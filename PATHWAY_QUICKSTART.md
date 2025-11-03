# Quick Start: Adding Degree Pathways

## Step 1: Prepare Your Pathway Data

Edit the file at `app/db/data/manoa_degree_pathways.json`. 

If you have **multiple pathways**, structure the file as an array:

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

## Step 2: Run the Ingestion

```bash
npm run ingest-pathways
```

Or:

```bash
npx tsx scripts/ingest/ingest-pathways.ts
```

## Step 3: View in the App

1. Start dev server: `npm run dev`
2. Navigate to the **Roadmap** page
3. Select your pathway from the dropdown
4. The interactive roadmap will display!

## Pathway Template

Copy this template for each new pathway:

```json
{
  "program_name": "YOUR PROGRAM NAME HERE",
  "institution": "University of Hawaiʻi at Mānoa",
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
            },
            {
              "name": "COURSE 102",
              "credits": 3
            }
          ],
          "activities": [
            "Join student clubs",
            "Attend orientation"
          ],
          "internships": [
            "Optional: Part-time on-campus job"
          ],
          "milestones": [
            "Declare major",
            "Meet academic advisor"
          ]
        },
        {
          "semester_name": "spring_semester",
          "credits": 15,
          "courses": [
            {
              "name": "COURSE 201",
              "credits": 3
            }
          ]
        },
        {
          "semester_name": "summer_semester",
          "credits": 0,
          "courses": []
        }
      ]
    },
    {
      "year_number": 2,
      "semesters": [ ... ]
    },
    {
      "year_number": 3,
      "semesters": [ ... ]
    },
    {
      "year_number": 4,
      "semesters": [ ... ]
    }
  ]
}
```

## Important Notes

### Required Fields
- `program_name` (must be unique)
- `institution`
- `total_credits`
- `years` array with at least one year

### Semester Names
Use these exact values for `semester_name`:
- `fall_semester`
- `spring_semester`
- `summer_semester`

### Optional Fields
- `activities` - Array of strings
- `internships` - Array of strings
- `milestones` - Array of strings

### Credits
- Course credits: Number (e.g., 3)
- Semester total: Number (should match sum of course credits)
- Program total: Number (all semesters combined)

## Common Mistakes to Avoid

❌ **Wrong semester name:**
```json
"semester_name": "Fall"  // Wrong!
```

✅ **Correct:**
```json
"semester_name": "fall_semester"
```

---

❌ **Missing credits:**
```json
{
  "name": "COURSE 101"  // Missing credits!
}
```

✅ **Correct:**
```json
{
  "name": "COURSE 101",
  "credits": 3
}
```

---

❌ **Duplicate program names:**
```json
[
  { "program_name": "Computer Science", ... },
  { "program_name": "Computer Science", ... }  // Duplicate!
]
```

✅ **Make them unique:**
```json
[
  { "program_name": "Computer Science (BS)", ... },
  { "program_name": "Computer Science (BA)", ... }
]
```

## Re-ingesting Data

If you update a pathway, just run the ingestion script again:

```bash
npm run ingest-pathways
```

The script will automatically **update** existing pathways (matched by program_name) instead of creating duplicates.

## Verifying Your Data

After ingestion, you should see output like:

```
🚀 Starting pathway ingestion...
📚 Found 3 pathway(s) to ingest
✅ Ingested: Bachelor of Arts (BA) in Cinematic Arts
✅ Ingested: Bachelor of Science (BS) in Computer Science
✅ Ingested: Bachelor of Business Administration (BBA)

📊 Ingestion Summary:
   ✅ Successful: 3
   ❌ Failed: 0
   📚 Total: 3

🎉 Pathway ingestion complete!
```

## Getting Help

- Check `PATHWAY_SYSTEM.md` for detailed documentation
- View the example pathway in `manoa_degree_pathways.json`
- Look at the JSON structure carefully - commas and brackets matter!
- Use a JSON validator: https://jsonlint.com/
