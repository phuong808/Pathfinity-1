import { tool } from 'ai';
import { z } from 'zod';
import { upsertUserProfile, getUserProfile } from '@/app/db/actions';

/**
 * Tool to save user profile data (dream job and major) to the database
 * This should be called after the user has confirmed their career path and major selection
 */
export const saveProfile = tool({
  description: `Save the user's selected career path (dream job) and major to their profile in the database. 
  
  **When to call this tool:**
  
  SCENARIO 1 - Fast-Track (User knows both):
  - User states BOTH career AND major in their message (e.g., "I want to become a doctor with a biology degree")
  - After verifying the major exists with getDegreeProgram
  - Save immediately without going through recommendations
  
  SCENARIO 2 - Knows Career Only:
  - User states career but not major
  - After showing major recommendations with getMajorRecommendations
  - User selects a major
  - Save both career and major
  
  SCENARIO 3 - Knows Major Only:
  - User states major but not career
  - After user clarifies their career goal
  - Save both career and major
  
  SCENARIO 4 - Full Onboarding:
  - User went through interest collection
  - AI provided career recommendations
  - User selected a career
  - AI provided major recommendations
  - User selected a major
  - Save both career and major
  
  **Important**: 
  - This tool saves permanent data - only call when user has confirmed their choices
  - Both dreamJob and major are optional parameters - you can save just one if needed
  - Always confirm the save with the user after calling this tool`,
  
  inputSchema: z.object({
    userId: z.string().describe('The user ID from the session'),
    dreamJob: z.string().optional().describe('The career path/dream job selected or stated by the user (e.g., "Software Engineer", "Doctor", "Teacher"). Can be their own words or from recommendations.'),
    major: z.string().optional().describe('The major/degree program selected or stated by the user (e.g., "Computer Science - BS", "Biology - BS"). Should match exact program name from getDegreeProgram when possible.'),
  }),
  
  execute: async ({ userId, dreamJob, major }) => {
    try {
      console.log('💾 Saving profile data:', { userId, dreamJob, major });
      
      // Get existing profile to preserve other data
      const existingProfile = await getUserProfile(userId);
      
      // Prepare update data - only update fields that are provided
      const updateData: {
        dreamJob?: string;
        major?: string;
      } = {};
      
      if (dreamJob) updateData.dreamJob = dreamJob;
      if (major) updateData.major = major;
      
      // Save to database
      await upsertUserProfile(userId, updateData);
      
      console.log('✅ Profile saved successfully');
      
      // Build confirmation message based on what was saved
      const confirmationParts: string[] = [];
      if (dreamJob) confirmationParts.push(`career path: ${dreamJob}`);
      if (major) confirmationParts.push(`major: ${major}`);
      
      const confirmationMessage = confirmationParts.length > 0 
        ? `Great! I've saved your ${confirmationParts.join(' and ')} to your profile.`
        : 'Profile updated successfully.';
      
      return {
        success: true,
        message: confirmationMessage,
        saved: {
          dreamJob: dreamJob || existingProfile?.dreamJob,
          major: major || existingProfile?.major,
        }
      };
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      return {
        success: false,
        message: 'I encountered an issue saving your profile. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },
});
