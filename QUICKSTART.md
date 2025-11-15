# Quick Start: Enhanced RAG Chatbot

## 🚀 Get Started in 3 Steps

### Step 1: Ensure Database is Populated

Make sure your database has all the course and degree program data:

```bash
# Check if data exists
psql $DATABASE_URL -c "SELECT COUNT(*) FROM courses;"
# Should show: 15510+

psql $DATABASE_URL -c "SELECT COUNT(*) FROM degree_programs;"
# Should show: 196

psql $DATABASE_URL -c "SELECT COUNT(*) FROM degree_pathways;"
# Should show: ~1500
```

If you don't have data, run the seed script first:
```bash
npx tsx scripts/seed/seed-all-pathways-courses.ts
```

### Step 2: Generate Embeddings

This is the **MOST IMPORTANT** step. Generate vector embeddings for semantic search:

```bash
npx tsx -r dotenv/config scripts/generate-embeddings.ts
```

**Expected output:**
```
🚀 Starting comprehensive embedding generation...

🎓 Generating embeddings for courses...
Found 15510 courses to process
  Progress: 50/15510 (50 new, 0 skipped)
  Progress: 100/15510 (100 new, 0 skipped)
  ...
✅ Course embeddings complete: 15510 inserted, 0 skipped

🎓 Generating embeddings for degree programs...
Found 196 degree programs to process
  Progress: 20/196 (20 new, 0 skipped)
  ...
✅ Degree program embeddings complete: 196 inserted, 0 skipped

🗺️ Generating embeddings for detailed pathway information...
  Progress: 10 processed (10 new, 0 skipped)
  ...
✅ Pathway details embeddings complete: 196 inserted, 0 skipped

🎉 All embeddings generated successfully!

The chatbot can now:
  ✅ Answer questions about any course in the UH system
  ✅ Provide information about all degree programs
  ✅ Describe detailed semester-by-semester pathways
  ✅ Use semantic search to find relevant information
```

**Duration:** 15-30 minutes (depends on API rate limits)

**Requirements:**
- Valid OpenAI API key in `.env`
- Sufficient API credits
- Stable internet connection

### Step 3: Verify and Test

Verify embeddings were created:

```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM embeddings;"
# Should show: 15000+ records
```

Start your development server:
```bash
npm run dev
```

Navigate to the chat interface and try these queries:

## 📝 Example Queries to Test

### Course Queries
```
✅ "Tell me about ICS 111"
✅ "What computer science courses are available?"
✅ "Find courses about machine learning"
✅ "Show me biology lab courses"
✅ "What are the prerequisites for ICS 311?"
```

### Program Queries
```
✅ "What Computer Science programs are available?"
✅ "Show me Business degrees at UH Manoa"
✅ "Find all engineering programs"
✅ "What BA programs can I study?"
```

### Pathway Queries
```
✅ "Show me the pathway for Computer Science BS"
✅ "What courses do I need for a Business degree?"
✅ "Give me a semester-by-semester plan for Engineering"
✅ "What's the roadmap for Psychology BA?"
```

### Complex Queries
```
✅ "I want to study AI and machine learning, what programs are available?"
✅ "How long does it take to get a BS in Computer Science?"
✅ "What courses do I take in my first year for a Business degree?"
✅ "Compare the Computer Science programs at different campuses"
```

## 🔧 Troubleshooting

### Problem: "No embeddings found"
**Solution:** Run the embeddings generation script:
```bash
npx tsx -r dotenv/config scripts/generate-embeddings.ts
```

### Problem: "Semantic search returns no results"
**Solutions:**
1. Lower the similarity threshold in `lib/semantic-search.tsx` (try 0.2 instead of 0.3)
2. Ensure embeddings exist: `SELECT COUNT(*) FROM embeddings;`
3. Check that pgvector extension is enabled

### Problem: "Tool returns found: false"
**Solutions:**
1. Check database connectivity
2. Verify tables exist and have data
3. Check console logs for specific errors
4. Ensure migrations are up to date

### Problem: Slow responses
**Solutions:**
1. Check database indexes: `\d+ courses`, `\d+ degree_programs`
2. Ensure pgvector index exists: `\d+ embeddings`
3. Monitor API rate limits
4. Check network latency

## 📊 What Changed

### New Files
```
✨ lib/tools/get-degree-program.ts  - Search degree programs
✨ lib/tools/get-pathway.ts         - Get semester pathways
✨ lib/rag-context.ts               - RAG context builder
✨ scripts/generate-embeddings.ts   - Generate embeddings
📖 RAG_CHATBOT_GUIDE.md            - Comprehensive guide
📖 RAG_IMPLEMENTATION_SUMMARY.md   - Implementation details
📖 QUICKSTART.md                   - This file
```

### Updated Files
```
🔄 lib/tools/index.ts               - Export new tools
🔄 app/api/chat/route.ts            - Enhanced system prompt + new tools
```

### Database Tables Used
```
📊 courses (15,510 records)
📊 degree_programs (196 records)
📊 degree_pathways (~1,500 records)
📊 pathway_courses (~9,000 records)
📊 embeddings (15,000+ records) ← NEW
📊 sources (3 records) ← NEW
```

## 🎯 Key Features

### ✅ Complete Course Knowledge
- All 15,510+ courses across UH system
- Semantic search finds relevant courses
- Prerequisite information
- Department and campus filtering

### ✅ Complete Program Knowledge
- All 196 degree programs
- Filter by major, degree type, campus
- Complete program details
- Duration and credit information

### ✅ Complete Pathway Knowledge
- Semester-by-semester plans
- All required courses
- Gen Ed and elective identification
- Course categories and notes

### ✅ Intelligent Search
- Vector-based semantic search
- Natural language understanding
- Context-aware responses
- Cross-referenced data

## 📚 Documentation

- **Full Guide:** [RAG_CHATBOT_GUIDE.md](./RAG_CHATBOT_GUIDE.md)
- **Implementation Summary:** [RAG_IMPLEMENTATION_SUMMARY.md](./RAG_IMPLEMENTATION_SUMMARY.md)
- **Database Schema:** [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- **Database Summary:** [DATABASE_IMPLEMENTATION_SUMMARY.md](./DATABASE_IMPLEMENTATION_SUMMARY.md)

## 🎓 Support

If you encounter issues:

1. Check this quickstart guide
2. Review the full guide: `RAG_CHATBOT_GUIDE.md`
3. Check database connectivity and data
4. Verify embeddings were generated
5. Review console logs for errors

## ✨ Success Checklist

After setup, verify:

- [x] Database has 15,510+ courses
- [x] Database has 196 degree programs
- [x] Database has ~1,500 pathway records
- [x] Embeddings table has 15,000+ records
- [x] pgvector extension is enabled
- [x] OpenAI API key is configured
- [x] Chat API responds to test queries
- [x] getDegreeProgram tool works
- [x] getPathway tool works
- [x] getCourse with semantic search works
- [x] No console errors

---

**Status:** ✅ Ready to Use

The enhanced RAG chatbot is now fully operational with complete knowledge of all UH system courses and degree programs!
