import { tool } from 'ai';
import { z } from 'zod';
import { upsertUserProfile, getUserProfile } from '@/app/db/actions';

/**
 * Tool to save user profile data (dream job and major) to the database
 * This should be called after the user has confirmed their career path and major selection
 */
export const saveProfile = tool({
  description: `Save the user's selected career path (dream job) and major to their profile in the database. 
  This should ONLY be called after:
  1. The AI has recommended career paths based on the user's interests, strengths, weaknesses, experience, and job preferences
  2. The user has selected or confirmed their desired career path
  3. The AI has recommended majors based on the selected career path
  4. The user has selected or confirmed their desired major
  
  Important: This tool saves permanent data - only call it when the user has explicitly confirmed their choices.`,
  
  inputSchema: z.object({
    userId: z.string().describe('The user ID from the session'),
    dreamJob: z.string().optional().describe('The career path/dream job selected by the user. Should match one of the recommended career paths.'),
    major: z.string().optional().describe('The major selected by the user. Should match one of the recommended majors.'),
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
