import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import * as path from 'path';
import { source, embedding, course, campus } from '../../app/db/schema';
import { eq, and, or } from 'drizzle-orm';

// Load .env for local testing
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Neon database
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

interface CourseData {
  course_prefix: string;
  course_number: string;
  course_title: string;
  course_desc: string;
  num_units: string;
  dept_name: string;
  inst_ipeds: number;
  metadata: string;
}

/*
 * Generate a content hash for deduplication
 */
function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate a stable source ID based on file name
 */
function generateSourceId(fileName: string): string {
  const hash = crypto.createHash('sha256').update(fileName).digest('hex').slice(0, 8);
  const safe = fileName.replace(/\W+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
  return `source_${safe}_${hash}`;
}

/**
 * Create embedding content from course data
 */
function createEmbeddingContent(course: CourseData): string {
  const courseCode = `${course.course_prefix} ${course.course_number}`;
  return `Course: ${courseCode} - ${course.course_title}
  Department: ${course.dept_name}
  Units: ${course.num_units}
  Description: ${course.course_desc}
  Additional Info: ${course.metadata}`;
}

/**
 * Normalize a file path to a campus ID.
 * Maps filename patterns to seeded campus IDs.
 */
function mapFilenameToCampusId(filePath: string): string | null {
  const base = path.basename(filePath, path.extname(filePath)).toLowerCase();
  
  // Map common filename patterns to seeded campus IDs
  const mapping: Record<string, string> = {
    'kapiolani_courses': 'kapiolani_cc',
    'manoa_courses': 'uh_manoa',
    'maui_courses': 'uh_maui',
    'leeward_courses': 'leeward_cc',
    'hilo_courses': 'uh_hilo',
    'honolulucc_courses': 'honolulu_cc',
    'hawaiicc_courses': 'hawaii_cc',
    'kauai_courses': 'kauai_cc',
    'west_oahu_courses': 'uh_west_oahu',
    'pcatt_courses': 'pcatt',
  };

  return mapping[base] || null;
}

/**
 * Generate embeddings using OpenAI with batch support
 */
async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return response.data.map(item => item.embedding as number[]);
}

/**
 * Upsert a course into the courses table and return its ID
 */
async function upsertCourse(
  campusId: string,
  courseData: CourseData
): Promise<number> {
  const prefix = courseData.course_prefix.trim();
  const number = courseData.course_number.trim();

  // Check if course already exists
  const existing = await db
    .select()
    .from(course)
    .where(
      and(
        eq(course.campusId, campusId),
        eq(course.coursePrefix, prefix),
        eq(course.courseNumber, number)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  // Insert new course
  const [inserted] = await db
    .insert(course)
    .values({
      campusId,
      coursePrefix: prefix,
      courseNumber: number,
      courseTitle: courseData.course_title || null,
      courseDesc: courseData.course_desc || null,
      numUnits: courseData.num_units || null,
      deptName: courseData.dept_name || null,
    })
    .returning();

  return inserted.id;
}

/**
 * Process courses in batches with API-level batching
 */
async function processBatch(
  courses: CourseData[],
  sourceId: string,
  campusId: string,
  batchSize: number = 20,
  skipExisting: boolean = true
): Promise<{ processed: number; skipped: number }> {
  let totalProcessed = 0;
  let totalSkipped = 0;

  for (let i = 0; i < courses.length; i += batchSize) {
    const batch = courses.slice(i, i + batchSize);

    const batchData = batch.map(courseData => {
      const courseCode = `${courseData.course_prefix} ${courseData.course_number}`;
      const content = createEmbeddingContent(courseData);
      const contentHash = generateContentHash(content);

      return {
        courseData,
        courseCode,
        content,
        contentHash,
      };
    });

    // Filter out existing embeddings if skipExisting is true using a single IN-query per batch
    let toProcess = batchData.slice();
    if (skipExisting) {
      const hashes = batchData.map(d => d.contentHash);
      let existingRows: { contentHash: string | null }[] = [];
      if (hashes.length > 0) {
        // Build a dynamic OR clause for the content_hash IN (...) behavior
        const contentConditions = hashes.map(h => eq(embedding.contentHash, h));
        existingRows = await db
          .select({ contentHash: embedding.contentHash })
          .from(embedding)
          .where(and(eq(embedding.sourceId, sourceId), or(...contentConditions)));
      }

      const existingSet = new Set(existingRows.filter(r => r.contentHash != null).map(r => r.contentHash as string));
      toProcess = batchData.filter(d => !existingSet.has(d.contentHash));
    }

    const skipped = batch.length - toProcess.length;
    totalSkipped += skipped;

    if (toProcess.length === 0) {
      console.log(`Batch ${Math.floor(i / batchSize) + 1}: All ${batch.length} courses already exist, skipping`);
      continue;
    }

    try {
      // Generate embeddings for entire batch in one API call
      const contents = toProcess.map(item => item.content);
      const embeddings = await generateEmbeddings(contents);

      // Prepare data for insertion
      const embeddingData: any[] = [];
      let invalidEmbeddings = 0;
      
      for (let idx = 0; idx < toProcess.length; idx++) {
        const item = toProcess[idx];
        const vec = embeddings[idx];
        
        if (!Array.isArray(vec) || vec.length !== 1536) {
          console.warn(`Skipping ${item.courseCode}: embedding has invalid dimensions (${vec?.length ?? 'null'})`);
          invalidEmbeddings++;
          continue;
        }

        // Insert course into courses table and get its ID
        const courseId = await upsertCourse(campusId, item.courseData);

        embeddingData.push({
          sourceId,
          refId: item.courseCode,
          title: item.courseData.course_title,
          campusId: campusId,
          courseId: courseId,
          content: item.content,
          metadata: item.courseData as any,
          contentHash: item.contentHash,
          embedding: vec,
        });
      }

      // Insert batch into database (if any valid embeddings)
      if (embeddingData.length > 0) {
        await db.insert(embedding).values(embeddingData);
      }

      totalProcessed += embeddingData.length;
      totalSkipped += invalidEmbeddings;
      console.log(
        `Batch ${Math.floor(i / batchSize) + 1}: Processed ${embeddingData.length} courses` +
        (skipped > 0 ? `, skipped ${skipped} existing` : '') +
        (invalidEmbeddings > 0 ? `, skipped ${invalidEmbeddings} invalid embeddings` : '')
      );

    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
      throw error;
    }

    // Delay between batches to respect rate limits
    if (i + batchSize < courses.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { processed: totalProcessed, skipped: totalSkipped };
}

/**
 * Main ingestion function with idempotency
 */
async function ingestCourseData(
  jsonFilePath: string,
  options: { skipExisting?: boolean; batchSize?: number } = {}
): Promise<void> {
  const { skipExisting = true, batchSize = 20 } = options;

  console.log(`Starting ingestion from: ${jsonFilePath}`);
  console.log(`Skip existing: ${skipExisting}, Batch size: ${batchSize}`);

  try {
    // Read JSON file
    const fileContent = await fs.readFile(jsonFilePath, 'utf-8');
    const courses: CourseData[] = JSON.parse(fileContent);

    console.log(`Loaded ${courses.length} courses from file`);

    // Create stable source ID and ensure source exists
    const fileName = jsonFilePath.split('/').pop() || 'unknown';
    const sourceId = generateSourceId(fileName);

    // Check if source exists, create if not
    const existingSource = await db
      .select()
      .from(source)
      .where(eq(source.id, sourceId))
      .limit(1);

    if (existingSource.length === 0) {
      await db.insert(source).values({
        id: sourceId,
        name: fileName,
        url: jsonFilePath,
        type: 'json-file',
      });
      console.log(`Created new source record: ${sourceId}`);
    } else {
      console.log(`Using existing source record: ${sourceId}`);
    }

    // Map filename to campus ID
    const campusId = mapFilenameToCampusId(jsonFilePath);
    if (!campusId) {
      throw new Error(`Cannot map filename "${jsonFilePath}" to a known campus ID. Update mapFilenameToCampusId() mapping.`);
    }

    // Verify campus exists in DB
    const campusRow = await db.select().from(campus).where(eq(campus.id, campusId)).limit(1);
    if (campusRow.length === 0) {
      throw new Error(`Campus "${campusId}" not found in database. Run seed-campuses.ts first.`);
    }

    console.log(`Detected campus ID: "${campusId}" (${campusRow[0].name})`);

    // Process courses in batches, passing the campus ID
    const { processed, skipped } = await processBatch(courses, sourceId, campusId, batchSize, skipExisting);

    console.log(`\nIngestion complete!`);
    console.log(`   Total courses: ${courses.length}`);
    console.log(`   Processed: ${processed}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Source ID: ${sourceId}`);

  } catch (error) {
    console.error('Error during ingestion:', error);
    throw error;
  }
}

// CLI execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npx tsx scripts/ingest/ingest-json.ts <path-to-json-file> [--force] [--batch-size=N]');
  console.error('  --force: Process all courses even if they already exist');
  console.error('  --batch-size=N: Set batch size (default: 20)');
  process.exit(1);
}

const filePath = args[0];
const skipExisting = !args.includes('--force');
const batchSizeArg = args.find(arg => arg.startsWith('--batch-size='));
const batchSize = batchSizeArg ? parseInt(batchSizeArg.split('=')[1]) : 20;

ingestCourseData(filePath, { skipExisting, batchSize })
  .then(() => {
    console.log('\nAll done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });