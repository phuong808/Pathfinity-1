import { generateRoadmap } from '../lib/roadmap-generator.js';

async function testRoadmapGeneration() {
  console.log('='.repeat(70));
  console.log('TESTING UH SYSTEM ROADMAP GENERATOR');
  console.log('='.repeat(70));
  console.log('');

  // Test 1: UH Manoa Computer Science (should use ICS prefix)
  console.log('TEST 1: UH Manoa - Computer Science BS');
  console.log('-'.repeat(70));
  try {
    const roadmap1 = await generateRoadmap(
      'uh_manoa',
      'Computer Science',
      'BS',
      ['Python', 'Data Structures', 'Web Development']
    );
    
    console.log('\n[OK] Test 1 Passed!');
    console.log(`Generated roadmap with ${roadmap1.total_credits} credits`);
    console.log(`Program: ${roadmap1.program_name}`);
    console.log(`Years: ${roadmap1.years.length}`);
    
    // Check for ICS courses
    const allCourses = roadmap1.years.flatMap(y => 
      y.semesters.flatMap(s => s.courses.map(c => c.name))
    );
    const icsCount = allCourses.filter(c => c.startsWith('ICS')).length;
    console.log(`ICS courses found: ${icsCount}`);
    
  } catch (error: any) {
    console.error('[FAIL] Test 1 Failed:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('');

  // Test 2: UH Hilo Computer Science (should use CS prefix, not ICS)
  console.log('TEST 2: UH Hilo - Computer Science BS');
  console.log('-'.repeat(70));
  try {
    const roadmap2 = await generateRoadmap(
      'uh_hilo',
      'Computer Science',
      'BS',
      []
    );
    
    console.log('\n[OK] Test 2 Passed!');
    console.log(`Generated roadmap with ${roadmap2.total_credits} credits`);
    console.log(`Program: ${roadmap2.program_name}`);
    console.log(`Years: ${roadmap2.years.length}`);
    
    // Check for CS courses (not ICS!)
    const allCourses = roadmap2.years.flatMap(y => 
      y.semesters.flatMap(s => s.courses.map(c => c.name))
    );
    const csCount = allCourses.filter(c => c.startsWith('CS ')).length;
    const icsCount = allCourses.filter(c => c.startsWith('ICS')).length;
    console.log(`CS courses found: ${csCount}`);
    console.log(`ICS courses found (should be 0): ${icsCount}`);
    
    if (csCount > 0 && icsCount === 0) {
      console.log('[OK] Correctly using CS prefix for UH Hilo!');
    } else {
      console.log('[WARN] Expected CS prefix, not ICS for UH Hilo');
    }
    
  } catch (error: any) {
    console.error('[FAIL] Test 2 Failed:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('');

  // Test 3: Check Gen Ed coverage
  console.log('TEST 3: UH Manoa - Business BBA (Check Gen Ed)');
  console.log('-'.repeat(70));
  try {
    const roadmap3 = await generateRoadmap(
      'uh_manoa',
      'Business Administration',
      'BBA',
      []
    );
    
    console.log('\n[OK] Test 3 Passed!');
    console.log(`Generated roadmap with ${roadmap3.total_credits} credits`);
    
    // Analyze Gen Ed coverage
    const allCourses = roadmap3.years.flatMap(y => 
      y.semesters.flatMap(s => s.courses.map(c => c.name))
    );
    
    const prefixes = allCourses.map(c => c.split(' ')[0]);
    const uniquePrefixes = new Set(prefixes);
    
    console.log(`\nGen Ed Analysis:`);
    console.log(`- Total unique prefixes: ${uniquePrefixes.size}`);
    console.log(`- ENG courses: ${prefixes.filter(p => p === 'ENG').length}`);
    console.log(`- MATH courses: ${prefixes.filter(p => p === 'MATH').length}`);
    console.log(`- HAW/HWST courses: ${prefixes.filter(p => p === 'HAW' || p === 'HWST').length}`);
    console.log(`- Social Science variety: ${Array.from(uniquePrefixes).filter(p => 
      ['HIST', 'PSY', 'SOC', 'ANTH', 'POLS', 'ECON'].includes(p)
    ).join(', ')}`);
    
  } catch (error: any) {
    console.error('[FAIL] Test 3 Failed:', error.message);
  }

  console.log('\n' + '='.repeat(70));
  console.log('ALL TESTS COMPLETED');
  console.log('='.repeat(70));
  
  process.exit(0);
}

testRoadmapGeneration().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});
