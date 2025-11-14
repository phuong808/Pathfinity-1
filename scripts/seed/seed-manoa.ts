import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import OpenAI from 'openai';
import { eq, and, sql } from 'drizzle-orm';
import { campus, degree, major, majorDegree, course, source, embedding, pathway } from '../../app/db/schema';

/*
  Minimal UH Mānoa seeding script.
  Seeds:
    - Campus (uh_manoa)
    - Degrees & Majors (filtered from uh_majors_colleges_specific_degrees.json)
    - Major-Degree links (with simple defaults)
    - Courses (manoa_courses.json) with optional embeddings
    - Pathways (manoa_degree_pathways.json)

  Usage examples:
    npx tsx scripts/seed/seed-manoa.ts            # Seed campus, degrees, majors, courses (no embeddings), pathways
    npx tsx scripts/seed/seed-manoa.ts --embeddings  # Include embeddings (requires OPENAI_API_KEY)
    npx tsx scripts/seed/seed-manoa.ts --limit-courses=300 --embeddings --batch-size=25
    npx tsx scripts/seed/seed-manoa.ts --force     # Re-insert (idempotent wherever possible)

  Flags:
    --embeddings       Generate OpenAI embeddings for courses
    --limit-courses=N  Only process first N courses (for quick smoke test)
    --batch-size=N     Embedding batch size (default 20)
    --force            Reprocess degrees/majors/courses even if existing
*/

const args = process.argv.slice(2);
// Embeddings default ON; disable with --no-embeddings
const doEmbeddings = !args.includes('--no-embeddings');
const force = args.includes('--force');
const limitArg = args.find(a => a.startsWith('--limit-courses='));
const limitCourses = limitArg ? parseInt(limitArg.split('=')[1]) : null;
const batchArg = args.find(a => a.startsWith('--batch-size='));
const batchSize = batchArg ? parseInt(batchArg.split('=')[1]) : 20;

const DATA_DIR = path.join(process.cwd(), 'app', 'db', 'data');
const MAJORS_FILE = path.join(DATA_DIR, 'uh_majors_colleges_specific_degrees.json');
const COURSES_FILE = path.join(DATA_DIR, 'manoa_courses.json');
const PATHWAYS_FILE = path.join(DATA_DIR, 'manoa_degree_pathways.json');
const CAMPUS_ID = 'uh_manoa';
const CAMPUS_KEY = 'University of Hawaiʻi at Mānoa';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient);
let openai: OpenAI | null = null;
if (doEmbeddings) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing: embeddings required for seeding context. Set key or use --no-embeddings to bypass.');
    process.exit(1);
  }
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

function section(title: string) { console.log(`\n===== ${title} =====`); }
function hash(content: string) { return crypto.createHash('sha256').update(content).digest('hex'); }
function sourceId(fileName: string) { const h = hash(fileName).slice(0,8); return `source_${fileName.replace(/\W+/g,'_').toLowerCase()}_${h}`; }
function embeddingContent(c: any) {
  const code = `${c.course_prefix} ${c.course_number}`;
  return `Course: ${code} - ${c.course_title}\nDepartment: ${c.dept_name}\nUnits: ${c.num_units}\nDescription: ${c.course_desc}\nAdditional Info: ${c.metadata}`;
}

// Simple defaults for requiredCredits/duration (months)
const degreeDefaults: Record<string, { requiredCredits?: number|null; typicalDuration?: number|null }> = {
  BA: { requiredCredits: 120, typicalDuration: 48 },
  BS: { requiredCredits: 120, typicalDuration: 48 },
  BFA: { requiredCredits: 120, typicalDuration: 48 },
  BMus: { requiredCredits: 120, typicalDuration: 48 },
  MA: { requiredCredits: 30, typicalDuration: 24 },
  MS: { requiredCredits: 30, typicalDuration: 24 },
  MFA: { requiredCredits: 30, typicalDuration: 36 },
  PhD: { requiredCredits: null, typicalDuration: 60 },
  JD: { requiredCredits: 89, typicalDuration: 36 },
  MEd: { requiredCredits: 30, typicalDuration: 24 },
  MPH: { requiredCredits: 30, typicalDuration: 24 },
  MBA: { requiredCredits: 30, typicalDuration: 24 },
};

async function ensureCampus() {
  section('Campus');
  const existing = await db.select().from(campus).where(eq(campus.id, CAMPUS_ID)).limit(1);
  if (existing.length && !force) {
    console.log(`Campus '${CAMPUS_ID}' exists -> skip`);
    return;
  }
  if (existing.length && force) {
    console.log(`Re-seeding campus '${CAMPUS_ID}'`);
  }
  await db.insert(campus).values({ id: CAMPUS_ID, name: 'UNIVERSITY OF HAWAIʻI AT MĀNOA' }).onConflictDoNothing();
  console.log(`Upserted campus '${CAMPUS_ID}'`);
}

async function seedMajorsAndDegrees() {
  section('Degrees & Majors');
  if (!fs.existsSync(MAJORS_FILE)) { console.log('Majors JSON missing, skipping'); return; }
  const raw = JSON.parse(fs.readFileSync(MAJORS_FILE,'utf8')) as Record<string, Record<string,string[]>>;
  const subset = raw[CAMPUS_KEY];
  if (!subset) { console.error(`Key '${CAMPUS_KEY}' not found in majors JSON.`); return; }

  const allDegreeCodes = new Set<string>();
  for (const majorTitle of Object.keys(subset)) subset[majorTitle].forEach(code => allDegreeCodes.add(code.trim()));
  console.log(`Found ${subset ? Object.keys(subset).length : 0} majors; ${allDegreeCodes.size} unique degree codes.`);

  // Insert degrees
    for (const code of Array.from(allDegreeCodes)) {
      try {
        console.log(`Degree upsert start: ${code}`);
        const exists = await db.select().from(degree).where(eq(degree.code, code)).limit(1);
        if (exists.length && !force) { console.log(`Degree exists (skip): ${code}`); continue; }
        if (exists.length && force) console.log(`Re-seeding degree ${code}`);
        await db.insert(degree).values({ code, name: code, level: 'unknown' }).onConflictDoNothing();
        console.log(`Degree upsert done: ${code}`);
      } catch (e) {
        console.error(`Degree upsert error (${code}):`, e);
        throw e;
      }
    }
  // Insert majors + links
  console.log('Beginning majors insertion loop...');
  let majorsInserted = 0; let linksInserted = 0; let errors = 0; let processedMajors = 0;
  for (const majorTitle of Object.keys(subset)) {
    try {
      const existingMajor = await db.select().from(major).where(and(eq(major.campusId, CAMPUS_ID), eq(major.title, majorTitle))).limit(1);
      let majorId: number;
      if (existingMajor.length && !force) {
        majorId = existingMajor[0].id;
      } else if (existingMajor.length && force) {
        // Optionally could delete links; for simplicity keep existing
        majorId = existingMajor[0].id;
        console.log(`Re-using existing major '${majorTitle}' (id=${majorId})`);
      } else {
        const [mRow] = await db.insert(major).values({ campusId: CAMPUS_ID, title: majorTitle }).returning();
        majorId = mRow.id; majorsInserted++;
        console.log(`Inserted major: ${majorTitle}`);
      }
      const codes = Array.from(new Set(subset[majorTitle].map(c=>c.trim())));
      for (const code of codes) {
        const degRow = await db.select().from(degree).where(eq(degree.code, code)).limit(1);
        if (!degRow.length) continue;
        const linkExists = await db.select().from(majorDegree).where(and(eq(majorDegree.majorId, majorId), eq(majorDegree.degreeId, degRow[0].id))).limit(1);
        if (linkExists.length && !force) continue;
        if (linkExists.length && force) continue; // keep existing link
        const defaults = degreeDefaults[code] || {};
        await db.insert(majorDegree).values({ majorId, degreeId: degRow[0].id, requiredCredits: defaults.requiredCredits ?? null, typicalDuration: defaults.typicalDuration ?? null });
        linksInserted++;
      }
      processedMajors++;
      if (processedMajors % 25 === 0) {
        console.log(`Progress: ${processedMajors}/${Object.keys(subset).length} majors processed...`);
      }
    } catch (e) {
      errors++; console.error(`Major '${majorTitle}' error:`, e);
    }
  }
  console.log(`Majors loop complete. Majors inserted: ${majorsInserted}, links inserted: ${linksInserted}, errors: ${errors}`);
  const currentMajorCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(major).where(eq(major.campusId, CAMPUS_ID));
  console.log(`Current major count for '${CAMPUS_ID}': ${currentMajorCount[0].c}`);
}

async function seedCourses() {
  section('Courses');
  if (!fs.existsSync(COURSES_FILE)) { console.log('Courses JSON missing, skipping'); return; }
  const raw = JSON.parse(fs.readFileSync(COURSES_FILE,'utf8')) as any[];
  const data = limitCourses ? raw.slice(0, limitCourses) : raw;
  console.log(`Loaded ${raw.length} courses; processing ${data.length}${limitCourses ? ' (limited)' : ''}.`);
  const srcId = sourceId('manoa_courses.json');
  const srcExists = await db.select().from(source).where(eq(source.id, srcId)).limit(1);
  if (!srcExists.length) {
    await db.insert(source).values({ id: srcId, name: 'manoa_courses.json', url: COURSES_FILE, type: 'json-file' });
  }
  let processed = 0; let skippedExisting = 0; let embeddingInserted = 0;
  // Prepare upsert of all courses first; collect embedding tasks
  const pendingEmbedding: { courseData: any; courseId: number; content: string; contentHash: string; ref: string; title: string; metadata: any }[] = [];
  for (const c of data) {
    const prefix = String(c.course_prefix).trim();
    const number = String(c.course_number).trim();
    let courseId: number;
    const existing = await db.select().from(course).where(and(eq(course.campusId, CAMPUS_ID), eq(course.coursePrefix, prefix), eq(course.courseNumber, number))).limit(1);
    if (existing.length && !force) {
      courseId = existing[0].id; skippedExisting++;
    } else if (existing.length && force) {
      courseId = existing[0].id;
    } else {
      const [row] = await db.insert(course).values({ campusId: CAMPUS_ID, coursePrefix: prefix, courseNumber: number, courseTitle: c.course_title || null, courseDesc: c.course_desc || null, numUnits: String(c.num_units||''), deptName: c.dept_name || null }).returning();
      courseId = row.id;
    }
    if (doEmbeddings && openai) {
      const content = embeddingContent(c);
      const contentHash = hash(content);
      const embExists = await db.select().from(embedding).where(and(eq(embedding.sourceId, srcId), eq(embedding.contentHash, contentHash))).limit(1);
      if (!embExists.length || force) {
        pendingEmbedding.push({ courseData: c, courseId, content, contentHash, ref: `${prefix} ${number}`, title: c.course_title, metadata: c });
      }
    }
    processed++;
  }

  if (doEmbeddings && openai) {
    console.log(`Embedding generation: ${pendingEmbedding.length} new course entries to embed.`);
    for (let i = 0; i < pendingEmbedding.length; i += batchSize) {
      const slice = pendingEmbedding.slice(i, i + batchSize);
      const contents = slice.map(s => s.content);
      const resp = await openai.embeddings.create({ model: 'text-embedding-3-small', input: contents });
      const vectors = resp.data.map(d => d.embedding as number[]);
      const rows = [] as any[];
      for (let j = 0; j < slice.length; j++) {
        const s = slice[j];
        const vec = vectors[j];
        if (!Array.isArray(vec) || vec.length !== 1536) { console.warn(`Bad embedding dimensions for ${s.ref}`); continue; }
        rows.push({ sourceId: srcId, refId: s.ref, title: s.title, campusId: CAMPUS_ID, courseId: s.courseId, content: s.content, metadata: s.metadata, contentHash: s.contentHash, embedding: vec });
      }
      if (rows.length) {
        await db.insert(embedding).values(rows);
        embeddingInserted += rows.length;
      }
      console.log(`Embedding batch ${(i / batchSize) + 1}: inserted ${rows.length}`);
      if (i + batchSize < pendingEmbedding.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
  console.log(`Courses processed: ${processed}; existing skipped: ${skippedExisting}; embeddings inserted: ${embeddingInserted}`);
}

async function seedPathways() {
  section('Pathways');
  if (!fs.existsSync(PATHWAYS_FILE)) { console.log('Pathways JSON missing, skipping'); return; }
  const raw = JSON.parse(fs.readFileSync(PATHWAYS_FILE,'utf8'));
  const arr = Array.isArray(raw) ? raw : [raw];
  let inserted = 0; let updated = 0;
  for (const p of arr) {
    const name = p.program_name;
    const existing = await db.select().from(pathway).where(eq(pathway.programName, name)).limit(1);
    if (existing.length && !force) { updated++; continue; }
    if (existing.length && force) {
      await db.update(pathway).set({ institution: p.institution, totalCredits: String(p.total_credits), pathwayData: p }).where(eq(pathway.programName, name));
      updated++; continue;
    }
    await db.insert(pathway).values({ id: crypto.randomUUID(), programName: name, institution: p.institution, totalCredits: String(p.total_credits), pathwayData: p });
    inserted++;
  }
  console.log(`Pathways inserted: ${inserted}; updated (skipped due to existing when !force): ${updated}`);
}

async function summary() {
  section('Summary');
  const degCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(degree);
  const majorCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(major).where(eq(major.campusId, CAMPUS_ID));
  const courseCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(course).where(eq(course.campusId, CAMPUS_ID));
  const pathwayCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(pathway);
  const embCount = await db.select({ c: sql<number>`COUNT(*)::int` }).from(embedding).where(eq(embedding.campusId, CAMPUS_ID));
  console.log(`Degrees total: ${degCount[0].c}`);
  console.log(`Majors (UH Mānoa): ${majorCount[0].c}`);
  console.log(`Courses (UH Mānoa): ${courseCount[0].c}`);
  console.log(`Pathways (all): ${pathwayCount[0].c}`);
  console.log(`Embeddings (UH Mānoa): ${embCount[0].c}`);
}

(async () => {
  const start = Date.now();
  console.log('Starting UH Mānoa seeding...');
  console.log(`Embeddings: ${doEmbeddings ? 'ENABLED' : 'DISABLED'}${doEmbeddings ? ` (batch size ${batchSize})` : ''}`);
  if (limitCourses) console.log(`Course limit: ${limitCourses}`);

  await ensureCampus();
  await seedMajorsAndDegrees();
  await seedCourses();
  await seedPathways();
  await summary();

  console.log(`\n✅ UH Mānoa seeding complete in ${(Date.now()-start)/1000}s`);
  process.exit(0);
})().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
