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
import { getCampusDisciplineMapping } from "./campus-prefixes";

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
  const { college, major, degree, skills } = profile;

  if (!college || !major || !degree) {
    throw new Error(`Profile ${profileId} is missing required fields: college, major, or degree`);
  }

  // Map college name to campus ID
  const campusId = COLLEGE_TO_CAMPUS_MAPPING[college];
  if (!campusId) {
    throw new Error(`Unknown college: ${college}`);
  }

  // Extract skills array from jsonb field
  const userSkills = skills ? (Array.isArray(skills) ? skills : []) : [];

  return generateRoadmap(campusId, major, degree, userSkills);
}

/**
 * Generate roadmap using AI from parameters
 */
export async function generateRoadmap(
  campusId: string,
  majorTitle: string,
  degreeCodeOrName: string,
  userSkills: string[] = []
): Promise<Roadmap> {
  console.log(`Generating AI roadmap for: ${majorTitle} (${degreeCodeOrName}) at ${campusId}`);
  if (userSkills.length > 0) {
    console.log(`User skills: ${userSkills.join(', ')}`);
  }

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
      `[WARN]  No relationship found between major "${majorTitle}" and degree "${degreeCodeOrName}". Trying fallback...`
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
        `[OK] Using fallback degree: ${fallbackDegree.name || fallbackDegree.code} instead of ${degreeCodeOrName}`
      );
    }
  } else {
    majorDegree = majorDegrees[0];
  }
  const requiredCredits = majorDegree.requiredCredits || 60; // default to 60 if null
  const durationMonths = majorDegree.typicalDuration || 24; // default to 24 months if null
  const durationYears = Math.ceil(durationMonths / 12);

  // Determine if this is an undergraduate program (needs Gen Ed) or graduate/certificate (doesn't)
  const degreeLevel = degree.level?.toLowerCase() || '';
  const isUndergraduate = degreeLevel === 'undergraduate' || 
                          degreeLevel === 'bachelor' || 
                          degreeLevel === "bachelor's" ||
                          degree.code?.toUpperCase().startsWith('B') || // BA, BS, BBA, etc.
                          degree.name?.toLowerCase().includes('bachelor');
  
  console.log(`Requirements: ${requiredCredits} credits over ${durationYears} years`);
  console.log(`Degree level: ${degreeLevel || 'unknown'} (${isUndergraduate ? 'Undergraduate - includes Gen Ed' : 'Graduate/Certificate - major courses only'})`);

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
  const relevantCourses = refineCourseSelection(allCourseData, requiredCredits, durationYears);
  console.log(`Final selection: ${relevantCourses.length} courses for AI`);

  // 9. Use AI to generate roadmap with filtered courses
  const roadmap = await generateRoadmapWithAI(
    relevantCourses,
    majorTitle,
    degree.name || degree.code, // Use code as fallback if name is null
    campus.name,
    requiredCredits,
    durationYears,
    userSkills,
    isUndergraduate // Pass whether Gen Ed is required
  );

  return roadmap;
}

/**
 * Get relevant course prefixes from the database based on major title
 * Uses campus-specific prefix mappings to handle variations across UH System
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

  // Extract keywords from major title - be more specific
  const majorKeywords = majorTitle.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3); // Only longer words (more specific)

  const relevantPrefixes = new Set<string>();

  // Get campus-specific prefix mappings (or default)
  const campusPrefixes = getCampusDisciplineMapping(campusId);

  // Match major keywords to campus-specific prefixes
  // STRICT matching: only match full words at the START of discipline names
  for (const keyword of majorKeywords) {
    for (const [discipline, prefixes] of Object.entries(campusPrefixes)) {
      // Split discipline by underscore
      const disciplineParts = discipline.split('_');
      
      // Only match if keyword is the FIRST part of the discipline
      // e.g., "computer" matches "computer_science" but "science" does NOT match "political_science"
      if (disciplineParts[0] === keyword) {
        (prefixes as string[]).forEach((p: string) => {
          if (prefixToDepts.has(p)) {
            relevantPrefixes.add(p);
            console.log(`  Matched "${keyword}" -> ${p} (${discipline})`);
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
      console.log(`  Direct match: "${firstWord}" -> ${prefix}`);
    }
  }

  // Limit to reasonable number of major-specific prefixes
  // We ONLY focus on major-related courses we can accurately map
  if (relevantPrefixes.size > 15) {
    const limited = new Set(Array.from(relevantPrefixes).slice(0, 15));
    console.log(`  Limited from ${relevantPrefixes.size} to ${limited.size} prefixes`);
    return limited;
  }

  return relevantPrefixes;
}

/**
 * Refine course selection with balanced level distribution
 * Provides progression from introductory to advanced courses
 */
function refineCourseSelection(
  courses: CourseData[],
  requiredCredits: number,
  durationYears: number
): CourseData[] {
  // Target: Ensure enough courses to meet credit requirements
  const minCoursesNeeded = Math.ceil(requiredCredits / 3);
  
  // Add buffer of 80% more courses to give AI plenty of options
  const targetCount = Math.min(
    Math.ceil(minCoursesNeeded * 1.8),
    150 // Cap at 150 courses
  );

  console.log(`  Target course count: ${targetCount} (need ~${minCoursesNeeded} courses for ${requiredCredits} credits)`);

  // If already within target, return as is
  if (courses.length <= targetCount) {
    return courses;
  }

  // Categorize by course level (100s, 200s, 300s, 400s)
  const level100 = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 100 && num < 200;
  });

  const level200 = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 200 && num < 300;
  });

  const level300 = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 300 && num < 400;
  });

  const level400 = courses.filter(c => {
    const num = parseInt(c.code.match(/(\d+)/)?.[1] || "999", 10);
    return num >= 400 && num < 500;
  });

  // Sort each level by course number (ascending)
  [level100, level200, level300, level400].forEach(category => {
    category.sort((a, b) => {
      const getNum = (code: string) => parseInt(code.match(/(\d+)/)?.[1] || "999", 10);
      return getNum(a.code) - getNum(b.code);
    });
  });

  // Distribution based on program duration
  // 2-year: 40% 100s, 60% 200s
  // 4-year: 25% 100s, 30% 200s, 30% 300s, 15% 400s
  let count100, count200, count300, count400;
  
  if (durationYears <= 2) {
    count100 = Math.ceil(targetCount * 0.40);
    count200 = targetCount - count100;
    count300 = 0;
    count400 = 0;
  } else {
    count100 = Math.ceil(targetCount * 0.25);
    count200 = Math.ceil(targetCount * 0.30);
    count300 = Math.ceil(targetCount * 0.30);
    count400 = targetCount - count100 - count200 - count300;
  }

  return [
    ...level100.slice(0, count100),
    ...level200.slice(0, count200),
    ...level300.slice(0, count300),
    ...level400.slice(0, count400),
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
  durationYears: number,
  userSkills: string[] = [],
  isUndergraduate: boolean = true
): Promise<Roadmap> {
  console.log(`  Sending ${courses.length} carefully curated courses to AI`);
  if (userSkills.length > 0) {
    console.log(`  User's desired skills: ${userSkills.join(', ')}`);
  }
  console.log(`  Program type: ${isUndergraduate ? 'Undergraduate (includes Gen Ed)' : 'Graduate/Certificate (major only)'}`);
  
  const systemPrompt = `You are an expert academic advisor creating CAREER-FOCUSED degree pathways for University of Hawaiʻi System students.

MISSION: Build a ${majorTitle} pathway that prioritizes skill development and career readiness.

PROGRAM TYPE: ${isUndergraduate ? 'UNDERGRADUATE (Bachelor\'s Degree)' : 'GRADUATE/CERTIFICATE PROGRAM'}

${userSkills.length > 0 ? `STUDENT'S CAREER GOALS:
The student wants to develop these specific skills: ${userSkills.join(', ')}
PRIORITIZE ${majorTitle} courses that build these skills.
` : ''}

═══════════════════════════════════════════════════════════════════
SIMPLIFIED APPROACH - MAJOR FIRST, PLACEHOLDERS FOR THE REST
═══════════════════════════════════════════════════════════════════

YOUR TASK:
1. Select ${majorTitle} courses from the provided list (use actual course codes)
2. Use PLACEHOLDERS for everything else (Gen Ed, support courses, electives)

${isUndergraduate ? `TARGET DISTRIBUTION (${requiredCredits} credits):
- ${majorTitle} major courses: ~${Math.floor(requiredCredits * 0.50)} credits (PRIORITY - use actual courses)
- General Education: ~${Math.floor(requiredCredits * 0.30)} credits (use "Gen Ed Requirement" placeholder)
- Support courses (Math/Science): ~${Math.floor(requiredCredits * 0.10)} credits (use "Support Course" placeholder)
- Electives: ~${Math.floor(requiredCredits * 0.10)} credits (use "Elective" placeholder)

PLACEHOLDERS TO USE:
- "Gen Ed Requirement" (3 credits) - for any general education need
- "Support Course" (3-4 credits) - for math, science, or related courses
- "Elective" (3 credits) - for any elective credit` : `TARGET DISTRIBUTION (${requiredCredits} credits):
- ${majorTitle} major courses: ~${Math.floor(requiredCredits * 0.85)} credits (PRIORITY - use actual courses)
- Electives/Support: ~${Math.floor(requiredCredits * 0.15)} credits (use "Elective" placeholder)

PLACEHOLDERS TO USE:
- "Elective" (3 credits) - for any elective or support course
- "Thesis/Capstone" (6 credits) - if applicable for graduate programs`}

CRITICAL RULES:
1. ONLY use course codes from the provided ${majorTitle} course list
2. DO NOT invent course codes (e.g., "MATH 241", "ENG 100") - use placeholders instead
3. DO NOT try to map specific Gen Ed requirements - just use "Gen Ed Requirement"
4. Focus on creating a logical progression of ${majorTitle} courses
${userSkills.length > 0 ? `5. Select courses that build skills: ${userSkills.join(', ')}` : ''}

PROGRESSION:
${isUndergraduate ? `- Year 1: Intro ${majorTitle} courses (100-200 level) + placeholders for foundation courses
- Year 2: Core ${majorTitle} courses (200-300 level) + placeholders for breadth
- Year 3: Advanced ${majorTitle} (300-400 level) + specialized skills
- Year 4: Capstone ${majorTitle} (400 level) + career preparation` : `- Focus on advanced ${majorTitle} courses (300/400/500/600 level)
- Progressive specialization and depth in ${majorTitle}
- Include research or capstone if available`}

EXAMPLE CORRECT USAGE:
{
  "name": "ICS 111",  // ✓ Actual ${majorTitle} course from list
  "credits": 4
}
{
  "name": "Gen Ed Requirement",  // ✓ Simple placeholder
  "credits": 3
}
{
  "name": "Support Course",  // ✓ For math/science we can't map
  "credits": 3
}

WRONG - DO NOT DO THIS:
{
  "name": "MATH 241",  // ✗ Don't invent courses not in list
  "credits": 4
}
{
  "name": "GEN-ED-FW",  // ✗ Don't use complex Gen Ed codes
  "credits": 3
}`;

  const userPrompt = `Create a ${durationYears}-year roadmap for ${majorTitle} (${degreeName}).

AVAILABLE ${majorTitle.toUpperCase()} COURSES:
${courses.map(c => `${c.code} - ${c.title} (${c.credits}cr)${c.prerequisites ? ` [Prereq: ${c.prerequisites}]` : ''}`).join('\n')}

${userSkills.length > 0 ? `STUDENT'S CAREER GOALS: ${userSkills.join(', ')}
→ Prioritize courses that build these skills!
` : ''}

${isUndergraduate ? `STRUCTURE YOUR ROADMAP:

Year 1 (Foundation):
- 3-4 intro ${majorTitle} courses (100-200 level)
- Fill remaining credits with "Gen Ed Requirement" or "Support Course"
- Target: 30 credits (15 per semester)

Year 2 (Core):
- 4-5 core ${majorTitle} courses (200-300 level)
- Continue with "Gen Ed Requirement" placeholders
- Target: 30 credits

Year 3 (Advanced):
- 4-5 advanced ${majorTitle} courses (300-400 level)
- Mix in "Elective" placeholders
- Target: 30 credits

Year 4 (Specialization):
- 4-5 specialized ${majorTitle} courses (400 level)
- Career-focused electives
- Target: 30 credits

TOTAL: ~${Math.floor(requiredCredits * 0.50)} credits of actual ${majorTitle} courses, rest placeholders` : `STRUCTURE YOUR ROADMAP:
- Select advanced ${majorTitle} courses (300/400/500/600 level)
- Focus on depth and specialization
- Use "Elective" placeholder only if needed to reach ${requiredCredits} credits
- Include ${Math.ceil(durationYears)} years of ${durationYears <= 2 ? 'fall + spring semesters' : 'coursework'}`}

JSON FORMAT (follow exactly):
{
  "program_name": "${degreeName} in ${majorTitle}",
  "institution": "${campusName}",
  "total_credits": ${requiredCredits},
  "years": [
    {
      "year_number": 1,
      "semesters": [
        {
          "semester_name": "fall_semester",
          "credits": 15,
          "courses": [
            {"name": "ICS 111", "credits": 4},
            {"name": "ICS 141", "credits": 3},
            {"name": "Gen Ed Requirement", "credits": 3},
            {"name": "Gen Ed Requirement", "credits": 3},
            {"name": "Support Course", "credits": 3}
          ]
        },
        {
          "semester_name": "spring_semester",
          "credits": 15,
          "courses": [...]
        }
      ]
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Low but not too low (allow some creativity for course selection)
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
 * Replace hallucinated courses with "Elective" placeholder
 */
function validateRoadmap(roadmap: Roadmap, requiredCredits: number, availableCourses: CourseData[]): void {
  if (!roadmap.years || !Array.isArray(roadmap.years)) {
    throw new Error("Invalid roadmap: missing years array");
  }

  // Create a set of valid course codes for quick lookup
  const validCourseCodes = new Set(availableCourses.map(c => c.code));
  
  // Define SIMPLE placeholders - accept anything that looks like a placeholder
  const placeholderPatterns = [
    'Gen Ed Requirement',
    'Support Course',
    'Elective',
    'Thesis/Capstone',
    'Capstone',
  ];
  
  const isPlaceholder = (name: string) => {
    return placeholderPatterns.some(p => name.includes(p));
  };
  
  const invalidCourses: string[] = [];
  const majorCourses: string[] = [];
  const placeholderCourses: string[] = [];

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
        // Extract course code (handle "ACC 200" or "ACC 200 - Title" formats)
        const courseCode = course.name.split(' - ')[0].trim();
        
        const isValidCourse = validCourseCodes.has(courseCode);
        const isValidPlaceholder = isPlaceholder(course.name);
        
        if (!isValidCourse && !isValidPlaceholder) {
          // Hallucinated course - replace with placeholder
          const originalName = course.name;
          invalidCourses.push(originalName);
          course.name = "Elective";
          console.warn(`   [WARN]  Replaced hallucinated course "${originalName}" with Elective`);
        } else if (isValidCourse) {
          // Normalize to just the course code (remove title if present)
          course.name = courseCode;
          majorCourses.push(courseCode);
        } else {
          placeholderCourses.push(course.name);
        }
        totalCredits += course.credits;
      }
    }
  }

  // Log warning if AI hallucinated courses
  if (invalidCourses.length > 0) {
    console.warn(`[WARN]  AI hallucinated ${invalidCourses.length} courses: ${invalidCourses.join(', ')}`);
    console.warn(`   These have been replaced with ELECTIVE placeholders.`);
  }

  roadmap.total_credits = totalCredits;

  // Log distribution
  const majorCredits = majorCourses.reduce((sum, name) => {
    const course = availableCourses.find(c => c.code === name);
    return sum + (course?.credits || 3);
  }, 0);
  const placeholderCredits = totalCredits - majorCredits;
  
  console.log(`\n Course Distribution:`);
  console.log(`  Major courses: ${majorCourses.length} courses (${majorCredits} credits)`);
  console.log(`  Placeholders: ${placeholderCourses.length} items (${placeholderCredits} credits)`);
  console.log(`  Total: ${totalCredits} credits (${requiredCredits} required)`);
  
  const majorPercent = ((majorCredits / totalCredits) * 100).toFixed(0);
  console.log(`  Ratio: ${majorPercent}% major courses, ${100 - parseInt(majorPercent)}% placeholders`);

  // Credit status
  if (totalCredits < requiredCredits) {
    console.warn(`[WARN]  Short by ${requiredCredits - totalCredits} credits`);
  } else if (totalCredits > requiredCredits * 1.1) {
    console.warn(`[WARN]  Exceeds requirement by ${totalCredits - requiredCredits} credits`);
  } else {
    console.log(`[OK] Credit requirement met ✓`);
  }
  
  // Simple success message
  console.log(`\n[OK] Roadmap validated - ${majorCourses.length} major courses mapped, rest are placeholders for user to fill in later.`);
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
