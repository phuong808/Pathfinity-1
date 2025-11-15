import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db';
import { careerPathway } from '@/app/db/schema';
import { sql, desc } from 'drizzle-orm';

/**
 * Tool to get career path recommendations based on user profile information
 * Uses the major-careers relationship data to suggest relevant career paths
 */
export const getCareerRecommendations = tool({
  description: `Get top 5 career path recommendations based on user's interests, strengths, weaknesses, experience, and job preferences. 
  This tool analyzes the user's profile information and returns the most relevant career paths.
  
  Important: This should be called after gathering:
  - User type
  - Interests
  - Strengths
  - Weaknesses
  - Experience
  - Job preferences
  
  The career paths returned will be used for the user to select their dream job.`,
  
  inputSchema: z.object({
    interests: z.array(z.string()).describe('Array of user interests (e.g., technology, healthcare, business)'),
    strengths: z.array(z.string()).describe('Array of user strengths (e.g., analytical thinking, communication, creativity)'),
    weaknesses: z.array(z.string()).optional().describe('Array of areas to improve (optional for recommendations)'),
    experience: z.string().optional().describe('Brief summary of relevant experience'),
    jobPreference: z.object({
      workEnvironment: z.array(z.string()).optional(),
      industryPreferences: z.array(z.string()).optional(),
      location: z.array(z.string()).optional(),
      companySize: z.string().optional(),
    }).optional().describe('Job preference information'),
  }),
  
  execute: async ({ interests, strengths, weaknesses, experience, jobPreference }) => {
    try {
      console.log('🎯 Getting career recommendations for:', { 
        interests, 
        strengths, 
        weaknesses, 
        experience,
        jobPreference 
      });
      
      // Get unique career paths from the database
      const careers = await db
        .selectDistinct({
          careerPath: careerPathway.title,
          careerCategory: careerPathway.category,
        })
        .from(careerPathway)
        .where(sql`${careerPathway.title} IS NOT NULL`)
        .orderBy(desc(careerPathway.title))
        .limit(100); // Get a good sample
      
      // Simple keyword matching for now
      // In a production system, you'd use embeddings and semantic search
      const scoredCareers = careers.map((career) => {
        let score = 0;
        const careerLower = career.careerPath?.toLowerCase() || '';
        const categoryLower = career.careerCategory?.toLowerCase() || '';
        
        // Match interests
        interests.forEach((interest: string) => {
          const interestLower = interest.toLowerCase();
          if (careerLower.includes(interestLower) || categoryLower.includes(interestLower)) {
            score += 3;
          }
        });
        
        // Match strengths
        strengths.forEach((strength: string) => {
          const strengthLower = strength.toLowerCase();
          if (careerLower.includes(strengthLower) || categoryLower.includes(strengthLower)) {
            score += 2;
          }
        });
        
        // Match job preferences (industry)
        if (jobPreference?.industryPreferences) {
          jobPreference.industryPreferences.forEach((industry: string) => {
            const industryLower = industry.toLowerCase();
            if (careerLower.includes(industryLower) || categoryLower.includes(industryLower)) {
              score += 2;
            }
          });
        }
        
        // Add some randomness for variety
        score += Math.random() * 0.5;
        
        return {
          ...career,
          score,
        };
      });
      
      // Sort by score and get top 5
      const topCareers = scoredCareers
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .filter(c => c.careerPath);
      
      if (topCareers.length === 0) {
        return {
          success: false,
          message: 'I couldn\'t find specific career recommendations based on your profile. Let me ask you some more questions.',
          recommendations: [],
        };
      }
      
      console.log('✅ Found career recommendations:', topCareers.length);
      
      return {
        success: true,
        message: 'Based on your interests, strengths, and preferences, here are career paths that might be a great fit for you:',
        recommendations: topCareers.map((career, index) => ({
          rank: index + 1,
          careerPath: career.careerPath,
          category: career.careerCategory,
        })),
      };
    } catch (error) {
      console.error('❌ Error getting career recommendations:', error);
      return {
        success: false,
        message: 'I encountered an issue finding career recommendations. Let me help you explore some options.',
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
      };
    }
  },
});
