import { db } from "@/app/db";
import { 
  campus, 
  course, 
  degree, 
  degreeProgram, 
  degreePathway, 
  pathwayCourse,
} from "@/app/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Campus mappings
const CAMPUS_MAP = {
  "University of Hawaiʻi at Mānoa": { id: "manoa", instIpeds: "141574", type: "university" },
  "Hawai'i Community College": { id: "hawaiicc", instIpeds: "383190", type: "community_college" },
  "University of Hawaiʻi at Hilo": { id: "hilo", instIpeds: "141334", type: "university" },
  "Honolulu Community College": { id: "honolulucc", instIpeds: "141301", type: "community_college" },
  "Kapiʻolani Community College": { id: "kapiolani", instIpeds: "141574", type: "community_college" },
  "Kapiolani Community College": { id: "kapiolani", instIpeds: "141574", type: "community_college" },
  "Kauaʻi Community College": { id: "kauai", instIpeds: "141367", type: "community_college" },
  "Leeward Community College": { id: "leeward", instIpeds: "141424", type: "community_college" },
  "Maui College": { id: "maui", instIpeds: "141489", type: "community_college" },
  "University of Hawaiʻi–West Oʻahu": { id: "westoahu", instIpeds: "141679", type: "university" },
  "Windward Community College": { id: "windward", instIpeds: "141706", type: "community_college" },
  "Pacific Center for Advanced Technology Training": { id: "pcatt", instIpeds: "", type: "community_college" },
};

// Degree code mappings and extraction
function extractDegreeInfo(programName: string): { degreeCode: string; majorTitle: string; track: string | null } {
  // Extract degree code (e.g., "BA", "BS", "AA", "AS", etc.)
  const degreeMatch = programName.match(/\(([A-Z\.]+)\)/);
  const degreeCode = degreeMatch ? degreeMatch[1] : "UNKNOWN";
  
  // Extract major title - text after "in" or entire name if no "in"
  let majorTitle = programName;
  const inMatch = programName.match(/\)\s+in\s+(.+?)(?:\s*\(|$)/);
  if (inMatch) {
    majorTitle = inMatch[1].trim();
  }
  
  // Extract track if present
  const trackMatch = programName.match(/\(([^)]*Track[^)]*)\)$/);
  const track = trackMatch ? trackMatch[1] : null;
  
  return { degreeCode, majorTitle, track };
}

// Degree level mapping
function getDegreeLevel(code: string): string {
  if (code.startsWith("B")) return "baccalaureate";
  if (code.startsWith("A")) return "associate";
  if (code.includes("Cert")) return "certificate";
  if (code.startsWith("M") || code.startsWith("PhD") || code.startsWith("D")) return "graduate";
  return "other";
}

// Parse course name to extract prefix and number
function parseCourseIdentifier(courseName: string): { prefix: string | null; number: string | null } {
  const match = courseName.match(/^([A-Z]+)\s*(\d+[A-Z]*)/i);
  if (match) {
    return { prefix: match[1].toUpperCase(), number: match[2] };
  }
  return { prefix: null, number: null };
}

// Determine if course is a general education requirement
function isGeneralEducation(courseName: string, category: string | undefined): boolean {
  const genEdPatterns = ['FW', 'FQ', 'FG', 'FGA', 'FGB', 'FGC', 'DA', 'DB', 'DH', 'DP', 'DS', 'DY', 'DL'];
  
  if (category && genEdPatterns.includes(category)) return true;
  
  // Check if course name contains gen ed codes
  return genEdPatterns.some(pattern => 
    courseName.includes(`(${pattern})`) || courseName.includes(pattern)
  );
}

// Determine if course is an elective
function isElectiveCourse(courseName: string): boolean {
  const lowerName = courseName.toLowerCase();
  return lowerName.includes("elective") || 
         lowerName === "elective" ||
         lowerName.includes("track elective");
}

interface CourseData {
  course_prefix: string;
  course_number: string;
  course_title: string;
  course_desc: string;
  num_units: string;
  dept_name: string;
  inst_ipeds: number;
  metadata?: string;
}

interface PathwayCourseData {
  name: string;
  credits: number;
  category?: string;
}

interface SemesterData {
  semester_name: string;
  credits: number;
  courses: PathwayCourseData[];
}

interface YearData {
  year_number: number;
  semesters: SemesterData[];
}

interface PathwayData {
  program_name: string;
  institution: string;
  total_credits: number;
  years: YearData[];
}

async function seedCampuses() {
  console.log("🏫 Seeding campuses...");
  
  for (const [name, info] of Object.entries(CAMPUS_MAP)) {
    await db.insert(campus).values({
      id: info.id,
      name: name,
      instIpeds: info.instIpeds || null,
      type: info.type,
    }).onConflictDoNothing();
  }
  
  console.log("✅ Campuses seeded");
}

async function seedCourses() {
  console.log("📚 Seeding courses...");
  
  const dataDir = path.join(process.cwd(), "app/db/data");
  const courseFiles = [
    { file: "manoa_courses.json", campusId: "manoa" },
    { file: "hawaiicc_courses.json", campusId: "hawaiicc" },
    { file: "hilo_courses.json", campusId: "hilo" },
    { file: "honolulucc_courses.json", campusId: "honolulucc" },
    { file: "kapiolani_courses.json", campusId: "kapiolani" },
    { file: "kauai_courses.json", campusId: "kauai" },
    { file: "leeward_courses.json", campusId: "leeward" },
    { file: "maui_courses.json", campusId: "maui" },
    { file: "pcatt_courses.json", campusId: "pcatt" },
    { file: "west_oahu_courses.json", campusId: "westoahu" },
    { file: "windward_courses.json", campusId: "windward" },
  ];
  
  for (const { file, campusId } of courseFiles) {
    const filePath = path.join(dataDir, file);
    console.log(`  Loading ${file}...`);
    
    const coursesData: CourseData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    // Batch insert for better performance
    const batchSize = 100;
    for (let i = 0; i < coursesData.length; i += batchSize) {
      const batch = coursesData.slice(i, i + batchSize);
      
      await db.insert(course).values(
        batch.map((c) => ({
          campusId,
          coursePrefix: c.course_prefix,
          courseNumber: c.course_number,
          courseTitle: c.course_title || null,
          courseDesc: c.course_desc || null,
          numUnits: c.num_units || null,
          deptName: c.dept_name || null,
          metadata: c.metadata || null,
        }))
      ).onConflictDoNothing();
    }
    
    console.log(`  ✅ ${coursesData.length} courses from ${file}`);
  }
  
  console.log("✅ All courses seeded");
}

async function seedDegrees() {
  console.log("🎓 Seeding degree types...");
  
  // Common degree codes in UH system
  const degrees = [
    { code: "BA", name: "Bachelor of Arts", level: "baccalaureate" },
    { code: "BS", name: "Bachelor of Science", level: "baccalaureate" },
    { code: "BBA", name: "Bachelor of Business Administration", level: "baccalaureate" },
    { code: "BED", name: "Bachelor of Education", level: "baccalaureate" },
    { code: "BFA", name: "Bachelor of Fine Arts", level: "baccalaureate" },
    { code: "AA", name: "Associate in Arts", level: "associate" },
    { code: "AS", name: "Associate in Science", level: "associate" },
    { code: "AAS", name: "Associate in Applied Science", level: "associate" },
    { code: "MA", name: "Master of Arts", level: "graduate" },
    { code: "MS", name: "Master of Science", level: "graduate" },
    { code: "MBA", name: "Master of Business Administration", level: "graduate" },
    { code: "PhD", name: "Doctor of Philosophy", level: "graduate" },
    { code: "CA", name: "Certificate of Achievement", level: "certificate" },
    { code: "CO", name: "Certificate of Completion", level: "certificate" },
    { code: "UCert", name: "Undergraduate Certificate", level: "certificate" },
  ];
  
  for (const deg of degrees) {
    await db.insert(degree).values(deg).onConflictDoNothing();
  }
  
  console.log("✅ Degree types seeded");
}

async function seedPathways() {
  console.log("🛤️  Seeding degree pathways...");
  
  const dataDir = path.join(process.cwd(), "app/db/data");
  const pathwayFiles = [
    { file: "manoa_degree_pathways.json", campusId: "manoa" },
    { file: "kapiolani_degree_pathways.json", campusId: "kapiolani" },
  ];
  
  // Build course lookup cache for faster matching
  console.log("  Building course lookup cache...");
  const courseLookup = new Map<string, number>(); // key: "campusId:PREFIX:NUMBER" -> courseId
  const allCourses = await db.select().from(course);
  for (const c of allCourses) {
    const key = `${c.campusId}:${c.coursePrefix}:${c.courseNumber}`;
    courseLookup.set(key, c.id);
  }
  console.log(`  📦 Cached ${courseLookup.size} courses`);
  
  for (const { file, campusId } of pathwayFiles) {
    const filePath = path.join(dataDir, file);
    console.log(`  Loading ${file}...`);
    
    const pathwaysData: PathwayData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    for (const pathway of pathwaysData) {
      // Extract degree information
      const { degreeCode, majorTitle, track } = extractDegreeInfo(pathway.program_name);
      
      // Get or create degree
      let degreeRecord = await db.select().from(degree).where(eq(degree.code, degreeCode)).limit(1);
      if (degreeRecord.length === 0) {
        // Create new degree if not exists
        const level = getDegreeLevel(degreeCode);
        const [newDegree] = await db.insert(degree).values({
          code: degreeCode,
          name: degreeCode,
          level,
        }).returning();
        degreeRecord = [newDegree];
      }
      
      // Create degree program
      const [program] = await db.insert(degreeProgram).values({
        campusId,
        degreeId: degreeRecord[0].id,
        programName: pathway.program_name,
        majorTitle,
        track,
        totalCredits: pathway.total_credits,
        typicalDurationYears: pathway.years.length,
      }).returning();
      
      console.log(`    📝 ${pathway.program_name}`);
      
      // Process each year and semester
      let sequenceOrder = 0;
      for (const year of pathway.years) {
        for (const semester of year.semesters) {
          sequenceOrder++;
          
          // Create pathway record for this semester
          const [pathwayRecord] = await db.insert(degreePathway).values({
            degreeProgramId: program.id,
            yearNumber: year.year_number,
            semesterName: semester.semester_name,
            semesterCredits: semester.credits,
            sequenceOrder,
          }).returning();
          
          // Add courses for this semester
          let courseSequence = 0;
          for (const pathwayCrs of semester.courses) {
            courseSequence++;
            
            // Try to match to actual course in database
            const { prefix, number } = parseCourseIdentifier(pathwayCrs.name);
            let matchedCourseId: number | null = null;
            
            if (prefix && number) {
              const key = `${campusId}:${prefix}:${number}`;
              matchedCourseId = courseLookup.get(key) || null;
            }
            
            const category = pathwayCrs.category || null;
            const isElective = isElectiveCourse(pathwayCrs.name);
            const isGenEd = isGeneralEducation(pathwayCrs.name, category || undefined);
            
            await db.insert(pathwayCourse).values({
              pathwayId: pathwayRecord.id,
              courseId: matchedCourseId,
              courseName: pathwayCrs.name,
              credits: pathwayCrs.credits,
              category,
              isElective,
              isGenEd,
              sequenceOrder: courseSequence,
            });
          }
        }
      }
    }
    
    console.log(`  ✅ ${pathwaysData.length} pathways from ${file}`);
  }
  
  console.log("✅ All pathways seeded");
}

async function main() {
  console.log("🚀 Starting database seeding for UH System pathways and courses...\n");
  
  try {
    await seedCampuses();
    console.log();
    
    await seedDegrees();
    console.log();
    
    await seedCourses();
    console.log();
    
    await seedPathways();
    console.log();
    
    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

main();
