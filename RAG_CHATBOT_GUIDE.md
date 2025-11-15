# RAG Chatbot Implementation Guide

## 🎉 Overview

The RAG (Retrieval-Augmented Generation) chatbot has been completely re-implemented to leverage the comprehensive database of **all UH system courses and degree pathways**. The chatbot can now intelligently answer questions about any course or degree program using semantic search and structured database queries.

## ✨ New Capabilities

### 1. **Comprehensive Course Knowledge**
- Search for any course by code (e.g., "ICS 211", "ENG 100")
- Semantic search across all 15,510+ courses
- Get detailed course information including prerequisites
- Find courses by keywords across all campuses

### 2. **Degree Program Intelligence**
- Search all 196 degree programs across the UH system
- Filter by major, degree type (BA, BS, AA, etc.), or campus
- Get complete program details: credits, duration, tracks
- View semester-by-semester pathways for any program

### 3. **Pathway & Roadmap Generation**
- Retrieve complete academic pathways from the database
- Display semester-by-semester course plans
- Show all required courses organized by year and semester
- Generate customized roadmaps based on actual program data

## 🚀 Setup Instructions

### Step 1: Generate Embeddings

Before the chatbot can use semantic search, you need to generate embeddings for all courses and degree programs:

```bash
# Make sure your database is populated with courses and degree programs
# Then run the embeddings generation script:
npx tsx -r dotenv/config scripts/generate-embeddings.ts
```

This script will:
- Generate embeddings for all 15,510+ courses
- Generate embeddings for all 196 degree programs
- Generate embeddings for detailed pathway information
- Populate the `embeddings` table for semantic search

**Note:** This process takes 15-30 minutes and makes API calls to OpenAI for embedding generation. Make sure you have:
- A valid OpenAI API key in your `.env` file
- Sufficient API credits
- A stable internet connection

### Step 2: Verify Embeddings

You can verify that embeddings were created successfully:

```bash
# Check the embeddings table
psql $DATABASE_URL -c "SELECT COUNT(*) FROM embeddings;"
```

You should see thousands of embeddings (approximately 15,000+ for courses plus additional for programs and pathways).

## 🛠️ New Tools Added

### `getDegreeProgram`
Search for degree programs by major name, degree type, or campus.

**Parameters:**
- `query` (optional): Major name or keyword (e.g., "Computer Science", "Business")
- `campus` (optional): Campus name filter (e.g., "UH Manoa", "Leeward CC")
- `degreeType` (optional): Degree type filter (e.g., "BA", "BS", "AA")
- `limit` (optional): Maximum results (default: 20)

**Returns:**
- List of matching degree programs with details
- Credits, duration, available tracks
- Campus and degree information

**Example Usage:**
- "Show me Computer Science programs"
- "What BS degrees are available at UH Manoa?"
- "Find all Business programs in the UH system"

### `getPathway`
Get the complete semester-by-semester academic pathway for a degree program.

**Parameters:**
- `programId` (optional): The degree program ID from getDegreeProgram results
- `majorName` (optional): Major name if programId not available
- `campusId` (optional): Campus ID to help find the program

**Returns:**
- Complete pathway organized by year and semester
- All required courses with credits
- Course categories (Gen Ed, Elective, etc.)
- Notes and alternative course options

**Example Usage:**
- "Show me the pathway for Computer Science BS at UH Manoa"
- "What's the semester plan for a Business degree?"
- "Give me the roadmap for Environmental Science"

## 📊 RAG Context System

### Semantic Search
The chatbot uses vector embeddings and cosine similarity to find relevant courses and programs based on user queries. The `semanticSearch` function:

- Generates embeddings for user queries
- Searches the embeddings table using pgvector
- Returns top-N most relevant results with similarity scores
- Filters results by a similarity threshold (default: 0.3)

### Context Builder
The `rag-context.ts` utility provides several functions for building rich context:

#### `buildRagContext(query, options)`
Main function that builds comprehensive context from a user query.

**Features:**
- Semantic search across courses and programs
- Automatic relevance ranking
- Context summarization
- Configurable limits and filters

#### `getCourseContext(courseCode, campusId?)`
Get detailed information about a specific course.

#### `getProgramContext(programId)`
Get detailed information about a degree program with pathway summary.

#### `findRelatedCourses(keywords, campusId?, limit)`
Search for courses using keyword matching.

## 🎯 How It Works

### 1. User Query Processing
When a user asks a question:

1. **Query Analysis**: The AI analyzes the query to determine intent
2. **Tool Selection**: Appropriate tools are selected (getCourse, getDegreeProgram, getPathway, etc.)
3. **Semantic Enhancement**: Semantic search finds relevant courses/programs
4. **Context Building**: Rich context is assembled from database queries
5. **Response Generation**: AI generates a natural response using the structured data

### 2. Intelligent Tool Orchestration
The system follows an intelligent workflow:

**For "What should I study?" queries:**
1. Use `getDegreeProgram` to show relevant programs
2. Use `getPathway` to show detailed semester plans
3. Explain requirements using formatted output

**For specific major queries:**
1. Use `getDegreeProgram` to find the program
2. Display program details (credits, duration, campus)
3. Offer to show full pathway with `getPathway`
4. Call `getPathway` with programId when accepted

**For course queries:**
1. Use `getCourse` for exact lookups or semantic search
2. Display course details and metadata
3. Use `parsePrereqs` for prerequisite information

### 3. Response Formatting
All tools return a consistent structure:
```typescript
{
  found: boolean;          // Whether results were found
  formatted: string;       // Pre-formatted text to display
  message?: string;        // Error/help message if not found
  error?: boolean;         // If system error occurred
  // Additional data fields...
}
```

The AI checks `found` and displays either `formatted` (success) or `message` (not found).

## 📝 Database Schema

### Embeddings Table
```sql
CREATE TABLE embeddings (
  id SERIAL PRIMARY KEY,
  source_id TEXT NOT NULL,           -- Source identifier
  ref_id TEXT,                       -- Reference ID (course code, program ID)
  title TEXT,                        -- Display title
  campus_id TEXT,                    -- Campus foreign key
  course_id INTEGER,                 -- Course foreign key
  content TEXT,                      -- Searchable content
  metadata JSONB,                    -- Additional metadata
  content_hash TEXT,                 -- Hash for deduplication
  embedding VECTOR(1536),            -- Vector embedding
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX embedding_vector_idx ON embeddings 
  USING ivfflat (embedding vector_cosine_ops);
```

### Sources Table
```sql
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  type TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables
Ensure these are set in your `.env` file:

```bash
# OpenAI API Key (required for embeddings and chat)
OPENAI_API_KEY=sk-...

# Database URL
DATABASE_URL=postgresql://...

# Optional: Adjust embedding model
# Default: text-embedding-3-small
```

### Semantic Search Parameters

In `lib/semantic-search.tsx`:
```typescript
export async function semanticSearch(
    query: string,
    limit: number = 5,        // Max results to return
    threshold: number = 0.3   // Minimum similarity score (0-1)
)
```

Adjust these parameters based on your needs:
- **Higher threshold (0.4-0.6)**: More relevant but fewer results
- **Lower threshold (0.2-0.3)**: More results but potentially less relevant
- **Higher limit (10-20)**: More comprehensive context for complex queries

## 🚨 Troubleshooting

### Embeddings Not Working
```bash
# Check if embeddings table has data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM embeddings;"

# If empty, regenerate embeddings
npx tsx -r dotenv/config scripts/generate-embeddings.ts
```

### Semantic Search Returning No Results
- Check the similarity threshold (lower it if needed)
- Verify embeddings exist for your query domain
- Ensure the pgvector extension is enabled

### Tool Errors
All tools are designed to fail gracefully:
- Check database connectivity
- Verify tables exist and have data
- Review console logs for specific errors

### Performance Issues
- Ensure indexes are created (run migrations)
- Check database connection pool settings
- Monitor OpenAI API rate limits

## 📈 Future Enhancements

Potential improvements to consider:

1. **Caching**: Cache frequent queries and embeddings
2. **Hybrid Search**: Combine semantic + keyword search
3. **User Context**: Remember user's campus/major preferences
4. **Prerequisites Graph**: Visualize course dependencies
5. **Personalization**: Tailor results based on user history
6. **Advanced Filters**: Filter by credits, difficulty, schedule
7. **Course Reviews**: Integrate student feedback
8. **Career Alignment**: Link programs to career outcomes

## 📚 Additional Resources

- [Database Schema Documentation](./DATABASE_SCHEMA.md)
- [Database Implementation Summary](./DATABASE_IMPLEMENTATION_SUMMARY.md)
- [Database Visual Diagram](./DATABASE_VISUAL_DIAGRAM.md)
- [Query Examples](./examples/api-usage-examples.tsx)

## 🎓 Testing the Chatbot

Try these sample queries:

**Course Queries:**
- "Tell me about ICS 111"
- "Show me all computer science courses"
- "What biology courses are available?"
- "Find courses about machine learning"

**Program Queries:**
- "What Computer Science programs are available?"
- "Show me Business degrees at UH Manoa"
- "What's the difference between BA and BS in Psychology?"

**Pathway Queries:**
- "Show me the pathway for Computer Science BS"
- "What courses do I take for a Business degree?"
- "Give me a semester-by-semester plan for Engineering"

**Combined Queries:**
- "I want to study AI and machine learning, what programs are available?"
- "What prerequisites do I need for ICS 311?"
- "How long does it take to get a BS in Computer Science?"

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Database has courses and degree programs
- [ ] Embeddings table is populated (15,000+ records)
- [ ] pgvector extension is enabled
- [ ] OpenAI API key is configured
- [ ] Chat API responds to queries
- [ ] getDegreeProgram tool works
- [ ] getPathway tool works
- [ ] getCourse with semantic search works
- [ ] Tool responses are formatted correctly
- [ ] No console errors in chat API

---

**Status**: ✅ Fully Implemented and Ready for Use

The RAG chatbot now has complete access to all UH system courses and degree pathways through the database, enabling intelligent and accurate responses to student queries.
