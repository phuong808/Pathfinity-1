# Conversational Profile Collection Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER STARTS NEW CHAT                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                        ┌─────────────────────────────┐
                        │  Check Profile Completion   │
                        │  getUserProfile(userId)     │
                        └─────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
        ┌───────────────────────┐           ┌───────────────────────┐
        │ hasCompletedOnboarding│           │ hasCompletedOnboarding│
        │      = false          │           │      = true           │
        │ (No dreamJob/major)   │           │ (Has dreamJob/major)  │
        └───────────────────────┘           └───────────────────────┘
                    │                                   │
                    ▼                                   ▼
        ┌───────────────────────┐           ┌───────────────────────┐
        │ START PROFILE         │           │ SKIP TO REGULAR       │
        │ COLLECTION FLOW       │           │ ADVISING MODE         │
        └───────────────────────┘           └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │          CONVERSATIONAL INFORMATION COLLECTION             │
        │                                                            │
        │  Step 1: User Type                                        │
        │  ├─ "I'm a high school student..."                        │
        │  └─ AI: "That's awesome! What interests you?"             │
        │                                                            │
        │  Step 2: Interests (3-5)                                  │
        │  ├─ "I love technology and problem-solving"               │
        │  └─ AI: "Great! What are you good at?"                    │
        │                                                            │
        │  Step 3: Strengths (3-5)                                  │
        │  ├─ "Math, logical thinking, attention to detail"         │
        │  └─ AI: "Any areas you want to improve?"                  │
        │                                                            │
        │  Step 4: Weaknesses (optional, 2-3)                       │
        │  ├─ "Public speaking" or "skip"                          │
        │  └─ AI: "Do you have any experience?"                     │
        │                                                            │
        │  Step 5: Experience                                       │
        │  ├─ "Built a weather app in Python"                      │
        │  └─ AI: "What's important to you in a job?"               │
        │                                                            │
        │  Step 6: Job Preferences                                  │
        │  ├─ "Remote work, tech startup, creative environment"     │
        │  └─ Collection Complete!                                  │
        └───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │              CAREER RECOMMENDATIONS PHASE                  │
        │                                                            │
        │  Tool: getCareerRecommendations({                         │
        │    interests: [...],                                      │
        │    strengths: [...],                                      │
        │    weaknesses: [...],    // optional                      │
        │    experience: "...",    // optional                      │
        │    jobPreference: {...}  // optional                      │
        │  })                                                        │
        │                                                            │
        │  Returns:                                                  │
        │  ┌────────────────────────────────────────────┐           │
        │  │ 1. Software Developer                      │           │
        │  │ 2. Full Stack Engineer                     │           │
        │  │ 3. Data Scientist                          │           │
        │  │ 4. DevOps Engineer                         │           │
        │  │ 5. Mobile App Developer                    │           │
        │  └────────────────────────────────────────────┘           │
        │                                                            │
        │  AI: "Based on your love for technology and               │
        │       problem-solving skills, here are careers             │
        │       that could be perfect for you..."                   │
        └───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │                 USER SELECTS CAREER                        │
        │                                                            │
        │  User: "I like Software Developer!"                       │
        │                                                            │
        │  ✓ Career Selected: "Software Developer"                  │
        └───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │               MAJOR RECOMMENDATIONS PHASE                  │
        │                                                            │
        │  Tool: getMajorRecommendations({                          │
        │    careerPath: "Software Developer",                      │
        │    preferredCampus: "UH Manoa"  // optional               │
        │  })                                                        │
        │                                                            │
        │  Returns:                                                  │
        │  ┌────────────────────────────────────────────┐           │
        │  │ 1. Computer Science - BS @ UH Mānoa        │           │
        │  │    (120 credits)                           │           │
        │  │ 2. Computer Science - BS @ UH Hilo         │           │
        │  │    (120 credits)                           │           │
        │  │ 3. Information & Computer Sciences - BS    │           │
        │  │    @ UH West Oʻahu (120 credits)           │           │
        │  │ 4. Computer Engineering - BS @ UH Mānoa    │           │
        │  │    (128 credits)                           │           │
        │  │ 5. Applied Computer Science - BS           │           │
        │  │    @ UH Mānoa (120 credits)                │           │
        │  └────────────────────────────────────────────┘           │
        │                                                            │
        │  AI: "Excellent choice! Here are majors that              │
        │       will prepare you for software development..."       │
        └───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │                   USER SELECTS MAJOR                       │
        │                                                            │
        │  User: "I'll go with Computer Science BS at UH Manoa"     │
        │                                                            │
        │  ✓ Major Selected: "Computer Science - BS"                │
        └───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │                  SAVE TO DATABASE                          │
        │                                                            │
        │  Tool: saveProfile({                                      │
        │    userId: "user_123",                                    │
        │    dreamJob: "Software Developer",                        │
        │    major: "Computer Science - BS"                         │
        │  })                                                        │
        │                                                            │
        │  Database Update:                                          │
        │  ┌────────────────────────────────────────────┐           │
        │  │ profiles table                             │           │
        │  │ ├─ userId: "user_123"                      │           │
        │  │ ├─ dreamJob: "Software Developer"          │           │
        │  │ ├─ major: "Computer Science - BS"          │           │
        │  │ └─ updatedAt: <timestamp>                  │           │
        │  └────────────────────────────────────────────┘           │
        │                                                            │
        │  AI: "Perfect! I've saved your career goal and            │
        │       major. Would you like to see the 4-year             │
        │       roadmap for Computer Science?"                      │
        └───────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────────────────────────────────────┐
        │              PROFILE COLLECTION COMPLETE!                  │
        │                                                            │
        │  User can now:                                            │
        │  • View course roadmaps                                   │
        │  • Explore courses                                        │
        │  • Get academic advising                                  │
        │  • Update profile if needed                               │
        │                                                            │
        │  Future conversations will skip profile collection        │
        └───────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────┐
│   User Input    │
│  (Conversation) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                    AI Chat System                       │
│                                                         │
│  Collects (NOT saved to DB):                          │
│  ├─ User Type                                          │
│  ├─ Interests []                                       │
│  ├─ Strengths []                                       │
│  ├─ Weaknesses []                                      │
│  ├─ Experience {}                                      │
│  └─ Job Preferences {}                                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│           getCareerRecommendations Tool                 │
│                                                         │
│  Input: interests, strengths, weaknesses, experience,   │
│         jobPreference                                   │
│                                                         │
│  Process:                                              │
│  1. Query career_pathways table                        │
│  2. Score based on keyword matching                    │
│  3. Sort by relevance                                  │
│  4. Return top 5                                       │
│                                                         │
│  Output: [{ careerPath, category, rank }]             │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              User Selects Career Path                   │
│         Selected: "Software Developer"                  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│          getMajorRecommendations Tool                   │
│                                                         │
│  Input: careerPath, preferredCampus                    │
│                                                         │
│  Process:                                              │
│  1. Find career_pathways.id matching careerPath        │
│  2. Query major_career_mappings where                  │
│     careerPathwayIds contains the ID                   │
│  3. Join with campus table                             │
│  4. Filter by preferredCampus (if provided)            │
│  5. Sort by relevance                                  │
│  6. Return top 5                                       │
│                                                         │
│  Output: [{ majorName, degreeType, campus, credits }] │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                User Selects Major                       │
│     Selected: "Computer Science - BS"                   │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                saveProfile Tool                         │
│                                                         │
│  Input: userId, dreamJob, major                        │
│                                                         │
│  Process:                                              │
│  1. Check if profile exists (getUserProfile)           │
│  2. Upsert to profiles table                           │
│                                                         │
│  Database Update:                                      │
│  UPDATE profiles SET                                   │
│    dreamJob = 'Software Developer',                    │
│    major = 'Computer Science - BS',                    │
│    updatedAt = NOW()                                   │
│  WHERE userId = 'user_123'                             │
│                                                         │
│  Output: { success: true, saved: { dreamJob, major }} │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                   ✓ COMPLETE                            │
│              Profile Saved to Database                  │
└─────────────────────────────────────────────────────────┘
```

## Key Implementation Notes

### What Gets Stored vs. What Doesn't

**Stored in Database** (profiles table):
- ✅ `dreamJob` - Career path selection
- ✅ `major` - Major selection
- ✅ `userType` - Can be saved (optional)

**Used as Context Only** (NOT stored):
- ❌ `interests` - Used for career recommendations only
- ❌ `strengths` - Used for career recommendations only
- ❌ `weaknesses` - Used for career recommendations only
- ❌ `experience` - Used for career recommendations only
- ❌ `jobPreference` - Used for career recommendations only

### Why This Approach?

1. **Privacy**: Don't store sensitive preference data unnecessarily
2. **Simplicity**: Only store the final selections
3. **Flexibility**: Users can change interests without DB updates
4. **Focus**: Dream job and major are the actionable data points

### Future Enhancement Opportunity

If needed, you can optionally save the full context by:
1. Adding fields to the saveProfile tool
2. Updating the upsertUserProfile function
3. Storing interests, strengths, etc. in the database

This would enable:
- Viewing past recommendations
- Understanding user's decision-making process
- Better personalization in future conversations
- Profile analytics and insights
