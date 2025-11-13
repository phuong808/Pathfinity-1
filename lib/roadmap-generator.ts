'use server';

import { db } from '@/app/db';
import { profile, course, campus, major, degree, majorDegree } from '@/app/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the schema for the roadmap structure (matching manoa_degree_pathways.json)
const CourseSchema = z.object({
  name: z.string().describe('Course code and number (e.g., "CINE 255", "FQ", "Gen Ed", "Elective")'),
  credits: z.number().describe('Number of credits for this course'),
});

const SemesterSchema = z.object({
  semester_name: z.enum(['fall_semester', 'spring_semester', 'summer_semester']),
  credits: z.number().describe('Total credits for this semester'),
  courses: z.array(CourseSchema),
});

const YearSchema = z.object({
  year_number: z.number().describe('Year number (1-4 for bachelor\'s, 1-2 for associate)'),
  semesters: z.array(SemesterSchema),
});

const RoadmapSchema = z.object({
  program_name: z.string().describe('Full program name including degree type'),
  institution: z.string().describe('Institution name'),
  total_credits: z.number().describe('Total credits required for the degree'),
  years: z.array(YearSchema),
});

type Roadmap = z.infer<typeof RoadmapSchema>;

/**
 * Get all available courses for a campus
 */
async function getCoursesForCampus(campusId: string): Promise<any[]> {
  const courses = await db
    .select({
      coursePrefix: course.coursePrefix,
      courseNumber: course.courseNumber,
      courseTitle: course.courseTitle,
      courseDesc: course.courseDesc,
      numUnits: course.numUnits,
      deptName: course.deptName,
    })
    .from(course)
    .where(eq(course.campusId, campusId));

  return courses;
}

/**
 * Get degree information for a major
 */
async function getDegreeInfo(majorTitle: string, campusId: string, degreeCodeOrName: string) {
  // Find the major
  const majors = await db
    .select()
    .from(major)
    .where(and(eq(major.campusId, campusId), eq(major.title, majorTitle)))
    .limit(1);

  if (majors.length === 0) {
    throw new Error(`Major "${majorTitle}" not found at campus "${campusId}"`);
  }

  const targetMajor = majors[0];

  // Find the degree - search by either code or name
  const degrees = await db
    .select({
      id: degree.id,
      code: degree.code,
      name: degree.name,
      level: degree.level,
      requiredCredits: majorDegree.requiredCredits,
      typicalDuration: majorDegree.typicalDuration,
    })
    .from(degree)
    .innerJoin(majorDegree, eq(degree.id, majorDegree.degreeId))
    .where(and(
      eq(majorDegree.majorId, targetMajor.id),
      sql`(${degree.code} = ${degreeCodeOrName} OR ${degree.name} = ${degreeCodeOrName})`
    ))
    .limit(1);

  if (degrees.length === 0) {
    // Get all available degrees for this major to show in error
    const availableDegrees = await db
      .select({
        code: degree.code,
        name: degree.name,
      })
      .from(degree)
      .innerJoin(majorDegree, eq(degree.id, majorDegree.degreeId))
      .where(eq(majorDegree.majorId, targetMajor.id));

    const availableList = availableDegrees
      .map(d => `${d.code} (${d.name})`)
      .join(', ');

    throw new Error(
      `Degree "${degreeCodeOrName}" not found for major "${majorTitle}". ` +
      `Available degrees: ${availableList}`
    );
  }

  return degrees[0];
}

/**
 * Get campus information
 */
async function getCampusInfo(campusNameOrId: string) {
  const campuses = await db
    .select()
    .from(campus)
    .where(
      sql`${campus.id} = ${campusNameOrId} OR LOWER(${campus.name}) LIKE ${`%${campusNameOrId.toLowerCase()}%`}`
    )
    .limit(1);

  if (campuses.length === 0) {
    throw new Error(`Campus "${campusNameOrId}" not found`);
  }

  return campuses[0];
}

/**
 * Generate roadmap using OpenAI with structured output
 * Exported for testing purposes
 */
export async function generateRoadmapWithAI(
  profileData: any,
  campusInfo: any,
  degreeInfo: any,
  availableCourses: any[]
): Promise<Roadmap> {
  // Prepare course catalog as a structured string (limit size for context)
  const courseCatalog = availableCourses
    .slice(0, 500) // Limit to first 500 courses to avoid token limits
    .map(c => `${c.coursePrefix} ${c.courseNumber}: ${c.courseTitle} (${c.numUnits} credits) - ${c.courseDesc?.substring(0, 100)}`)
    .join('\n');

  const totalCoursesCount = availableCourses.length;

  // Determine degree structure based on level
  const degreeLevel = degreeInfo.level || 'baccalaureate';
  let expectedYears = 4;
  let expectedCredits = degreeInfo.requiredCredits || 120;
  
  if (degreeLevel.includes('certificate')) {
    expectedYears = 1;
    expectedCredits = degreeInfo.requiredCredits || 15;
  } else if (degreeLevel === 'associate') {
    expectedYears = 2;
    expectedCredits = degreeInfo.requiredCredits || 60;
  } else if (degreeLevel === 'baccalaureate') {
    expectedYears = 4;
    expectedCredits = degreeInfo.requiredCredits || 120;
  } else if (degreeLevel === 'graduate') {
    expectedYears = 2;
    expectedCredits = degreeInfo.requiredCredits || 30;
  } else if (degreeLevel === 'professional_doctorate' || degreeLevel === 'doctorate') {
    expectedYears = 4;
    expectedCredits = degreeInfo.requiredCredits || 60;
  }

  // Build comprehensive prompt
  const prompt = `You are an expert academic advisor creating a personalized college course roadmap.

STUDENT PROFILE:
- Career Goal: ${profileData.career}
- Major: ${profileData.major}
- Degree: ${degreeInfo.name} (${degreeInfo.code})
- Interests: ${profileData.interests?.join(', ') || 'Not specified'}
- Skills: ${profileData.skills?.join(', ') || 'Not specified'}

INSTITUTION: ${campusInfo.name}

DEGREE REQUIREMENTS:
- Required Credits: ${expectedCredits}
- Degree Level: ${degreeLevel}
- Typical Duration: ${degreeInfo.typicalDuration ? `${degreeInfo.typicalDuration} months` : `${expectedYears * 12} months`}
- Expected Years: ${expectedYears}

AVAILABLE COURSES (showing ${Math.min(500, totalCoursesCount)} of ${totalCoursesCount} courses):
${courseCatalog}

CRITICAL REQUIREMENTS:
1. ONLY use courses from the provided course catalog above for major-specific courses
2. Course names MUST match EXACTLY as shown (e.g., "ICS 111", "MATH 241")
3. The roadmap MUST include ALL ${expectedYears} year(s) for this ${degreeLevel} degree
4. The roadmap MUST fulfill the required credits (${expectedCredits} credits total)
5. You may SLIGHTLY exceed the required credits if necessary to complete the degree properly
6. Include courses directly relevant to the major "${profileData.major}"
7. Prioritize courses that align with the career goal: "${profileData.career}"
8. Include courses that develop the student's interests: ${profileData.interests?.join(', ')}
9. Include courses that build upon their skills: ${profileData.skills?.join(', ')}

FOR GENERAL EDUCATION & ELECTIVES:
- Use placeholders like: "Gen Ed", "Elective", "Upper Division Elective"
- These do not need to be from the course catalog

ROADMAP STRUCTURE:
${degreeLevel === 'certificate' || degreeLevel.includes('certificate') ? `
- **Certificate programs: 1 year (2-3 semesters)**
- Focus on core practical skills for immediate employment
- Typically 15-30 credits total
- Most courses should be major-specific
` : degreeLevel === 'associate' ? `
- **Associate degree: 2 years (4 semesters + summers)**
- Balance of general education and major courses
- Typically 60 credits total
- Year 1: Foundation courses and general education
- Year 2: More specialized major courses
` : degreeLevel === 'baccalaureate' ? `
- **Bachelor's degree: 4 years (8 semesters + summers)**
- Each year has 3 semesters: fall_semester, spring_semester, summer_semester
- Distribute credits evenly (typically 15 credits per fall/spring semester)
- Summer semesters can be 0-6 credits
- Total should be ${expectedCredits}+ credits
- Year 1: Foundational courses (100-200 level), general education
- Year 2: Core major requirements (200-300 level)
- Year 3: Advanced major courses (300-400 level)
- Year 4: Capstone/senior courses (400+ level)
` : degreeLevel === 'graduate' ? `
- **Master's degree: 2 years (4 semesters)**
- Focus on advanced coursework and research
- Typically 30-36 credits total
- All courses should be graduate level (600+ level)
- Include thesis/capstone in final semesters
- Year 1: Core graduate courses
- Year 2: Specialized electives and thesis/capstone
` : `
- **Doctoral degree: 3-5 years**
- Mix of advanced coursework and research
- Typically 60+ credits including dissertation
- All courses should be graduate level (600-700+ level)
- Include dissertation research credits
- Early years: Advanced coursework and comprehensive exams
- Later years: Dissertation research and writing
`}

VERIFICATION CHECKLIST:
- [ ] Roadmap has exactly ${expectedYears} year(s)
- [ ] Total credits across all years = ${expectedCredits}+ credits
- [ ] All major-specific courses exist in the provided catalog
- [ ] Prerequisite sequences are logical
- [ ] Career skills (${profileData.skills?.join(', ')}) are addressed
- [ ] Student interests (${profileData.interests?.join(', ')}) are incorporated

Generate a complete, realistic, and personalized ${expectedYears}-year academic roadmap for this ${degreeLevel} degree.`;

  console.log('Generating roadmap with AI...');
  console.log(`Available courses: ${totalCoursesCount}`);
  console.log(`Required credits: ${degreeInfo.requiredCredits || 120}`);

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: RoadmapSchema,
      mode: 'json',
      prompt,
      temperature: 0.7,
    });

    console.log('Roadmap generated successfully');
    console.log(`Total credits in roadmap: ${object.total_credits}`);
    
    return object;
  } catch (error) {
    console.error('Error generating roadmap with AI:', error);
    throw new Error(`Failed to generate roadmap: ${error}`);
  }
}

/**
 * Main function to generate and save roadmap for a profile
 */
export async function generateAndSaveRoadmap(profileId: number): Promise<void> {
  console.log(`\n=== Starting roadmap generation for profile ${profileId} ===`);

  try {
    // 1. Get profile data
    const profiles = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId))
      .limit(1);

    if (profiles.length === 0) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const profileData = profiles[0];
    console.log('Profile found:', {
      career: profileData.career,
      college: profileData.college,
      major: profileData.major,
      degree: profileData.degree,
    });

    // Validate required fields
    if (!profileData.college || !profileData.major || !profileData.degree) {
      throw new Error('Profile is missing required fields: college, major, or degree');
    }

    // 2. Get campus info
    const campusInfo = await getCampusInfo(profileData.college);
    console.log(`Campus found: ${campusInfo.name} (${campusInfo.id})`);

    // 3. Get degree info
    const degreeInfo = await getDegreeInfo(
      profileData.major,
      campusInfo.id,
      profileData.degree
    );
    console.log(`Degree info: ${degreeInfo.name} (${degreeInfo.code}), ${degreeInfo.requiredCredits} credits`);

    // 4. Get available courses
    const courses = await getCoursesForCampus(campusInfo.id);
    console.log(`Found ${courses.length} courses for campus`);

    if (courses.length === 0) {
      throw new Error(`No courses found for campus ${campusInfo.id}`);
    }

    // 5. Generate roadmap with AI
    const roadmap = await generateRoadmapWithAI(
      profileData,
      campusInfo,
      degreeInfo,
      courses
    );

    // 6. Save roadmap to profile
    await db
      .update(profile)
      .set({
        roadmap: roadmap as any,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, profileId));

    console.log(`✓ Roadmap successfully saved to profile ${profileId}`);
    console.log(`  Program: ${roadmap.program_name}`);
    console.log(`  Total Credits: ${roadmap.total_credits}`);
    console.log(`  Years: ${roadmap.years.length}`);
    console.log('=== Roadmap generation completed ===\n');

  } catch (error) {
    console.error(`\n✗ Error generating roadmap for profile ${profileId}:`, error);
    throw error;
  }
}

/**
 * Test function to generate roadmap (for CLI testing)
 */
export async function testRoadmapGeneration(profileId: number) {
  console.log('\n' + '='.repeat(60));
  console.log('ROADMAP GENERATION TEST');
  console.log('='.repeat(60));

  try {
    await generateAndSaveRoadmap(profileId);
    
    // Fetch and display the saved roadmap
    const profiles = await db
      .select()
      .from(profile)
      .where(eq(profile.id, profileId))
      .limit(1);

    if (profiles.length > 0 && profiles[0].roadmap) {
      const roadmap = profiles[0].roadmap as Roadmap;
      console.log('\n' + '-'.repeat(60));
      console.log('GENERATED ROADMAP PREVIEW:');
      console.log('-'.repeat(60));
      console.log(`Program: ${roadmap.program_name}`);
      console.log(`Institution: ${roadmap.institution}`);
      console.log(`Total Credits: ${roadmap.total_credits}`);
      console.log(`\nYears: ${roadmap.years.length}`);
      
      roadmap.years.forEach(year => {
        console.log(`\n  Year ${year.year_number}:`);
        year.semesters.forEach(semester => {
          if (semester.courses.length > 0) {
            console.log(`    ${semester.semester_name}: ${semester.credits} credits`);
            semester.courses.forEach(course => {
              console.log(`      - ${course.name} (${course.credits} credits)`);
            });
          }
        });
      });

      console.log('\n' + '='.repeat(60));
      console.log('✓ TEST COMPLETED SUCCESSFULLY');
      console.log('='.repeat(60) + '\n');
    }
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('✗ TEST FAILED');
    console.log('='.repeat(60));
    console.error(error);
    throw error;
  }
}
