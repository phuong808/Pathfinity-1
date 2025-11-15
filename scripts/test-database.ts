/**
 * Test script to verify database functionality and showcase query performance
 */

import {
  getAllCampuses,
  getCoursesByCampus,
  getCourseByCode,
  searchCourses,
  getDegreeProgramsByCampus,
  searchDegreePrograms,
  getCompletePathway,
  getGeneralEducationCourses,
  getCourseCountByCampus,
  getProgramCountByCampus,
} from "@/app/db/queries";

async function testQueries() {
  console.log("🧪 Testing Database Queries\n");
  console.log("=" .repeat(60));
  
  // Test 1: Get all campuses
  console.log("\n📍 Test 1: Get All Campuses");
  console.time("Query Time");
  const campuses = await getAllCampuses();
  console.timeEnd("Query Time");
  console.log(`Found ${campuses.length} campuses:`);
  campuses.forEach(c => console.log(`  - ${c.name} (${c.type})`));
  
  // Test 2: Get courses by campus
  console.log("\n📚 Test 2: Get Courses for Mānoa");
  console.time("Query Time");
  const manoaCourses = await getCoursesByCampus("manoa");
  console.timeEnd("Query Time");
  console.log(`Found ${manoaCourses.length} courses at UH Mānoa`);
  console.log("Sample courses:");
  manoaCourses.slice(0, 5).forEach(c => 
    console.log(`  - ${c.coursePrefix} ${c.courseNumber}: ${c.courseTitle}`)
  );
  
  // Test 3: Find specific course
  console.log("\n🔍 Test 3: Find Specific Course (ICS 111)");
  console.time("Query Time");
  const ics111 = await getCourseByCode("manoa", "ICS", "111");
  console.timeEnd("Query Time");
  if (ics111) {
    console.log(`Found: ${ics111.coursePrefix} ${ics111.courseNumber}: ${ics111.courseTitle}`);
    console.log(`Description: ${ics111.courseDesc?.substring(0, 100)}...`);
  }
  
  // Test 4: Search courses
  console.log("\n🔎 Test 4: Search Courses (keyword: 'computer')");
  console.time("Query Time");
  const searchResults = await searchCourses(undefined, "computer", 10);
  console.timeEnd("Query Time");
  console.log(`Found ${searchResults.length} courses matching 'computer':`);
  searchResults.forEach(c => 
    console.log(`  - ${c.coursePrefix} ${c.courseNumber}: ${c.courseTitle} (${c.campusId})`)
  );
  
  // Test 5: Get degree programs
  console.log("\n🎓 Test 5: Get Degree Programs at Mānoa");
  console.time("Query Time");
  const programs = await getDegreeProgramsByCampus("manoa");
  console.timeEnd("Query Time");
  console.log(`Found ${programs.length} programs at UH Mānoa`);
  console.log("Sample programs:");
  programs.slice(0, 5).forEach(p => 
    console.log(`  - ${p.program.programName} (${p.program.totalCredits} credits)`)
  );
  
  // Test 6: Search degree programs
  console.log("\n🔎 Test 6: Search Degree Programs (keyword: 'Computer Science')");
  console.time("Query Time");
  const csPrograms = await searchDegreePrograms("Computer Science");
  console.timeEnd("Query Time");
  console.log(`Found ${csPrograms.length} Computer Science programs:`);
  csPrograms.forEach(p => 
    console.log(`  - ${p.program.programName} at ${p.campus?.name}`)
  );
  
  // Test 7: Get complete pathway
  console.log("\n🛤️  Test 7: Get Complete Pathway");
  if (csPrograms.length > 0) {
    const programId = csPrograms[0].program.id;
    console.log(`Getting pathway for: ${csPrograms[0].program.programName}`);
    console.time("Query Time");
    const pathway = await getCompletePathway(programId);
    console.timeEnd("Query Time");
    console.log(`Found ${pathway.length} semesters in pathway`);
    
    if (pathway.length > 0) {
      const firstSemester = pathway[0];
      console.log(`\nFirst semester (Year ${firstSemester.yearNumber}, ${firstSemester.semesterName}):`);
      console.log(`  Credits: ${firstSemester.semesterCredits}`);
      console.log(`  Courses (${firstSemester.courses.length}):`);
      firstSemester.courses.slice(0, 5).forEach(c => {
        const courseName = c.course ? 
          `${c.course.coursePrefix} ${c.course.courseNumber}: ${c.course.courseTitle}` :
          c.pathwayCourse.courseName;
        console.log(`    - ${courseName} (${c.pathwayCourse.credits} credits)`);
      });
    }
  }
  
  // Test 8: Get general education requirements
  console.log("\n📖 Test 8: Get General Education Requirements");
  if (programs.length > 0) {
    const programId = programs[0].program.id;
    console.log(`Getting gen ed for: ${programs[0].program.programName}`);
    console.time("Query Time");
    const genEd = await getGeneralEducationCourses(programId);
    console.timeEnd("Query Time");
    console.log(`Found ${genEd.length} general education requirements`);
    
    // Group by category
    const byCategory = new Map<string, typeof genEd>();
    genEd.forEach(ge => {
      const cat = ge.pathwayCourse.category || "Other";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(ge);
    });
    
    console.log("\nBy category:");
    Array.from(byCategory.entries()).slice(0, 5).forEach(([cat, courses]) => {
      console.log(`  ${cat}: ${courses.length} courses`);
    });
  }
  
  // Test 9: Course count statistics
  console.log("\n📊 Test 9: Course Count by Campus");
  console.time("Query Time");
  const courseStats = await getCourseCountByCampus();
  console.timeEnd("Query Time");
  courseStats.forEach(stat => 
    console.log(`  ${stat.campusName}: ${stat.courseCount} courses`)
  );
  
  // Test 10: Program count statistics
  console.log("\n📊 Test 10: Program Count by Campus");
  console.time("Query Time");
  const programStats = await getProgramCountByCampus();
  console.timeEnd("Query Time");
  programStats.forEach(stat => 
    console.log(`  ${stat.campusName}: ${stat.programCount} programs`)
  );
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests completed successfully!");
}

testQueries().catch(error => {
  console.error("❌ Error running tests:", error);
  process.exit(1);
});
