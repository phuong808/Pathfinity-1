# User Profile System Documentation

## Overview

The user profile system is designed to collect and store comprehensive information about each user to enable personalized career recommendations, academic counseling matching, and career roadmap generation.

## Database Schema

### Profile Table Structure

Each user has a single profile record with the following fields:

#### Core Fields (Primary Use)
These fields are most frequently used for career roadmap display and academic counselor connections:

- **`dreamJob`** (text): The user's primary career goal or dream job. Linked to career pathways for roadmap generation.
- **`major`** (text): The user's intended or current major. Used for academic planning and course recommendations.

#### User Categorization

- **`userType`** (text): User's current status
  - Options: `high_school_student`, `college_student`, `career_changer`, `professional`
  - Used to tailor recommendations and content

#### Career Exploration Fields
These fields are used by the chatbot to provide personalized career recommendations:

- **`interests`** (jsonb array): User's areas of interest
  - Example: `["artificial intelligence", "healthcare", "environmental science"]`

- **`strengths`** (jsonb array): User's identified strengths and skills
  - Example: `["problem solving", "communication", "programming", "leadership"]`

- **`weaknesses`** (jsonb array): Areas the user wants to improve
  - Example: `["public speaking", "time management", "networking"]`

- **`experience`** (jsonb array): Work experience, internships, or projects
  - Each entry contains:
    - `title`: Position or project title
    - `company`: Organization name
    - `description`: Brief description
    - `duration`: Time period
    - `type`: `internship`, `part-time`, `full-time`, `volunteer`, or `project`
  - Example:
    ```json
    [
      {
        "title": "Software Engineering Intern",
        "company": "Tech Corp",
        "description": "Developed web applications",
        "duration": "Summer 2024",
        "type": "internship"
      }
    ]
    ```

- **`jobPreference`** (jsonb object): User's job and career preferences
  - `workEnvironment`: Array of preferred work settings (e.g., `["remote", "hybrid"]`)
  - `industryPreferences`: Array of preferred industries
  - `salaryExpectation`: Expected salary range
  - `location`: Array of preferred work locations
  - `companySize`: Preferred company size (e.g., `startup`, `mid-size`, `enterprise`)
  - `workLifeBalance`: Work-life balance preferences

#### Legacy Fields
- `career`, `college`, `degree`, `skills`, `roadmap`: Maintained for backward compatibility

## API Endpoints

### 1. Get User Profile
```
GET /api/profiles
```

**Authentication**: Required

**Response**:
```json
{
  "success": true,
  "profile": {
    "dreamJob": "Software Engineer",
    "major": "Computer Science",
    "userType": "college_student",
    "interests": ["AI", "web development"],
    "strengths": ["problem solving", "coding"],
    "weaknesses": ["networking"],
    "experience": [...],
    "jobPreference": {...}
  }
}
```

### 2. Create Profile
```
POST /api/profiles
```

**Authentication**: Required

**Body**: Profile data (all fields optional)
```json
{
  "dreamJob": "Data Scientist",
  "major": "Statistics",
  "userType": "college_student",
  "interests": ["machine learning", "data analysis"],
  "strengths": ["analytical thinking", "Python"],
  "weaknesses": ["presentation skills"],
  "experience": [
    {
      "title": "Research Assistant",
      "company": "University Lab",
      "type": "part-time",
      "duration": "1 year"
    }
  ],
  "jobPreference": {
    "workEnvironment": ["hybrid"],
    "location": ["San Francisco", "Remote"],
    "companySize": "mid-size"
  }
}
```

### 3. Update Profile (Partial)
```
PATCH /api/profiles
```

**Authentication**: Required

**Body**: Only fields to update
```json
{
  "dreamJob": "AI Researcher",
  "interests": ["deep learning", "NLP"]
}
```

### 4. Upsert Profile
```
PUT /api/profiles
```

**Authentication**: Required

**Body**: Complete profile data (creates if doesn't exist, updates if exists)

### 5. Extract Profile from Chat
```
POST /api/profiles/extract-from-chat
```

**Authentication**: Required

**Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "I'm interested in becoming a software engineer"
    },
    {
      "role": "assistant",
      "content": "That's great! What programming languages do you know?"
    },
    {
      "role": "user",
      "content": "I know Python and JavaScript, and I'm strong at problem solving"
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "profile": {...},
  "extracted": {
    "dreamJob": "Software Engineer",
    "strengths": ["Python", "JavaScript", "problem solving"]
  }
}
```

## Server-Side Functions

### Profile Management (`/app/db/actions.ts`)

#### `getUserProfile(userId: string)`
Retrieves the complete profile for a user.

#### `createUserProfile(userId: string, profileData: ProfileData)`
Creates a new profile for a user.

#### `updateUserProfile(userId: string, profileData: Partial<ProfileData>)`
Updates specific fields in a user's profile.

#### `upsertUserProfile(userId: string, profileData: ProfileData)`
Creates or updates a profile (automatically determines which operation to perform).

#### `updateChatProfileData(chatId: string, dreamJob?: string, major?: string)`
Updates the chat record with extracted profile information.

### Profile Queries (`/app/db/queries.ts`)

#### `getProfileByUserId(userId: string)`
Get profile by user ID.

#### `getProfilesByDreamJob(dreamJob: string)`
Find all users with a specific dream job.

#### `getProfilesByMajor(major: string)`
Find all users with a specific major.

#### `getProfilesByUserType(userType: string)`
Find all users of a specific type.

#### `searchProfilesByInterest(interest: string)`
Find users with a specific interest.

## Profile Extraction Utilities (`/lib/profile-extraction.ts`)

### `extractProfileFromConversation(messages)`
Analyzes a conversation and extracts all available profile information using AI.

### `mergeProfileData(existing, extracted)`
Intelligently merges extracted profile data with existing profile, avoiding duplicates and preserving important information.

### `extractCoreProfileInfo(messages)`
Extracts only dreamJob and major for quick updates.

## Chat Integration

The chat system now tracks profile data extraction:

- **`extractedDreamJob`**: Dream job identified in this chat
- **`extractedMajor`**: Major identified in this chat
- **`profileDataExtracted`**: Boolean flag indicating if profile extraction was performed

## Workflow

### 1. New User Chat Session

When a user starts a chat:
1. Chatbot collects information through conversation
2. User shares interests, strengths, weaknesses, experience, and preferences
3. System extracts profile information automatically
4. Profile is created/updated in the database

### 2. Career Recommendation Process

```
User Input (chat) 
  → Profile Extraction (AI-powered)
  → Store all profile fields
  → Use profile data for recommendations
  → Return: Recommended career paths + major
  → Store dreamJob and major as primary fields
```

### 3. Subsequent Chats

Each new chat can:
- Extract additional profile information
- Update existing fields with new information
- Maintain core fields (dreamJob, major) for roadmap consistency

## Usage Examples

### Client-Side Profile Update

```typescript
// Create or update profile
const response = await fetch('/api/profiles', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dreamJob: 'UX Designer',
    major: 'Design',
    userType: 'college_student',
    interests: ['user research', 'prototyping', 'accessibility'],
    strengths: ['empathy', 'creativity', 'attention to detail'],
    weaknesses: ['coding'],
    jobPreference: {
      workEnvironment: ['hybrid', 'office'],
      location: ['New York', 'Boston']
    }
  })
})
```

### Extract Profile from Chat

```typescript
const response = await fetch('/api/profiles/extract-from-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: chatMessages.map(msg => ({
      role: msg.role,
      content: msg.parts.find(p => p.type === 'text')?.text || ''
    }))
  })
})
```

### Server-Side Profile Access

```typescript
import { getUserProfile, upsertUserProfile } from '@/app/db/actions'

// Get profile
const profile = await getUserProfile(userId)

// Update specific fields
await updateUserProfile(userId, {
  dreamJob: 'Machine Learning Engineer',
  major: 'Computer Science'
})

// Full upsert
await upsertUserProfile(userId, {
  dreamJob: 'Product Manager',
  major: 'Business Administration',
  interests: ['product strategy', 'user experience'],
  // ... other fields
})
```

## Key Design Principles

1. **Dual-Purpose Fields**: All fields are stored, but `dreamJob` and `major` are the primary fields used for roadmaps and counselor matching.

2. **Incremental Collection**: Information can be gathered over multiple chat sessions and merged intelligently.

3. **AI-Powered Extraction**: Chatbot conversations automatically extract profile information without requiring explicit forms.

4. **Flexible Updates**: Support both partial updates (PATCH) and full replacements (PUT).

5. **Type Safety**: TypeScript interfaces ensure type safety throughout the application.

## Database Indexes

For optimal performance, the following indexes are created:

- `profile_user_idx`: Fast user lookup
- `profile_dream_job_idx`: Query by dream job
- `profile_major_idx`: Query by major
- `profile_user_type_idx`: Filter by user type

## Migration

The profile schema was updated with migration `0013_gifted_misty_knight.sql`, which:
- Added all new profile fields
- Created necessary indexes
- Maintained backward compatibility with legacy fields
