export type Course = { name: string; credits: number; semesterLabel?: string }
export type Semester = { semester_name: string; credits: number; courses: Course[] }
export type Year = { year_number: number; semesters: Semester[] }

export type Program = {
  program_name: string
  institution?: string
  total_credits?: number
  years: Year[]
}

// layout constants exported for reuse
export const NODE_WIDTH = 220
export const NODE_HEIGHT = 52
export const COLUMN_GAP = 340
export const ROW_GAP = 96
