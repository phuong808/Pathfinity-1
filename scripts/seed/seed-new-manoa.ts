// scripts/embed_all.ts
//
// High-concurrency embedding pipeline for:
//   - courses.json (Chunk Type C: full, short, prereqs)
//   - all_pathways.json (Full pathway chunking Option 3)
//
// Uses:
//   - Drizzle with Neon HTTP
//   - gpt-4.1-mini embed() helper from actions.ts
//   - vector(1536) column in embeddings table
//
// Run with:
//   pnpm tsx scripts/embed_all.ts

import { db } from "../../app/db/index.js";
import { embedding, source, campuses } from "../../app/db/schema.js"; // your schema tables
import { eq } from "drizzle-orm";
import { embed } from "../../app/db/actions.js"; // your gpt-4.1-mini embedding helper
import fs from "fs";
import crypto from "crypto";
import pLimit from "p-limit";
import path from "path";
import { fileURLToPath } from "url";

// -----------------------------------------------------------------------------
// CONFIG
// -----------------------------------------------------------------------------

// Concurrency mode A: safe high concurrency
const WORKER_COUNT = 25;

// Distinct source IDs for this dataset generation
const COURSE_SOURCE_ID = "source_manoa_courses_v2";
const PATHWAY_SOURCE_ID = "source_manoa_pathways_v2";

// Files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COURSES_JSON = path.join(__dirname, "../../app/db/data/revised_manoa_courses.json");
const PATHWAYS_JSON = path.join(__dirname, "../../app/db/data/revised_manoa_pathways.json");

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const md5 = (s: string) => crypto.createHash("md5").update(s).digest("hex");

function loadJSON<T>(path: string): T {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function clean(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

// -----------------------------------------------------------------------------
// COURSE CHUNKING (TYPE C)
// -----------------------------------------------------------------------------

function makeCourseChunks(course: any) {
  const chunks: any[] = [];

  const { courseId, title, description, credits, focusDesignations, prerequisites } =
    course;

  // FULL
  chunks.push({
    refId: `${courseId}-full`,
    title: `${courseId}: ${title}`,
    content: clean(`
      Course: ${courseId}
      Title: ${title}
      Credits: ${credits ?? "N/A"}
      Description: ${description ?? ""}
      Prerequisites: ${prerequisites ?? "None"}
      Focus: ${Array.isArray(focusDesignations) ? focusDesignations.join(", ") : ""}
    `),
    metadata: { type: "course-full", courseId },
  });

  // SHORT
  {
    const summary = description
      ? description.split(".").slice(0, 2).join(".") + "."
      : `Summary of ${courseId}`;

    chunks.push({
      refId: `${courseId}-short`,
      title: `${courseId} summary`,
      content: clean(summary),
      metadata: { type: "course-short", courseId },
    });
  }

  // PREREQ chunk
  if (prerequisites && prerequisites.length > 0) {
    chunks.push({
      refId: `${courseId}-prereqs`,
      title: `${courseId} prerequisites`,
      content: clean(
        `Prerequisites for ${courseId}: ${prerequisites}`
      ),
      metadata: { type: "course-prereqs", courseId },
    });
  }

  return chunks;
}

// -----------------------------------------------------------------------------
// PATHWAY CHUNKING (FULL CHUNKING OPTION 3)
// -----------------------------------------------------------------------------

function makePathwayChunks(p: any) {
  const programId = p.programId;
  const programName = p.programName;
  const chunks: any[] = [];

  const genEd = p.requirements.genEd;
  const major = p.requirements.major;
  const graduation = p.requirements.graduation;

  // Overview
  chunks.push({
    refId: `${programId}-overview`,
    title: `${programName} Overview`,
    content: clean(`
      Program: ${programName}
      Degree type: ${p.degreeType}
      Summary of program requirements.
    `),
    metadata: { type: "program-overview", programId },
  });

  // GenEd: Diversification
  chunks.push({
    refId: `${programId}-gened-diversification`,
    title: `${programName} Diversification`,
    content: clean(JSON.stringify(genEd.diversification, null, 2)),
    metadata: { type: "gened-diversification", programId },
  });

  // GenEd: Focus
  chunks.push({
    refId: `${programId}-gened-focus`,
    title: `${programName} Focus Requirements`,
    content: clean(JSON.stringify(genEd.focus, null, 2)),
    metadata: { type: "gened-focus", programId },
  });

  // GenEd: HSL
  chunks.push({
    refId: `${programId}-gened-hsl`,
    title: `${programName} HSL Requirements`,
    content: clean(JSON.stringify(genEd.hsl, null, 2)),
    metadata: { type: "gened-hsl", programId },
  });

  // Graduation
  chunks.push({
    refId: `${programId}-graduation`,
    title: `${programName} Graduation Requirements`,
    content: clean(JSON.stringify(graduation, null, 2)),
    metadata: { type: "graduation", programId },
  });

  // Major requirement groups
  function pushGroup(list: any[], type: string) {
    if (!list || !Array.isArray(list)) return;
    list.forEach((group: any, idx: number) => {
      chunks.push({
        refId: `${programId}-${type}-${idx + 1}`,
        title: `${programName} — ${group.title ?? type} (Group ${idx + 1})`,
        content: clean(JSON.stringify(group.entries, null, 2)),
        metadata: {
          type: `major-${type}`,
          programId,
          groupIndex: idx + 1,
        },
      });
    });
  }

  pushGroup(major.prerequisites, "prerequisites");
  pushGroup(major.core, "core");
  pushGroup(major.electives, "electives");
  pushGroup(major.other, "other");

  return chunks;
}

// -----------------------------------------------------------------------------
// DRIZZLE INSERT WITH RETRY + DEDUPE
// -----------------------------------------------------------------------------

async function embedAndInsert(chunk: any, sourceId: string) {
  const { refId, title, content, metadata } = chunk;
  const contentHash = md5(content);

  // Skip duplicates
  const exists = await db.query.embedding.findFirst({
    where: (e, { eq }) => eq(e.contentHash, contentHash),
    columns: { id: true },
  });
  if (exists) return;

  let vector: number[] | null = null;

  // Retry embedding up to 3 times
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      vector = await embed(content); // calls gpt-4.1-mini
      break;
    } catch (err) {
      console.error(
        `Embedding failed (attempt ${attempt}) for refId ${refId}`,
        err
      );
      if (attempt === 3) throw err;
      await new Promise((res) =>
        setTimeout(res, attempt * 1500) // backoff
      );
    }
  }

  // Insert row
  await db.insert(embedding).values({
    sourceId,
    refId,
    title,
    content,
    metadata,
    contentHash,
    embedding: vector!,
    campusId: "manoa",
    courseId: null,
  });
}

// -----------------------------------------------------------------------------
// ENSURE SOURCE IDS EXIST
// -----------------------------------------------------------------------------

async function ensureSource(id: string, name: string) {
  const exists = await db.query.source.findFirst({
    where: (s, { eq }) => eq(s.id, id),
  });
  if (!exists) {
    await db.insert(source).values({
      id,
      name,
      type: "json-file",
    });
  }
}

async function ensureCampus(id: string, name: string) {
  const exists = await db.query.campuses.findFirst({
    where: (c, { eq }) => eq(c.id, id),
  });

  if (!exists) {
    await db.insert(campuses).values({
      id,
      name,
    });
  }
}


// -----------------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------------

async function main() {
  console.log("\n🔍 Loading JSON...\n");

  const courses = loadJSON<any[]>(COURSES_JSON);
  const pathways = loadJSON<{ programs: any[] }>(PATHWAYS_JSON).programs;

  console.log(`Loaded ${courses.length} courses`);
  console.log(`Loaded ${pathways.length} pathway programs`);
  
  await ensureCampus("manoa", "University of Hawaiʻi at Mānoa");
  await ensureSource(COURSE_SOURCE_ID, "Manoa Courses (v2)");
  await ensureSource(PATHWAY_SOURCE_ID, "Manoa Pathways (v2)");

  console.log("\n📦 Creating chunks...");
  const courseChunks = courses.flatMap(makeCourseChunks);
  const pathwayChunks = pathways.flatMap(makePathwayChunks);

  const allChunks = [
    ...courseChunks.map((c) => ({ ...c, sourceId: COURSE_SOURCE_ID })),
    ...pathwayChunks.map((p) => ({ ...p, sourceId: PATHWAY_SOURCE_ID })),
  ];

  console.log(`Total chunks: ${allChunks.length}\n`);

  // Concurrency-limited embedding
  const limit = pLimit(WORKER_COUNT);
  let processed = 0;
  const start = Date.now();

  console.log("🚀 Starting embedding...\n");

  await Promise.all(
    allChunks.map((chunk) =>
      limit(async () => {
        await embedAndInsert(chunk, chunk.sourceId);
        processed++;

        if (processed % 100 === 0) {
          const elapsed = ((Date.now() - start) / 1000).toFixed(1);
          console.log(
            `Processed ${processed}/${allChunks.length} chunks (${elapsed}s elapsed)`
          );
        }
      })
    )
  );

  console.log("\n🎉 Embedding complete!");
}

main().catch(console.error);

