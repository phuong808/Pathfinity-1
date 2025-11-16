import 'dotenv/config';
import { db } from '@/app/db';
import { degreeProgram, degree, campus } from '@/app/db/schema';
import { eq, ilike, and } from 'drizzle-orm';

async function testMajorSearch() {
  console.log('🔍 Testing major search for UH Manoa...\n');
  
  // 1. Check if we have any programs at UH Manoa
  const manoaPrograms = await db
    .select({
      majorTitle: degreeProgram.majorTitle,
      programName: degreeProgram.programName,
      campusName: campus.name,
      degreeCode: degree.code,
    })
    .from(degreeProgram)
    .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
    .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
    .where(ilike(campus.name, '%Manoa%'))
    .limit(10);
  
  console.log('📚 Sample programs at UH Manoa:');
  manoaPrograms.forEach(prog => {
    console.log(`  - ${prog.majorTitle} (${prog.degreeCode}) - ${prog.campusName}`);
  });
  
  console.log('\n🔍 Searching for "software engineer" related majors...\n');
  
  // 2. Try searching for computer-related programs
  const computerPrograms = await db
    .select({
      majorTitle: degreeProgram.majorTitle,
      programName: degreeProgram.programName,
      campusName: campus.name,
      degreeCode: degree.code,
    })
    .from(degreeProgram)
    .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
    .leftJoin(degree, eq(degreeProgram.degreeId, degree.id))
    .where(
      and(
        ilike(campus.name, '%Manoa%'),
        ilike(degreeProgram.majorTitle, '%computer%')
      )
    )
    .limit(10);
  
  console.log('💻 Computer-related programs at UH Manoa:');
  if (computerPrograms.length === 0) {
    console.log('  ❌ No computer programs found!');
  } else {
    computerPrograms.forEach(prog => {
      console.log(`  - ${prog.majorTitle} (${prog.degreeCode})`);
    });
  }
  
  // 3. Check total count
  const totalCount = await db
    .select({ count: degreeProgram.id })
    .from(degreeProgram)
    .leftJoin(campus, eq(degreeProgram.campusId, campus.id))
    .where(ilike(campus.name, '%Manoa%'));
  
  console.log('\n📊 Total programs at UH Manoa:', totalCount.length);
  
  process.exit(0);
}

testMajorSearch().catch(console.error);
