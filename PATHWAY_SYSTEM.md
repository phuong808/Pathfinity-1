# Degree Pathway System - Implementation Guide

## Overview
This implementation adds a complete degree pathway management system to Pathfinity, allowing users to:
- Load degree pathways from JSON files into the database
- View available pathways in a dropdown
- Visualize 4-year academic roadmaps with courses, activities, internships, and milestones
- Interactively edit and customize their pathways

## Architecture

### 1. Database Schema (`app/db/schema.ts`)
Added a `pathways` table with the following structure:
```typescript
- id: serial (auto-increment)
- programName: text (unique) - e.g., "Bachelor of Arts (BA) in Cinematic Arts"
- institution: text - e.g., "University of Hawaiʻi at Mānoa"
- totalCredits: text - Total credits required
- pathwayData: jsonb - Full pathway JSON structure
- createdAt: timestamp
- updatedAt: timestamp
```

### 2. Ingestion Script (`scripts/ingest/ingest-pathways.ts`)
- Reads pathway data from `app/db/data/manoa_degree_pathways.json`
- Supports both single pathway objects and arrays of pathways
- Handles duplicates by updating existing records
- Provides detailed logging and error handling

### 3. API Endpoint (`app/api/pathways/route.ts`)
REST API for accessing pathway data:
- `GET /api/pathways` - List all pathways (metadata only)
- `GET /api/pathways?id=1` - Get specific pathway by ID (includes full data)
- `GET /api/pathways?programName=Bachelor%20of%20Arts...` - Get by program name

### 4. Roadmap Page (`app/(with-sidebar)/Roadmap/page.tsx`)
Enhanced with:
- Dynamic pathway loading from database
- Dropdown selector for available pathways
- Automatic roadmap generation from pathway data
- Loading states and error handling
- Support for courses, activities, internships, and milestones

## Pathway JSON Structure

```json
{
  "program_name": "Program Name",
  "institution": "Institution Name",
  "total_credits": 120,
  "years": [
    {
      "year_number": 1,
      "semesters": [
        {
          "semester_name": "fall_semester",
          "credits": 15,
          "courses": [
            {
              "name": "COURSE 101",
              "credits": 3
            }
          ],
          "activities": ["Activity 1", "Activity 2"],
          "internships": ["Internship opportunity"],
          "milestones": ["Important milestone"]
        }
      ]
    }
  ]
}
```

## Setup Instructions

### 1. Database Setup
The pathways table has been created automatically via `drizzle-kit push`.

### 2. Add Your Pathway Data
Place your pathway JSON file(s) in:
```
app/db/data/manoa_degree_pathways.json
```

The file can contain:
- A single pathway object
- An array of pathway objects

### 3. Run the Ingestion Script
```bash
npx tsx scripts/ingest/ingest-pathways.ts
```

Or add to package.json:
```json
{
  "scripts": {
    "ingest-pathways": "tsx scripts/ingest/ingest-pathways.ts"
  }
}
```

Then run:
```bash
npm run ingest-pathways
```

### 4. View in the App
1. Start the development server: `npm run dev`
2. Navigate to the Roadmap page
3. Select a pathway from the dropdown
4. The roadmap will automatically generate with all courses, activities, internships, and milestones

## Features

### Automatic Roadmap Generation
- Converts pathway JSON to interactive React Flow nodes and edges
- Positions nodes automatically in a 4-year grid layout
- Connects semesters sequentially with animated edges
- Includes start and career-ready nodes

### Visual Elements
- **Courses**: Blue nodes with course codes and credits
- **Activities**: Orange emoji markers (🎯)
- **Internships**: Purple markers (💼)
- **Milestones**: Gold markers (⭐)

### Interactive Features
- Click nodes to view/edit details
- Drag to rearrange layout
- Add custom nodes
- Connect nodes with new edges
- Customize colors and styling
- Zoom and pan controls

## Adding More Pathways

### Option 1: Update the JSON File
Add more pathway objects to `manoa_degree_pathways.json` and re-run the ingestion script.

### Option 2: Individual Files
Create separate JSON files and update the ingestion script to read from multiple files:

```typescript
const files = [
  'manoa_degree_pathways.json',
  'engineering_pathways.json',
  'business_pathways.json',
];

for (const file of files) {
  // Process each file
}
```

### Option 3: API/Database Import
Modify the ingestion script to fetch from an external API or database.

## Customization

### Node Positioning
Adjust spacing in `pathwayToNodesAndEdges()` function:
```typescript
const xOffset = 400;  // Left margin
const xSpacing = 350; // Horizontal space between semesters
const yOffset = 50;   // Top margin
const ySpacing = 300; // Vertical space between years
```

### Colors
Modify `MANOA_COLORS` constant in `page.tsx`:
```typescript
const MANOA_COLORS = {
  course: '#3498db',      // Course nodes
  activity: '#e67e22',    // Activities
  internship: '#9b59b6',  // Internships
  milestone: '#f39c12',   // Milestones
  // ... more colors
};
```

### Semester Names
Update `SEMESTER_NAMES` mapping:
```typescript
const SEMESTER_NAMES: Record<string, string> = {
  fall_semester: '🍂 Fall',
  spring_semester: '🌸 Spring',
  summer_semester: '☀️ Summer',
  winter_semester: '❄️ Winter', // Add more as needed
};
```

## Troubleshooting

### Pathways Not Showing
1. Check database connection
2. Verify ingestion script ran successfully
3. Check browser console for API errors
4. Ensure pathway data is valid JSON

### Roadmap Not Generating
1. Verify pathway has valid structure
2. Check that `pathwayData` field is populated in database
3. Look for console errors in browser dev tools

### Duplicate Pathways
The ingestion script automatically updates existing pathways by `programName`. To force recreation, delete from database first:
```sql
DELETE FROM pathways WHERE program_name = 'Program Name';
```

## Future Enhancements

Potential improvements:
- Save custom pathway edits per user
- Export pathway as PDF/image
- Progress tracking (completed courses)
- GPA calculator integration
- Course prerequisite validation
- Drag-and-drop course scheduling
- Multi-semester planning view
- Share pathways with advisors

## Example Data

A sample pathway for "Bachelor of Arts (BA) in Cinematic Arts (Animation Track)" is included in the repository. It demonstrates:
- 4 years of courses
- Fall, Spring, and Summer semesters
- Course credits and codes
- Recommended activities
- Internship opportunities
- Academic milestones

## File Locations

- Schema: `app/db/schema.ts` (line with `export const pathway`)
- Ingestion: `scripts/ingest/ingest-pathways.ts`
- API: `app/api/pathways/route.ts`
- UI: `app/(with-sidebar)/Roadmap/page.tsx`
- Data: `app/db/data/manoa_degree_pathways.json`
