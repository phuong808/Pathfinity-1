'use server';

import { db } from '@/app/db';
import { profile, campus } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import fs from 'fs';
import path from 'path';

// Define pathway template type
interface PathwayTemplate {
  program_name: string;
  institution: string;
  total_credits: number;
  years: Array<{
    year_number: number;
    semesters: Array<{
      semester_name: 'fall_semester' | 'spring_semester' | 'summer_semester';
      credits: number;
      courses: Array<{
        name: string;
        credits: number;
      }>;
    }>;
  }>;
}

// Define course from database
interface CourseRecord {
  coursePrefix: string;
  courseNumber: string;
  courseTitle: string;
  numUnits: string;
}

/**
 * Load pathway templates from manoa_degree_pathways.json
 */
function loadPathwayTemplates(): PathwayTemplate[] {
  const filePath = path.join(process.cwd(), 'app', 'db', 'data', 'manoa_degree_pathways.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

/**
 * Load all UH Manoa courses from manoa_courses.json
 */
function loadManoaCourses(): CourseRecord[] {
  const filePath = path.join(process.cwd(), 'app', 'db', 'data', 'manoa_courses.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const courses = JSON.parse(fileContent);
  
  return courses.map((c: any) => ({
    coursePrefix: c.course_prefix,
    courseNumber: c.course_number,
    courseTitle: c.course_title,
    numUnits: c.num_units,
  }));
}

/**
 * Find matching pathway template for a major and degree
 */
function findMatchingPathway(
  major: string,
  degree: string,
  templates: PathwayTemplate[]
): PathwayTemplate | null {
  const normalizedMajor = major.toLowerCase().trim();
  const normalizedDegree = degree.toUpperCase().trim();
  
  // Try exact match first
  for (const template of templates) {
    const programName = template.program_name.toLowerCase();
    if (programName.includes(normalizedMajor) && programName.includes(normalizedDegree.toLowerCase())) {
      return template;
    }
  }
  
  // Try partial match - just major name
  for (const template of templates) {
    const programName = template.program_name.toLowerCase();
    if (programName.includes(normalizedMajor)) {
      return template;
    }
  }
  
  return null;
}

/**
 * Extract major department prefix from pathway
 */
function extractMajorPrefix(pathwayTemplate: PathwayTemplate): string {
  // Look for most common course prefix in the pathway
  const prefixCounts = new Map<string, number>();
  
  pathwayTemplate.years.forEach(year => {
    year.semesters.forEach(semester => {
      semester.courses.forEach(course => {
        const match = course.name.match(/^([A-Z]+)/);
        if (match) {
          const prefix = match[1];
          // Skip gen-ed codes
          if (!['FW', 'FQ', 'FG', 'DS', 'DA', 'DH', 'DL', 'DB', 'DP', 'DY', 'HSL'].includes(prefix)) {
            prefixCounts.set(prefix, (prefixCounts.get(prefix) || 0) + 1);
          }
        }
      });
    });
  });
  
  // Return most common prefix
  let maxCount = 0;
  let majorPrefix = '';
  prefixCounts.forEach((count, prefix) => {
    if (count > maxCount) {
      maxCount = count;
      majorPrefix = prefix;
    }
  });
  
  return majorPrefix;
}

/**
 * Get relevant courses for elective replacement
 */
function getRelevantCourses(
  allCourses: CourseRecord[],
  majorPrefix: string
): { byLevel: Map<string, CourseRecord[]>, all: CourseRecord[] } {
  // Filter to major courses
  const majorCourses = allCourses.filter(c => c.coursePrefix === majorPrefix);
  
  // Organize by level
  const byLevel = new Map<string, CourseRecord[]>();
  byLevel.set('100-200', []);
  byLevel.set('300', []);
  byLevel.set('400+', []);
  
  majorCourses.forEach(course => {
    const num = parseInt(course.courseNumber);
    if (!isNaN(num)) {
      if (num < 300) {
        byLevel.get('100-200')!.push(course);
      } else if (num < 400) {
        byLevel.get('300')!.push(course);
      } else {
        byLevel.get('400+')!.push(course);
      }
    }
  });
  
  return { byLevel, all: majorCourses };
}

/**
 * Simple function to process pathway and replace electives using AI
 */
async function processPathwayWithAI(
  pathwayTemplate: PathwayTemplate,
  relevantCourses: { byLevel: Map<string, CourseRecord[]>, all: CourseRecord[] },
  profileData: any,
  majorPrefix: string
): Promise<PathwayTemplate> {
  // Create a simple course list organized by level
  const level400 = relevantCourses.byLevel.get('400+')!.slice(0, 30);
  const level300 = relevantCourses.byLevel.get('300')!.slice(0, 20);
  
  const courseList = `
LEVEL 400+ COURSES (for "400+ Elective" replacements):
${level400.map(c => `${c.coursePrefix} ${c.courseNumber}: ${c.courseTitle}`).join('\n')}

LEVEL 300 COURSES (for "300+ Elective" replacements):
${level300.map(c => `${c.coursePrefix} ${c.courseNumber}: ${c.courseTitle}`).join('\n')}
`.trim();

  const prompt = `You are processing a college degree pathway. Your job is SIMPLE and SPECIFIC:

STUDENT INFO:
- Major: ${profileData.major}
- Career Goal: ${profileData.career || 'Not specified'}
- Interests: ${profileData.interests?.join(', ') || 'Not specified'}

AVAILABLE COURSES:
${courseList}

PATHWAY TEMPLATE (JSON):
${JSON.stringify(pathwayTemplate, null, 2)}

YOUR TASKS (do ONLY these 3 things):

1. **REPLACE ELECTIVES**: Find any course name containing "Elective" and replace with actual courses from the list above.
   - "${majorPrefix} 400+ Elective" → Choose a ${majorPrefix} course from LEVEL 400+ list
   - "${majorPrefix} 300+ Elective" → Choose a ${majorPrefix} course from LEVEL 300 or 400+ list
   - "Elective 300+" → Choose any 300+ course that fits career/interests
   - Choose courses relevant to "${profileData.career}"
   - NO DUPLICATES - each course only once

2. **CHOOSE FROM OPTIONS**: When you see "or", "/", or "and", pick ONE option that makes sense.
   - "MATH 215, 241 or 251A" → Pick ONE: MATH 215 OR MATH 241 OR MATH 251A
   - "PHYS 151 or 170" → Pick ONE: PHYS 151 OR PHYS 170
   - "ICS 312/331" → Pick ONE: ICS 312 OR ICS 331
   - Choose options that sequence well (e.g., if you pick MATH 241, pick MATH 242 later)

3. **KEEP UNCHANGED**:
   - All Gen Ed codes: FW, FQ, FG (A/B/C), DS, DA, DH, DL, DB, DP, DY, DA/DH/DL, HSL
   - Specific courses that are already clear: ICS 111, MATH 241, CHEM 161, etc.

Return the COMPLETE modified pathway as valid JSON. Keep ALL years, ALL semesters, ALL courses. Only modify what needs changing.`;

  console.log('Processing pathway with AI to replace electives and choose options...');
  
  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt,
      temperature: 0.2,
    });
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const processedPathway = JSON.parse(jsonMatch[0]);
    console.log('✓ Pathway processed successfully');
    
    return processedPathway;
  } catch (error) {
    console.error('Error processing pathway with AI:', error);
    throw error;
  }
}

/**
 * Get campus information
 */
async function getCampusInfo(campusNameOrId: string) {
  let campuses = await db
    .select()
    .from(campus)
    .where(eq(campus.id, campusNameOrId))
    .limit(1);

  if (campuses.length === 0) {
    const allCampuses = await db.select().from(campus);
    campuses = allCampuses.filter(c => {
      const nameMatch = c.name.toLowerCase() === campusNameOrId.toLowerCase();
      const aliases = Array.isArray(c.aliases) ? c.aliases : [];
      const aliasMatch = aliases.some((alias: string) => alias.toLowerCase() === campusNameOrId.toLowerCase());
      return nameMatch || aliasMatch;
    });
  }

  if (campuses.length === 0) {
    throw new Error(`Campus "${campusNameOrId}" not found`);
  }

  return campuses[0];
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

    if (!profileData.college || !profileData.major || !profileData.degree) {
      throw new Error('Profile is missing required fields: college, major, or degree');
    }

    // 2. Check if campus is UH Manoa
    const campusInfo = await getCampusInfo(profileData.college);
    console.log(`Campus found: ${campusInfo.name} (${campusInfo.id})`);

    if (campusInfo.id !== 'uh_manoa') {
      console.log(`Campus ${campusInfo.id} is not UH Manoa. Storing empty roadmap.`);
      
      await db
        .update(profile)
        .set({
          roadmap: null,
          updatedAt: new Date(),
        })
        .where(eq(profile.id, profileId));
      
      console.log(`✓ Empty roadmap saved for non-UH Manoa profile ${profileId}`);
      console.log('=== Roadmap generation completed ===\n');
      return;
    }

    // 3. Load pathway templates
    console.log('Loading pathway templates...');
    const pathwayTemplates = loadPathwayTemplates();
    console.log(`Loaded ${pathwayTemplates.length} pathway templates`);

    // 4. Find matching pathway
    const matchingPathway = findMatchingPathway(
      profileData.major,
      profileData.degree,
      pathwayTemplates
    );

    if (!matchingPathway) {
      console.log(`No pathway template found for ${profileData.major} (${profileData.degree})`);
      
      await db
        .update(profile)
        .set({
          roadmap: null,
          updatedAt: new Date(),
        })
        .where(eq(profile.id, profileId));
      
      console.log(`✓ Empty roadmap saved (no template found) for profile ${profileId}`);
      console.log('=== Roadmap generation completed ===\n');
      return;
    }

    console.log(`Found matching pathway: ${matchingPathway.program_name}`);

    // 5. Load courses and extract major prefix
    console.log('Loading UH Manoa courses...');
    const allCourses = loadManoaCourses();
    console.log(`Loaded ${allCourses.length} UH Manoa courses`);

    const majorPrefix = extractMajorPrefix(matchingPathway);
    console.log(`Detected major prefix: ${majorPrefix}`);

    const relevantCourses = getRelevantCourses(allCourses, majorPrefix);
    console.log(`Found ${relevantCourses.all.length} ${majorPrefix} courses`);

    // 6. Process pathway with AI (simple replacement)
    const processedRoadmap = await processPathwayWithAI(
      matchingPathway,
      relevantCourses,
      profileData,
      majorPrefix
    );

    // Add profile information
    const finalRoadmap = {
      ...processedRoadmap,
      career_goal: profileData.career || undefined,
      interests: profileData.interests as string[] || undefined,
      skills: profileData.skills as string[] || undefined,
    };

    // 7. Save roadmap to profile
    await db
      .update(profile)
      .set({
        roadmap: finalRoadmap as any,
        updatedAt: new Date(),
      })
      .where(eq(profile.id, profileId));

    console.log(`✓ Roadmap successfully saved to profile ${profileId}`);
    console.log(`  Program: ${processedRoadmap.program_name}`);
    console.log(`  Total Credits: ${processedRoadmap.total_credits}`);
    console.log(`  Years: ${processedRoadmap.years.length}`);
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

    if (profiles.length > 0) {
      const savedProfile = profiles[0];
      
      if (!savedProfile.roadmap) {
        console.log('\n' + '-'.repeat(60));
        console.log('NO ROADMAP GENERATED:');
        console.log('-'.repeat(60));
        console.log(`Campus: ${savedProfile.college}`);
        console.log('Reason: Either campus is not UH Manoa or no pathway template found');
        console.log('\n' + '='.repeat(60));
        console.log('✓ TEST COMPLETED (No roadmap for this profile)');
        console.log('='.repeat(60) + '\n');
        return;
      }
      
      const roadmap = savedProfile.roadmap as any;
      console.log('\n' + '-'.repeat(60));
      console.log('GENERATED ROADMAP PREVIEW:');
      console.log('-'.repeat(60));
      console.log(`Program: ${roadmap.program_name}`);
      console.log(`Institution: ${roadmap.institution}`);
      console.log(`Total Credits: ${roadmap.total_credits}`);
      
      if (roadmap.career_goal) {
        console.log(`Career Goal: ${roadmap.career_goal}`);
      }
      if (roadmap.interests && roadmap.interests.length > 0) {
        console.log(`Interests: ${roadmap.interests.join(', ')}`);
      }
      if (roadmap.skills && roadmap.skills.length > 0) {
        console.log(`Skills: ${roadmap.skills.join(', ')}`);
      }
      
      console.log(`\nYears: ${roadmap.years.length}`);
      
      roadmap.years.forEach((year: any) => {
        console.log(`\n  Year ${year.year_number}:`);
        year.semesters.forEach((semester: any) => {
          if (semester.courses.length > 0) {
            console.log(`    ${semester.semester_name}: ${semester.credits} credits`);
            semester.courses.forEach((course: any) => {
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
