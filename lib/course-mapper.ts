import manoaCoursesData from '@/app/db/data/manoa_courses.json';

export interface CourseDetails {
  course_prefix: string;
  course_number: string;
  course_title: string;
  course_desc: string;
  num_units: string;
  dept_name: string;
  inst_ipeds: number;
  metadata: string;
}

// Type the imported JSON data
const manoaCourses = manoaCoursesData as CourseDetails[];

/**
 * Maps a course name (e.g., "ICS 111", "MATH 241", "CINE 255 (DH)") to detailed course information
 * from the manoa_courses.json database
 * 
 * @param courseName - The course name/code (e.g., "ICS 111", "MATH 241", "CINE 255 (DH)")
 * @returns CourseDetails object if found, undefined otherwise
 */
export function getCourseDetails(courseName: string): CourseDetails | undefined {
  if (!courseName) return undefined;
  
  // Remove anything in parentheses (like focus areas: "CINE 255 (DH)" -> "CINE 255")
  let cleanedName = courseName.replace(/\s*\([^)]*\)/g, '').trim();
  
  // Handle "or" cases - try to get the first course mentioned
  // e.g., "CINE 315 or 321" -> "CINE 315"
  // e.g., "FQ (or FW)" -> "FQ"
  if (cleanedName.includes(' or ')) {
    cleanedName = cleanedName.split(' or ')[0].trim();
  }
  
  // Normalize to uppercase
  const normalizedName = cleanedName.toUpperCase();
  
  // Extract course prefix and number from the course name
  // Handle various formats: "ICS 111", "ICS111", "ICS-111", etc.
  const match = normalizedName.match(/^([A-Z]+)\s*[-]?\s*(\d+[A-Z]?)$/);
  
  if (!match) return undefined;
  
  const [, prefix, number] = match;
  
  // Find the course in the database
  const course = manoaCourses.find(
    c => c.course_prefix.toUpperCase() === prefix && 
         c.course_number.toUpperCase() === number
  );
  
  return course;
}

/**
 * Gets a formatted course code from prefix and number
 */
export function formatCourseCode(prefix: string, number: string): string {
  return `${prefix} ${number}`;
}

/**
 * Extracts prerequisites from metadata string
 */
export function extractPrerequisites(metadata: string): string {
  const prereqMatch = metadata.match(/Prerequisites?:\s*([^;.]+)/i);
  return prereqMatch ? prereqMatch[1].trim() : 'None';
}

/**
 * Extracts grade option from metadata string
 */
export function extractGradeOption(metadata: string): string {
  const gradeMatch = metadata.match(/Grade Option:\s*([^;.]+)/i);
  return gradeMatch ? gradeMatch[1].trim() : 'Not specified';
}

/**
 * Checks if a course is repeatable
 */
export function isRepeatable(metadata: string): boolean {
  return /Repeatable/i.test(metadata);
}

/**
 * Extracts major restrictions from metadata
 */
export function extractMajorRestrictions(metadata: string): string {
  const restrictionMatch = metadata.match(/Major Restrictions?:\s*([^;.]+)/i);
  return restrictionMatch ? restrictionMatch[1].trim() : 'None';
}
