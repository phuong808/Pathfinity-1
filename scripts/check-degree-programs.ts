import { db } from "@/app/db";
import { degreeProgram, degree, campus } from "@/app/db/schema";
import { eq } from "drizzle-orm";

async function checkDegreePrograms() {
  try {
    console.log("Checking degree_programs table...\n");
    
    // Check manoa programs
    const manoaPrograms = await db.select({
      program: degreeProgram,
      degree: degree,
      campus: campus,
    })
    .from(degreeProgram)
    .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
    .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
    .where(eq(degreeProgram.campusId, 'manoa'))
    .limit(5);
    
    console.log(`Found ${manoaPrograms.length} Manoa programs (showing first 5):`);
    manoaPrograms.forEach(p => {
      console.log({
        id: p.program.id,
        programName: p.program.programName,
        majorTitle: p.program.majorTitle,
        degreeCode: p.degree?.code,
        campusId: p.program.campusId,
      });
    });
    
    // Check total count
    const allPrograms = await db.select().from(degreeProgram);
    console.log(`\nTotal degree programs in database: ${allPrograms.length}`);
    
    // Check degrees table
    const degrees = await db.select().from(degree);
    console.log(`\nTotal degrees in database: ${degrees.length}`);
    if (degrees.length > 0) {
      console.log("Sample degrees:", degrees.slice(0, 5));
    }
    
    // Check campuses
    const campuses = await db.select().from(campus);
    console.log(`\nTotal campuses in database: ${campuses.length}`);
    if (campuses.length > 0) {
      console.log("Campuses:", campuses);
    }
    
  } catch (error) {
    console.error("Error checking database:", error);
  }
  
  process.exit(0);
}

checkDegreePrograms();
