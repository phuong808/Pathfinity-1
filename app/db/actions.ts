'use server';

import { db } from './index';
import { chat, message, profile } from './schema';
import { eq, desc } from 'drizzle-orm';
import { generateId, UIMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * Generate a chat title using AI based on the first user message
 * @param firstMessage - The first user message text
 * @returns A concise title (max 60 chars)
 */
async function generateChatTitle(firstMessage: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openai('gpt-4.1-mini'),
      prompt: `Generate a very short, concise title (max 4 words) for a chat conversation that starts with: "${firstMessage.slice(0, 200)}"
      
      Rules:
        - Maximum 4 words
        - No quotes or punctuation at the end
        - Descriptive, clear, and super concise
        - Just the title, nothing else`,
    });
    
    return text.trim().slice(0, 50);
  } catch (error) {
    console.error('Failed to generate title:', error);
    // Fallback to first 50 chars of message
    return firstMessage.slice(0, 50);
  }
}

/**
 * Create a new chat session
 * @param userId - The user ID to associate with the chat
 * @returns The new chat ID
 */
export async function createChat(userId: string): Promise<string> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('createChat requires a valid userId');
  }

  const id = generateId();

  await db.insert(chat).values({
    id,
    userId: userId.trim(),
    title: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

/**
 * Load all messages for a specific chat
 * @param chatId - The chat ID to load messages for
 * @returns Array of UIMessages
 */
export async function loadChat(chatId: string): Promise<UIMessage[]> {
  const messages = await db
    .select()
    .from(message)
    .where(eq(message.chatId, chatId))
    .orderBy(message.createdAt);
  
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    parts: msg.content as UIMessage['parts'],
    createdAt: msg.createdAt,
  }));
}

/**
 * Save messages for a chat
 * @param chatId - The chat ID
 * @param messages - Array of UIMessages to save
 */
export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string;
  messages: UIMessage[];
}): Promise<void> {
  // Delete existing messages for this chat
  await db.delete(message).where(eq(message.chatId, chatId));
  
  // Insert all messages
  if (messages.length > 0) {
    await db.insert(message).values(
      messages.map((msg) => ({
        id: msg.id,
        chatId,
        role: msg.role,
        content: msg.parts,
        createdAt: new Date(),
      }))
    );
    
    // Check if chat already has a title
    const existingChat = await db
      .select({ title: chat.title })
      .from(chat)
      .where(eq(chat.id, chatId))
      .limit(1);
    
    // Only generate title if it doesn't exist yet
    if (existingChat.length > 0 && !existingChat[0].title) {
      const firstUserMessage = messages.find(m => m.role === 'user');
      if (firstUserMessage) {
        const textPart = firstUserMessage.parts.find(p => p.type === 'text');
        if (textPart && 'text' in textPart) {
          // Generate AI-powered title
          const title = await generateChatTitle(textPart.text);
          await db
            .update(chat)
            .set({ 
              title,
              updatedAt: new Date(),
            })
            .where(eq(chat.id, chatId));
        }
      }
    } else {
      // Just update the updatedAt timestamp
      await db
        .update(chat)
        .set({ updatedAt: new Date() })
        .where(eq(chat.id, chatId));
    }
  }
}

/**
 * Get all chats for a user
 * @param userId - The user ID (required)
 * @returns Array of chat objects with id, title, and timestamps
 */
export async function getChats(userId: string): Promise<{
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}[]> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('getChats requires a valid userId');
  }

  const chats = await db
    .select({
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    })
    .from(chat)
    .where(eq(chat.userId, userId.trim()))
    .orderBy(desc(chat.updatedAt));
  
  return chats;
}

/**
 * Update a chat title
 * @param chatId - The chat ID to update
 * @param title - The new title
 */
export async function updateChatTitle(chatId: string, title: string): Promise<void> {
  await db
    .update(chat)
    .set({ 
      title: title.trim(),
      updatedAt: new Date(),
    })
    .where(eq(chat.id, chatId));
}

/**
 * Delete a chat and all its messages
 * @param chatId - The chat ID to delete
 */
export async function deleteChat(chatId: string): Promise<void> {
  await db.delete(chat).where(eq(chat.id, chatId));
}

/**
 * Delete a specific message and all subsequent messages
 * @param messageId - The message ID to delete
 * @param chatId - The chat ID
 */
export async function deleteMessage(messageId: string, chatId: string): Promise<void> {
  // Get the message to find its timestamp
  const msgToDelete = await db
    .select()
    .from(message)
    .where(eq(message.id, messageId))
    .limit(1);
  
  if (msgToDelete.length === 0) return;
  
  // Delete this message and all later messages
  await db
    .delete(message)
    .where(eq(message.chatId, chatId));
}

/* ========== PROFILE MANAGEMENT ========== */

/**
 * Profile data interface for comprehensive user information
 */
export interface ProfileData {
  // Core fields for career roadmap and academic counselor
  dreamJob?: string;
  major?: string;
  
  // User categorization
  userType?: string; // 'high_school_student' | 'college_student' | 'career_changer' | 'professional'
  
  // Career exploration fields
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  experience?: Array<{
    title?: string;
    company?: string;
    description?: string;
    duration?: string;
    type?: string; // 'internship' | 'part-time' | 'full-time' | 'volunteer' | 'project'
  }>;
  jobPreference?: {
    workEnvironment?: string[];
    industryPreferences?: string[];
    salaryExpectation?: string;
    location?: string[];
    companySize?: string;
    workLifeBalance?: string;
  };
  
  // Legacy fields
  career?: string;
  college?: string;
  degree?: string;
  skills?: unknown;
  roadmap?: unknown;
}

/**
 * Get user profile by user ID
 * @param userId - The user ID
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<ProfileData | null> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('getUserProfile requires a valid userId');
  }

  const [userProfile] = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, userId.trim()))
    .limit(1);
  
  if (!userProfile) return null;
  
  return {
    dreamJob: userProfile.dreamJob ?? undefined,
    major: userProfile.major ?? undefined,
    userType: userProfile.userType ?? undefined,
    interests: userProfile.interests as string[] ?? undefined,
    strengths: userProfile.strengths as string[] ?? undefined,
    weaknesses: userProfile.weaknesses as string[] ?? undefined,
    experience: userProfile.experience as ProfileData['experience'] ?? undefined,
    jobPreference: userProfile.jobPreference as ProfileData['jobPreference'] ?? undefined,
    career: userProfile.career ?? undefined,
    college: userProfile.college ?? undefined,
    degree: userProfile.degree ?? undefined,
    skills: userProfile.skills ?? undefined,
    roadmap: userProfile.roadmap ?? undefined,
  };
}

/**
 * Create a new user profile
 * @param userId - The user ID
 * @param profileData - The profile data to create
 * @returns The created profile
 */
export async function createUserProfile(
  userId: string,
  profileData: ProfileData
): Promise<ProfileData> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('createUserProfile requires a valid userId');
  }

  const [newProfile] = await db
    .insert(profile)
    .values({
      userId: userId.trim(),
      dreamJob: profileData.dreamJob ?? null,
      major: profileData.major ?? null,
      userType: profileData.userType ?? null,
      interests: profileData.interests ?? null,
      strengths: profileData.strengths ?? null,
      weaknesses: profileData.weaknesses ?? null,
      experience: profileData.experience ?? null,
      jobPreference: profileData.jobPreference ?? null,
      career: profileData.career ?? null,
      college: profileData.college ?? null,
      degree: profileData.degree ?? null,
      skills: profileData.skills ?? null,
      roadmap: profileData.roadmap ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return {
    dreamJob: newProfile.dreamJob ?? undefined,
    major: newProfile.major ?? undefined,
    userType: newProfile.userType ?? undefined,
    interests: newProfile.interests as string[] ?? undefined,
    strengths: newProfile.strengths as string[] ?? undefined,
    weaknesses: newProfile.weaknesses as string[] ?? undefined,
    experience: newProfile.experience as ProfileData['experience'] ?? undefined,
    jobPreference: newProfile.jobPreference as ProfileData['jobPreference'] ?? undefined,
    career: newProfile.career ?? undefined,
    college: newProfile.college ?? undefined,
    degree: newProfile.degree ?? undefined,
    skills: newProfile.skills ?? undefined,
    roadmap: newProfile.roadmap ?? undefined,
  };
}

/**
 * Update an existing user profile
 * @param userId - The user ID
 * @param profileData - The profile data to update (partial update)
 * @returns The updated profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<ProfileData>
): Promise<ProfileData> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('updateUserProfile requires a valid userId');
  }

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  
  if (profileData.dreamJob !== undefined) updateData.dreamJob = profileData.dreamJob;
  if (profileData.major !== undefined) updateData.major = profileData.major;
  if (profileData.userType !== undefined) updateData.userType = profileData.userType;
  if (profileData.interests !== undefined) updateData.interests = profileData.interests;
  if (profileData.strengths !== undefined) updateData.strengths = profileData.strengths;
  if (profileData.weaknesses !== undefined) updateData.weaknesses = profileData.weaknesses;
  if (profileData.experience !== undefined) updateData.experience = profileData.experience;
  if (profileData.jobPreference !== undefined) updateData.jobPreference = profileData.jobPreference;
  if (profileData.career !== undefined) updateData.career = profileData.career;
  if (profileData.college !== undefined) updateData.college = profileData.college;
  if (profileData.degree !== undefined) updateData.degree = profileData.degree;
  if (profileData.skills !== undefined) updateData.skills = profileData.skills;
  if (profileData.roadmap !== undefined) updateData.roadmap = profileData.roadmap;

  const [updatedProfile] = await db
    .update(profile)
    .set(updateData)
    .where(eq(profile.userId, userId.trim()))
    .returning();
  
  if (!updatedProfile) {
    throw new Error('Profile not found');
  }
  
  return {
    dreamJob: updatedProfile.dreamJob ?? undefined,
    major: updatedProfile.major ?? undefined,
    userType: updatedProfile.userType ?? undefined,
    interests: updatedProfile.interests as string[] ?? undefined,
    strengths: updatedProfile.strengths as string[] ?? undefined,
    weaknesses: updatedProfile.weaknesses as string[] ?? undefined,
    experience: updatedProfile.experience as ProfileData['experience'] ?? undefined,
    jobPreference: updatedProfile.jobPreference as ProfileData['jobPreference'] ?? undefined,
    career: updatedProfile.career ?? undefined,
    college: updatedProfile.college ?? undefined,
    degree: updatedProfile.degree ?? undefined,
    skills: updatedProfile.skills ?? undefined,
    roadmap: updatedProfile.roadmap ?? undefined,
  };
}

/**
 * Create or update user profile (upsert)
 * @param userId - The user ID
 * @param profileData - The profile data to create or update
 * @returns The created or updated profile
 */
export async function upsertUserProfile(
  userId: string,
  profileData: ProfileData
): Promise<ProfileData> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('upsertUserProfile requires a valid userId');
  }

  const existingProfile = await getUserProfile(userId);
  
  if (existingProfile) {
    return await updateUserProfile(userId, profileData);
  } else {
    return await createUserProfile(userId, profileData);
  }
}

/**
 * Update chat with extracted profile information
 * @param chatId - The chat ID
 * @param dreamJob - Extracted dream job
 * @param major - Extracted major
 */
export async function updateChatProfileData(
  chatId: string,
  dreamJob?: string,
  major?: string
): Promise<void> {
  await db
    .update(chat)
    .set({
      extractedDreamJob: dreamJob ?? null,
      extractedMajor: major ?? null,
      profileDataExtracted: true,
      updatedAt: new Date(),
    })
    .where(eq(chat.id, chatId));
}
