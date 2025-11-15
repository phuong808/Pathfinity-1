/**
 * Example usage of the User Profile System
 * This file demonstrates how to use the profile APIs, hooks, and utilities
 */

'use client';

import { useUserProfile, useProfileHelpers } from '@/hooks/use-user-profile';
import { UserProfile } from '@/types/profile';

/**
 * Example 1: Display User Profile
 */
export function ProfileDisplay() {
  const { profile, loading, error } = useUserProfile();
  const { completionPercentage, hasCoreFields, isComplete } = useProfileHelpers(profile);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found</div>;

  return (
    <div className="profile-display">
      <h2>Your Profile</h2>
      <div className="completion-badge">
        {completionPercentage}% Complete
        {isComplete && ' ✓'}
      </div>

      {/* Core Fields */}
      {hasCoreFields && (
        <div className="core-fields">
          <h3>Career Goals</h3>
          <p><strong>Dream Job:</strong> {profile.dreamJob}</p>
          <p><strong>Major:</strong> {profile.major}</p>
        </div>
      )}

      {/* User Type */}
      {profile.userType && (
        <div>
          <strong>User Type:</strong> {profile.userType}
        </div>
      )}

      {/* Interests */}
      {profile.interests && profile.interests.length > 0 && (
        <div>
          <h3>Interests</h3>
          <ul>
            {profile.interests.map((interest, i) => (
              <li key={i}>{interest}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths */}
      {profile.strengths && profile.strengths.length > 0 && (
        <div>
          <h3>Strengths</h3>
          <ul>
            {profile.strengths.map((strength, i) => (
              <li key={i}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Experience */}
      {profile.experience && profile.experience.length > 0 && (
        <div>
          <h3>Experience</h3>
          {profile.experience.map((exp, i) => (
            <div key={i} className="experience-item">
              <h4>{exp.title}</h4>
              <p>{exp.company} • {exp.type} • {exp.duration}</p>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Create/Update Profile Form
 */
export function ProfileForm() {
  const { profile, updateProfile, upsertProfile, loading } = useUserProfile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const profileData: UserProfile = {
      dreamJob: formData.get('dreamJob') as string,
      major: formData.get('major') as string,
      userType: formData.get('userType') as UserProfile['userType'],
      interests: (formData.get('interests') as string).split(',').map(s => s.trim()),
      strengths: (formData.get('strengths') as string).split(',').map(s => s.trim()),
    };

    const success = await upsertProfile(profileData);
    if (success) {
      alert('Profile saved successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <h2>Update Your Profile</h2>

      <div>
        <label htmlFor="dreamJob">Dream Job</label>
        <input
          type="text"
          id="dreamJob"
          name="dreamJob"
          defaultValue={profile?.dreamJob}
          placeholder="e.g., Software Engineer"
        />
      </div>

      <div>
        <label htmlFor="major">Major</label>
        <input
          type="text"
          id="major"
          name="major"
          defaultValue={profile?.major}
          placeholder="e.g., Computer Science"
        />
      </div>

      <div>
        <label htmlFor="userType">User Type</label>
        <select id="userType" name="userType" defaultValue={profile?.userType}>
          <option value="">Select...</option>
          <option value="high_school_student">High School Student</option>
          <option value="college_student">College Student</option>
          <option value="career_changer">Career Changer</option>
          <option value="professional">Professional</option>
        </select>
      </div>

      <div>
        <label htmlFor="interests">Interests (comma-separated)</label>
        <input
          type="text"
          id="interests"
          name="interests"
          defaultValue={profile?.interests?.join(', ')}
          placeholder="e.g., AI, Web Development, Design"
        />
      </div>

      <div>
        <label htmlFor="strengths">Strengths (comma-separated)</label>
        <input
          type="text"
          id="strengths"
          name="strengths"
          defaultValue={profile?.strengths?.join(', ')}
          placeholder="e.g., Problem Solving, Communication, Leadership"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}

/**
 * Example 3: Extract Profile from Chat
 */
export function ChatProfileExtractor({ chatMessages }: { 
  chatMessages: Array<{ role: 'user' | 'assistant'; content: string }> 
}) {
  const { extractFromChat, loading } = useUserProfile();

  const handleExtract = async () => {
    const result = await extractFromChat(chatMessages);
    
    if (result.success) {
      console.log('Extracted profile info:', result.extracted);
      alert('Profile updated from chat!');
    }
  };

  return (
    <button onClick={handleExtract} disabled={loading}>
      {loading ? 'Extracting...' : 'Update Profile from Chat'}
    </button>
  );
}

/**
 * Example 4: Server-Side Profile Access
 * (Use this in server components or API routes)
 */

// In a server component or API route:
/*
import { getUserProfile, updateUserProfile } from '@/app/db/actions';

export async function ServerSideProfileExample({ userId }: { userId: string }) {
  // Get profile
  const profile = await getUserProfile(userId);

  // Update core fields
  if (profile && !profile.major) {
    await updateUserProfile(userId, {
      major: 'Computer Science',
      dreamJob: 'Software Engineer'
    });
  }

  return (
    <div>
      <h1>Welcome, aspiring {profile?.dreamJob || 'professional'}!</h1>
      <p>Major: {profile?.major || 'Not specified'}</p>
    </div>
  );
}
*/

/**
 * Example 5: API Usage (Direct fetch)
 */
export async function directApiExample() {
  // Get profile
  const getResponse = await fetch('/api/profiles');
  const profileData = await getResponse.json();
  console.log('Current profile:', profileData.profile);

  // Update profile
  const updateResponse = await fetch('/api/profiles', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dreamJob: 'Data Scientist',
      interests: ['machine learning', 'statistics', 'data visualization']
    })
  });
  const updateData = await updateResponse.json();
  console.log('Updated profile:', updateData.profile);

  // Extract from chat
  const extractResponse = await fetch('/api/profiles/extract-from-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'I want to become a UX designer' },
        { role: 'assistant', content: 'Great! What interests you about UX design?' },
        { role: 'user', content: 'I love user research and creating intuitive interfaces' }
      ]
    })
  });
  const extractData = await extractResponse.json();
  console.log('Extracted profile:', extractData.extracted);
}

/**
 * Example 6: Conditional Rendering Based on Profile
 */
export function ProfileBasedContent() {
  const { profile } = useUserProfile();
  const { hasCoreFields } = useProfileHelpers(profile);

  if (!hasCoreFields) {
    return (
      <div className="onboarding">
        <h2>Let's set up your profile!</h2>
        <p>Tell us about your career goals to get personalized recommendations.</p>
        <ProfileForm />
      </div>
    );
  }

  return (
    <div className="personalized-content">
      <h2>Your Career Roadmap</h2>
      <p>Based on your goal of becoming a {profile?.dreamJob}</p>
      <p>with a major in {profile?.major}</p>
      {/* Show personalized roadmap */}
    </div>
  );
}

/**
 * Example 7: Profile Completion Progress
 */
export function ProfileCompletionProgress() {
  const { profile } = useUserProfile();
  const { completionPercentage, isComplete } = useProfileHelpers(profile);

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!profile?.dreamJob) missing.push('Dream Job');
    if (!profile?.major) missing.push('Major');
    if (!profile?.userType) missing.push('User Type');
    if (!profile?.interests?.length) missing.push('Interests');
    if (!profile?.strengths?.length) missing.push('Strengths');
    return missing;
  };

  return (
    <div className="progress-widget">
      <h3>Profile Completion</h3>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <p>{completionPercentage}% Complete</p>

      {!isComplete && (
        <div>
          <p>Complete these fields for better recommendations:</p>
          <ul>
            {getMissingFields().map(field => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {isComplete && (
        <div className="completion-badge">
          ✓ Your profile is complete!
        </div>
      )}
    </div>
  );
}
