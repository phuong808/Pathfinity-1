// Simple test of the major recommendations tool
import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'public', 'uh_manoa_majors_careers_match.json');
const jsonData = fs.readFileSync(jsonPath, 'utf-8');
const data = JSON.parse(jsonData);

console.log('📚 Total majors in file:', data.majors_career_pathways.length);

// Test search for "software engineer"
const careerPath = 'software engineer';
const careerLower = careerPath.toLowerCase();

console.log('\n🔍 Searching for:', careerPath);

let matches = [];

for (const major of data.majors_career_pathways) {
  for (const career of major.career_pathways) {
    const careerPathwayLower = career.toLowerCase();
    if (careerPathwayLower.includes('software') || careerPathwayLower.includes('developer') || careerPathwayLower.includes('programmer')) {
      matches.push({
        major: major.major,
        career: career,
      });
    }
  }
}

console.log('\n✅ Found matches:');
matches.slice(0, 10).forEach(m => {
  console.log(`  - ${m.major}: ${m.career}`);
});
