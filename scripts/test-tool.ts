import { getMajorRecommendations } from '../lib/tools/get-major-recommendations';

async function testTool() {
  console.log('🧪 Testing getMajorRecommendations tool\n');
  
  // Test 1: Software Engineer
  console.log('Test 1: Software Engineer');
  const result1 = await getMajorRecommendations.execute({ careerPath: 'software engineer' });
  console.log('Success:', result1.success);
  console.log('Message:', result1.message);
  if (result1.success && result1.recommendations) {
    console.log('Recommendations:');
    result1.recommendations.forEach((rec: any) => {
      console.log(`  ${rec.rank}. ${rec.majorName} (${rec.degreeType})`);
      if (rec.relatedCareers) {
        console.log(`     Related careers: ${rec.relatedCareers.join(', ')}`);
      }
    });
  }
  
  console.log('\n---\n');
  
  // Test 2: Doctor
  console.log('Test 2: Doctor');
  const result2 = await getMajorRecommendations.execute({ careerPath: 'doctor' });
  console.log('Success:', result2.success);
  if (result2.success && result2.recommendations) {
    console.log('Recommendations:');
    result2.recommendations.forEach((rec: any) => {
      console.log(`  ${rec.rank}. ${rec.majorName} (${rec.degreeType})`);
    });
  }
  
  console.log('\n---\n');
  
  // Test 3: Teacher
  console.log('Test 3: Teacher');
  const result3 = await getMajorRecommendations.execute({ careerPath: 'teacher' });
  console.log('Success:', result3.success);
  if (result3.success && result3.recommendations) {
    console.log('Recommendations:');
    result3.recommendations.forEach((rec: any) => {
      console.log(`  ${rec.rank}. ${rec.majorName} (${rec.degreeType})`);
    });
  }
}

testTool().catch(console.error);
