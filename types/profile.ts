/**
 * User Profile Type Definitions
 * Centralized type definitions for the user profile system
 */

/**
 * User type categorization
 */
export type UserType = 
  | 'high_school_student'
  | 'college_student'
  | 'career_changer'
  | 'professional'
  | 'unknown';

/**
 * Experience entry types
 */
export type ExperienceType = 
  | 'internship'
  | 'part-time'
  | 'full-time'
  | 'volunteer'
  | 'project';

/**
 * Work experience or project entry
 */
export interface Experience {
  title?: string;
  company?: string;
  description?: string;
  duration?: string;
  type?: ExperienceType;
}

/**
 * Job preferences and career preferences
 */
export interface JobPreference {
  workEnvironment?: string[]; // e.g., ['remote', 'office', 'hybrid']
  industryPreferences?: string[];
  salaryExpectation?: string;
  location?: string[];
  companySize?: string; // e.g., 'startup', 'mid-size', 'enterprise'
  workLifeBalance?: string;
}

/**
 * Complete user profile structure
 */
export interface UserProfile {
  // Core fields - most frequently used
  dreamJob?: string;
  major?: string;
  
  // User categorization
  userType?: UserType;
  
  // Career exploration fields
  interests?: string[];
  strengths?: string[];
  weaknesses?: string[];
  experience?: Experience[];
  jobPreference?: JobPreference;
  
  // Legacy fields (for backward compatibility)
  career?: string;
  college?: string;
  degree?: string;
  skills?: unknown;
  roadmap?: unknown;
}

/**
 * Profile creation request
 */
export type CreateProfileRequest = UserProfile;

/**
 * Profile update request (partial)
 */
export type UpdateProfileRequest = Partial<UserProfile>;

/**
 * Profile API response
 */
export interface ProfileResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
}

/**
 * Chat message for profile extraction
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Profile extraction request
 */
export interface ProfileExtractionRequest {
  messages: ChatMessage[];
}

/**
 * Profile extraction response
 */
export interface ProfileExtractionResponse {
  success: boolean;
  profile?: UserProfile;
  extracted?: Partial<UserProfile>;
  error?: string;
}

/**
 * Validation helpers
 */
export const isValidUserType = (type: string): type is UserType => {
  return ['high_school_student', 'college_student', 'career_changer', 'professional', 'unknown'].includes(type);
};

export const isValidExperienceType = (type: string): type is ExperienceType => {
  return ['internship', 'part-time', 'full-time', 'volunteer', 'project'].includes(type);
};

/**
 * Profile field validators
 */
export const ProfileValidators = {
  userType: (value: unknown): value is UserType => {
    return typeof value === 'string' && isValidUserType(value);
  },
  
  stringArray: (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  },
  
  experience: (value: unknown): value is Experience[] => {
    if (!Array.isArray(value)) return false;
    return value.every(item => 
      typeof item === 'object' && 
      item !== null &&
      (item.type === undefined || isValidExperienceType(item.type))
    );
  },
  
  jobPreference: (value: unknown): value is JobPreference => {
    if (typeof value !== 'object' || value === null) return false;
    const pref = value as JobPreference;
    
    if (pref.workEnvironment && !Array.isArray(pref.workEnvironment)) return false;
    if (pref.industryPreferences && !Array.isArray(pref.industryPreferences)) return false;
    if (pref.location && !Array.isArray(pref.location)) return false;
    
    return true;
  },
};

/**
 * Profile data sanitizer - removes undefined fields
 */
export const sanitizeProfile = (profile: Partial<UserProfile>): Partial<UserProfile> => {
  const sanitized: Partial<UserProfile> = {};
  
  for (const [key, value] of Object.entries(profile)) {
    if (value !== undefined) {
      (sanitized as Record<string, unknown>)[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Check if profile has core fields populated
 */
export const hasCoreFields = (profile: UserProfile | null): boolean => {
  return !!(profile?.dreamJob && profile?.major);
};

/**
 * Check if profile is complete (has all recommended fields)
 */
export const isProfileComplete = (profile: UserProfile | null): boolean => {
  if (!profile) return false;
  
  return !!(
    profile.dreamJob &&
    profile.major &&
    profile.userType &&
    profile.interests && profile.interests.length > 0 &&
    profile.strengths && profile.strengths.length > 0
  );
};

/**
 * Get profile completion percentage
 */
export const getProfileCompletionPercentage = (profile: UserProfile | null): number => {
  if (!profile) return 0;
  
  const fields = [
    'dreamJob',
    'major',
    'userType',
    'interests',
    'strengths',
    'weaknesses',
    'experience',
    'jobPreference',
  ];
  
  const filledFields = fields.filter(field => {
    const value = profile[field as keyof UserProfile];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== undefined && value !== null && value !== '';
  });
  
  return Math.round((filledFields.length / fields.length) * 100);
};
