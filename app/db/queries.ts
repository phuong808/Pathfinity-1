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
  coursePrerequisite 
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
