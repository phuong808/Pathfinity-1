# Conversational Profile Collection - Quick Reference

## Summary
The chatbot now collects user profile information through natural conversation, recommends career paths and majors based on user input, and stores the selections in the database.

## Key Points

### What Gets Stored in Database
- ✅ **Dream Job** (career path selected by user)
- ✅ **Major** (major selected by user)
- ❌ Interests, strengths, weaknesses, experience, job preferences (used only as conversation context)

### Information Collection Flow
1. **User Type** → 2. **Interests** → 3. **Strengths** → 4. **Weaknesses** (optional) → 5. **Experience** → 6. **Job Preferences** → 7. **Career Recommendations** → 8. **Career Selection** → 9. **Major Recommendations** → 10. **Major Selection** → 11. **Save to Database**

### New Tools Added

| Tool | Purpose | When to Use |
|------|---------|-------------|
| `getCareerRecommendations` | Get 5 career suggestions | After collecting interests, strengths, experience, preferences |
| `getMajorRecommendations` | Get 5 major suggestions | After user selects career path |
| `saveProfile` | Save to database | After user confirms BOTH career AND major |

### Files Modified

```
lib/tools/
├── get-career-recommendations.ts  (NEW)
├── get-major-recommendations.ts   (NEW)
├── save-profile.ts                (NEW)
└── index.ts                       (MODIFIED - exports new tools)

app/api/chat/
└── route.ts                       (MODIFIED - added tools & system prompt)
```

### System Prompt Changes

The chat route now:
1. Gets user session and profile status
2. Checks if user has completed onboarding (`hasCompletedOnboarding`)
3. Adjusts system prompt based on completion status
4. Provides detailed instructions for profile collection workflow
5. Includes examples of natural conversation flow

### Conversation Style

**Goal**: Feel like talking to an advisor, NOT filling out a form

**Good Examples**:
- "That's awesome! What specifically about computers interests you?"
- "Building and problem-solving - that's a great combination!"
- "Based on everything you've shared, here are 5 career paths..."

**Bad Examples**:
- "Please enter your interests:"
- "Question 3 of 7"
- "Complete the following form:"

### Database Schema (Already Exists)

```typescript
profile {
  dreamJob: text         // Saved from chat
  major: text           // Saved from chat
  userType: text        // Can be saved from chat
  interests: jsonb      // NOT saved from chat (context only)
  strengths: jsonb      // NOT saved from chat (context only)
  weaknesses: jsonb     // NOT saved from chat (context only)
  experience: jsonb     // NOT saved from chat (context only)
  jobPreference: jsonb  // NOT saved from chat (context only)
}
```

### Career & Major Recommendation Logic

**Career Recommendations**:
- Query `career_pathways` table
- Score based on keyword matching with interests, strengths, job preferences
- Return top 5 with category information

**Major Recommendations**:
- Query `major_career_mappings` table
- Find majors linked to selected career pathway ID
- Filter by preferred campus if specified
- Return top 5 with degree type, campus, credits

### Tool Parameters

#### getCareerRecommendations
```typescript
{
  interests: string[],              // Required
  strengths: string[],              // Required
  weaknesses?: string[],            // Optional
  experience?: string,              // Optional
  jobPreference?: {                 // Optional
    workEnvironment?: string[],
    industryPreferences?: string[],
    location?: string[],
    companySize?: string
  }
}
```

#### getMajorRecommendations
```typescript
{
  careerPath: string,               // Required
  preferredCampus?: string          // Optional
}
```

#### saveProfile
```typescript
{
  userId: string,                   // Required
  dreamJob?: string,                // Optional
  major?: string                    // Optional
}
```

### Integration Points

1. **Chat Route** (`/app/api/chat/route.ts`):
   - Imports tools
   - Gets user session
   - Checks profile status
   - Passes userId to tools
   - Updates system prompt

2. **Database Actions** (`/app/db/actions.ts`):
   - `getUserProfile(userId)` - Check if profile exists
   - `upsertUserProfile(userId, data)` - Save profile data

3. **Database Schema** (`/app/db/schema.ts`):
   - `profile` table - User profiles
   - `careerPathway` table - Career options
   - `majorCareerMapping` table - Major-career relationships

### Testing Checklist

- [ ] New user completes full onboarding flow
- [ ] Career recommendations appear after info collection
- [ ] Major recommendations appear after career selection
- [ ] Profile saves to database correctly
- [ ] Existing users skip onboarding
- [ ] Conversation feels natural, not robotic
- [ ] Optional fields can be skipped
- [ ] AI adapts to user's natural communication style

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| No career recommendations | Run career ingestion script |
| No major recommendations | Check major_career_mappings table |
| Profile not saving | Verify userId is passed correctly |
| AI not following flow | Check if user already has profile |

### Next Steps After Implementation

1. Test with real users
2. Gather feedback on conversation naturalness
3. Improve career/major matching algorithm (consider embeddings)
4. Add ability to update profile
5. Store full profile context for future reference
6. Add progress indicators (optional)

## Quick Command Reference

```bash
# Start development server
npm run dev

# Check for errors
npm run build

# Ingest career data (if needed)
npm run ingest:uh-manoa-careers

# Check database
psql $DATABASE_URL
```

## Documentation Files

- `CONVERSATIONAL_PROFILE_IMPLEMENTATION.md` - Full implementation details
- `TESTING_PROFILE_COLLECTION.md` - Testing guide and scenarios
- `CONVERSATIONAL_PROFILE_QUICK_REFERENCE.md` - This file (quick reference)
