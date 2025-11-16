import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/**
 * Tool to get major recommendations based on a selected career path
 * Reads directly from UH Manoa majors-careers JSON file for fast, accurate matching
 */

interface MajorCareerData {
  id: number;
  major: string;
  credits: number | string;
  degree_type: string;
  career_pathways: string[];
}

interface MajorsCareerFile {
  majors_career_pathways: MajorCareerData[];
}

export const getMajorRecommendations = tool({
  description: `Get top 5 major recommendations based on the user's selected career path or interest. 
  This tool uses UH Manoa's official majors-careers matching data to find relevant majors.
  
  Works well with various career inputs like:
  - Specific roles: "Software Engineer", "Doctor", "Teacher", "Accountant"
  - Career fields: "Healthcare", "Technology", "Business", "Education"
  - Job descriptions: "work with computers", "help people", "create art"
  
  The tool will find UH Manoa majors that best match the career path.`,
  
  inputSchema: z.object({
    careerPath: z.string().describe('The career path, job role, or field of interest from the user (e.g., "software engineer", "doctor", "work in healthcare", "business analyst")'),
  }),
  
  execute: async ({ careerPath }) => {
    try {
      console.log('🎓 Getting major recommendations for career:', careerPath);
      
      // Read the UH Manoa majors-careers JSON file
      const jsonPath = path.join(process.cwd(), 'public', 'uh_manoa_majors_careers_match.json');
      const jsonData = fs.readFileSync(jsonPath, 'utf-8');
      const data: MajorsCareerFile = JSON.parse(jsonData);
      
      const careerLower = careerPath.toLowerCase().trim();
      console.log('🔍 Searching for:', careerLower);
      
      // Score each major based on how well it matches the career
      interface ScoredMajor {
        major: MajorCareerData;
        score: number;
        matchedCareers: string[];
      }
      
      const scoredMajors: ScoredMajor[] = [];
      
      for (const major of data.majors_career_pathways) {
        let score = 0;
        const matchedCareers: string[] = [];
        
        // Check if any career pathway matches the user's input
        for (const career of major.career_pathways) {
          const careerPathwayLower = career.toLowerCase();
          
          // Exact match or contains
          if (careerPathwayLower === careerLower) {
            score += 100; // Perfect match
            matchedCareers.push(career);
          } else if (careerPathwayLower.includes(careerLower) || careerLower.includes(careerPathwayLower)) {
            score += 50; // Strong match
            matchedCareers.push(career);
          } else {
            // Keyword matching
            const careerWords = careerLower.split(/\s+/);
            const pathwayWords = careerPathwayLower.split(/\s+/);
            
            let wordMatches = 0;
            for (const word of careerWords) {
              if (word.length > 3 && pathwayWords.some(pw => pw.includes(word) || word.includes(pw))) {
                wordMatches++;
              }
            }
            
            if (wordMatches > 0) {
              score += wordMatches * 10;
              matchedCareers.push(career);
            }
          }
        }
        
        // Also check if major title matches
        const majorLower = major.major.toLowerCase();
        const majorWords = careerLower.split(/\s+/);
        for (const word of majorWords) {
          if (word.length > 3 && majorLower.includes(word)) {
            score += 20;
          }
        }
        
        // Only include majors with at least some score
        if (score > 0) {
          scoredMajors.push({ major, score, matchedCareers });
        }
      }
      
      console.log(`📚 Found ${scoredMajors.length} matching majors`);
      
      if (scoredMajors.length === 0) {
        return {
          success: false,
          message: `I couldn't find UH Manoa majors matching "${careerPath}". Could you describe the career differently? For example: "software developer", "nurse", "teacher", or "business analyst".`,
          recommendations: [],
        };
      }
      
      // Sort by score and get top 5
      const topMajors = scoredMajors
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      console.log('✅ Top majors:', topMajors.map(m => m.major.major));
      
      return {
        success: true,
        message: `Based on your interest in ${careerPath}, here are the best matching majors at UH Manoa:`,
        recommendations: topMajors.map((item, index) => ({
          rank: index + 1,
          majorName: item.major.major,
          degreeType: item.major.degree_type,
          campus: 'University of Hawaiʻi at Mānoa',
          credits: typeof item.major.credits === 'number' ? item.major.credits.toString() : item.major.credits,
          relatedCareers: item.matchedCareers.slice(0, 3), // Show top 3 matched careers
        })),
      };
    } catch (error) {
      console.error('❌ Error getting major recommendations:', error);
      return {
        success: false,
        message: 'I encountered an issue finding major recommendations. Let me help you explore programs at UH Manoa.',
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
      };
    }
  },
});
