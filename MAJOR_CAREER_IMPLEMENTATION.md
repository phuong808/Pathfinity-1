# UH Manoa Major-Career Pathway Implementation

This document describes the database implementation for storing and retrieving UH Manoa major-to-career pathway mappings, **including RAG embeddings for intelligent chatbot responses**.

## Features

✅ **Database Storage**: Normalized storage of 97 majors and 382 career pathways  
✅ **Fast Retrieval**: Optimized indexes for O(log n) query performance  
✅ **API Endpoints**: RESTful APIs for accessing major-career data  
✅ **Semantic Search**: Vector embeddings enable natural language queries  
✅ **RAG Integration**: Chatbot can intelligently answer career-related questions

## Database Schema

### Tables Created

#### 1. `major_career_mappings`
Stores the relationship between majors and their career pathways.

**Columns:**
- `id` (serial, primary key)
- `campus_id` (text, FK to campuses)
- `major_name` (text) - e.g., "Accounting - BS"
- `degree_type` (text) - e.g., "BS", "BA", "MACC"
- `credits` (integer) - Total credits required
- `career_pathway_ids` (jsonb) - Array of career pathway IDs
- `created_at`, `updated_at` (timestamps)

**Indexes for Fast Retrieval:**
- `major_career_campus_major_idx` - Composite index on (campus_id, major_name) for O(log n) lookups
- `major_career_degree_type_idx` - Index on degree_type for filtering
- `major_career_unique_idx` - Unique constraint on (campus_id, major_name)

#### 2. `career_pathways`
Normalized storage of career titles to prevent duplication.

**Columns:**
- `id` (serial, primary key)
- `title` (text, unique) - e.g., "Tax Accountant"
- `normalized_title` (text) - Lowercase version for case-insensitive searches
- `category` (text, nullable) - Career category/field
- `description` (text, nullable)
- `metadata` (jsonb, nullable)
- `created_at`, `updated_at` (timestamps)

**Indexes:**
- `career_pathway_title_idx` - Fast lookup by exact title
- `career_pathway_normalized_idx` - Case-insensitive search
- `career_pathway_category_idx` - Category filtering

## Query Functions

Located in `/app/db/queries.ts`:

### Major Queries
- `getMajorsByCampus(campusId)` - Get all majors for a campus
- `getMajorByName(campusId, majorName)` - Get specific major
- `getMajorsByDegreeType(campusId, degreeType)` - Filter by degree type
- `searchMajors(campusId, searchTerm)` - Search with partial matching
- `getMajorWithCareerPathways(campusId, majorName)` - Get major with full career details
- `getMajorCareerStats(campusId)` - Get statistics

### Career Queries
- `getAllCareerPathways()` - Get all careers
- `getCareerPathwayById(id)` - Get by ID
- `getCareerPathwayByTitle(title)` - Case-insensitive title lookup
- `getCareerPathwaysByCategory(category)` - Filter by category
- `getMajorsForCareer(campusId, careerTitle)` - Reverse lookup: find majors for a career

## API Endpoints

### `/api/major-careers`
- `GET` - List all majors
- `GET ?major=name` - Get specific major with careers
- `GET ?degreeType=BS` - Filter by degree type
- `GET ?search=term` - Search majors
- `GET ?stats=true` - Include statistics

### `/api/major-careers/[id]`
- `GET` - Get major by ID with career pathways

### `/api/career-pathways`
- `GET` - List all career pathways
- `GET ?title=name` - Get specific career
- `GET ?category=name` - Filter by category
- `GET ?findMajors=title` - Find majors that lead to this career

## Data Ingestion

### Script: `scripts/ingest/uh-manoa-majors-careers.ts`

**Run with:**
```bash
npm run ingest:uh-manoa-careers
```

**What it does:**
1. Ensures UH Manoa campus exists in database
2. Reads `public/uh_manoa_majors_careers_match.json`
3. Creates/updates career pathway entries (normalized)
4. Creates/updates major-career mappings
5. Provides progress feedback and statistics

## Setup Instructions

### 1. Generate Database Migration
```bash
npm run db:generate
```

### 2. Apply Migration
```bash
npm run db:migrate
# or for direct push
npm run db:push
```

### 3. Ingest Data
```bash
npm run ingest:uh-manoa-careers
```

### 4. Generate Embeddings for RAG Chatbot
```bash
npm run generate:major-career-embeddings
```

This will create embeddings for:
- 97 major-career mappings (each major with its career pathways)
- 382 individual career pathways (with related majors)

The chatbot can now semantically understand and answer questions like:
- "What careers can I pursue with a Computer Science degree?"
- "What should I study to become a software engineer?"
- "What are the best majors for healthcare careers?"
- "Tell me about career options for Business majors"

## Performance Optimizations

### Indexing Strategy
1. **Composite index** on (campus_id, major_name) for primary lookups
2. **JSONB array indexing** using GIN operator for career pathway searches
3. **Normalized storage** of career pathways to reduce duplication
4. **Denormalized IDs** in major_career_mappings for fast joins

### Query Optimization
- Single-query retrieval for major with careers using `inArray()`
- Batch operations for ingestion
- Prepared statements via Drizzle ORM

### Expected Performance
- Major lookup by name: **O(log n)** - ~0.5ms for 100 majors
- Career pathways for major: **O(k log n)** where k = number of careers - ~1-2ms
- Search queries: **O(m)** where m = matches - ~2-5ms
- Reverse lookup (careers to majors): **O(n)** with JSONB containment - ~5-10ms

## Usage Examples

### Get all majors
```typescript
import { getMajorsByCampus } from "@/app/db/queries";
const majors = await getMajorsByCampus("uh-manoa");
```

### Get career pathways for a major
```typescript
import { getCareerPathwaysForMajor } from "@/app/db/queries";
const careers = await getCareerPathwaysForMajor("uh-manoa", "Accounting - BS");
```

### Find majors for a career
```typescript
import { getMajorsForCareer } from "@/app/db/queries";
const majors = await getMajorsForCareer("uh-manoa", "Software Engineer");
```

### API Usage
```bash
# Get all majors
curl http://localhost:3000/api/major-careers

# Get specific major with careers
curl http://localhost:3000/api/major-careers?major=Accounting%20-%20BS

# Search majors
curl http://localhost:3000/api/major-careers?search=computer

# Find majors that lead to a career
curl http://localhost:3000/api/career-pathways?findMajors=Software%20Engineer
```

## Data Structure

### Source JSON Format
```json
{
  "majors_career_pathways": [
    {
      "id": 1,
      "major": "Accounting - BS",
      "credits": 120,
      "degree_type": "BS",
      "career_pathways": [
        "Tax Accountant",
        "CPA (Certified Public Accountant)",
        ...
      ]
    }
  ]
}
```

### Database Storage
- **97 majors** stored in `major_career_mappings`
- **~300-400 unique careers** stored in `career_pathways` (normalized)
- Average **5-10 career pathways per major**

## Future Enhancements

1. **Career Categories** - Populate category field using O*NET API
2. **Embeddings** - ✅ COMPLETED - Vector embeddings for semantic search
3. **Skills Mapping** - Link careers to required skills
4. **Salary Data** - Integrate with labor market APIs
5. **Course Relationships** - Link majors to degree programs and pathways

## RAG Chatbot Integration

### Embedding Generation

The system generates two types of embeddings:

1. **Major Embeddings** (97 total)
   - Contains major name, degree type, credits
   - Lists all career pathways
   - Natural language descriptions for semantic matching
   - Example: "Students who graduate with a Computer Science - BS degree can pursue careers as: Software Engineer, Data Scientist, Web Developer..."

2. **Career Pathway Embeddings** (382 total)
   - Contains career title and category
   - Lists related majors (reverse mapping)
   - Natural language descriptions
   - Example: "To become a Software Engineer, you can study: Computer Science - BS, Information & Computer Sciences - BS..."

### RAG Context Functions

Located in `lib/rag-context.ts`:

#### `buildRagContext(userQuery, options)`
Enhanced to include major-career pathway results from semantic search. Returns:
- Relevant courses
- Relevant degree programs  
- **Relevant major-career mappings** (NEW)

#### `getMajorCareerContext(majorName, campusId)`
Get specific major with all its career pathways:
```typescript
const context = await getMajorCareerContext("Computer Science - BS");
// Returns: { major: {...}, careers: [...] }
```

#### `findMajorsForCareer(careerTitle, campusId)`
Reverse lookup - find majors that lead to a specific career:
```typescript
const majors = await findMajorsForCareer("Software Engineer");
// Returns: [{ majorName, degreeType, credits }, ...]
```

### How It Works

1. **User asks a question** about careers or majors
2. **Semantic search** finds relevant embeddings using cosine similarity
3. **RAG context builder** enriches the response with:
   - Major-career mappings
   - Individual career pathways
   - Related majors for specific careers
4. **Chatbot** receives context and provides intelligent, data-backed answers

### Example Queries

The chatbot can now answer:

```
User: "What can I do with a Computer Science degree?"
→ Retrieves Computer Science major embedding
→ Returns: Software Engineer, Data Scientist, Web Developer, etc.

User: "What should I study to become a marine biologist?"
→ Retrieves Marine Biologist career embedding
→ Returns: Marine Biology - BS, Oceanography - BS, etc.

User: "Tell me about healthcare careers at UH Manoa"
→ Semantic search across all embeddings
→ Returns: Nursing majors, Medical Technology, Public Health, etc.

User: "I want to work in finance, what major should I choose?"
→ Searches career embeddings for finance-related careers
→ Returns: Accounting, Finance, Economics majors with relevant careers
```

### Embedding Metadata

Each embedding stores rich metadata for filtering and analytics:

**Major Embeddings:**
```json
{
  "majorId": 42,
  "majorName": "Computer Science - BS",
  "degreeType": "BS",
  "credits": "120",
  "careerCount": 15
}
```

**Career Embeddings:**
```json
{
  "careerId": 156,
  "careerTitle": "Software Engineer",
  "category": "Technology",
  "relatedMajorsCount": 8
}
```
