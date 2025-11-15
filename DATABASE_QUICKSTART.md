# 🎓 UH System Database - Quick Start Guide

## 📋 What's Been Implemented

A **fully optimized PostgreSQL database** storing all degree pathways and courses from:
- ✅ UH Mānoa (9,055 courses, 195 programs)
- ✅ All 10 UH Community Colleges (6,455 courses, 1 program)
- ✅ Complete 4-year pathways with semester-by-semester course layouts

## 🚀 Quick Start

### 1. Database is Already Set Up! ✅

The schema has been applied and all data is loaded. You're ready to use it!

### 2. Using the Database in Your Code

```typescript
// Import query functions
import { 
  searchDegreePrograms, 
  getCompletePathway,
  getCourseByCode 
} from "@/app/db/queries";

// Search for programs
const programs = await searchDegreePrograms("Computer Science");

// Get full 4-year pathway
const pathway = await getCompletePathway(programs[0].program.id);

// Find a course
const course = await getCourseByCode("manoa", "ICS", "111");
```

### 3. Test the Database

```bash
npx tsx scripts/test-database.ts
```

## 📚 Available Query Functions

### Campus Queries
```typescript
getAllCampuses(type?)           // Get all campuses
getCampusById(campusId)         // Get specific campus
```

### Course Queries  
```typescript
getCoursesByCampus(campusId)                        // All courses (~90ms)
getCourseByCode(campusId, prefix, number)           // Find course (~75ms)
searchCourses(campusId?, keyword, limit?)           // Search (~75ms)
getCoursesByDepartment(campusId, deptName)          // By department
```

### Degree Program Queries
```typescript
getDegreeProgramsByCampus(campusId)                 // All programs (~240ms)
getDegreeProgramsByLevel(level)                     // By level
searchDegreePrograms(keyword, limit?)               // Search (~80ms)
getDegreeProgramById(programId)                     // Specific program
```

### Pathway Queries (Most Important)
```typescript
getCompletePathway(programId)                       // Full pathway (~155ms)
getPathwayByYear(programId, yearNumber)             // Single year
getGeneralEducationCourses(programId)               // Gen ed reqs
getElectives(programId)                             // Electives
```

### Analytics
```typescript
getCourseCountByCampus()                            // Statistics
getProgramCountByCampus()                           // Distribution
getCreditDistribution()                             // Credit analysis
```

## 📊 What's in the Database

| Table | Records | Description |
|-------|---------|-------------|
| **campuses** | 11 | UH system campuses |
| **courses** | 15,510 | All courses across campuses |
| **degrees** | 15+ | Degree types (BA, BS, AA, etc.) |
| **degree_programs** | 196 | Specific degree programs |
| **degree_pathways** | ~1,500 | Semester records |
| **pathway_courses** | ~9,000 | Course-semester links |

## ⚡ Performance

All queries under **250ms**:
- Campus queries: ~75ms
- Course lookups: ~75-90ms
- Pathway retrieval: ~155ms
- Search operations: ~75-240ms

## 🔧 Maintenance

### Re-seed Database
```bash
npx tsx scripts/seed/seed-all-pathways-courses.ts
```

### Apply Schema Changes
```bash
npx drizzle-kit push
```

### Test Functionality
```bash
npx tsx scripts/test-database.ts
```

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `DATABASE_SCHEMA.md` | Complete schema documentation |
| `DATABASE_IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `DATABASE_VISUAL_DIAGRAM.md` | Visual schema diagrams |
| `examples/api-usage-examples.tsx` | API route examples |

## 🎯 Common Use Cases

### Use Case 1: Display Degree Pathway
```typescript
// In a Next.js page
export default async function ProgramPage({ params }) {
  const program = await getDegreeProgramById(params.id);
  const pathway = await getCompletePathway(params.id);
  
  return (
    <div>
      <h1>{program.program.programName}</h1>
      {/* Render pathway by year/semester */}
    </div>
  );
}
```

### Use Case 2: Course Search API
```typescript
// app/api/courses/search/route.ts
export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("q");
  const results = await searchCourses(undefined, keyword, 50);
  return NextResponse.json({ results });
}
```

### Use Case 3: Program Recommendations
```typescript
// Find programs by major
const csPrograms = await searchDegreePrograms("Computer Science");

// Get all programs at a campus
const manoaPrograms = await getDegreeProgramsByCampus("manoa");

// Filter by degree level
const bachelorPrograms = await getDegreeProgramsByLevel("baccalaureate");
```

## 🏗️ Database Schema (Simplified)

```
campuses
  └─► courses (15,510 records)
  └─► degree_programs (196 records)
        └─► degree_pathways (~1,500 semesters)
              └─► pathway_courses (~9,000 links)
```

## ✨ Key Features

### 1. **Normalized Structure**
- Courses stored once, referenced by pathways
- ~90% storage reduction vs. JSON
- Easy updates without duplication

### 2. **Optimized Indexes**
- 19 strategic indexes
- Fast lookups on frequently queried columns
- Composite indexes for complex queries

### 3. **Type Safety**
- Full TypeScript support
- Drizzle ORM integration
- Auto-completion in IDE

### 4. **Flexible Queries**
- Pre-built query functions
- Easy to extend
- Supports pagination

## 🎓 Example: Complete Workflow

```typescript
// 1. Search for a program
const programs = await searchDegreePrograms("Computer Science");
// Returns: 7 programs in ~80ms

// 2. Get the first program's details
const program = programs[0];
console.log(program.program.programName);
// "Bachelor of Science (BS) in Computer Science"

// 3. Get complete 4-year pathway
const pathway = await getCompletePathway(program.program.id);
// Returns: 12 semesters with all courses in ~155ms

// 4. Get general education requirements
const genEd = await getGeneralEducationCourses(program.program.id);
// Returns: All gen ed courses by category

// 5. Look up a specific course
const course = await getCourseByCode("manoa", "ICS", "111");
// Returns: Course details in ~75ms
```

## 🔗 Related Files

### Schema & Queries
- `/app/db/schema.ts` - Database schema
- `/app/db/queries.ts` - Query functions

### Scripts
- `/scripts/seed/seed-all-pathways-courses.ts` - Seed script
- `/scripts/test-database.ts` - Test script
- `/scripts/enable-vector.ts` - Extension setup

### Data Files
- `/app/db/data/*.json` - Source data files

## 💡 Tips

1. **Use Server Components** for direct database queries
2. **Cache Results** with Next.js `revalidate` 
3. **Paginate** large result sets
4. **Index Custom Queries** if you add new patterns
5. **Use Transactions** for data updates

## 🆘 Troubleshooting

### Query is Slow
- Check if relevant indexes exist
- Use `EXPLAIN ANALYZE` to debug
- Consider adding specific index

### Data Out of Sync
- Re-run seed script
- Check for constraint violations
- Verify foreign key relationships

### Type Errors
- Regenerate Drizzle types: `npx drizzle-kit generate`
- Check import paths
- Verify schema matches database

## 📬 Support

For detailed information:
- Schema: `DATABASE_SCHEMA.md`
- Examples: `examples/api-usage-examples.tsx`
- Diagrams: `DATABASE_VISUAL_DIAGRAM.md`

---

**Status**: ✅ **READY TO USE** - Database is fully operational!
