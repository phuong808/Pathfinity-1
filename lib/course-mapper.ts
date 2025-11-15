// This file provides types and constants that can be used by both client and server components
// Database queries should only be done in API routes or server components

export interface CourseDetails {
  course_prefix: string;
  course_number: string;
  course_title: string;
  course_desc: string;
  num_units: string;
  dept_name: string;
  metadata: string;
}

export interface PathwayData {
  program_name: string;
  institution: string;
  total_credits: number;
  years: Array<{
    year_number: number;
    semesters: Array<{
      semester_name: string;
      credits: number;
      courses: Array<{
        name: string;
        credits: number;
      }>;
      activities?: string[];
      internships?: string[];
      milestones?: string[];
    }>;
  }>;
}

export interface MajorData {
  majorName: string;
  degrees: string[];
  institution: string;
  pathwayData?: PathwayData;
}

export interface Campus {
  id: string;
  name: string;
  displayName: string;
}

// Available campuses based on database
export const CAMPUSES: Campus[] = [
  { id: 'manoa', name: 'manoa', displayName: 'UH Mānoa' },
  { id: 'hawaiicc', name: 'hawaiicc', displayName: 'Hawaiʻi CC' },
  { id: 'hilo', name: 'hilo', displayName: 'UH Hilo' },
  { id: 'honolulucc', name: 'honolulucc', displayName: 'Honolulu CC' },
  { id: 'kapiolani', name: 'kapiolani', displayName: 'Kapiʻolani CC (KCC)' },
  { id: 'kauai', name: 'kauai', displayName: 'Kauaʻi CC' },
  { id: 'leeward', name: 'leeward', displayName: 'Leeward CC' },
  { id: 'maui', name: 'maui', displayName: 'UH Maui College' },
  { id: 'pcatt', name: 'pcatt', displayName: 'PCATT' },
  { id: 'westoahu', name: 'westoahu', displayName: 'UH West Oʻahu' },
  { id: 'windward', name: 'windward', displayName: 'Windward CC' },
];

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
