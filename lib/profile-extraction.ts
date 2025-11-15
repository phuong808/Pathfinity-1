/**
 * Profile extraction utilities for analyzing chat conversations
 * and extracting user profile information
 */

import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { ProfileData } from '@/app/db/actions';

/**
 * Schema for profile extraction from chat messages
 */
const ProfileExtractionSchema = z.object({
  userType: z.enum(['high_school_student', 'college_student', 'career_changer', 'professional', 'unknown']).optional(),
  dreamJob: z.string().optional().describe('The user\'s primary career goal or dream job'),
  major: z.string().optional().describe('The user\'s intended or current major'),
  interests: z.array(z.string()).optional().describe('Areas of interest mentioned by the user'),
  strengths: z.array(z.string()).optional().describe('User\'s strengths or skills they mentioned'),
  weaknesses: z.array(z.string()).optional().describe('Areas the user wants to improve'),
  experience: z.array(z.object({
    title: z.string().optional(),
    company: z.string().optional(),
    description: z.string().optional(),
    duration: z.string().optional(),
    type: z.enum(['internship', 'part-time', 'full-time', 'volunteer', 'project']).optional(),
  })).optional().describe('Work experience, internships, or projects mentioned'),
  jobPreference: z.object({
    workEnvironment: z.array(z.string()).optional().describe('Preferred work environment (remote, office, hybrid)'),
    industryPreferences: z.array(z.string()).optional().describe('Preferred industries'),
    salaryExpectation: z.string().optional().describe('Salary expectations if mentioned'),
    location: z.array(z.string()).optional().describe('Preferred work locations'),
    companySize: z.string().optional().describe('Preferred company size (startup, mid-size, enterprise)'),
    workLifeBalance: z.string().optional().describe('Work-life balance preferences'),
  }).optional(),
});

export type ExtractedProfile = z.infer<typeof ProfileExtractionSchema>;

/**
 * Extract profile information from a conversation
 * @param messages - Array of message content strings from the conversation
 * @returns Extracted profile data
 */
export async function extractProfileFromConversation(
  messages: { role: string; content: string }[]
): Promise<ExtractedProfile> {
  try {
    // Combine messages into a single context
    const conversationContext = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: ProfileExtractionSchema,
      prompt: `Analyze this conversation and extract any profile information about the user.
Focus on career goals, educational plans, interests, strengths, weaknesses, experience, and job preferences.
Only include information that was explicitly mentioned or can be clearly inferred.

Conversation:
${conversationContext}

Extract all relevant profile information. If something wasn't mentioned, don't include it.`,
    });

    return object;
  } catch (error) {
    console.error('Error extracting profile from conversation:', error);
    return {};
  }
}

/**
 * Merge extracted profile data with existing profile
 * Prioritizes existing data but adds new information
 */
export function mergeProfileData(
  existing: ProfileData | null,
  extracted: ExtractedProfile
): ProfileData {
  if (!existing) {
    // If no existing profile, convert extracted to ProfileData
    return {
      userType: extracted.userType !== 'unknown' ? extracted.userType : undefined,
      dreamJob: extracted.dreamJob,
      major: extracted.major,
      interests: extracted.interests,
      strengths: extracted.strengths,
      weaknesses: extracted.weaknesses,
      experience: extracted.experience,
      jobPreference: extracted.jobPreference,
    };
  }

  // Merge arrays without duplicates
  const mergeArrays = (existing?: string[], extracted?: string[]): string[] | undefined => {
    if (!existing && !extracted) return undefined;
    if (!existing) return extracted;
    if (!extracted) return existing;
    
    const combined = [...existing, ...extracted];
    return Array.from(new Set(combined));
  };

  // Merge experience arrays
  const mergeExperience = (
    existing?: ProfileData['experience'],
    extracted?: ExtractedProfile['experience']
  ): ProfileData['experience'] => {
    if (!existing && !extracted) return undefined;
    if (!existing) return extracted;
    if (!extracted) return existing;
    return [...existing, ...extracted];
  };

  return {
    // Use existing core fields unless not set
    dreamJob: existing.dreamJob || extracted.dreamJob,
    major: existing.major || extracted.major,
    userType: existing.userType || (extracted.userType !== 'unknown' ? extracted.userType : undefined),
    
    // Merge arrays
    interests: mergeArrays(existing.interests, extracted.interests),
    strengths: mergeArrays(existing.strengths, extracted.strengths),
    weaknesses: mergeArrays(existing.weaknesses, extracted.weaknesses),
    experience: mergeExperience(existing.experience, extracted.experience),
    
    // Merge job preferences
    jobPreference: {
      workEnvironment: mergeArrays(
        existing.jobPreference?.workEnvironment,
        extracted.jobPreference?.workEnvironment
      ),
      industryPreferences: mergeArrays(
        existing.jobPreference?.industryPreferences,
        extracted.jobPreference?.industryPreferences
      ),
      salaryExpectation: existing.jobPreference?.salaryExpectation || extracted.jobPreference?.salaryExpectation,
      location: mergeArrays(
        existing.jobPreference?.location,
        extracted.jobPreference?.location
      ),
      companySize: existing.jobPreference?.companySize || extracted.jobPreference?.companySize,
      workLifeBalance: existing.jobPreference?.workLifeBalance || extracted.jobPreference?.workLifeBalance,
    },
    
    // Keep legacy fields
    career: existing.career,
    college: existing.college,
    degree: existing.degree,
    skills: existing.skills,
    roadmap: existing.roadmap,
  };
}

/**
 * Extract just the dream job and major for quick chat updates
 */
export async function extractCoreProfileInfo(
  messages: { role: string; content: string }[]
): Promise<{ dreamJob?: string; major?: string }> {
  try {
    const conversationContext = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n');

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: z.object({
        dreamJob: z.string().optional(),
        major: z.string().optional(),
      }),
      prompt: `Analyze this conversation and extract ONLY:
1. The user's dream job or primary career goal
2. The user's intended or current major

Be concise and extract only what was clearly stated.

Conversation:
${conversationContext}`,
    });

    return object;
  } catch (error) {
    console.error('Error extracting core profile info:', error);
    return {};
  }
}
