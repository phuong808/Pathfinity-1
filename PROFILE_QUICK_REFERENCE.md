# User Profile System - Quick Reference Guide

## 📋 Overview

The user profile system collects comprehensive information about users through AI chatbot conversations, storing data for personalized career recommendations and academic planning.

## 🎯 Key Concepts

### Core Fields (Most Important)
- **dreamJob**: User's primary career goal → Used for career roadmap
- **major**: User's intended major → Used for academic planning

### Supporting Fields
- **userType**: Student type (high school, college, career changer, professional)
- **interests**: Areas of interest
- **strengths**: User's skills and strengths
- **weaknesses**: Areas to improve
- **experience**: Work history/projects
- **jobPreference**: Career preferences (location, environment, salary, etc.)

## 🚀 Quick Start

### 1. Get User Profile

```typescript
import { getUserProfile } from '@/app/db/actions';

const profile = await getUserProfile(userId);
```

### 2. Create/Update Profile

```typescript
import { upsertUserProfile } from '@/app/db/actions';

await upsertUserProfile(userId, {
  dreamJob: 'Software Engineer',
  major: 'Computer Science',
  interests: ['AI', 'Web Development'],
  strengths: ['Problem Solving', 'Teamwork']
});
```

### 3. Use Profile Hook (Client-Side)

```typescript
import { useUserProfile } from '@/hooks/use-user-profile';

function MyComponent() {
  const { profile, updateProfile, loading } = useUserProfile();
  
  return (
    <div>
      <h1>Dream Job: {profile?.dreamJob}</h1>
      <button onClick={() => updateProfile({ dreamJob: 'New Job' })}>
        Update
      </button>
    </div>
  );
}
```

### 4. Extract Profile from Chat

```typescript
import { extractFromChat } from '@/hooks/use-user-profile';

const { extractFromChat } = useUserProfile();

await extractFromChat([
  { role: 'user', content: 'I want to be a data scientist' },
  { role: 'assistant', content: 'Great! What interests you?' },
  { role: 'user', content: 'I love machine learning and statistics' }
]);
// Automatically updates profile with extracted information
```

## 📡 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/profiles` | Get current user's profile |
| POST | `/api/profiles` | Create new profile |
| PATCH | `/api/profiles` | Update specific fields |
| PUT | `/api/profiles` | Create or update (upsert) |
| POST | `/api/profiles/extract-from-chat` | Extract profile from chat messages |

## 💡 Common Use Cases

### Use Case 1: First-Time User Onboarding

```typescript
const { profile } = useUserProfile();
const { hasCoreFields } = useProfileHelpers(profile);

if (!hasCoreFields) {
  // Show onboarding form to collect dreamJob and major
  return <OnboardingForm />;
}
```

### Use Case 2: Display Career Roadmap

```typescript
const profile = await getUserProfile(userId);

if (profile?.dreamJob && profile?.major) {
  // Show personalized roadmap based on dreamJob and major
  const roadmap = await generateRoadmap(profile.dreamJob, profile.major);
}
```

### Use Case 3: Match with Academic Counselor

```typescript
const profile = await getUserProfile(userId);

// Match counselor based on user's major
const counselor = await findCounselorByMajor(profile?.major);
```

### Use Case 4: Chat-Based Profile Building

```typescript
// In your chat component
const { extractFromChat } = useUserProfile();

// After chat conversation ends
await extractFromChat(chatMessages);
// Profile automatically updated with information from conversation
```

## 🔧 Server Actions

### Available Functions in `/app/db/actions.ts`

```typescript
// Read
getUserProfile(userId: string)

// Create
createUserProfile(userId: string, profileData: ProfileData)

// Update (partial)
updateUserProfile(userId: string, profileData: Partial<ProfileData>)

// Upsert (create or update)
upsertUserProfile(userId: string, profileData: ProfileData)

// Update chat with profile data
updateChatProfileData(chatId: string, dreamJob?: string, major?: string)
```

### Available Queries in `/app/db/queries.ts`

```typescript
getProfileByUserId(userId: string)
getProfilesByDreamJob(dreamJob: string)
getProfilesByMajor(major: string)
getProfilesByUserType(userType: string)
searchProfilesByInterest(interest: string)
```

## 📊 Profile Helpers

```typescript
import { useProfileHelpers } from '@/hooks/use-user-profile';

const { profile } = useUserProfile();
const { 
  hasCoreFields,        // dreamJob & major present?
  isComplete,           // All recommended fields filled?
  completionPercentage  // 0-100%
} = useProfileHelpers(profile);
```

## 🔄 Profile Extraction Flow

```
User Chat → AI Extraction → Profile Merge → Database Update
     ↓            ↓              ↓              ↓
  Chatbot     OpenAI GPT    Smart Merge    PostgreSQL
  Messages    analyzes      no duplicates   with indexes
```

## 📝 TypeScript Types

```typescript
import { UserProfile, ProfileData } from '@/types/profile';

const profile: UserProfile = {
  dreamJob: 'Software Engineer',
  major: 'Computer Science',
  userType: 'college_student',
  interests: ['AI', 'Web Dev'],
  strengths: ['Problem Solving'],
  weaknesses: ['Public Speaking'],
  experience: [{
    title: 'Intern',
    company: 'Tech Corp',
    type: 'internship',
    duration: '3 months'
  }],
  jobPreference: {
    workEnvironment: ['remote', 'hybrid'],
    location: ['SF', 'NY'],
    salaryExpectation: '$80k-$100k'
  }
};
```

## 🎨 UI Examples

### Display Profile Completion

```typescript
const { completionPercentage } = useProfileHelpers(profile);

<div className="progress-bar">
  Profile {completionPercentage}% Complete
</div>
```

### Conditional Content

```typescript
{profile?.dreamJob && (
  <CareerRoadmap dreamJob={profile.dreamJob} major={profile.major} />
)}
```

## 🐛 Debugging

```typescript
// Check if profile exists
const profile = await getUserProfile(userId);
console.log('Profile exists:', !!profile);

// Check core fields
console.log('Has core fields:', profile?.dreamJob && profile?.major);

// Test extraction
const extracted = await extractProfileFromConversation(messages);
console.log('Extracted:', extracted);
```

## 📖 Documentation Files

- **USER_PROFILE_SYSTEM.md** - Comprehensive documentation
- **types/profile.ts** - TypeScript type definitions
- **examples/profile-usage-examples.tsx** - React component examples

## 🔑 Key Database Tables

- **profiles** - Main profile data (17 columns, 4 indexes)
- **chats** - Links chats to extracted profile data
- **users** - User authentication (links to profiles)

## 🎯 Best Practices

1. ✅ Always check `profile?.dreamJob` and `profile?.major` before showing roadmaps
2. ✅ Use `upsertUserProfile` when you're not sure if profile exists
3. ✅ Extract profile from chat after meaningful conversations
4. ✅ Use `PATCH` for partial updates, `PUT` for full updates
5. ✅ Display completion percentage to encourage profile completion

## 🚫 Common Mistakes

1. ❌ Don't call `createUserProfile` without checking if profile exists
2. ❌ Don't forget to handle `null` profiles
3. ❌ Don't mix up `dreamJob` (string) with `career` (legacy field)
4. ❌ Don't manually parse JSON fields - they're typed automatically

## 📞 Need Help?

Check the following files:
- `/app/db/schema.ts` - Database schema
- `/app/db/actions.ts` - Server actions
- `/lib/profile-extraction.ts` - AI extraction logic
- `/hooks/use-user-profile.ts` - React hooks
