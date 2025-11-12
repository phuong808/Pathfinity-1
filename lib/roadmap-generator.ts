/**
 * AI-Powered Roadmap Generator
 * 
 * Uses GPT-4.1-mini to intelligently generate degree roadmaps that:
 * - Respect prerequisite chains
 * - Select courses relevant to the major
 * - Fulfill credit requirements without excessive overage
 * - Balance semester loads appropriately
 */

import { db } from "@/app/db";
import { 
  profile as profileTable, 
  campus as campusTable, 
  course as courseTable,
  major as majorTable,
  degree as degreeTable,
  majorDegree as majorDegreeTable,
  embedding as embeddingTable
} from "@/app/db/schema";
import { eq, and } from "drizzle-orm";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types
export interface CourseItem {
  name: string;
  credits: number;
}

export interface Semester {
  semester_name: "fall_semester" | "spring_semester" | "summer_semester";
  credits: number;
  courses: CourseItem[];
}

export interface Year {
  year_number: number;
  semesters: Semester[];
}

export interface Roadmap {
  program_name: string;
  institution: string;
  total_credits: number;
  years: Year[];
}

interface CourseData {
  code: string;
  title: string;
  credits: number;
  prerequisites?: string;
  description?: string;
}

// College name to campus ID mapping
export const COLLEGE_TO_CAMPUS_MAPPING: Record<string, string> = {
  "Hawaiʻi Community College": "hawaii_cc",
  "Honolulu Community College": "honolulu_cc",
  "Kapiʻolani Community College": "kapiolani_cc",
  "Kauaʻi Community College": "kauai_cc",
  "Leeward Community College": "leeward_cc",
  "University of Hawaiʻi at Hilo": "uh_hilo",
  "University of Hawaiʻi at Mānoa": "uh_manoa",
  "University of Hawaiʻi at Manoa": "uh_manoa",
  "University of Hawaiʻi - West Oʻahu": "uh_west_oahu",
  "University of Hawaiʻi – West Oʻahu": "uh_west_oahu",
  "Windward Community College": "windward_cc",
  "University of Hawaiʻi Maui College": "uh_maui",
  "Pacific Center for Advanced Technology Training (PCATT)": "pcatt",
};

/**
 * Generate roadmap using AI from profile ID
 */
export async function generateRoadmapFromProfile(profileId: number): Promise<Roadmap> {
  // Fetch profile data
  const profiles = await db
    .select()
    .from(profileTable)
    .where(eq(profileTable.id, profileId))
    .limit(1);

  if (profiles.length === 0) {
    throw new Error(`Profile with ID ${profileId} not found`);
  }

  const profile = profiles[0];
  const { college, major, degree } = profile;

  if (!college || !major || !degree) {
    throw new Error(`Profile ${profileId} is missing required fields: college, major, or degree`);
  }

  // Map college name to campus ID
  const campusId = COLLEGE_TO_CAMPUS_MAPPING[college];
  if (!campusId) {
    throw new Error(`Unknown college: ${college}`);
  }

  return generateRoadmap(campusId, major, degree);
}

/**
 * Generate roadmap using AI from parameters
 */
export async function generateRoadmap(
  campusId: string,
  majorTitle: string,
  degreeCodeOrName: string
): Promise<Roadmap> {
  console.log(`Generating AI roadmap for: ${majorTitle} (${degreeCodeOrName}) at ${campusId}`);

  // 1. Fetch campus info
  const campuses = await db
    .select()
    .from(campusTable)
    .where(eq(campusTable.id, campusId))
    .limit(1);

  if (campuses.length === 0) {
    throw new Error(`Campus with ID ${campusId} not found`);
  }
  const campus = campuses[0];

  // 2. Fetch major
  const majors = await db
    .select()
    .from(majorTable)
    .where(
      and(
        eq(majorTable.campusId, campusId),
        eq(majorTable.title, majorTitle)
      )
    )
    .limit(1);

  if (majors.length === 0) {
    throw new Error(`Major "${majorTitle}" not found for campus ${campusId}`);
  }
  const major = majors[0];

  // 3. Fetch degree (by code OR name)
  const degrees = await db
    .select()
    .from(degreeTable)
    .limit(100);

  const degree = degrees.find(
    (d) => d.code === degreeCodeOrName || d.name === degreeCodeOrName
  );

  if (!degree) {
    throw new Error(`Degree "${degreeCodeOrName}" not found`);
  }

  // 4. Fetch major-degree relationship for credit requirements
  const majorDegrees = await db
    .select()
    .from(majorDegreeTable)
    .where(
      and(
        eq(majorDegreeTable.majorId, major.id),
        eq(majorDegreeTable.degreeId, degree.id)
      )
    )
    .limit(1);

  // If no relationship found, try to get ANY degree for this major as fallback
  let majorDegree;
  if (majorDegrees.length === 0) {
    console.warn(
      `⚠️  No relationship found between major "${majorTitle}" and degree "${degreeCodeOrName}". Trying fallback...`
    );
    
    // Get all degrees for this major
    const allMajorDegrees = await db
      .select()
      .from(majorDegreeTable)
      .where(eq(majorDegreeTable.majorId, major.id))
      .limit(10);
    
    if (allMajorDegrees.length === 0) {
      throw new Error(
        `Major "${majorTitle}" has no associated degrees in the database. Please contact support.`
      );
    }
    
    // Use the first available degree as fallback
    majorDegree = allMajorDegrees[0];
    
    // Get the degree info for logging
    const fallbackDegrees = await db
      .select()
      .from(degreeTable)
      .where(eq(degreeTable.id, majorDegree.degreeId))
      .limit(1);
    
    if (fallbackDegrees.length > 0) {
      const fallbackDegree = fallbackDegrees[0];
      console.log(
        `✅ Using fallback degree: ${fallbackDegree.name || fallbackDegree.code} instead of ${degreeCodeOrName}`
      );
    }
  } else {
    majorDegree = majorDegrees[0];
  }
  const requiredCredits = majorDegree.requiredCredits || 60; // default to 60 if null
  const durationMonths = majorDegree.typicalDuration || 24; // default to 24 months if null
  const durationYears = Math.ceil(durationMonths / 12);

  console.log(`Requirements: ${requiredCredits} credits over ${durationYears} years`);

  // 5. Build prefix mapping from ACTUAL database content for this major
  const relevantPrefixes = await getRelevantPrefixesFromDatabase(campusId, majorTitle);
  console.log(`  Database analysis found prefixes: ${Array.from(relevantPrefixes).join(', ')}`);

  // 6. Fetch ONLY relevant courses using database filtering (prevents hallucination at source)
  const courses = await db
    .select({
      id: courseTable.id,
      code: courseTable.coursePrefix,
      courseNumber: courseTable.courseNumber,
      title: courseTable.courseTitle,
      credits: courseTable.numUnits,
      dept: courseTable.deptName,
    })
    .from(courseTable)
    .where(eq(courseTable.campusId, campusId));

  // 7. Fetch prerequisite information from embeddings
  const embeddings = await db
    .select({
      courseId: embeddingTable.courseId,
      metadata: embeddingTable.metadata,
    })
    .from(embeddingTable)
    .where(eq(embeddingTable.campusId, campusId));

  // Create a map of course ID to prerequisites
  const prereqMap = new Map<number, string>();
  const descriptionMap = new Map<number, string>();

  for (const emb of embeddings) {
    if (emb.courseId && emb.metadata && typeof emb.metadata === "object") {
      const meta = emb.metadata as any;
      if (meta.prerequisites) {
        prereqMap.set(emb.courseId, meta.prerequisites);
      }
      if (meta.description) {
        descriptionMap.set(emb.courseId, meta.description);
      }
    }
  }

  // 8. Filter courses by relevant prefixes and prepare data for AI
  const allCourseData: CourseData[] = courses
    .filter((course) => {
      const prefix = course.code.toUpperCase();
      return relevantPrefixes.has(prefix);
    })
    .map((course) => {
      const code = `${course.code} ${course.courseNumber}`;
      const credits = parseInt(course.credits || "3", 10) || 3;
      
      return {
        code,
        title: course.title || "",
        credits,
        prerequisites: prereqMap.get(course.id),
        description: descriptionMap.get(course.id),
      };
    })
    .filter((course) => course.credits > 0); // Filter out invalid courses

  console.log(`Filtered from ${courses.length} total → ${allCourseData.length} relevant courses`);

  // 9. Further refine by course level if still too many
  const relevantCourses = refineCourseSelection(allCourseData, requiredCredits);
  console.log(`Final selection: ${relevantCourses.length} courses for AI`);

  // 9. Use AI to generate roadmap with filtered courses
  const roadmap = await generateRoadmapWithAI(
    relevantCourses,
    majorTitle,
    degree.name || degree.code, // Use code as fallback if name is null
    campus.name,
    requiredCredits,
    durationYears
  );

  return roadmap;
}

/**
 * Get relevant course prefixes from the database based on major title
 * AGGRESSIVE FILTERING: Returns only core major prefixes + essential gen-ed (5-8 prefixes max)
 */
async function getRelevantPrefixesFromDatabase(
  campusId: string,
  majorTitle: string
): Promise<Set<string>> {
  // Fetch all unique course prefixes for this campus
  const allCourses = await db
    .select({
      prefix: courseTable.coursePrefix,
      dept: courseTable.deptName,
    })
    .from(courseTable)
    .where(eq(courseTable.campusId, campusId));

  // Build a map of prefix → department names
  const prefixToDepts = new Map<string, Set<string>>();
  for (const course of allCourses) {
    const prefix = course.prefix.toUpperCase();
    if (!prefixToDepts.has(prefix)) {
      prefixToDepts.set(prefix, new Set());
    }
    if (course.dept) {
      prefixToDepts.get(prefix)!.add(course.dept.toLowerCase());
    }
  }

  // Extract keywords from major title
  const majorKeywords = majorTitle.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3); // Only longer words (more specific)

  const relevantPrefixes = new Set<string>();

  // Core abbreviation patterns (ONLY most common)
  const coreAbbreviations: Record<string, string[]> = {
    'computer': ['ICS'],
    'information': ['ICS'],
    'business': ['BUS'],
    'account': ['ACC'],
    'economic': ['ECON'],
    'engineer': ['ENGR'],
    'biolog': ['BIOL'],
    'chemist': ['CHEM'],
    'physic': ['PHYS'],
    'mathematic': ['MATH'],
    'english': ['ENG'],
    'psycholog': ['PSY'],
    'nurs': ['NURS'],
    'hawaiian': ['HWST'],
    'communicat': ['COM'],
    'history': ['HIST'],
    'sociology': ['SOC'],
    'anthropology': ['ANTH'],
  };

  // Match major keywords to core prefixes ONLY
  for (const keyword of majorKeywords) {
    for (const [key, prefixes] of Object.entries(coreAbbreviations)) {
      if (keyword.startsWith(key)) {
        prefixes.forEach(p => {
          if (prefixToDepts.has(p)) {
            relevantPrefixes.add(p);
          }
        });
      }
    }
  }

  // Direct prefix matching (first word of major)
  const firstWord = majorTitle.split(/\s+/)[0].toUpperCase();
  for (const prefix of prefixToDepts.keys()) {
    if (prefix === firstWord || prefix === firstWord.substring(0, 4)) {
      relevantPrefixes.add(prefix);
    }
  }

  // Always include ONLY core general education prefixes (minimal set)
  const genEdPrefixes = ['ENG', 'ENGL', 'MATH'];
  genEdPrefixes.forEach(prefix => {
    if (prefixToDepts.has(prefix)) {
      relevantPrefixes.add(prefix);
    }
  });

  // Add COMM/COM only if campus has it (for general ed communication requirement)
  if (prefixToDepts.has('COM')) relevantPrefixes.add('COM');
  else if (prefixToDepts.has('COMM')) relevantPrefixes.add('COMM');

  // Limit to maximum 8 prefixes to keep course count low
  if (relevantPrefixes.size > 8) {
    // Prioritize: major-specific prefixes first, then gen-ed
    const majorSpecific = Array.from(relevantPrefixes).filter(p => !genEdPrefixes.includes(p));
    const limited = new Set([...majorSpecific.slice(0, 5), ...genEdPrefixes]);
    return limited;
  }

  return relevantPrefixes;
}

/**
 * Refine course selection by prioritizing foundational courses
 * AGGRESSIVE FILTERING: Target 40-60 courses max
 */
function refineCourseSelection(
  courses: CourseData[],
  requiredCredits: number
): CourseData[] {
  // MUCH more aggressive target: 40-60 courses only
  const targetCount = Math.min(
    Math.max(Math.ceil((requiredCredits / 3) * 2), 40),
    60
  );

  // If already within target, return as is
  if (courses.length <= targetCount) {
    return courses;
  }

  // Categorize by course level
  const foundational = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 100 && num < 200;
  });

  const intermediate = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 200 && num < 300;
  });

  const advanced = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 300 && num < 500;
  });

  // Sort each category by course number (ascending)
  [foundational, intermediate, advanced].forEach(category => {
    category.sort((a, b) => {
      const getNum = (code: string) => parseInt(code.match(/(\d+)/)?.[1] || "999", 10);
      return getNum(a.code) - getNum(b.code);
    });
  });

  // Distribution strategy: Heavy bias toward foundational courses
  // 60% foundational, 30% intermediate, 10% advanced
  const foundationalCount = Math.ceil(targetCount * 0.60);
  const intermediateCount = Math.ceil(targetCount * 0.30);
  const advancedCount = targetCount - foundationalCount - intermediateCount;

  return [
    ...foundational.slice(0, foundationalCount),
    ...intermediate.slice(0, intermediateCount),
    ...advanced.slice(0, advancedCount),
  ];
}

/**
 * Use OpenAI GPT-4.1-mini to generate a roadmap
 */
async function generateRoadmapWithAI(
  courses: CourseData[],
  majorTitle: string,
  degreeName: string,
  campusName: string,
  requiredCredits: number,
  durationYears: number
): Promise<Roadmap> {
  console.log(`  Sending ${courses.length} carefully curated courses to AI`);
  
  // Create a structured JSON list of courses (harder to hallucinate)
  const courseData = courses.map(c => ({
    code: c.code,
    credits: c.credits,
    title: c.title,
  }));
  
  const systemPrompt = `You are an expert academic advisor creating degree roadmaps.

You will receive a curated list of ${courses.length} available courses. These are the ONLY courses you can use.

CRITICAL RULES:
1. Use ONLY courses from the provided JSON array - NO EXCEPTIONS
2. DO NOT invent, guess, or modify any course codes
3. If you need more courses, repeat existing ones or use fewer courses
4. Copy course codes EXACTLY from the "code" field
5. Every course MUST exist in the JSON array

Requirements:
- Major: ${majorTitle}  
- Degree: ${degreeName}
- Credits: ${requiredCredits} minimum (can go slightly over if needed)
- Duration: ${durationYears} years (fall/spring only)
- Load: 12-18 credits per semester

The course list is SMALL and CURATED - use these exact courses only.`;

  const userPrompt = `AVAILABLE COURSES (${courses.length} total - use ONLY these):
${JSON.stringify(courseData, null, 2)}

Create a ${durationYears}-year roadmap using ONLY courses from above.

IMPORTANT: The list above contains ALL available courses. Do NOT use any course not in this list.

Return valid JSON:
{
  "program_name": "${degreeName} in ${majorTitle}",
  "institution": "${campusName}",
  "total_credits": 0,
  "years": [
    {
      "year_number": 1,
      "semesters": [
        {
          "semester_name": "fall_semester",
          "credits": 0,
          "courses": [
            {"name": "EXACT CODE FROM JSON", "credits": NUMBER}
          ]
        }
      ]
    }
  ]
}

VERIFY BEFORE SUBMITTING: Check that EVERY course "name" exactly matches a "code" from the JSON array.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Very low for maximum accuracy
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const roadmap = JSON.parse(content) as Roadmap;
    
    // Validate the roadmap structure and course validity
    validateRoadmap(roadmap, requiredCredits, courses);
    
    console.log(`AI generated roadmap with ${roadmap.total_credits} credits`);
    
    return roadmap;
  } catch (error) {
    console.error("Error generating roadmap with AI:", error);
    throw new Error(`Failed to generate roadmap with AI: ${error}`);
  }
}

/**
 * Validate roadmap structure and requirements
 * Replace hallucinated courses with "Elective" instead of throwing errors
 */
function validateRoadmap(roadmap: Roadmap, requiredCredits: number, availableCourses: CourseData[]): void {
  if (!roadmap.years || !Array.isArray(roadmap.years)) {
    throw new Error("Invalid roadmap: missing years array");
  }

  // Create a set of valid course codes for quick lookup
  const validCourseCodes = new Set(availableCourses.map(c => c.code));
  const invalidCourses: string[] = [];

  let totalCredits = 0;
  for (const year of roadmap.years) {
    if (!year.semesters || !Array.isArray(year.semesters)) {
      throw new Error(`Invalid roadmap: year ${year.year_number} missing semesters`);
    }
    for (const semester of year.semesters) {
      if (!semester.courses || !Array.isArray(semester.courses)) {
        throw new Error(`Invalid roadmap: semester missing courses`);
      }
      for (const course of semester.courses) {
        // Check if course exists in database
        if (!validCourseCodes.has(course.name)) {
          const originalName = course.name;
          invalidCourses.push(originalName);
          // Replace hallucinated course with Elective placeholder
          course.name = "ELECTIVE";
          console.warn(`   ⚠️  Replaced hallucinated course "${originalName}" with ELECTIVE in Year ${year.year_number}, ${semester.semester_name}`);
        }
        totalCredits += course.credits;
      }
    }
  }

  // Log warning if AI hallucinated courses (but don't throw error)
  if (invalidCourses.length > 0) {
    console.warn(`⚠️  AI hallucinated ${invalidCourses.length} courses: ${invalidCourses.join(', ')}`);
    console.warn(`   These have been replaced with ELECTIVE placeholders. Roadmap will still be saved.`);
  }

  roadmap.total_credits = totalCredits;

  // Log credit status
  const creditDifference = totalCredits - requiredCredits;
  const percentOver = ((totalCredits / requiredCredits) - 1) * 100;
  
  if (totalCredits < requiredCredits) {
    console.warn(`⚠️  Roadmap has ${totalCredits} credits but requires ${requiredCredits} (short by ${Math.abs(creditDifference)} credits)`);
  } else if (totalCredits === requiredCredits) {
    console.log(`✅ Roadmap exactly meets requirement: ${totalCredits} credits`);
  } else if (percentOver <= 10) {
    console.log(`✅ Roadmap has ${totalCredits} credits (${percentOver.toFixed(1)}% over required ${requiredCredits})`);
  } else {
    console.warn(`⚠️  Roadmap has ${totalCredits} credits, which is ${percentOver.toFixed(1)}% over required ${requiredCredits}`);
  }
}

/**
 * Save roadmap to profile
 */
export async function saveRoadmapToProfile(
  profileId: number,
  roadmap: Roadmap
): Promise<void> {
  await db
    .update(profileTable)
    .set({
      roadmap: roadmap as any,
      updatedAt: new Date(),
    })
    .where(eq(profileTable.id, profileId));

  console.log(`Saved roadmap to profile ${profileId}`);
}

/**
 * Generate and save roadmap for a profile (convenience function)
 */
export async function generateAndSaveRoadmap(profileId: number): Promise<Roadmap> {
  const roadmap = await generateRoadmapFromProfile(profileId);
  await saveRoadmapToProfile(profileId, roadmap);
  return roadmap;
}
