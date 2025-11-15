# Testing the Conversational Profile Collection

## Prerequisites
1. Ensure the database is running and has career pathway data
2. Have a test user account
3. Start the development server: `npm run dev`

## Test Scenarios

### Test 1: New User - Full Onboarding Flow

**Setup**: Use a new user account or clear existing profile data

**Steps**:
1. Navigate to `/Chat` (or click "New Chat")
2. Start with: "I'm a high school student interested in technology"
3. When asked about interests, respond with: "I enjoy programming, problem-solving, and building apps"
4. When asked about strengths, respond with: "I'm good at math, logical thinking, and I'm detail-oriented"
5. When asked about weaknesses (optional), respond with: "I want to improve my public speaking skills"
6. When asked about experience, respond with: "I built a simple weather app using Python last year"
7. When asked about job preferences, respond with: "I'd like to work remotely at a tech startup"
8. The AI should use `getCareerRecommendations` tool and show 5 career paths
9. Select one: "I like Software Developer"
10. The AI should use `getMajorRecommendations` tool and show 5 majors
11. Select one: "I'll go with Computer Science BS at UH Manoa"
12. The AI should use `saveProfile` tool and confirm the save
13. Verify in database that profile has `dreamJob` and `major` set

**Expected Results**:
- Natural conversation flow without feeling like a form
- Career recommendations based on user input
- Major recommendations based on selected career
- Profile saved to database
- Next conversation recognizes completed profile

### Test 2: Existing User - Skip Onboarding

**Setup**: Use a user account with existing dreamJob and major in profile

**Steps**:
1. Navigate to `/Chat`
2. Start a new conversation with any message
3. The AI should NOT go through the profile collection flow
4. The AI should provide regular academic advising

**Expected Results**:
- No profile collection questions
- Direct assistance with courses/programs/roadmaps
- System recognizes completed profile

### Test 3: Natural Question Weaving

**Setup**: New user account

**Steps**:
1. Start conversation naturally without following the prescribed order
2. Mention interests, strengths, and career ideas in random order
3. Observe how AI adapts to collect missing information

**Expected Results**:
- AI should adapt to user's natural communication style
- Should collect all required information regardless of order
- Should not repeat questions for already-provided information

### Test 4: Skipping Optional Fields

**Setup**: New user account

**Steps**:
1. Go through the flow but skip weaknesses when asked
2. Provide minimal experience information
3. Continue to career selection

**Expected Results**:
- AI should accept minimal information
- Should still provide career recommendations
- Should not force user to provide optional data

### Test 5: Career Change - Existing User Updates Profile

**Setup**: User with existing profile

**Steps**:
1. Start conversation with: "I want to change my career path"
2. Provide new interests and goals
3. Go through recommendation flow again
4. Select new career and major

**Expected Results**:
- AI should guide through recommendations again
- Should update profile with new selections
- Should confirm the change

## Database Verification

After completing tests, verify in the database:

```sql
-- Check profile data
SELECT 
  u.name,
  u.email,
  p."dreamJob",
  p.major,
  p."userType",
  p."createdAt",
  p."updatedAt"
FROM profiles p
JOIN users u ON p."userId" = u.id
WHERE u.email = 'test@example.com';
```

## Debug Mode

To see what's happening during the conversation:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for logs like:
   - `🎯 Getting career recommendations for:`
   - `✅ Found career recommendations:`
   - `🎓 Getting major recommendations for career:`
   - `✅ Found major recommendations:`
   - `💾 Saving profile data:`
   - `✅ Profile saved successfully`

## API Response Verification

Check the tool responses in the chat:

1. **getCareerRecommendations** should return:
```json
{
  "success": true,
  "message": "Based on your interests...",
  "recommendations": [
    {
      "rank": 1,
      "careerPath": "Software Developer",
      "category": "Technology"
    },
    // ... 4 more
  ]
}
```

2. **getMajorRecommendations** should return:
```json
{
  "success": true,
  "message": "Based on your interest in...",
  "recommendations": [
    {
      "rank": 1,
      "majorName": "Computer Science - BS",
      "degreeType": "BS",
      "campus": "University of Hawaiʻi at Mānoa",
      "credits": "120"
    },
    // ... 4 more
  ]
}
```

3. **saveProfile** should return:
```json
{
  "success": true,
  "message": "Great! I've saved your career path: Software Developer and major: Computer Science - BS to your profile.",
  "saved": {
    "dreamJob": "Software Developer",
    "major": "Computer Science - BS"
  }
}
```

## Troubleshooting

### Issue: Career recommendations return empty
**Cause**: No career pathway data in database
**Solution**: Run the career pathway ingestion script:
```bash
npm run ingest:uh-manoa-careers
```

### Issue: Major recommendations return empty
**Cause**: No major-career mapping data in database
**Solution**: Verify major_career_mappings table has data

### Issue: Profile not saving
**Cause**: User ID not being passed correctly
**Solution**: Check browser console for errors, verify session is valid

### Issue: AI not following profile collection flow
**Cause**: User already has profile data or system prompt not loading correctly
**Solution**: 
1. Check database for existing profile
2. Clear profile data if testing
3. Verify system prompt includes profile collection section

## Expected Conversation Patterns

### Good Patterns ✅
- "That's interesting that you enjoy problem-solving..."
- "Based on what you've shared..."
- "Let me show you some career paths that might be a great fit..."
- "Which of these resonates most with you?"

### Bad Patterns ❌
- "Please fill out the following fields..."
- "Question 1 of 7..."
- "Enter your interests:"
- Robotic, form-like responses

## Success Criteria

✅ Conversation feels natural and engaging
✅ All required information collected in order
✅ Optional fields can be skipped
✅ Career recommendations relevant to user input
✅ Major recommendations relevant to selected career
✅ Profile saved correctly to database
✅ Subsequent conversations recognize completed profile
✅ No technical errors or tool failures mentioned to user
✅ AI provides helpful explanations for recommendations
✅ User feels guided, not interrogated
