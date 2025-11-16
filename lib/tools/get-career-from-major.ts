import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

/**
 * Tool to get career recommendations based on a selected major
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

export const getCareerRecommendationsFromMajor = tool({
  description: `Get career path recommendations based on a selected major at UH Manoa. 
  This tool helps users who already know what major they want to study by showing them what careers they can pursue with that degree.
  
  Works well with various major inputs like:
  - Full major names: "Computer Science", "Biology", "Accounting"
  - Partial names: "Computer", "Business", "Engineering"
  - With degree type: "Computer Science BS", "Accounting BA"
  
  The tool will find relevant UH Manoa majors and show their career pathways.`,
  
  inputSchema: z.object({
    majorName: z.string().describe('The major name from the user (e.g., "Computer Science", "Biology", "Business", "Nursing")'),
  }),
  
  execute: async ({ majorName }) => {
    try {
      console.log('💼 Getting career recommendations for major:', majorName);
      
      // Read the UH Manoa majors-careers JSON file
      const jsonPath = path.join(process.cwd(), 'public', 'uh_manoa_majors_careers_match.json');
      const jsonData = fs.readFileSync(jsonPath, 'utf-8');
      const data: MajorsCareerFile = JSON.parse(jsonData);
      
      const majorLower = majorName.toLowerCase().trim();
      console.log('🔍 Searching for major:', majorLower);
      
      // Find matching majors
      interface MatchedMajor {
        major: MajorCareerData;
        score: number;
      }
      
      const matchedMajors: MatchedMajor[] = [];
      
      for (const major of data.majors_career_pathways) {
        const majorTitleLower = major.major.toLowerCase();
        let score = 0;
        
        // Exact match
        if (majorTitleLower === majorLower) {
          score = 100;
        }
        // Major title contains input or input contains major title
        else if (majorTitleLower.includes(majorLower) || majorLower.includes(majorTitleLower.split(' -')[0].toLowerCase())) {
          score = 50;
        }
        // Keyword matching
        else {
          const majorWords = majorLower.split(/\s+/);
          const titleWords = majorTitleLower.split(/\s+/);
          
          let wordMatches = 0;
          for (const word of majorWords) {
            if (word.length > 2 && titleWords.some(tw => tw.includes(word) || word.includes(tw))) {
              wordMatches++;
            }
          }
          
          if (wordMatches > 0) {
            score = wordMatches * 20;
          }
        }
        
        if (score > 0) {
          matchedMajors.push({ major, score });
        }
      }
      
      console.log(`📚 Found ${matchedMajors.length} matching majors`);
      
      if (matchedMajors.length === 0) {
        return {
          success: false,
          message: `I couldn't find "${majorName}" at UH Manoa. Could you try a different major name? For example: "Computer Science", "Biology", "Business Administration", or "Nursing".`,
          recommendations: [],
        };
      }
      
      // Sort by score and get top match
      const topMajors = matchedMajors
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Get top 3 matching majors (in case of similar names)
      
      // Collect all unique career pathways from matched majors
      const allCareers = new Set<string>();
      topMajors.forEach(m => {
        m.major.career_pathways.forEach(career => allCareers.add(career));
      });
      
      const careers = Array.from(allCareers).slice(0, 8); // Show up to 8 careers
      
      console.log('✅ Found careers:', careers);
      
      return {
        success: true,
        message: `Here are career paths you can pursue with a ${topMajors[0].major.major.split(' -')[0]} degree from UH Manoa:`,
        majorMatch: topMajors[0].major.major,
        degreeType: topMajors[0].major.degree_type,
        credits: typeof topMajors[0].major.credits === 'number' ? topMajors[0].major.credits.toString() : topMajors[0].major.credits,
        careerPathways: careers,
      };
    } catch (error) {
      console.error('❌ Error getting career recommendations:', error);
      return {
        success: false,
        message: 'I encountered an issue finding career paths for that major. Could you tell me more about what you want to study?',
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
      };
    }
  },
});
