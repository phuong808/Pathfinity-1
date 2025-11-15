/**
 * Optimized query functions for degree pathways and courses
 * These functions leverage the normalized database structure for fast retrieval
 */

import { db } from "@/app/db";
import { 
  campus, 
  course, 
  degree, 
  degreeProgram, 
  degreePathway, 
  pathwayCourse,
  coursePrerequisite,
  majorCareerMapping,
  careerPathway
} from "@/app/db/schema";
import { eq, and, or, like, sql, desc, asc, inArray } from "drizzle-orm";

// ========== CAMPUS QUERIES ==========

/**
 * Get all campuses, optionally filtered by type
 */
export async function getAllCampuses(type?: "university" | "community_college") {
  if (type) {
    return await db.select().from(campus).where(eq(campus.type, type));
  }
  return await db.select().from(campus);
}

/**
 * Get campus by ID
 */
export async function getCampusById(campusId: string) {
  const [result] = await db.select().from(campus).where(eq(campus.id, campusId)).limit(1);
  return result;
}

// ========== COURSE QUERIES ==========

/**
 * Get all courses for a specific campus
 */
export async function getCoursesByCampus(campusId: string) {
  return await db.select()
    .from(course)
    .where(eq(course.campusId, campusId))
    .orderBy(asc(course.coursePrefix), asc(course.courseNumber));
}

/**
 * Find a specific course by prefix and number
 */
export async function getCourseByCode(campusId: string, prefix: string, number: string) {
  const [result] = await db.select()
    .from(course)
    .where(
      and(
        eq(course.campusId, campusId),
        eq(course.coursePrefix, prefix.toUpperCase()),
        eq(course.courseNumber, number)
      )
    )
    .limit(1);
  return result;
}

/**
 * Search courses by keyword in title or description
 */
export async function searchCourses(
  campusId: string | undefined, 
  keyword: string, 
  limit: number = 50
) {
  const searchPattern = `%${keyword}%`;
  
  if (campusId) {
    return await db.select().from(course)
      .where(
        and(
          eq(course.campusId, campusId),
          or(
            like(course.courseTitle, searchPattern),
            like(course.courseDesc, searchPattern),
            like(course.coursePrefix, searchPattern)
          )
        )
      )
      .limit(limit);
  }
  
  return await db.select().from(course)
    .where(
      or(
        like(course.courseTitle, searchPattern),
        like(course.courseDesc, searchPattern),
        like(course.coursePrefix, searchPattern)
      )
    )
    .limit(limit);
}

/**
 * Get courses by department
 */
export async function getCoursesByDepartment(campusId: string, deptName: string) {
  return await db.select()
    .from(course)
    .where(
      and(
        eq(course.campusId, campusId),
        eq(course.deptName, deptName)
      )
    )
    .orderBy(asc(course.coursePrefix), asc(course.courseNumber));
}

/**
 * Get all unique departments for a campus
 */
export async function getDepartmentsByCampus(campusId: string) {
  const result = await db.selectDistinct({
    deptName: course.deptName,
  })
  .from(course)
  .where(eq(course.campusId, campusId))
  .orderBy(asc(course.deptName));
  
  return result.map(r => r.deptName).filter((name): name is string => name !== null);
}

// ========== DEGREE PROGRAM QUERIES ==========

/**
 * Get all degree programs for a campus
 */
export async function getDegreeProgramsByCampus(campusId: string) {
  return await db.select({
    program: degreeProgram,
    degree: degree,
    campus: campus,
  })
  .from(degreeProgram)
  .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
  .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
  .where(eq(degreeProgram.campusId, campusId))
  .orderBy(asc(degreeProgram.majorTitle));
}

/**
 * Get degree programs by degree level
 */
export async function getDegreeProgramsByLevel(level: string) {
  return await db.select({
    program: degreeProgram,
    degree: degree,
    campus: campus,
  })
  .from(degreeProgram)
  .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
  .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
  .where(eq(degree.level, level))
  .orderBy(asc(campus.name), asc(degreeProgram.majorTitle));
}

/**
 * Search degree programs by major title
 */
export async function searchDegreePrograms(keyword: string, limit: number = 50) {
  const searchPattern = `%${keyword}%`;
  
  return await db.select({
    program: degreeProgram,
    degree: degree,
    campus: campus,
  })
  .from(degreeProgram)
  .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
  .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
  .where(
    or(
      like(degreeProgram.majorTitle, searchPattern),
      like(degreeProgram.programName, searchPattern),
      like(degreeProgram.track, searchPattern)
    )
  )
  .limit(limit);
}

/**
 * Get a specific degree program by ID
 */
export async function getDegreeProgramById(programId: number) {
  const [result] = await db.select({
    program: degreeProgram,
    degree: degree,
    campus: campus,
  })
  .from(degreeProgram)
  .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
  .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
  .where(eq(degreeProgram.id, programId))
  .limit(1);
  
  return result;
}

// ========== DEGREE PATHWAY QUERIES ==========

/**
 * Get the complete pathway for a degree program
 * Returns all semesters in order with their courses
 */
export async function getCompletePathway(programId: number) {
  // Get all pathway semesters
  const pathways = await db.select()
    .from(degreePathway)
    .where(eq(degreePathway.degreeProgramId, programId))
    .orderBy(asc(degreePathway.sequenceOrder));
  
  // Get all courses for these pathways
  const pathwayIds = pathways.map(p => p.id);
  
  if (pathwayIds.length === 0) {
    return [];
  }
  
  const courses = await db.select({
    pathwayCourse: pathwayCourse,
    course: course,
  })
  .from(pathwayCourse)
  .leftJoin(course, eq(pathwayCourse.courseId, course.id))
  .where(inArray(pathwayCourse.pathwayId, pathwayIds))
  .orderBy(asc(pathwayCourse.pathwayId), asc(pathwayCourse.sequenceOrder));
  
  // Group courses by pathway
  const coursesByPathway = new Map<number, typeof courses>();
  for (const c of courses) {
    const pathwayId = c.pathwayCourse.pathwayId;
    if (!coursesByPathway.has(pathwayId)) {
      coursesByPathway.set(pathwayId, []);
    }
    coursesByPathway.get(pathwayId)!.push(c);
  }
  
  // Combine pathways with their courses
  return pathways.map(pathway => ({
    ...pathway,
    courses: coursesByPathway.get(pathway.id) || [],
  }));
}

/**
 * Get pathway for a specific year
 */
export async function getPathwayByYear(programId: number, yearNumber: number) {
  const pathways = await db.select()
    .from(degreePathway)
    .where(
      and(
        eq(degreePathway.degreeProgramId, programId),
        eq(degreePathway.yearNumber, yearNumber)
      )
    )
    .orderBy(asc(degreePathway.sequenceOrder));
  
  const pathwayIds = pathways.map(p => p.id);
  
  if (pathwayIds.length === 0) {
    return [];
  }
  
  const courses = await db.select({
    pathwayCourse: pathwayCourse,
    course: course,
  })
  .from(pathwayCourse)
  .leftJoin(course, eq(pathwayCourse.courseId, course.id))
  .where(inArray(pathwayCourse.pathwayId, pathwayIds))
  .orderBy(asc(pathwayCourse.pathwayId), asc(pathwayCourse.sequenceOrder));
  
  const coursesByPathway = new Map<number, typeof courses>();
  for (const c of courses) {
    const pathwayId = c.pathwayCourse.pathwayId;
    if (!coursesByPathway.has(pathwayId)) {
      coursesByPathway.set(pathwayId, []);
    }
    coursesByPathway.get(pathwayId)!.push(c);
  }
  
  return pathways.map(pathway => ({
    ...pathway,
    courses: coursesByPathway.get(pathway.id) || [],
  }));
}

/**
 * Get all general education requirements from pathways
 */
export async function getGeneralEducationCourses(programId: number) {
  const pathways = await db.select()
    .from(degreePathway)
    .where(eq(degreePathway.degreeProgramId, programId));
  
  const pathwayIds = pathways.map(p => p.id);
  
  if (pathwayIds.length === 0) {
    return [];
  }
  
  return await db.select({
    pathwayCourse: pathwayCourse,
    course: course,
  })
  .from(pathwayCourse)
  .leftJoin(course, eq(pathwayCourse.courseId, course.id))
  .where(
    and(
      inArray(pathwayCourse.pathwayId, pathwayIds),
      eq(pathwayCourse.isGenEd, true)
    )
  )
  .orderBy(asc(pathwayCourse.category));
}

/**
 * Get all electives from a pathway
 */
export async function getElectives(programId: number) {
  const pathways = await db.select()
    .from(degreePathway)
    .where(eq(degreePathway.degreeProgramId, programId));
  
  const pathwayIds = pathways.map(p => p.id);
  
  if (pathwayIds.length === 0) {
    return [];
  }
  
  return await db.select({
    pathwayCourse: pathwayCourse,
    course: course,
  })
  .from(pathwayCourse)
  .leftJoin(course, eq(pathwayCourse.courseId, course.id))
  .where(
    and(
      inArray(pathwayCourse.pathwayId, pathwayIds),
      eq(pathwayCourse.isElective, true)
    )
  );
}

// ========== STATISTICS & ANALYTICS QUERIES ==========

/**
 * Get course count by campus
 */
export async function getCourseCountByCampus() {
  return await db.select({
    campusId: course.campusId,
    campusName: campus.name,
    courseCount: sql<number>`count(*)`,
  })
  .from(course)
  .leftJoin(campus, eq(course.campusId, campus.id))
  .groupBy(course.campusId, campus.name)
  .orderBy(desc(sql`count(*)`));
}

/**
 * Get complete degree program with pathway in a format compatible with the frontend
 * Returns the pathway data structured like the JSON files
 */
export async function getDegreeProgramsWithPathways(campusId: string) {
  // Get all degree programs for the campus with related data
  const programs = await db.select({
    program: degreeProgram,
    degree: degree,
    campus: campus,
  })
  .from(degreeProgram)
  .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
  .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
  .where(eq(degreeProgram.campusId, campusId))
  .orderBy(asc(degreeProgram.majorTitle));

  // For each program, get its complete pathway
  const result = await Promise.all(programs.map(async ({ program, degree: deg, campus: camp }) => {
    const pathway = await getCompletePathway(program.id);
    
    // Transform to the format expected by the frontend
    const pathwayData = pathway.length > 0 ? {
      program_name: program.programName,
      institution: camp?.name || campusId,
      total_credits: program.totalCredits || 0,
      years: transformPathwayToYears(pathway),
    } : null;

    return {
      id: program.id,
      programName: program.programName,
      majorTitle: program.majorTitle,
      track: program.track,
      degreeCode: deg?.code,
      degreeName: deg?.name,
      institution: camp?.name || campusId,
      totalCredits: program.totalCredits,
      pathwayData,
    };
  }));

  return result;
}

/**
 * Transform database pathway structure to the year-based structure expected by frontend
 */
interface PathwaySemester {
  yearNumber: number;
  semesterName: string;
  semesterCredits: number | null;
  courses: Array<{
    pathwayCourse: {
      courseName: string;
      credits: number;
    };
  }>;
}

function transformPathwayToYears(pathwayWithCourses: PathwaySemester[]) {
  // Group by year
  const yearMap = new Map<number, PathwaySemester[]>();
  
  for (const semester of pathwayWithCourses) {
    const yearNum = semester.yearNumber;
    if (!yearMap.has(yearNum)) {
      yearMap.set(yearNum, []);
    }
    yearMap.get(yearNum)!.push(semester);
  }

  // Convert to array format
  const years = Array.from(yearMap.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([yearNumber, semesters]) => ({
      year_number: yearNumber,
      semesters: semesters.map(semester => ({
        semester_name: semester.semesterName,
        credits: semester.semesterCredits || 0,
        courses: semester.courses.map((c) => ({
          name: c.pathwayCourse.courseName,
          credits: c.pathwayCourse.credits,
        })),
      })),
    }));

  return years;
}

/**
 * Get program count by campus
 */
export async function getProgramCountByCampus() {
  return await db.select({
    campusId: degreeProgram.campusId,
    campusName: campus.name,
    programCount: sql<number>`count(*)`,
  })
  .from(degreeProgram)
  .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
  .groupBy(degreeProgram.campusId, campus.name)
  .orderBy(desc(sql`count(*)`));
}

/**
 * Get total credits distribution
 */
export async function getCreditDistribution() {
  return await db.select({
    totalCredits: degreeProgram.totalCredits,
    count: sql<number>`count(*)`,
  })
  .from(degreeProgram)
  .groupBy(degreeProgram.totalCredits)
  .orderBy(asc(degreeProgram.totalCredits));
}

// ========== COURSE PREREQUISITES ==========

/**
 * Get prerequisites for a course
 */
export async function getCoursePrerequisites(courseId: number) {
  return await db.select({
    prerequisite: coursePrerequisite,
    course: course,
  })
  .from(coursePrerequisite)
  .leftJoin(course, eq(coursePrerequisite.prerequisiteCourseId, course.id))
  .where(eq(coursePrerequisite.courseId, courseId));
}

/**
 * Find courses that have a specific course as a prerequisite
 */
export async function getCourseDependents(courseId: number) {
  return await db.select({
    dependent: course,
    prerequisiteInfo: coursePrerequisite,
  })
  .from(coursePrerequisite)
  .leftJoin(course, eq(coursePrerequisite.courseId, course.id))
  .where(eq(coursePrerequisite.prerequisiteCourseId, courseId));
}

// ========== MAJOR & CAREER PATHWAY QUERIES ==========

/**
 * Get all majors for a specific campus
 * Optimized with index on campus_id + major_name
 */
export async function getMajorsByCampus(campusId: string) {
  return await db.select()
    .from(majorCareerMapping)
    .where(eq(majorCareerMapping.campusId, campusId))
    .orderBy(asc(majorCareerMapping.majorName));
}

/**
 * Get a specific major by name and campus
 * Uses composite index for O(log n) lookup
 */
export async function getMajorByName(campusId: string, majorName: string) {
  const [result] = await db.select()
    .from(majorCareerMapping)
    .where(and(
      eq(majorCareerMapping.campusId, campusId),
      eq(majorCareerMapping.majorName, majorName)
    ))
    .limit(1);
  return result;
}

/**
 * Get all majors by degree type (e.g., all BS programs)
 * Uses index on degree_type
 */
export async function getMajorsByDegreeType(campusId: string, degreeType: string) {
  return await db.select()
    .from(majorCareerMapping)
    .where(and(
      eq(majorCareerMapping.campusId, campusId),
      eq(majorCareerMapping.degreeType, degreeType)
    ))
    .orderBy(asc(majorCareerMapping.majorName));
}

/**
 * Get career pathways for a specific major
 * Returns the full career pathway details by joining with career_pathways table
 * This is the main query for "what careers can I pursue with this major?"
 */
export async function getCareerPathwaysForMajor(campusId: string, majorName: string) {
  // First, get the major and its career pathway IDs
  const major = await getMajorByName(campusId, majorName);
  
  if (!major || !major.careerPathwayIds || major.careerPathwayIds.length === 0) {
    return [];
  }

  // Then fetch all the career pathways
  return await db.select()
    .from(careerPathway)
    .where(inArray(careerPathway.id, major.careerPathwayIds))
    .orderBy(asc(careerPathway.title));
}

/**
 * Get all career pathways (for reference data)
 */
export async function getAllCareerPathways() {
  return await db.select()
    .from(careerPathway)
    .orderBy(asc(careerPathway.title));
}

/**
 * Get a career pathway by ID
 */
export async function getCareerPathwayById(id: number) {
  const [result] = await db.select()
    .from(careerPathway)
    .where(eq(careerPathway.id, id))
    .limit(1);
  return result;
}

/**
 * Get a career pathway by title (case-insensitive)
 */
export async function getCareerPathwayByTitle(title: string) {
  const normalized = title.toLowerCase().trim();
  const [result] = await db.select()
    .from(careerPathway)
    .where(eq(careerPathway.normalizedTitle, normalized))
    .limit(1);
  return result;
}

/**
 * Get career pathways by category
 */
export async function getCareerPathwaysByCategory(category: string) {
  return await db.select()
    .from(careerPathway)
    .where(eq(careerPathway.category, category))
    .orderBy(asc(careerPathway.title));
}

/**
 * Search majors by partial name match
 * Useful for autocomplete/search functionality
 */
export async function searchMajors(campusId: string, searchTerm: string) {
  return await db.select()
    .from(majorCareerMapping)
    .where(and(
      eq(majorCareerMapping.campusId, campusId),
      like(majorCareerMapping.majorName, `%${searchTerm}%`)
    ))
    .orderBy(asc(majorCareerMapping.majorName))
    .limit(20);
}

/**
 * Get majors that lead to a specific career
 * Useful for "what should I study to become a X?" queries
 */
export async function getMajorsForCareer(campusId: string, careerTitle: string) {
  // First get the career pathway
  const career = await getCareerPathwayByTitle(careerTitle);
  
  if (!career) {
    return [];
  }

  // Find all majors that include this career in their pathways
  // Using jsonb operator to check if array contains the career ID
  return await db.select()
    .from(majorCareerMapping)
    .where(and(
      eq(majorCareerMapping.campusId, campusId),
      sql`${majorCareerMapping.careerPathwayIds} @> ${JSON.stringify([career.id])}::jsonb`
    ))
    .orderBy(asc(majorCareerMapping.majorName));
}

/**
 * Get comprehensive major data with career pathways
 * Returns major info along with full career pathway details
 * Optimized for displaying complete major information
 */
export async function getMajorWithCareerPathways(campusId: string, majorName: string) {
  const major = await getMajorByName(campusId, majorName);
  
  if (!major) {
    return null;
  }

  const careers = await getCareerPathwaysForMajor(campusId, majorName);

  return {
    ...major,
    careerPathways: careers,
  };
}

/**
 * Get statistics about majors and careers
 * Useful for analytics and dashboards
 */
export async function getMajorCareerStats(campusId: string) {
  const majors = await getMajorsByCampus(campusId);
  
  const degreeTypes = majors.reduce((acc, major) => {
    acc[major.degreeType] = (acc[major.degreeType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCareerPathways = majors.reduce((sum, major) => {
    return sum + (major.careerPathwayIds?.length || 0);
  }, 0);

  return {
    totalMajors: majors.length,
    degreeTypes,
    averageCareerPathwaysPerMajor: majors.length > 0 ? totalCareerPathways / majors.length : 0,
  };
}

// ========== PROFILE QUERIES ==========

/**
 * Get user profile with all fields
 */
export async function getProfileByUserId(userId: string) {
  const { profile } = await import('@/app/db/schema');
  const [userProfile] = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId))
    .limit(1);
  
  return userProfile;
}

/**
 * Get profiles by dream job
 */
export async function getProfilesByDreamJob(dreamJob: string) {
  const { profile } = await import('@/app/db/schema');
  return await db
    .select()
    .from(profile)
    .where(eq(profile.dreamJob, dreamJob));
}

/**
 * Get profiles by major
 */
export async function getProfilesByMajor(major: string) {
  const { profile } = await import('@/app/db/schema');
  return await db
    .select()
    .from(profile)
    .where(eq(profile.major, major));
}

/**
 * Get profiles by user type
 */
export async function getProfilesByUserType(userType: string) {
  const { profile } = await import('@/app/db/schema');
  return await db
    .select()
    .from(profile)
    .where(eq(profile.userType, userType));
}

/**
 * Search profiles by interests
 */
export async function searchProfilesByInterest(interest: string) {
  const { profile } = await import('@/app/db/schema');
  return await db
    .select()
    .from(profile)
    .where(sql`${profile.interests}::jsonb @> ${JSON.stringify([interest])}::jsonb`);
}
