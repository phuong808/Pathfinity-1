/**
 * Comprehensive test script for roadmap generator across all degree levels
 * Tests with hardcoded profiles (not from database)
 * 
 * Usage:
 *   npm run test-roadmap-comprehensive
 */

import { generateRoadmapWithAI } from '../lib/roadmap-generator';
import { db } from '../app/db';
import { course, campus, major, degree, majorDegree } from '../app/db/schema';
import { eq, and, sql } from 'drizzle-orm';

// Test profiles for different degree levels
const TEST_PROFILES = [
  {
    name: 'Certificate Test (CO - Certificate of Competence)',
    profile: {
      career: 'Law Enforcement Officer',
      college: 'Hawaiʻi Community College',
      major: 'Administration of Justice',
      degree: 'CO', // Certificate of Competence
      interests: ['Criminal Justice', 'Law Enforcement', 'Community Safety'],
      skills: ['Communication', 'Problem Solving', 'Conflict Resolution'],
    },
  },
  {
    name: 'Certificate Test (CA - Certificate of Achievement)',
    profile: {
      career: 'Automotive Technician',
      college: 'Hawaiʻi Community College',
      major: 'Auto Body Repair & Painting',
      degree: 'CA', // Certificate of Achievement
      interests: ['Automotive Repair', 'Paint Technology', 'Customer Service'],
      skills: ['Hand Tools', 'Paint Application', 'Detail-Oriented Work'],
    },
  },
  {
    name: 'Associate Degree Test (AAS)',
    profile: {
      career: 'Automotive Service Manager',
      college: 'Hawaiʻi Community College',
      major: 'Automotive Technology',
      degree: 'AAS', // Associate in Applied Science
      interests: ['Automotive Systems', 'Diagnostics', 'Management'],
      skills: ['Technical Diagnostics', 'Customer Relations', 'Team Leadership'],
    },
  },
  {
    name: 'Associate Degree Test (AS)',
    profile: {
      career: 'Police Officer',
      college: 'Hawaiʻi Community College',
      major: 'Administration of Justice',
      degree: 'AS', // Associate in Science
      interests: ['Criminal Law', 'Community Policing', 'Public Safety'],
      skills: ['Critical Thinking', 'Report Writing', 'Interpersonal Communication'],
    },
  },
  {
    name: 'Bachelor Degree Test (BS - Computer Science)',
    profile: {
      career: 'Software Engineer',
      college: 'University of Hawaiʻi at Manoa',
      major: 'Computer Science',
      degree: 'BS', // Bachelor of Science
      interests: ['Artificial Intelligence', 'Cloud Computing', 'Machine Learning'],
      skills: ['Python', 'Java', 'Data Structures', 'Algorithms'],
    },
  },
  {
    name: 'Bachelor Degree Test (BBA - Business)',
    profile: {
      career: 'Business Analyst',
      college: 'University of Hawaiʻi at Hilo',
      major: 'Accounting',
      degree: 'BBA', // Bachelor of Business Administration
      interests: ['Financial Analysis', 'Business Strategy', 'Data Analytics'],
      skills: ['Financial Modeling', 'Excel', 'Communication', 'Problem Solving'],
    },
  },
  {
    name: 'Master Degree Test (MA)',
    profile: {
      career: 'School Counselor',
      college: 'University of Hawaiʻi at Hilo',
      major: 'Counseling Psychology',
      degree: 'MA', // Master of Arts
      interests: ['Adolescent Psychology', 'Career Counseling', 'Mental Health'],
      skills: ['Active Listening', 'Empathy', 'Assessment', 'Intervention Planning'],
    },
  },
  {
    name: 'Doctoral Degree Test (PhD)',
    profile: {
      career: 'Research Scientist',
      college: 'University of Hawaiʻi at Manoa',
      major: 'Computer Science',
      degree: 'PhD', // Doctor of Philosophy
      interests: ['Artificial Intelligence', 'Quantum Computing', 'Algorithm Design'],
      skills: ['Research Methodology', 'Advanced Mathematics', 'Scientific Writing', 'Grant Writing'],
    },
  },
];

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
 * Get degree information for a major
 */
async function getDegreeInfo(majorTitle: string, campusId: string, degreeCode: string) {
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

  // Find the degree
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
      eq(degree.code, degreeCode)
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
      `Degree "${degreeCode}" not found for major "${majorTitle}". ` +
      `Available degrees: ${availableList || 'None'}`
    );
  }

  return degrees[0];
}

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
 * Test a single profile
 */
async function testProfile(testCase: typeof TEST_PROFILES[0], index: number) {
  console.log('\n' + '='.repeat(80));
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(80));

  const { profile } = testCase;

  console.log('\nProfile Details:');
  console.log(`  Career: ${profile.career}`);
  console.log(`  College: ${profile.college}`);
  console.log(`  Major: ${profile.major}`);
  console.log(`  Degree: ${profile.degree}`);
  console.log(`  Interests: ${profile.interests.join(', ')}`);
  console.log(`  Skills: ${profile.skills.join(', ')}`);

  try {
    // 1. Get campus info
    console.log(`\n[1/4] Looking up campus...`);
    const campusInfo = await getCampusInfo(profile.college);
    console.log(`  ✓ Found: ${campusInfo.name} (${campusInfo.id})`);

    // 2. Get degree info
    console.log(`\n[2/4] Looking up degree information...`);
    const degreeInfo = await getDegreeInfo(
      profile.major,
      campusInfo.id,
      profile.degree
    );
    console.log(`  ✓ Found: ${degreeInfo.name} (${degreeInfo.code})`);
    console.log(`  ✓ Level: ${degreeInfo.level}`);
    console.log(`  ✓ Required Credits: ${degreeInfo.requiredCredits || 'N/A'}`);
    console.log(`  ✓ Duration: ${degreeInfo.typicalDuration ? `${degreeInfo.typicalDuration} months` : 'N/A'}`);

    // 3. Get available courses
    console.log(`\n[3/4] Loading available courses...`);
    const courses = await getCoursesForCampus(campusInfo.id);
    console.log(`  ✓ Found ${courses.length} courses`);

    if (courses.length === 0) {
      throw new Error(`No courses found for campus ${campusInfo.id}`);
    }

    // 4. Generate roadmap
    console.log(`\n[4/4] Generating roadmap with AI...`);
    const roadmap = await generateRoadmapWithAI(
      profile,
      campusInfo,
      degreeInfo,
      courses
    );

    // Display results
    console.log('\n' + '-'.repeat(80));
    console.log('GENERATED ROADMAP:');
    console.log('-'.repeat(80));
    console.log(`Program: ${roadmap.program_name}`);
    console.log(`Institution: ${roadmap.institution}`);
    console.log(`Total Credits: ${roadmap.total_credits}`);
    console.log(`Number of Years: ${roadmap.years.length}`);
    
    // Show semester breakdown
    let totalCreditsVerify = 0;
    roadmap.years.forEach((year: any) => {
      console.log(`\n  Year ${year.year_number}:`);
      year.semesters.forEach((semester: any) => {
        if (semester.courses.length > 0) {
          console.log(`    ${semester.semester_name}: ${semester.credits} credits`);
          semester.courses.forEach((course: any) => {
            console.log(`      - ${course.name} (${course.credits} credits)`);
          });
          totalCreditsVerify += semester.credits;
        }
      });
    });

    console.log(`\n  Total Credits (Verified): ${totalCreditsVerify}`);
    console.log(`  Required Credits: ${degreeInfo.requiredCredits || 'N/A'}`);
    
    // Validate
    const meetsRequirement = degreeInfo.requiredCredits 
      ? totalCreditsVerify >= degreeInfo.requiredCredits 
      : true;
    
    if (meetsRequirement) {
      console.log(`  ✓ Credit requirement MET`);
    } else {
      console.log(`  ✗ Credit requirement NOT MET (short by ${(degreeInfo.requiredCredits || 0) - totalCreditsVerify} credits)`);
    }

    console.log('\n' + '='.repeat(80));
    console.log(`✓ TEST ${index + 1} PASSED: ${testCase.name}`);
    console.log('='.repeat(80));

    return { success: true, testCase: testCase.name };

  } catch (error) {
    console.log('\n' + '='.repeat(80));
    console.log(`✗ TEST ${index + 1} FAILED: ${testCase.name}`);
    console.log('='.repeat(80));
    console.error(`Error: ${error}`);
    
    return { success: false, testCase: testCase.name, error };
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('\n' + '█'.repeat(80));
  console.log('COMPREHENSIVE ROADMAP GENERATOR TEST SUITE');
  console.log('Testing all degree levels with hardcoded profiles');
  console.log('█'.repeat(80));

  const results = [];

  for (let i = 0; i < TEST_PROFILES.length; i++) {
    const result = await testProfile(TEST_PROFILES[i], i);
    results.push(result);
    
    // Add a pause between tests
    if (i < TEST_PROFILES.length - 1) {
      console.log('\n⏳ Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log('\n\n' + '█'.repeat(80));
  console.log('TEST SUMMARY');
  console.log('█'.repeat(80));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\nTotal Tests: ${results.length}`);
  console.log(`✓ Passed: ${passed}`);
  console.log(`✗ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed Tests:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  ✗ ${r.testCase}`);
      });
  }

  console.log('\n' + '█'.repeat(80));
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! 🎉');
  } else {
    console.log('⚠️  SOME TESTS FAILED');
  }
  
  console.log('█'.repeat(80) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

main();
