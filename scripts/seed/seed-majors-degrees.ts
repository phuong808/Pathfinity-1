// run with: npx tsx scripts/seed/seed-majors-degrees.ts

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { db } from '../../app/db/index';
import { degree, major, majorDegree } from '../../app/db/schema';
import { eq, and } from 'drizzle-orm';

dotenv.config();

// Path to the source JSON file (already in repo)
const jsonPath = path.join(__dirname, '..', '..', 'app', 'db', 'data', 'uh_majors_colleges_specific_degrees.json');

// Map human-readable college names (as they appear in the JSON) to the campus.id values used by your seed-campuses script.
const collegeToCampusId: Record<string, string> = {
  'University of Hawaiʻi at Mānoa': 'uh_manoa',
  'University of Hawaiʻi at Hilo': 'uh_hilo',
  'Hawaiʻi Community College': 'hawaii_cc',
  "Kapiʻolani Community College": 'kapiolani_cc',
  "Kauaʻi Community College": 'kauai_cc',
  'Leeward Community College': 'leeward_cc',
  'Maui College': 'uh_maui',
  'Honolulu Community College': 'honolulu_cc',
  'University of Hawaiʻi–West Oʻahu': 'uh_west_oahu',
  'Windward Community College': 'windward_cc',
};

// A small catalog translating common codes to human-friendly names and levels.
// Extend this map as needed; unknown codes will be created with the code as the name and level 'unknown'.
const degreeCatalog: Record<string, { name: string; level: string }> = {
  // Associate Degrees
  'AA': { name: 'Associate in Arts', level: 'associate' },
  'AS': { name: 'Associate in Science', level: 'associate' },
  'AAS': { name: 'Associate in Applied Science', level: 'associate' },
  'ATS': { name: 'Associate in Technical Studies', level: 'associate' },
  
  // Certificates
  'CO': { name: 'Certificate of Competence', level: 'certificate' },
  'CA': { name: 'Certificate of Achievement', level: 'certificate' },
  'SC': { name: 'Subject Certificate', level: 'certificate' },
  'ASC': { name: 'Academic Subject Certificate', level: 'certificate' },
  'UCert': { name: 'Undergraduate Certificate', level: 'certificate' },
  'GCert': { name: 'Graduate Certificate', level: 'graduate_certificate' },
  'APC': { name: 'Advanced Professional Certificate', level: 'post_baccalaureate_certificate' },
  'PB': { name: 'Post-Baccalaureate Certificate', level: 'post_baccalaureate_certificate' },
  
  // Baccalaureate Degrees
  'BA': { name: 'Bachelor of Arts', level: 'baccalaureate' },
  'BS': { name: 'Bachelor of Science', level: 'baccalaureate' },
  'BBA': { name: 'Bachelor of Business Administration', level: 'baccalaureate' },
  'BAS': { name: 'Bachelor of Applied Science', level: 'baccalaureate' },
  'BSW': { name: 'Bachelor of Social Work', level: 'baccalaureate' },
  'BEnvD': { name: 'Bachelor of Environmental Design', level: 'baccalaureate' },
  'BEd': { name: 'Bachelor of Education', level: 'baccalaureate' },
  'BMus': { name: 'Bachelor of Music', level: 'baccalaureate' },
  'BFA': { name: 'Bachelor of Fine Arts', level: 'baccalaureate' },
  
  // Master's Degrees
  'MA': { name: 'Master of Arts', level: 'graduate' },
  'MS': { name: 'Master of Science', level: 'graduate' },
  'MEd': { name: 'Master of Education', level: 'graduate' },
  'MEdT': { name: 'Master of Education in Teaching', level: 'graduate' },
  'MSW': { name: 'Master of Social Work', level: 'graduate' },
  'MPA': { name: 'Master of Public Administration', level: 'graduate' },
  'MPH': { name: 'Master of Public Health', level: 'graduate' },
  'MBA': { name: 'Master of Business Administration', level: 'graduate' },
  'MLA': { name: 'Master of Landscape Architecture', level: 'graduate' },
  'MEM': { name: 'Master of Environmental Management', level: 'graduate' },
  'MHRM': { name: 'Master of Human Resource Management', level: 'graduate' },
  'MAcc': { name: 'Master of Accountancy', level: 'graduate' },
  'MLISC': { name: 'Master of Library and Information Science', level: 'graduate' },
  'MMus': { name: 'Master of Music', level: 'graduate' },
  'MFA': { name: 'Master of Fine Arts', level: 'graduate' },
  'MURP': { name: 'Master of Urban and Regional Planning', level: 'graduate' },
  'LLM': { name: 'Master of Laws', level: 'graduate' },
  
  // Doctoral Degrees
  'PhD': { name: 'Doctor of Philosophy', level: 'doctorate' },
  'EdD': { name: 'Doctor of Education', level: 'professional_doctorate' },
  'JD': { name: 'Juris Doctor', level: 'professional_doctorate' },
  'PharmD': { name: 'Doctor of Pharmacy', level: 'professional_doctorate' },
  'DNP': { name: 'Doctor of Nursing Practice', level: 'professional_doctorate' },
  'MD': { name: 'Doctor of Medicine', level: 'professional_doctorate' },
};

  // Reasonable default mappings for required credits and typical duration (in months)
  // These are defaults only — specific majors may differ and can be updated later.
  // For ranges, we use the UPPER bound to give conservative estimates for student planning.
  const degreeDefaults: Record<string, { requiredCredits?: number | null; typicalDuration?: number | null }> = {
    // Baccalaureate Degrees (120 credit standard, 48 months = 4 years)
    'BA': { requiredCredits: 120, typicalDuration: 48 },
    'BS': { requiredCredits: 120, typicalDuration: 48 },
    'BBA': { requiredCredits: 120, typicalDuration: 48 },
    'BAS': { requiredCredits: 120, typicalDuration: 48 },
    'BSW': { requiredCredits: 120, typicalDuration: 48 },
    'BEd': { requiredCredits: 120, typicalDuration: 48 },
    'BMus': { requiredCredits: 120, typicalDuration: 48 },
    'BFA': { requiredCredits: 120, typicalDuration: 48 },
    'BEnvD': { requiredCredits: 128, typicalDuration: 48 }, // Specialized program (higher credits, same duration)
    
    // Associate Degrees (60 credit standard, 24 months = 2 years)
    'AA': { requiredCredits: 60, typicalDuration: 24 },
    'AS': { requiredCredits: 60, typicalDuration: 24 },
    'AAS': { requiredCredits: 60, typicalDuration: 24 },
    'ATS': { requiredCredits: 60, typicalDuration: 24 },
    // Certificates (Variable credits by type)
    'CO': { requiredCredits: 14, typicalDuration: 6 }, // 4-24 credits (midpoint 14), short-term (<1 year)
    'CA': { requiredCredits: 38, typicalDuration: 12 }, // 24-51 credits (midpoint 38), typically a one-year certificate
    'SC': { requiredCredits: 12, typicalDuration: 6 }, // Minimum 12 credits, short certificate 
    'ASC': { requiredCredits: 12, typicalDuration: 12 }, // Minimum 12 credits, designed to fit within the AA 
    'UCert': { requiredCredits: 15, typicalDuration: 12 }, // Minimum 15 credits, 1-2 semesters 
    'GCert': { requiredCredits: 15, typicalDuration: 12 }, // Minimum 15 credits, typically 1 year 
    'APC': { requiredCredits: 24, typicalDuration: 12 }, // 18-30 credits (midpoint 24), 1-2 semesters 
    'PB': { requiredCredits: 31, typicalDuration: 18 }, // Based on example Post-Baccalaureate Education program credits 

    // Master's Degrees (30 credit standard, 24 months = 2 years)
    'MA': { requiredCredits: 30, typicalDuration: 24 },
    'MS': { requiredCredits: 30, typicalDuration: 24 },
    'MEd': { requiredCredits: 30, typicalDuration: 24 },
    'MEdT': { requiredCredits: 30, typicalDuration: 24 },
    'MSW': { requiredCredits: 30, typicalDuration: 24 },
    'MPA': { requiredCredits: 30, typicalDuration: 24 },
    'MPH': { requiredCredits: 30, typicalDuration: 24 },
    'MBA': { requiredCredits: 30, typicalDuration: 24 },
    'MLA': { requiredCredits: 30, typicalDuration: 24 },
    'MEM': { requiredCredits: 30, typicalDuration: 24 },
    'MHRM': { requiredCredits: 30, typicalDuration: 24 },
    'MAcc': { requiredCredits: 30, typicalDuration: 24 },
    'MLISC': { requiredCredits: 30, typicalDuration: 24 },
    'MMus': { requiredCredits: 30, typicalDuration: 24 },
    'MFA': { requiredCredits: 30, typicalDuration: 24 },
    'MURP': { requiredCredits: 30, typicalDuration: 24 },
    'LLM': { requiredCredits: 24, typicalDuration: 12 }, // Post-JD degree, 1 year = 12 months
    
    // Doctoral Degrees (variable, research-based)
    'PhD': { requiredCredits: null, typicalDuration: 60 }, // Varies greatly (e.g., 66-84 credits) [19, 20]; 3-5 years (60 months used for upper range)
    'EdD': { requiredCredits: 64, typicalDuration: 48 }, // Fixed 64 credits post-master's [21]; 3-4 years
    'JD': { requiredCredits: 89, typicalDuration: 36 }, // Minimum 89 credits [22]; 3 years
    'PharmD': { requiredCredits: 144, typicalDuration: 48 }, // Fixed 144 credits [23]; 4 years
    'DNP': { requiredCredits: 40, typicalDuration: 36 }, // 37-42 credits post-MSN (midpoint 40) [24]; 2.5-3 years
    'MD': { requiredCredits: null, typicalDuration: 48 }, // 4 years is standard duration
};

function unique<T>(arr: T[]) { return Array.from(new Set(arr)); }

async function seed() {
  const startTime = Date.now();
  console.log('🚀 Starting majors & degrees seed...\n');
  
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw) as Record<string, Record<string, string[]>>;

  const allDegreeCodes = new Set<string>();

  // Step 1: Collect all unique degree codes from JSON
  console.log('📊 Step 1: Analyzing JSON data...');
  for (const college of Object.keys(data)) {
    const majors = data[college];
    for (const major of Object.keys(majors)) {
      for (const code of majors[major]) {
        if (code && code.trim()) allDegreeCodes.add(code.trim());
      }
    }
  }

  const totalColleges = Object.keys(data).length;
  const totalMajorsInJson = Object.values(data).reduce((sum, majors) => sum + Object.keys(majors).length, 0);
  console.log(`   ✓ Found ${totalColleges} colleges`);
  console.log(`   ✓ Found ${totalMajorsInJson} total majors`);
  console.log(`   ✓ Found ${allDegreeCodes.size} unique degree codes\n`);

  // Step 2: Insert all degrees (idempotent via onConflictDoNothing)
  console.log('🎓 Step 2: Seeding degrees...');
  let degreesInserted = 0;
  let degreesExisted = 0;
  
  for (const code of Array.from(allDegreeCodes).sort()) {
    const meta = degreeCatalog[code] || { name: code, level: 'unknown' };

    // check if degree already exists for clearer logging
    const existing = await db
      .select()
      .from(degree)
      .where(eq(degree.code, code))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(degree)
        .values({
          code: code,
          name: meta.name,
          level: meta.level,
        })
        .onConflictDoNothing();
      degreesInserted++;
      console.log(`   ➕ ${code.padEnd(8)} — ${meta.name}`);
    } else {
      degreesExisted++;
      console.log(`   ✓  ${code.padEnd(8)} — ${existing[0].name || meta.name} (exists)`);
    }
  }
  console.log(`\n   📈 Summary: ${degreesInserted} inserted, ${degreesExisted} already existed\n`);

  // Step 3: Insert majors and major_degrees for each college
  console.log('🏫 Step 3: Seeding majors and major-degree links...\n');
  let majorCount = 0;
  let majorExisted = 0;
  let majorDegreeCount = 0;
  let majorDegreeExisted = 0;
  let skippedColleges = 0;
  let processedColleges = 0;

  const colleges = Object.keys(data).sort();
  for (const college of colleges) {
    processedColleges++;
    const collegeProgress = `[${processedColleges}/${colleges.length}]`;
    console.log(`${collegeProgress} 🏛️  ${college}`);
    
    const campusId = collegeToCampusId[college];
    if (!campusId) {
      console.warn(`   ⚠️  No campus mapping found - SKIPPING\n`);
      skippedColleges++;
      continue;
    }

    const majorsForCollege = data[college];
    const majorsList = Object.keys(majorsForCollege).sort();
    console.log(`   Campus: ${campusId} | Majors: ${majorsList.length}`);

    let collegeNewMajors = 0;
    let collegeNewLinks = 0;

    for (const majorTitle of majorsList) {
      // Check if major already exists
      const existingMajor = await db
        .select()
        .from(major)
        .where(and(eq(major.campusId, campusId), eq(major.title, majorTitle)))
        .limit(1);

      let majorId: number;
      
      if (existingMajor.length > 0) {
        majorId = existingMajor[0].id;
        majorExisted++;
      } else {
        // Insert new major (credits/duration are stored per-degree in major_degrees)
        const [inserted] = await db.insert(major)
          .values({
            campusId: campusId,
            title: majorTitle,
          })
          .returning();
        majorId = inserted.id;
        majorCount++;
        collegeNewMajors++;
        console.log(`   ➕ Major: ${majorTitle} (id=${majorId})`);
      }

      // For each degree code, link to major via major_degrees
      const codes = unique(majorsForCollege[majorTitle].map((c: string) => c.trim()).filter(Boolean));
      
      for (const code of codes) {
        // Get degree_id for this code
        const degreeRecord = await db
          .select()
          .from(degree)
          .where(eq(degree.code, code))
          .limit(1);

        if (degreeRecord.length === 0) {
          console.warn(`      ⚠️  Degree code "${code}" not found - skipping link`);
          continue;
        }

        const degreeId = degreeRecord[0].id;

        // Check if major_degree link already exists
        const existingLink = await db
          .select()
          .from(majorDegree)
          .where(and(eq(majorDegree.majorId, majorId), eq(majorDegree.degreeId, degreeId)))
          .limit(1);

        if (existingLink.length === 0) {
          // Get defaults for this degree
          const def = degreeDefaults[code] || {};
          
          await db.insert(majorDegree)
            .values({
              majorId: majorId,
              degreeId: degreeId,
              requiredCredits: def.requiredCredits ?? null,
              typicalDuration: def.typicalDuration ?? null,
            });
          majorDegreeCount++;
          collegeNewLinks++;
        } else {
          majorDegreeExisted++;
        }
      }
    }
    
    console.log(`   📊 College summary: ${collegeNewMajors} new majors, ${collegeNewLinks} new links\n`);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ SEEDING COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`⏱️  Duration: ${duration}s\n`);
  console.log('📊 SUMMARY:');
  console.log(`   Degrees:        ${degreesInserted} inserted, ${degreesExisted} existed (${allDegreeCodes.size} total)`);
  console.log(`   Majors:         ${majorCount} inserted, ${majorExisted} existed (${majorCount + majorExisted} total)`);
  console.log(`   Major-Degrees:  ${majorDegreeCount} inserted, ${majorDegreeExisted} existed (${majorDegreeCount + majorDegreeExisted} total)`);
  console.log(`   Colleges:       ${processedColleges - skippedColleges} processed, ${skippedColleges} skipped`);
  console.log('═══════════════════════════════════════════════════════\n');
  
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
