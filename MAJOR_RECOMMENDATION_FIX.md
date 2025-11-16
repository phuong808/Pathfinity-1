# Major Recommendations Fix - UH Manoa JSON Direct Read

## Problem
The chatbot couldn't find relevant majors when users said "I want to become a software engineer" because:
1. The `degree_programs` table in the database was **empty** (0 records at UH Manoa)
2. The tool was trying to query the database which had no data
3. Users were getting "couldn't find majors" errors

## Root Cause
The `getMajorRecommendations` tool was querying the `degree_programs` database table, but:
- The database had not been seeded with UH Manoa program data
- The table was completely empty (verified with test query showing 0 programs)

## Solution
**Completely rewrote** `lib/tools/get-major-recommendations.ts` to:
1. **Read directly from JSON file** (`public/uh_manoa_majors_careers_match.json`)
2. **Skip database entirely** - no dependency on seeding
3. **Use official UH Manoa career-major mappings** from the JSON file

## Technical Changes

### Before (Database Approach)
```typescript
// Queried degree_programs table
const programs = await db
  .select({...})
  .from(degreeProgram)
  .where(/* keyword matching */)
```

### After (JSON Direct Read)
```typescript
// Read from JSON file
const jsonPath = path.join(process.cwd(), 'public', 'uh_manoa_majors_careers_match.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

// Match career paths in the JSON data
for (const major of data.majors_career_pathways) {
  for (const career of major.career_pathways) {
    // Score based on matching
  }
}
```

## Matching Algorithm

The new tool uses intelligent scoring:
1. **Perfect match** (e.g., "software engineer" = "Software Engineer"): +100 points
2. **Contains match** (e.g., "engineer" in "Software Engineer"): +50 points  
3. **Keyword match** (word-by-word matching): +10 points per word
4. **Major title match**: +20 points if career words appear in major name

## Data Verification

Verified JSON file contains 97 majors with career pathways:
```bash
$ node scripts/simple-test.js
📚 Total majors in file: 97

🔍 Searching for: software engineer

✅ Found matches:
  - Computer Science - BS: Software Engineer
  - Computer Science - BA: Software Developer
```

## Benefits

1. **✅ Works immediately** - No database seeding required
2. **✅ Accurate** - Uses official UH Manoa career-major mappings
3. **✅ Fast** - JSON read is instant (no database queries)
4. **✅ Reliable** - No dependency on database state
5. **✅ UH Manoa only** - JSON file contains only UH Manoa majors (as required)

## Files Changed

1. **`lib/tools/get-major-recommendations.ts`** - Complete rewrite (266 lines → 158 lines)
   - Removed: Database queries, keyword mapping dictionary
   - Added: JSON file reading, career pathway matching
   - Simplified: Direct matching against official data

2. **`app/api/chat/route.ts`** - Enhanced system prompt
   - Added explicit instructions to call `getMajorRecommendations` immediately
   - Added critical rule #12 for major recommendations
   - Updated tool description with usage triggers

## Testing

### Test Cases
1. **"software engineer"** → Should return Computer Science (BS/BA)
2. **"doctor"** → Should return Biology, Chemistry, Biochemistry
3. **"teacher"** → Should return Education programs
4. **"accountant"** → Should return Accounting programs

### How to Test
1. Go to http://localhost:3000/Chat
2. Say: "I want to become a software engineer"
3. When asked, say: "yes can you help me find relevant program"
4. Should immediately show 5 UH Manoa majors with Computer Science at the top

## Expected Result

**Before (Broken):**
```
User: "I want to become a software engineer"
Bot: "What major are you considering?"
User: "yes can you help me find relevant program"
Bot: "It seems I couldn't find specific majors using 'software engineer'..."
```

**After (Fixed):**
```
User: "I want to become a software engineer"
Bot: "That's fantastic! Software engineering is a promising field. Would you like me to suggest some relevant programs?"
User: "yes can you help me find relevant program"
Bot: "Based on your interest in software engineer, here are the best matching majors at UH Manoa:
1. Computer Science - BS
2. Computer Science - BA
3. Computer Engineering - BS
4. Information and Computer Sciences - BS
5. [...]"
```

## Notes

- **Focus: UH Manoa only** - JSON file and tool only handle UH Manoa programs
- **No database dependency** - Tool works even if database is empty
- **Career pathway data** - JSON contains actual career outcomes for each major
- **Removed `preferredCampus` parameter** - Since we only have UH Manoa data

## Next Steps

If database approach is preferred in future:
1. Run: `npm run ingest:uh-manoa-careers` to seed the database
2. Revert to database-query version of the tool
3. But current JSON approach is simpler and faster for UH Manoa-only use case
