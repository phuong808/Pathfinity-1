/**
 * Generate embeddings for UH Manoa major-career pathway data
 * This enables semantic search for the RAG chatbot to answer questions like:
 * - "What careers can I pursue with a Computer Science degree?"
 * - "What should I study to become a software engineer?"
 * - "What are the best majors for healthcare careers?"
 * 
 * Usage: npm run generate:major-career-embeddings
 */

// CRITICAL: Load environment variables BEFORE any other imports
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from project root
config({ path: resolve(process.cwd(), '.env') });
// Also try .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Verify environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set in environment variables');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY is not set in environment variables');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully\n');

import { db } from "@/app/db";
import { 
  majorCareerMapping,
  careerPathway,
  embedding as embeddingTable, 
  source,
  campus
} from "@/app/db/schema";
import { eq, inArray } from "drizzle-orm";
import { generateEmbeddings } from "@/lib/embeddings";
import crypto from "crypto";

const UH_MANOA_CAMPUS_ID = "uh-manoa";

// Helper to create content hash for deduplication
function contentHash(text: string): string {
  return crypto.createHash("sha256").update(text || "").digest("hex");
}

/**
 * Generate embeddings for major-career mappings
 * Each embedding contains information about a major and its career pathways
 */
async function generateMajorCareerEmbeddings() {
  console.log("🎓 Generating embeddings for UH Manoa major-career pathways...\n");
  
  // Get or create source
  let [majorCareerSource] = await db
    .select()
    .from(source)
    .where(eq(source.id, "uh-manoa-major-careers"))
    .limit(1);

  if (!majorCareerSource) {
    console.log("Creating source entry...");
    [majorCareerSource] = await db
      .insert(source)
      .values({
        id: "uh-manoa-major-careers",
        name: "UH Manoa Major to Career Pathways",
        type: "database",
        url: null,
      })
      .returning();
    console.log("✓ Source created\n");
  }

  // Get campus info
  const [uhManoa] = await db
    .select()
    .from(campus)
    .where(eq(campus.id, UH_MANOA_CAMPUS_ID))
    .limit(1);

  if (!uhManoa) {
    console.error("❌ ERROR: UH Manoa campus not found in database");
    process.exit(1);
  }

  // Get all majors with their career pathways
  const majors = await db
    .select()
    .from(majorCareerMapping)
    .where(eq(majorCareerMapping.campusId, UH_MANOA_CAMPUS_ID));

  console.log(`Found ${majors.length} majors to process\n`);

  // Get all career pathways once
  const allCareerIds = [...new Set(majors.flatMap(m => m.careerPathwayIds || []))];
  const careers = await db
    .select()
    .from(careerPathway)
    .where(inArray(careerPathway.id, allCareerIds));

  const careerMap = new Map(careers.map(c => [c.id, c]));

  // Process in batches to avoid API rate limits
  const batchSize = 50;
  let processed = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  console.log("Processing majors in batches...\n");

  for (let i = 0; i < majors.length; i += batchSize) {
    const batch = majors.slice(i, i + batchSize);
    
    // Prepare content for embedding - rich text that describes the major and careers
    const contents = batch.map(major => {
      const careerTitles = (major.careerPathwayIds || [])
        .map(id => careerMap.get(id)?.title)
        .filter(Boolean);

      // Create comprehensive text for semantic search
      const parts = [
        `Major: ${major.majorName}`,
        `Degree Type: ${major.degreeType}`,
        major.credits ? `Credits Required: ${major.credits}` : null,
        `Campus: University of Hawaii at Manoa`,
        `Career Pathways: ${careerTitles.join(", ")}`,
        // Add natural language descriptions for better semantic matching
        `Students who graduate with a ${major.majorName} degree can pursue careers as: ${careerTitles.join(", ")}`,
        `If you want to become a ${careerTitles[0]}, consider studying ${major.majorName}`,
        `This ${major.degreeType} program prepares students for careers in: ${careerTitles.slice(0, 3).join(", ")}`,
      ].filter(Boolean);

      return parts.join("\n");
    });

    // Calculate content hashes
    const hashes = contents.map(contentHash);

    // Check which ones already exist
    const existing = await db
      .select()
      .from(embeddingTable)
      .where(inArray(embeddingTable.contentHash, hashes));

    const existingHashes = new Set(existing.map(e => e.contentHash));

    // Filter out items that already exist with same content
    const newItems = batch
      .map((major, idx) => ({ major, content: contents[idx], hash: hashes[idx] }))
      .filter(item => !existingHashes.has(item.hash));

    if (newItems.length === 0) {
      skipped += batch.length;
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: All ${batch.length} items already exist, skipping...`);
      continue;
    }

    // Generate embeddings for new items
    try {
      const embeddings = await generateEmbeddings(newItems.map(item => item.content));

      // Insert embeddings
      for (let j = 0; j < newItems.length; j++) {
        const item = newItems[j];
        const embedding = embeddings[j];

        // Check if we should update existing or insert new
        const [existingRecord] = await db
          .select()
          .from(embeddingTable)
          .where(eq(embeddingTable.refId, `major-${item.major.id}`))
          .limit(1);

        if (existingRecord) {
          // Update existing record
          await db
            .update(embeddingTable)
            .set({
              content: item.content,
              contentHash: item.hash,
              embedding: embedding,
              metadata: {
                majorId: item.major.id,
                majorName: item.major.majorName,
                degreeType: item.major.degreeType,
                credits: item.major.credits,
                careerCount: item.major.careerPathwayIds?.length || 0,
              },
            })
            .where(eq(embeddingTable.id, existingRecord.id));
          updated++;
        } else {
          // Insert new embedding
          await db
            .insert(embeddingTable)
            .values({
              sourceId: majorCareerSource.id,
              refId: `major-${item.major.id}`,
              title: item.major.majorName,
              campusId: UH_MANOA_CAMPUS_ID,
              content: item.content,
              contentHash: item.hash,
              embedding: embedding,
              metadata: {
                majorId: item.major.id,
                majorName: item.major.majorName,
                degreeType: item.major.degreeType,
                credits: item.major.credits,
                careerCount: item.major.careerPathwayIds?.length || 0,
              },
            });
          inserted++;
        }
      }

      processed += batch.length;
      skipped += batch.length - newItems.length;

      console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(majors.length / batchSize)}: Processed ${newItems.length} new, skipped ${batch.length - newItems.length} existing`);
      
      // Rate limiting - wait a bit between batches
      if (i + batchSize < majors.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`  ❌ Error processing batch:`, error);
      // Continue with next batch
    }
  }

  console.log("\n✓ Major embeddings completed!");
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total processed: ${processed}/${majors.length}\n`);
}

/**
 * Generate embeddings for individual career pathways
 * This helps answer questions about specific careers
 */
async function generateCareerPathwayEmbeddings() {
  console.log("💼 Generating embeddings for career pathways...\n");
  
  // Get or create source
  let [careerSource] = await db
    .select()
    .from(source)
    .where(eq(source.id, "career-pathways"))
    .limit(1);

  if (!careerSource) {
    console.log("Creating source entry...");
    [careerSource] = await db
      .insert(source)
      .values({
        id: "career-pathways",
        name: "Career Pathways Database",
        type: "database",
        url: null,
      })
      .returning();
    console.log("✓ Source created\n");
  }

  // Get all career pathways
  const careers = await db
    .select()
    .from(careerPathway);

  console.log(`Found ${careers.length} career pathways to process\n`);

  // Find which majors lead to each career
  const majors = await db
    .select()
    .from(majorCareerMapping)
    .where(eq(majorCareerMapping.campusId, UH_MANOA_CAMPUS_ID));

  // Build reverse mapping: career -> majors
  const careerToMajors = new Map<number, string[]>();
  for (const major of majors) {
    for (const careerId of major.careerPathwayIds || []) {
      if (!careerToMajors.has(careerId)) {
        careerToMajors.set(careerId, []);
      }
      careerToMajors.get(careerId)!.push(major.majorName);
    }
  }

  // Process in batches
  const batchSize = 50;
  let processed = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  console.log("Processing careers in batches...\n");

  for (let i = 0; i < careers.length; i += batchSize) {
    const batch = careers.slice(i, i + batchSize);
    
    // Prepare content for embedding
    const contents = batch.map(career => {
      const relatedMajors = careerToMajors.get(career.id) || [];

      const parts = [
        `Career: ${career.title}`,
        career.category ? `Category: ${career.category}` : null,
        career.description ? `Description: ${career.description}` : null,
        relatedMajors.length > 0 ? `Related UH Manoa Majors: ${relatedMajors.slice(0, 10).join(", ")}` : null,
        // Natural language for semantic search
        `To become a ${career.title}, you can study: ${relatedMajors.slice(0, 5).join(", ")}`,
        relatedMajors.length > 0 ? `${career.title} career pathway available from ${relatedMajors.length} UH Manoa programs` : null,
      ].filter(Boolean);

      return parts.join("\n");
    });

    // Calculate content hashes
    const hashes = contents.map(contentHash);

    // Check which ones already exist
    const existing = await db
      .select()
      .from(embeddingTable)
      .where(inArray(embeddingTable.contentHash, hashes));

    const existingHashes = new Set(existing.map(e => e.contentHash));

    // Filter out items that already exist
    const newItems = batch
      .map((career, idx) => ({ career, content: contents[idx], hash: hashes[idx] }))
      .filter(item => !existingHashes.has(item.hash));

    if (newItems.length === 0) {
      skipped += batch.length;
      console.log(`  Batch ${Math.floor(i / batchSize) + 1}: All ${batch.length} items already exist, skipping...`);
      continue;
    }

    // Generate embeddings
    try {
      const embeddings = await generateEmbeddings(newItems.map(item => item.content));

      // Insert/update embeddings
      for (let j = 0; j < newItems.length; j++) {
        const item = newItems[j];
        const embedding = embeddings[j];
        const relatedMajors = careerToMajors.get(item.career.id) || [];

        // Check if we should update existing or insert new
        const [existingRecord] = await db
          .select()
          .from(embeddingTable)
          .where(eq(embeddingTable.refId, `career-${item.career.id}`))
          .limit(1);

        if (existingRecord) {
          // Update
          await db
            .update(embeddingTable)
            .set({
              content: item.content,
              contentHash: item.hash,
              embedding: embedding,
              metadata: {
                careerId: item.career.id,
                careerTitle: item.career.title,
                category: item.career.category,
                relatedMajorsCount: relatedMajors.length,
              },
            })
            .where(eq(embeddingTable.id, existingRecord.id));
          updated++;
        } else {
          // Insert
          await db
            .insert(embeddingTable)
            .values({
              sourceId: careerSource.id,
              refId: `career-${item.career.id}`,
              title: item.career.title,
              campusId: UH_MANOA_CAMPUS_ID,
              content: item.content,
              contentHash: item.hash,
              embedding: embedding,
              metadata: {
                careerId: item.career.id,
                careerTitle: item.career.title,
                category: item.career.category,
                relatedMajorsCount: relatedMajors.length,
              },
            });
          inserted++;
        }
      }

      processed += batch.length;
      skipped += batch.length - newItems.length;

      console.log(`  Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(careers.length / batchSize)}: Processed ${newItems.length} new, skipped ${batch.length - newItems.length} existing`);
      
      // Rate limiting
      if (i + batchSize < careers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`  ❌ Error processing batch:`, error);
    }
  }

  console.log("\n✓ Career pathway embeddings completed!");
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Total processed: ${processed}/${careers.length}\n`);
}

// Main execution
async function main() {
  console.log("=".repeat(60));
  console.log("🚀 UH Manoa Major-Career Pathway Embeddings Generator");
  console.log("=".repeat(60));
  console.log();

  try {
    // Generate embeddings for majors with their career pathways
    await generateMajorCareerEmbeddings();

    // Generate embeddings for individual careers
    await generateCareerPathwayEmbeddings();

    console.log("=".repeat(60));
    console.log("✅ All embeddings generated successfully!");
    console.log("=".repeat(60));
    console.log("\n💡 The chatbot can now answer questions like:");
    console.log("   • What careers can I pursue with a Computer Science degree?");
    console.log("   • What should I study to become a software engineer?");
    console.log("   • What are the best majors for healthcare careers?");
    console.log("   • Tell me about career options for Business majors\n");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
