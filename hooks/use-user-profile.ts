'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile, ProfileResponse, ProfileExtractionRequest } from '@/types/profile';

/**
 * Custom hook for managing user profiles
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch the current user's profile
   */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profiles');
      const data: ProfileResponse = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
      } else if (response.status === 404) {
        // Profile doesn't exist yet
        setProfile(null);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new profile
   */
  const createProfile = useCallback(async (profileData: UserProfile): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data: ProfileResponse = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return true;
      } else {
        setError(data.error || 'Failed to create profile');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update profile (partial update)
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data: ProfileResponse = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return true;
      } else {
        setError(data.error || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upsert profile (create or update)
   */
  const upsertProfile = useCallback(async (profileData: UserProfile): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data: ProfileResponse = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return true;
      } else {
        setError(data.error || 'Failed to save profile');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Extract profile from chat messages and update
   */
  const extractFromChat = useCallback(async (
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{ success: boolean; extracted?: Partial<UserProfile> }> => {
    try {
      setLoading(true);
      setError(null);

      const request: ProfileExtractionRequest = { messages };
      const response = await fetch('/api/profiles/extract-from-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return { success: true, extracted: data.extracted };
      } else {
        setError(data.error || 'Failed to extract profile from chat');
        return { success: false };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract profile from chat');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update specific core fields
   */
  const updateCoreFields = useCallback(async (
    dreamJob?: string,
    major?: string
  ): Promise<boolean> => {
    return updateProfile({ dreamJob, major });
  }, [updateProfile]);

  // Load profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    createProfile,
    updateProfile,
    upsertProfile,
    extractFromChat,
    updateCoreFields,
  };
}

/**
 * Hook for profile statistics and helper functions
 */
export function useProfileHelpers(profile: UserProfile | null) {
  const hasCoreFields = profile?.dreamJob && profile?.major;
  
  const isComplete = !!(
    profile?.dreamJob &&
    profile?.major &&
    profile?.userType &&
    profile?.interests && profile.interests.length > 0 &&
    profile?.strengths && profile.strengths.length > 0
  );

  const completionPercentage = (() => {
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
  })();

  return {
    hasCoreFields,
    isComplete,
    completionPercentage,
  };
}
