# Pathway System - File-Based Implementation

## Overview
The pathway system now reads directly from `app/db/data/manoa_degree_pathways.json` without needing a database. This makes it simpler to add and update pathways.

## How It Works

### 1. JSON File Location
```
app/db/data/manoa_degree_pathways.json
```

This file contains all your degree pathways. It can be:
- A single pathway object, OR
- An array of pathway objects

### 2. API Endpoint (`app/api/pathways/route.ts`)
Reads the JSON file directly and provides:
- `GET /api/pathways` - Returns list of all pathways
- `GET /api/pathways?programName=...` - Returns specific pathway details

### 3. Roadmap Page (`app/(with-sidebar)/Roadmap/page.tsx`)
- Fetches pathways from the API on page load
- Displays dropdown with all available pathways
- Generates interactive roadmap when pathway is selected
- Shows courses, activities, internships, and milestones

## Usage

### Adding Multiple Pathways
Edit `app/db/data/manoa_degree_pathways.json` to include all your pathways:

```json
[
  {
    "program_name": "Bachelor of Arts (BA) in Cinematic Arts (Animation Track)",
    "institution": "University of Hawaiʻi at Mānoa",
    "total_credits": 120,
    "years": [ ... ]
  },
  {
    "program_name": "Bachelor of Science (BS) in Computer Science",
    "institution": "University of Hawaiʻi at Mānoa",
    "total_credits": 120,
    "years": [ ... ]
  },
  {
    "program_name": "Bachelor of Business Administration (BBA)",
    "institution": "University of Hawaiʻi at Mānoa",
    "total_credits": 124,
    "years": [ ... ]
  }
]
```

### Viewing Pathways
1. Start dev server: `npm run dev`
2. Navigate to Roadmap page
3. Select pathway from dropdown
4. Interactive roadmap displays automatically!

## Benefits of File-Based Approach

✅ **No database ingestion needed** - Just edit the JSON file  
✅ **Instant updates** - Changes appear immediately on refresh  
✅ **Easy version control** - JSON file can be tracked in Git  
✅ **Simple deployment** - No database migrations required  
✅ **Easy to backup** - Just copy the JSON file  

## Pathway JSON Structure

Each pathway must have:

```json
{
  "program_name": "Program Name (unique identifier)",
  "institution": "University of Hawaiʻi at Mānoa",
  "total_credits": 120,
  "years": [
    {
      "year_number": 1,
      "semesters": [
        {
          "semester_name": "fall_semester",  // or spring_semester, summer_semester
          "credits": 15,
          "courses": [
            {
              "name": "COURSE 101 - Course Name",
              "credits": 3
            }
          ],
          "activities": ["Optional array of activities"],
          "internships": ["Optional array of internships"],
          "milestones": ["Optional array of milestones"]
        }
      ]
    }
  ]
}
```

## Roadmap Features

The interactive roadmap displays:
- **Start Node**: Beginning of academic journey
- **Semester Nodes**: Each semester with all courses and credits
- **Activities**: 🎯 Recommended clubs, events, networking
- **Internships**: 💼 Work experience opportunities
- **Milestones**: ⭐ Important achievements and goals
- **Career Node**: End goal after graduation

### Visual Layout
- Years progress vertically (top to bottom)
- Semesters progress horizontally (left to right)
- All nodes are connected with animated edges
- Color-coded by type (courses=blue, activities=orange, etc.)

### Interactive Features
- Click nodes to view/edit details
- Drag nodes to rearrange
- Add custom nodes
- Create new connections
- Zoom and pan controls
- Customize colors and styling

## Example Semester Structure

```json
{
  "semester_name": "fall_semester",
  "credits": 15,
  "courses": [
    {
      "name": "CINE 255 (DH)",
      "credits": 3
    },
    {
      "name": "ART 113",
      "credits": 3
    },
    {
      "name": "FQ (or FW)",
      "credits": 3
    }
  ],
  "activities": [
    "Join film/animation clubs",
    "Attend campus film screenings"
  ],
  "internships": [
    "Apply for summer animation internships"
  ],
  "milestones": [
    "Complete foundation art courses",
    "Build portfolio beginnings"
  ]
}
```

## Troubleshooting

### Pathways not showing in dropdown
1. Check that `manoa_degree_pathways.json` exists in `app/db/data/`
2. Verify JSON is valid (use https://jsonlint.com/)
3. Check browser console for errors
4. Restart dev server

### Roadmap not generating
1. Ensure `program_name` is unique
2. Verify semester names use correct format: `fall_semester`, `spring_semester`, `summer_semester`
3. Check that all courses have both `name` and `credits`

### Invalid JSON errors
- Make sure commas are correct (no trailing commas)
- Check all brackets and braces are closed
- Verify quotes are properly escaped

## Next Steps

1. **Add your pathways**: Edit `manoa_degree_pathways.json` with all UH Mānoa programs
2. **Test**: Refresh the roadmap page and select different pathways
3. **Customize**: Adjust colors, layout, or add more features as needed

No database setup or ingestion scripts needed! Just edit the JSON file and reload. 🎓✨
