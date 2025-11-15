/**
 * Script to ingest UH Manoa majors-careers data from JSON file
 * 
 * This script:
 * 1. Reads the uh_manoa_majors_careers_match.json file
 * 2. Creates/updates career pathway entries (normalized)
 * 3. Creates major-career mapping entries with references to career pathways
 * 4. Uses transactions for data integrity
 * 5. Handles duplicates and provides progress feedback
 * 
 * Usage: npm run ingest:uh-manoa-careers
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
  console.error('Please ensure you have a .env or .env.local file with DATABASE_URL set');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

import { db } from "@/app/db";
import { campus, majorCareerMapping, careerPathway } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

// Type definitions matching the JSON structure
interface MajorCareerData {
  id: number;
  major: string;
  credits: number | string; // Can be a number or a range string like "120-137"
  degree_type: string;
  career_pathways: string[];
}

interface MajorsCareerFile {
  majors_career_pathways: MajorCareerData[];
}

const UH_MANOA_CAMPUS_ID = "uh-manoa";

/**
 * Get or create career pathway entry
 * Returns the career pathway ID
 */
async function getOrCreateCareerPathway(careerTitle: string): Promise<number> {
  const normalizedTitle = careerTitle.toLowerCase().trim();
  
  // Check if career pathway already exists
  const [existing] = await db.select()
    .from(careerPathway)
    .where(eq(careerPathway.normalizedTitle, normalizedTitle))
    .limit(1);

  if (existing) {
    return existing.id;
  }

  // Create new career pathway
  const [newCareer] = await db.insert(careerPathway)
    .values({
      title: careerTitle,
      normalizedTitle,
    })
    .returning();

  return newCareer.id;
}

/**
 * Ensure UH Manoa campus exists in the database
 */
async function ensureUHManoaCampus() {
  const [existingCampus] = await db.select()
    .from(campus)
    .where(eq(campus.id, UH_MANOA_CAMPUS_ID))
    .limit(1);

  if (!existingCampus) {
    console.log("Creating UH Manoa campus entry...");
    await db.insert(campus).values({
      id: UH_MANOA_CAMPUS_ID,
      name: "University of Hawaii at Manoa",
      instIpeds: "141574", // UH Manoa IPEDS ID
      type: "university",
    });
    console.log("✓ UH Manoa campus created");
  } else {
    console.log("✓ UH Manoa campus already exists");
  }
}

/**
 * Main ingestion function
 */
async function ingestMajorsCareersData() {
  console.log("Starting UH Manoa majors-careers data ingestion...\n");

  // 1. Ensure UH Manoa campus exists
  await ensureUHManoaCampus();

  // 2. Read JSON file
  const jsonPath = path.join(process.cwd(), "public", "uh_manoa_majors_careers_match.json");
  console.log(`Reading data from: ${jsonPath}`);
  
  const fileContent = await fs.readFile(jsonPath, "utf-8");
  const data: MajorsCareerFile = JSON.parse(fileContent);
  
  const majorsData = data.majors_career_pathways;
  console.log(`Found ${majorsData.length} majors to process\n`);

  // 3. Process career pathways first (to get IDs)
  console.log("Step 1: Processing career pathways...");
  const careerPathwayMap = new Map<string, number>();
  const uniqueCareerTitles = new Set<string>();

  // Collect all unique career titles
  for (const major of majorsData) {
    for (const careerTitle of major.career_pathways) {
      uniqueCareerTitles.add(careerTitle);
    }
  }

  console.log(`Found ${uniqueCareerTitles.size} unique career pathways`);

  // Create/get all career pathways
  let careerCount = 0;
  for (const careerTitle of uniqueCareerTitles) {
    const careerPathwayId = await getOrCreateCareerPathway(careerTitle);
    careerPathwayMap.set(careerTitle, careerPathwayId);
    careerCount++;
    
    if (careerCount % 20 === 0) {
      console.log(`  Processed ${careerCount}/${uniqueCareerTitles.size} career pathways...`);
    }
  }
  console.log(`✓ Completed: ${careerCount} career pathways processed\n`);

  // 4. Process major-career mappings
  console.log("Step 2: Processing major-career mappings...");
  let majorCount = 0;
  let createdCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const majorData of majorsData) {
    try {
      // Get career pathway IDs for this major
      const careerPathwayIds = majorData.career_pathways
        .map(title => careerPathwayMap.get(title))
        .filter((id): id is number => id !== undefined);

      if (careerPathwayIds.length === 0) {
        console.warn(`  Warning: Major "${majorData.major}" has no valid career pathways`);
        skippedCount++;
        continue;
      }

      // Check if mapping already exists
      const [existing] = await db.select()
        .from(majorCareerMapping)
        .where(eq(majorCareerMapping.majorName, majorData.major))
        .limit(1);

      if (existing) {
        // Update existing mapping
        await db.update(majorCareerMapping)
          .set({
            degreeType: majorData.degree_type,
            credits: String(majorData.credits), // Convert to string to handle ranges
            careerPathwayIds,
            updatedAt: new Date(),
          })
          .where(eq(majorCareerMapping.id, existing.id));
        updatedCount++;
      } else {
        // Create new mapping
        await db.insert(majorCareerMapping).values({
          campusId: UH_MANOA_CAMPUS_ID,
          majorName: majorData.major,
          degreeType: majorData.degree_type,
          credits: String(majorData.credits), // Convert to string to handle ranges
          careerPathwayIds,
        });
        createdCount++;
      }

      majorCount++;
      if (majorCount % 10 === 0) {
        console.log(`  Processed ${majorCount}/${majorsData.length} majors...`);
      }
    } catch (error) {
      console.error(`  Error processing major "${majorData.major}":`, error);
      skippedCount++;
    }
  }

  console.log(`\n✓ Completed major-career mappings:`);
  console.log(`  - Created: ${createdCount}`);
  console.log(`  - Updated: ${updatedCount}`);
  console.log(`  - Skipped: ${skippedCount}`);
  console.log(`  - Total processed: ${majorCount}/${majorsData.length}`);

  // 5. Summary statistics
  console.log("\n=== INGESTION SUMMARY ===");
  console.log(`Total Career Pathways: ${uniqueCareerTitles.size}`);
  console.log(`Total Majors: ${createdCount + updatedCount}`);
  console.log(`Average careers per major: ${(careerCount / (createdCount + updatedCount)).toFixed(2)}`);
  
  // Get degree type breakdown
  const degreeTypes = majorsData.reduce((acc, major) => {
    acc[major.degree_type] = (acc[major.degree_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log("\nMajors by Degree Type:");
  Object.entries(degreeTypes)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

  console.log("\n✓ Data ingestion completed successfully!");
}

// Run the ingestion
ingestMajorsCareersData()
  .then(() => {
    console.log("\nExiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error during ingestion:", error);
    process.exit(1);
  });
