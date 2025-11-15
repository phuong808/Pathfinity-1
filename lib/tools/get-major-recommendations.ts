import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db';
import { majorCareerMapping, careerPathway, campus } from '@/app/db/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * Tool to get major recommendations based on a selected career path
 * Queries the major-career mapping to find relevant majors
 */
export const getMajorRecommendations = tool({
  description: `Get top 5 major recommendations based on the user's selected career path. 
  This tool looks up which majors lead to the selected career and returns relevant options.
  
  Important: This should be called AFTER the user has selected a career path from the recommendations.
  The majors returned will be used for the user to select their desired major.`,
  
  inputSchema: z.object({
    careerPath: z.string().describe('The selected career path/dream job from the user'),
    preferredCampus: z.string().optional().describe('Optional preferred campus (e.g., "UH Manoa", "UH Hilo")'),
  }),
  
  execute: async ({ careerPath, preferredCampus }) => {
    try {
      console.log('🎓 Getting major recommendations for career:', careerPath, 'campus:', preferredCampus);
      
      // First, find the career pathway ID(s) that match the career path
      const careerPathways = await db
        .select({ id: careerPathway.id })
        .from(careerPathway)
        .where(sql`LOWER(${careerPathway.title}) LIKE ${`%${careerPath.toLowerCase()}%`}`)
        .limit(10);
      
      if (careerPathways.length === 0) {
        return {
          success: false,
          message: `I couldn't find specific majors linked to "${careerPath}". Let me suggest some general programs that might interest you.`,
          recommendations: [],
        };
      }
      
      const careerPathwayIds = careerPathways.map(cp => cp.id);
      
      // Find majors that include these career pathways
      const majors = await db
        .select({
          majorName: majorCareerMapping.majorName,
          degreeType: majorCareerMapping.degreeType,
          credits: majorCareerMapping.credits,
          campusId: majorCareerMapping.campusId,
          campusName: campus.name,
          careerPathwayIds: majorCareerMapping.careerPathwayIds,
        })
        .from(majorCareerMapping)
        .leftJoin(campus, eq(majorCareerMapping.campusId, campus.id))
        .where(
          sql`EXISTS (
            SELECT 1 FROM jsonb_array_elements(${majorCareerMapping.careerPathwayIds}) AS elem
            WHERE elem::text::int IN (${sql.join(careerPathwayIds.map(id => sql`${id}`), sql`, `)})
          )`
        )
        .limit(20);
      
      if (majors.length === 0) {
        return {
          success: false,
          message: `I found the career path but couldn't locate specific majors for it. Would you like me to suggest some related programs?`,
          recommendations: [],
        };
      }
      
      // Filter by preferred campus if provided
      let filteredMajors = majors;
      if (preferredCampus) {
        const campusFilter = majors.filter(m => 
          m.campusName?.toLowerCase().includes(preferredCampus.toLowerCase())
        );
        if (campusFilter.length > 0) {
          filteredMajors = campusFilter;
        }
      }
      
      // Score majors based on relevance
      const scoredMajors = filteredMajors.map((major) => {
        let score = 0;
        
        // Check how many of the career pathway IDs match
        const majorCareerIds = major.careerPathwayIds as number[] || [];
        const matchCount = careerPathwayIds.filter(id => majorCareerIds.includes(id)).length;
        score += matchCount * 10;
        
        // Prefer UH Manoa if no campus preference
        if (!preferredCampus && major.campusName?.includes('Mānoa')) {
          score += 2;
        }
        
        // Add slight randomness for variety
        score += Math.random() * 0.5;
        
        return {
          ...major,
          score,
        };
      });
      
      // Sort by score and get top 5
      const topMajors = scoredMajors
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      console.log('✅ Found major recommendations:', topMajors.length);
      
      return {
        success: true,
        message: `Based on your interest in ${careerPath}, here are majors that can lead you there:`,
        recommendations: topMajors.map((major, index) => ({
          rank: index + 1,
          majorName: major.majorName,
          degreeType: major.degreeType,
          campus: major.campusName,
          credits: major.credits,
        })),
      };
    } catch (error) {
      console.error('❌ Error getting major recommendations:', error);
      return {
        success: false,
        message: 'I encountered an issue finding major recommendations. Let me help you explore some programs.',
        error: error instanceof Error ? error.message : 'Unknown error',
        recommendations: [],
      };
    }
  },
});
