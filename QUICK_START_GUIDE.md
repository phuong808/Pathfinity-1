# Quick Start: Testing the Conversational Profile Collection

## 1. Verify Database Setup

First, make sure you have the required data in your database:

```bash
# Check if career pathways exist
psql $DATABASE_URL -c "SELECT COUNT(*) FROM career_pathways;"

# Check if major-career mappings exist
psql $DATABASE_URL -c "SELECT COUNT(*) FROM major_career_mappings;"
```

If counts are 0, run the ingestion script:
```bash
npm run ingest:uh-manoa-careers
```

## 2. Start Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

## 3. Test the Flow

### Option A: Quick Test (Copy-paste responses)

**Step 1**: Navigate to `/Chat` or click "New Chat"

**Step 2**: Start the conversation
```
I'm a high school student interested in technology
```

**Step 3**: When asked about interests
```
I enjoy programming, problem-solving, and building things
```

**Step 4**: When asked about strengths
```
I'm good at math, logical thinking, and attention to detail
```

**Step 5**: When asked about weaknesses (optional)
```
I want to improve my public speaking
```

**Step 6**: When asked about experience
```
I built a weather app using Python last year
```

**Step 7**: When asked about job preferences
```
I'd like to work remotely at a tech startup
```

**Step 8**: Review the 5 career recommendations

**Step 9**: Select a career
```
Software Developer sounds perfect!
```

**Step 10**: Review the 5 major recommendations

**Step 11**: Select a major
```
I'll go with Computer Science BS at UH Manoa
```

**Step 12**: Verify the save confirmation

### Option B: Natural Conversation (Recommended)

Just chat naturally! The AI will guide you through the process conversationally. Don't worry about following the exact order - just respond naturally to what the AI asks.

Example:
```
You: Hi! I'm trying to figure out what to study in college

AI: Hey! I'd love to help you explore your options. First, let me learn a bit about you - are you currently in high school, already in college, or somewhere else in your journey?

You: I'm a junior in high school right now

AI: Awesome! Being a junior is the perfect time to start exploring. So what kinds of things are you interested in? What gets you excited or curious?

You: I really like technology and computers, and I enjoy solving puzzles

AI: That's a great combination! Technology and problem-solving skills open up so many exciting careers. What would you say you're really good at? Like maybe certain subjects, skills, or ways of thinking?

[Continue naturally...]
```

## 4. Verify in Console

Open browser DevTools (F12) → Console tab

Look for these logs:
```
🎯 Getting career recommendations for: { interests: [...], strengths: [...] }
✅ Found career recommendations: 5
🎓 Getting major recommendations for career: Software Developer
✅ Found major recommendations: 5
💾 Saving profile data: { userId: "...", dreamJob: "...", major: "..." }
✅ Profile saved successfully
```

## 5. Verify in Database

```bash
# Check if profile was saved
psql $DATABASE_URL -c "SELECT \"dreamJob\", major, \"updatedAt\" FROM profiles ORDER BY \"updatedAt\" DESC LIMIT 1;"
```

Should show:
```
     dreamJob     |        major        |     updatedAt
------------------+--------------------+------------------
 Software Developer | Computer Science - BS | 2025-11-15 ...
```

## 6. Test Existing User Flow

Start a NEW chat (the user now has a profile)

The AI should:
- ✅ NOT ask profile collection questions
- ✅ Go straight to regular advising
- ✅ Recognize you have a career goal and major

Try:
```
Show me the roadmap for my major
```

The AI should know your major and provide the roadmap.

## Common Issues & Quick Fixes

### Issue: No career recommendations appear

**Fix**:
```bash
npm run ingest:uh-manoa-careers
```

### Issue: "401 Unauthorized" error

**Fix**: Make sure you're logged in
1. Go to `/login`
2. Sign in with your account
3. Try again

### Issue: Profile not saving

**Check**: Browser console for errors
**Fix**: Clear cookies and log in again

### Issue: AI asking form-like questions

**Expected**: This shouldn't happen! The system prompt should prevent this
**Report**: This is a bug - check the system prompt in `/app/api/chat/route.ts`

## What Success Looks Like

✅ **Natural conversation** - Feels like talking to a person
✅ **Smooth transitions** - AI naturally moves between topics
✅ **Relevant recommendations** - Careers match your interests
✅ **Clear explanations** - AI explains why careers fit
✅ **Confirmed save** - AI confirms profile was saved
✅ **Next steps offered** - AI suggests viewing roadmap

## What to Watch Out For

❌ **Robotic language** - "Please enter your interests" (should be conversational)
❌ **Numbered questions** - "Question 3 of 7" (should flow naturally)
❌ **Tool errors shown** - "The getCareerRecommendations tool failed" (should be hidden)
❌ **No recommendations** - Empty list (database issue)
❌ **Repeated questions** - Asking for same info twice (context issue)

## Next Steps After Testing

1. **Try different scenarios**:
   - Different user types (college student, working professional)
   - Different interests (healthcare, business, arts)
   - Skip optional fields
   - Provide minimal information

2. **Test edge cases**:
   - Very short responses
   - Very detailed responses
   - Changing mind mid-conversation
   - Asking unrelated questions

3. **Verify data**:
   - Check database after each test
   - Ensure profile updates correctly
   - Verify no duplicate profiles

4. **Get feedback**:
   - Ask someone else to try it
   - Observe if they find it natural
   - Note any confusion points

## Troubleshooting Commands

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT NOW();"

# View recent profiles
psql $DATABASE_URL -c "SELECT u.email, p.\"dreamJob\", p.major FROM profiles p JOIN users u ON p.\"userId\" = u.id ORDER BY p.\"updatedAt\" DESC LIMIT 5;"

# Check career pathways count
psql $DATABASE_URL -c "SELECT COUNT(*), category FROM career_pathways GROUP BY category;"

# Check major mappings count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM major_career_mappings;"

# View chat logs (terminal)
npm run dev | grep "Getting career"

# Restart server
# Ctrl+C then npm run dev
```

## Important Notes

- The system uses OpenAI GPT-4o-mini for responses
- Make sure you have API credits available
- The AI is instructed to be natural and conversational
- Only dreamJob and major are saved to the database
- Interests, strengths, etc. are context only

## Support & Documentation

- **Full details**: `CONVERSATIONAL_PROFILE_IMPLEMENTATION.md`
- **Testing guide**: `TESTING_PROFILE_COLLECTION.md`
- **Quick reference**: `CONVERSATIONAL_PROFILE_QUICK_REFERENCE.md`
- **Flow diagram**: `PROFILE_COLLECTION_FLOW_DIAGRAM.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`

## Ready to Go!

You're all set! The implementation is complete and ready for testing. Just:

1. ✅ Start the dev server (`npm run dev`)
2. ✅ Navigate to `/Chat`
3. ✅ Start chatting naturally
4. ✅ Watch the magic happen!

The AI will guide you through discovering your career path and selecting a major in a natural, engaging way. Enjoy! 🚀
