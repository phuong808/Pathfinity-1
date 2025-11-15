# Conversational Profile Collection Implementation

## Overview
The chatbot now implements a natural, conversational flow for collecting user profile information and recommending career paths and majors. The system feels like talking to an advisor rather than filling out a form.

## Key Features

### 1. Natural Conversation Flow
- Collects profile information through friendly dialogue
- Weaves questions naturally into the conversation
- Acknowledges and reflects on user responses
- Maintains engagement throughout the process

### 2. Information Collection Order
The chatbot collects information in this specific order:
1. **User Type** - Student level/status (high school, college, professional, etc.)
2. **Interests** - 3-5 things they're passionate about
3. **Strengths** - 3-5 skills they excel at
4. **Weaknesses** - 2-3 areas to improve (optional)
5. **Experience** - Work, internships, projects, volunteer work
6. **Job Preferences** - Work environment, location, industry, company size

### 3. Smart Recommendations

#### Career Path Recommendations
- Once profile info is collected, AI uses `getCareerRecommendations` tool
- Returns top 5 career paths based on interests, strengths, and preferences
- Explains WHY each career aligns with their profile
- User selects their preferred career path

#### Major Recommendations
- After career selection, AI uses `getMajorRecommendations` tool
- Returns top 5 majors that lead to the selected career
- Shows degree type, campus, and credit requirements
- Explains how each major prepares them for their career
- User selects their preferred major

### 4. Database Storage
- Dream job and major are NOT required upfront
- Only saved to database after BOTH are selected by user
- Uses `saveProfile` tool with userId, dreamJob, and major
- Confirms save and offers next steps (roadmap viewing)

## New Tools

### `getCareerRecommendations`
```typescript
{
  interests: string[],           // Required: User interests
  strengths: string[],           // Required: User strengths
  weaknesses?: string[],         // Optional: Areas to improve
  experience?: string,           // Optional: Experience summary
  jobPreference?: {              // Optional: Job preferences
    workEnvironment?: string[],
    industryPreferences?: string[],
    location?: string[],
    companySize?: string
  }
}
```
Returns: `{ success, message, recommendations: [{ rank, careerPath, category }] }`

### `getMajorRecommendations`
```typescript
{
  careerPath: string,           // Required: Selected career
  preferredCampus?: string      // Optional: Campus preference
}
```
Returns: `{ success, message, recommendations: [{ rank, majorName, degreeType, campus, credits }] }`

### `saveProfile`
```typescript
{
  userId: string,               // Required: User ID
  dreamJob?: string,            // Optional: Selected career
  major?: string                // Optional: Selected major
}
```
Returns: `{ success, message, saved: { dreamJob, major } }`

## Implementation Details

### Files Modified/Created

1. **New Tools**:
   - `/lib/tools/get-career-recommendations.ts` - Career path suggestions
   - `/lib/tools/get-major-recommendations.ts` - Major suggestions based on career
   - `/lib/tools/save-profile.ts` - Save to database
   - `/lib/tools/index.ts` - Export all tools

2. **Modified Files**:
   - `/app/api/chat/route.ts` - Added profile collection system prompt and tools

### Database Schema (Already Exists)
The profile table in `app/db/schema.ts` already has all necessary fields:
- `dreamJob` - Career path/goal
- `major` - Selected major
- `userType` - User categorization
- `interests` - Array of interests (used for recommendations, not stored from chat)
- `strengths` - Array of strengths (used for recommendations, not stored from chat)
- `weaknesses` - Array of weaknesses (used for recommendations, not stored from chat)
- `experience` - Experience objects (used for recommendations, not stored from chat)
- `jobPreference` - Job preference object (used for recommendations, not stored from chat)

Note: The chat uses interests, strengths, weaknesses, experience, and jobPreference as **conversation context only** to generate recommendations. Only dreamJob and major are stored permanently.

## Conversation Flow Example

```
User: "I'm a high school student interested in computers"
AI: "That's awesome! Computers and technology open up so many exciting possibilities. 
     What specifically about computers interests you? Is it creating things, solving 
     problems, designing, or something else?"

User: "I like building things and solving puzzles"
AI: "Building and problem-solving - that's a great combination! Those skills are 
     valuable in so many tech careers. What would you say are some of your strongest 
     skills? Maybe things like logical thinking, creativity, communication?"

User: "I'm good at math and logical thinking"
AI: "Excellent! Strong math and logical thinking skills are perfect for tech careers. 
     Are there any areas you'd like to improve or develop further?"

User: "I want to get better at public speaking"
AI: "That's a great goal - communication skills are super important in any field. 
     Do you have any experience with computers or tech? Maybe projects, classes, 
     or things you've built?"

User: "I built a simple game in Python last year"
AI: "That's fantastic! Building a game is a great hands-on way to learn. 
     When you think about your future career, what's important to you? 
     Like working remotely, being in a big city, working at a startup versus 
     a large company?"

User: "I'd like to work remotely and maybe at a tech startup"
AI: [Uses getCareerRecommendations tool]
    "Awesome! Based on everything you've shared - your love for building things, 
     your problem-solving skills, strong math abilities, and your interest in startups - 
     here are 5 career paths that could be perfect for you:

     1. **Software Developer** - Build applications and solve technical challenges
     2. **Full Stack Engineer** - Work on both frontend and backend systems
     3. **Game Developer** - Combine creativity with programming
     4. **Data Engineer** - Build systems that process and analyze data
     5. **DevOps Engineer** - Automate and optimize software deployment

     Which of these sounds most exciting to you?"

User: "Software Developer sounds great!"
AI: [Uses getMajorRecommendations tool]
    "Excellent choice! Software development is a fantastic field with lots of 
     opportunities. Here are majors that will prepare you well:

     1. **Computer Science - BS** at UH Mānoa (120 credits)
     2. **Computer Science - BS** at UH Hilo (120 credits)
     3. **Information & Computer Sciences - BS** at UH West Oʻahu (120 credits)
     4. **Computer Engineering - BS** at UH Mānoa (128 credits)
     5. **Applied Computer Science - BS** at UH Mānoa (120 credits)

     Computer Science gives you strong fundamentals in algorithms, data structures, 
     and software engineering. Which of these interests you most?"

User: "I'll go with Computer Science BS at UH Manoa"
AI: [Uses saveProfile tool]
    "Perfect! I've saved Computer Science as your major and Software Developer as 
     your career goal. Would you like to see the complete 4-year roadmap for 
     Computer Science at UH Mānoa? I can show you all the courses you'll take 
     semester by semester."
```

## Status Tracking

The system tracks whether a user has completed onboarding:
- `hasCompletedOnboarding` = true if user has dreamJob OR major set
- Changes system prompt behavior based on completion status
- Completed users skip to regular advising mode
- New users get the full profile collection flow

## Benefits

1. **Natural Experience**: Feels like talking to a real advisor
2. **Personalized**: Recommendations based on actual user input
3. **Data-Driven**: Uses major-career mapping from database
4. **Flexible**: Dream job and major not required upfront
5. **Goal-Oriented**: Clear path from discovery to major selection
6. **Database-Backed**: Permanent storage for career path and major

## Testing

To test the implementation:
1. Start a new chat conversation
2. Respond as a new user (e.g., "I'm a high school student")
3. Follow the natural conversation flow
4. Provide interests, strengths, experience, preferences
5. Review career recommendations
6. Select a career path
7. Review major recommendations
8. Select a major
9. Verify profile is saved to database
10. Check that subsequent conversations recognize completed profile

## Future Enhancements

1. **Semantic Matching**: Use embeddings for better career/major matching
2. **More Context**: Store full profile data (interests, strengths, etc.) for future reference
3. **Profile Updates**: Allow users to update their career path or major
4. **Progress Tracking**: Show users where they are in the onboarding flow
5. **Personality Insights**: Add personality assessment for better recommendations
6. **Industry Data**: Integrate salary data, job growth stats from Lightcast API
