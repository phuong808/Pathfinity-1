import { db } from "@/app/db";
import { degreeProgram } from "@/app/db/schema";
import { eq } from "drizzle-orm";

async function testQuery() {
  try {
    console.log("Testing degree programs query...\n");
    
    const programs = await db.select()
      .from(degreeProgram)
      .where(eq(degreeProgram.campusId, 'manoa'))
      .limit(3);
    
    console.log(`Found ${programs.length} programs:`);
    programs.forEach(p => {
      console.log({
        id: p.id,
        programName: p.programName,
        majorTitle: p.majorTitle,
        track: p.track,
      });
    });
    
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
}

testQuery();
