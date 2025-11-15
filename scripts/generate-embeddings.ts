/**
 * Generate embeddings for all courses and degree programs
 * This populates the embeddings table for semantic search in the RAG chatbot
 */

// CRITICAL: Load environment variables BEFORE any other imports
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from project root
config({ path: resolve(process.cwd(), '.env') });
// Also try .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
  console.error('Please ensure you have a .env file with DATABASE_URL set');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');
console.log('📍 DATABASE_URL:', process.env.DATABASE_URL.substring(0, 30) + '...');

import { db } from "@/app/db";
import { 
  course, 
  degreeProgram, 
  degreePathway,
  pathwayCourse,
  embedding as embeddingTable, 
  source,
  campus,
  degree
} from "@/app/db/schema";
import { eq, inArray, isNotNull } from "drizzle-orm";
import { generateEmbeddings } from "@/lib/embeddings";
import crypto from "crypto";

// Helper to create content hash for deduplication
function contentHash(text: string): string {
  return crypto.createHash("sha256").update(text || "").digest("hex");
}

async function generateCourseEmbeddings() {
  console.log("\n🎓 Generating embeddings for courses...");
  
  // Get all courses with campus info
  const courses = await db
    .select({
      id: course.id,
      campusId: course.campusId,
      prefix: course.coursePrefix,
      number: course.courseNumber,
      title: course.courseTitle,
      desc: course.courseDesc,
      credits: course.numUnits,
      dept: course.deptName,
      metadata: course.metadata,
      campusName: campus.name,
    })
    .from(course)
    .leftJoin(campus, eq(course.campusId, campus.id))
    .where(isNotNull(course.courseTitle))
    .limit(5000); // Process in batches

  console.log(`Found ${courses.length} courses to process`);

  // Get or create source
  let [courseSource] = await db
    .select()
    .from(source)
    .where(eq(source.id, "courses-database"))
    .limit(1);

  if (!courseSource) {
    [courseSource] = await db
      .insert(source)
      .values({
        id: "courses-database",
        name: "UH System Courses Database",
        type: "database",
        url: null,
      })
      .returning();
  }

  // Process in batches to avoid API rate limits
  const batchSize = 50;
  let processed = 0;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < courses.length; i += batchSize) {
    const batch = courses.slice(i, i + batchSize);
    
    // Prepare content for embedding
    const contents = batch.map(c => {
      const parts = [
        `Course: ${c.prefix} ${c.number}`,
        c.title && `Title: ${c.title}`,
        c.dept && `Department: ${c.dept}`,
        c.campusName && `Campus: ${c.campusName}`,
        c.credits && `Credits: ${c.credits}`,
        c.desc && `Description: ${c.desc}`,
        c.metadata && `Prerequisites/Requirements: ${c.metadata}`,
      ].filter(Boolean);
      
      return parts.join(". ");
    });

    // Generate embeddings for this batch
    try {
      const embeddings = await generateEmbeddings(contents);

      // Insert embeddings
      const embeddingRecords = batch.map((c, idx) => {
        const content = contents[idx];
        const hash = contentHash(content);
        
        return {
          sourceId: courseSource.id,
          refId: `${c.campusId}-${c.prefix}-${c.number}`,
          title: `${c.prefix} ${c.number} - ${c.title || 'Untitled'}`,
          campusId: c.campusId,
          courseId: c.id,
          content: content,
          metadata: {
            prefix: c.prefix,
            number: c.number,
            title: c.title,
            department: c.dept,
            credits: c.credits,
            metadata: c.metadata,
          },
          contentHash: hash,
          embedding: embeddings[idx],
        };
      });

      // Check which embeddings already exist
      const hashes = embeddingRecords.map(e => e.contentHash);
      const existing = await db
        .select({ contentHash: embeddingTable.contentHash })
        .from(embeddingTable)
        .where(inArray(embeddingTable.contentHash, hashes));

      const existingHashes = new Set(existing.map(e => e.contentHash));
      const newRecords = embeddingRecords.filter(e => !existingHashes.has(e.contentHash));

      if (newRecords.length > 0) {
        await db.insert(embeddingTable).values(newRecords);
        inserted += newRecords.length;
      }
      skipped += embeddingRecords.length - newRecords.length;
      processed += batch.length;

      console.log(`  Progress: ${processed}/${courses.length} (${inserted} new, ${skipped} skipped)`);
    } catch (error) {
      console.error(`  Error processing batch starting at ${i}:`, error);
    }

    // Rate limiting: wait a bit between batches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ Course embeddings complete: ${inserted} inserted, ${skipped} skipped`);
}

async function generateDegreeProgramEmbeddings() {
  console.log("\n🎓 Generating embeddings for degree programs...");

  // Get all degree programs with related info
  const programs = await db
    .select({
      id: degreeProgram.id,
      campusId: degreeProgram.campusId,
      programName: degreeProgram.programName,
      majorTitle: degreeProgram.majorTitle,
      track: degreeProgram.track,
      totalCredits: degreeProgram.totalCredits,
      typicalDuration: degreeProgram.typicalDurationYears,
      description: degreeProgram.description,
      degreeCode: degree.code,
      degreeName: degree.name,
      degreeLevel: degree.level,
      campusName: campus.name,
    })
    .from(degreeProgram)
    .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
    .leftJoin(campus, eq(degreeProgram.campusId, campus.id));

  console.log(`Found ${programs.length} degree programs to process`);

  // Get or create source
  let [programSource] = await db
    .select()
    .from(source)
    .where(eq(source.id, "degree-programs-database"))
    .limit(1);

  if (!programSource) {
    [programSource] = await db
      .insert(source)
      .values({
        id: "degree-programs-database",
        name: "UH System Degree Programs Database",
        type: "database",
        url: null,
      })
      .returning();
  }

  // For each program, also get pathway summary
  const programsWithPathways = await Promise.all(
    programs.map(async (p) => {
      const pathways = await db
        .select({
          yearNumber: degreePathway.yearNumber,
          semesterName: degreePathway.semesterName,
          semesterCredits: degreePathway.semesterCredits,
        })
        .from(degreePathway)
        .where(eq(degreePathway.degreeProgramId, p.id))
        .orderBy(degreePathway.sequenceOrder)
        .limit(20);

      return { ...p, pathways };
    })
  );

  const batchSize = 20;
  let processed = 0;
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < programsWithPathways.length; i += batchSize) {
    const batch = programsWithPathways.slice(i, i + batchSize);

    // Prepare content for embedding
    const contents = batch.map(p => {
      const parts = [
        `Degree Program: ${p.programName}`,
        p.majorTitle && `Major: ${p.majorTitle}`,
        p.track && `Track: ${p.track}`,
        p.degreeCode && `Degree: ${p.degreeCode} - ${p.degreeName || p.degreeCode}`,
        p.degreeLevel && `Level: ${p.degreeLevel}`,
        p.campusName && `Campus: ${p.campusName}`,
        p.totalCredits && `Total Credits: ${p.totalCredits}`,
        p.typicalDuration && `Duration: ${p.typicalDuration} years`,
        p.description && `Description: ${p.description}`,
        p.pathways.length > 0 && `Program Structure: ${p.pathways.length} semesters over ${Math.max(...p.pathways.map(pw => pw.yearNumber))} years`,
      ].filter(Boolean);

      return parts.join(". ");
    });

    try {
      const embeddings = await generateEmbeddings(contents);

      const embeddingRecords = batch.map((p, idx) => {
        const content = contents[idx];
        const hash = contentHash(content);

        return {
          sourceId: programSource.id,
          refId: `program-${p.id}`,
          title: p.programName,
          campusId: p.campusId,
          courseId: null,
          content: content,
          metadata: {
            programId: p.id,
            majorTitle: p.majorTitle,
            track: p.track,
            degreeCode: p.degreeCode,
            totalCredits: p.totalCredits,
            typicalDuration: p.typicalDuration,
            pathwayCount: p.pathways.length,
          },
          contentHash: hash,
          embedding: embeddings[idx],
        };
      });

      // Check which embeddings already exist
      const hashes = embeddingRecords.map(e => e.contentHash);
      const existing = await db
        .select({ contentHash: embeddingTable.contentHash })
        .from(embeddingTable)
        .where(inArray(embeddingTable.contentHash, hashes));

      const existingHashes = new Set(existing.map(e => e.contentHash));
      const newRecords = embeddingRecords.filter(e => !existingHashes.has(e.contentHash));

      if (newRecords.length > 0) {
        await db.insert(embeddingTable).values(newRecords);
        inserted += newRecords.length;
      }
      skipped += embeddingRecords.length - newRecords.length;
      processed += batch.length;

      console.log(`  Progress: ${processed}/${programsWithPathways.length} (${inserted} new, ${skipped} skipped)`);
    } catch (error) {
      console.error(`  Error processing batch starting at ${i}:`, error);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`✅ Degree program embeddings complete: ${inserted} inserted, ${skipped} skipped`);
}

async function generatePathwayDetailsEmbeddings() {
  console.log("\n🗺️  Generating embeddings for detailed pathway information...");

  // Get programs with pathways
  const programs = await db
    .select({
      id: degreeProgram.id,
      programName: degreeProgram.programName,
      majorTitle: degreeProgram.majorTitle,
      campusId: degreeProgram.campusId,
    })
    .from(degreeProgram);

  let [pathwaySource] = await db
    .select()
    .from(source)
    .where(eq(source.id, "degree-pathways-database"))
    .limit(1);

  if (!pathwaySource) {
    [pathwaySource] = await db
      .insert(source)
      .values({
        id: "degree-pathways-database",
        name: "UH System Degree Pathways Database",
        type: "database",
        url: null,
      })
      .returning();
  }

  let inserted = 0;
  let skipped = 0;

  for (const program of programs) {
    // Get pathway with courses
    const pathways = await db
      .select({
        pathwayId: degreePathway.id,
        yearNumber: degreePathway.yearNumber,
        semesterName: degreePathway.semesterName,
        semesterCredits: degreePathway.semesterCredits,
      })
      .from(degreePathway)
      .where(eq(degreePathway.degreeProgramId, program.id))
      .orderBy(degreePathway.sequenceOrder);

    if (pathways.length === 0) continue;

    // Get all courses for this program's pathways
    const pathwayIds = pathways.map(p => p.pathwayId);
    const courses = await db
      .select({
        pathwayId: pathwayCourse.pathwayId,
        courseName: pathwayCourse.courseName,
        credits: pathwayCourse.credits,
        category: pathwayCourse.category,
      })
      .from(pathwayCourse)
      .where(inArray(pathwayCourse.pathwayId, pathwayIds));

    // Group courses by pathway
    const coursesByPathway = new Map<number, typeof courses>();
    for (const c of courses) {
      if (!coursesByPathway.has(c.pathwayId)) {
        coursesByPathway.set(c.pathwayId, []);
      }
      coursesByPathway.get(c.pathwayId)!.push(c);
    }

    // Create rich content about the pathway structure
    const pathwayDescription = pathways.map(p => {
      const pathwayCourses = coursesByPathway.get(p.pathwayId) || [];
      const courseList = pathwayCourses.map(c => 
        `${c.courseName} (${c.credits}cr${c.category ? `, ${c.category}` : ''})`
      ).join(", ");

      return `Year ${p.yearNumber} ${p.semesterName.replace('_semester', '')}: ${p.semesterCredits || 0} credits - ${courseList}`;
    }).join(". ");

    const content = `Degree Pathway for ${program.programName} (${program.majorTitle}). Complete semester-by-semester plan: ${pathwayDescription}`;
    
    // Check if this content already exists
    const hash = contentHash(content);
    const [existing] = await db
      .select()
      .from(embeddingTable)
      .where(eq(embeddingTable.contentHash, hash))
      .limit(1);

    if (existing) {
      skipped++;
      continue;
    }

    try {
      const [embedding] = await generateEmbeddings([content]);

      await db.insert(embeddingTable).values({
        sourceId: pathwaySource.id,
        refId: `pathway-detail-${program.id}`,
        title: `Pathway: ${program.majorTitle}`,
        campusId: program.campusId,
        courseId: null,
        content: content,
        metadata: {
          programId: program.id,
          programName: program.programName,
          semesterCount: pathways.length,
        },
        contentHash: hash,
        embedding: embedding,
      });

      inserted++;
      
      if (inserted % 10 === 0) {
        console.log(`  Progress: ${inserted + skipped} processed (${inserted} new, ${skipped} skipped)`);
      }
    } catch (error) {
      console.error(`  Error processing pathway for ${program.majorTitle}:`, error);
    }

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`✅ Pathway details embeddings complete: ${inserted} inserted, ${skipped} skipped`);
}

async function main() {
  console.log("🚀 Starting comprehensive embedding generation...");
  console.log("This will populate the embeddings table for RAG-powered chat");

  try {
    // Generate embeddings for all data types
    await generateCourseEmbeddings();
    await generateDegreeProgramEmbeddings();
    await generatePathwayDetailsEmbeddings();

    console.log("\n🎉 All embeddings generated successfully!");
    console.log("\nThe chatbot can now:");
    console.log("  ✅ Answer questions about any course in the UH system");
    console.log("  ✅ Provide information about all degree programs");
    console.log("  ✅ Describe detailed semester-by-semester pathways");
    console.log("  ✅ Use semantic search to find relevant information");

  } catch (error) {
    console.error("\n❌ Error generating embeddings:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
