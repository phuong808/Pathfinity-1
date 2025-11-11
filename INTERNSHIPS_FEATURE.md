# Internship Feature Documentation

## Overview
The Internship feature allows students to discover, browse, save, and track internship opportunities that are relevant to their degree pathway and career goals.

## Features

### 1. **Internship Discovery**
- Browse a comprehensive list of internship opportunities
- Filter by location, location type (remote/hybrid/onsite), experience level, and compensation
- Search across titles, companies, and descriptions
- View internships relevant to specific majors and degree programs

### 2. **Application Tracking**
- Save internships for later review
- Mark applications with status: Saved, Applied, Interviewing, Offered, Accepted, Rejected
- Add personal notes to each application
- Track application dates
- Remove applications from your list

### 3. **Organized Tabs**
- **All Internships**: Browse all available opportunities
- **Saved**: View internships you've bookmarked
- **Applied**: Track applications in progress

### 4. **Detailed Internship Information**
- Company and role details
- Location and work arrangement
- Duration and compensation
- Application deadline
- Required skills and qualifications
- Requirements and responsibilities
- Related majors and degrees
- External application links

## Database Schema

### Internships Table
```sql
CREATE TABLE internships (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  location_type TEXT, -- 'remote', 'hybrid', 'onsite'
  duration TEXT,
  is_paid BOOLEAN DEFAULT true,
  salary_range TEXT,
  application_deadline TIMESTAMP,
  start_date TIMESTAMP,
  skills JSONB, -- Array of required skills
  related_majors JSONB, -- Array of relevant major titles
  related_degrees JSONB, -- Array of degree codes
  experience_level TEXT, -- 'freshman', 'sophomore', 'junior', 'senior', 'any'
  application_url TEXT,
  contact_email TEXT,
  posted_date TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Internship Applications Table
```sql
CREATE TABLE internship_applications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  internship_id INTEGER NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'saved', -- 'saved', 'applied', 'interviewing', 'offered', 'accepted', 'rejected'
  applied_date TIMESTAMP,
  notes TEXT,
  resume_url TEXT,
  cover_letter_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### GET /api/internships
Fetch all active internships with optional filtering.

**Query Parameters:**
- `search`: Search term for title, company, or description
- `location`: Filter by location
- `locationType`: Filter by 'remote', 'hybrid', or 'onsite'
- `isPaid`: Filter by 'true' or 'false'
- `experienceLevel`: Filter by 'freshman', 'sophomore', 'junior', 'senior', or 'any'
- `userRelevant`: Set to 'true' to filter by user's major/degree (requires authentication)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Software Engineering Intern",
      "company": "Google",
      "description": "...",
      "location": "Mountain View, CA",
      "locationType": "hybrid",
      "salaryRange": "$45-55/hr",
      "skills": ["Python", "Java", "Algorithms"],
      "relatedMajors": ["Computer Science", "Software Engineering"],
      "userApplication": {
        "id": 123,
        "status": "saved",
        "appliedDate": null
      }
    }
  ],
  "count": 20
}
```

### POST /api/internships
Create a new internship (admin only).

**Request Body:**
```json
{
  "title": "Software Engineering Intern",
  "company": "Google",
  "description": "...",
  "requirements": "...",
  "location": "Mountain View, CA",
  "locationType": "hybrid",
  "duration": "12 weeks",
  "isPaid": true,
  "salaryRange": "$45-55/hr",
  "skills": ["Python", "Java"],
  "relatedMajors": ["Computer Science"],
  "experienceLevel": "junior"
}
```

### GET /api/internships/applications
Get all applications for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "internshipId": 5,
      "status": "applied",
      "appliedDate": "2024-01-15T10:00:00Z",
      "notes": "Submitted resume and cover letter"
    }
  ]
}
```

### POST /api/internships/applications
Create or update an application.

**Request Body:**
```json
{
  "internshipId": 5,
  "status": "applied",
  "notes": "Submitted application through career portal"
}
```

### DELETE /api/internships/applications?id=123
Remove an application from tracking.

## Setup Instructions

### 1. Run Database Migrations
```bash
# Generate migration from schema changes
npm run drizzle-kit generate

# Apply migrations to database
npm run drizzle-kit migrate
```

### 2. Seed Sample Data
```bash
# Populate database with sample internships
npm run seed-internships
```

This will add 18 diverse internship opportunities across:
- Technology (Software Engineering, Data Science, Full Stack, Cybersecurity, UX/UI)
- Business & Finance (Investment Banking, Marketing Analytics, Consulting)
- Engineering (Mechanical, Civil)
- Healthcare & Life Sciences (Clinical Research, Pharmaceutical Research)
- Creative & Media (Graphic Design, Content Writing)
- Startups & Remote (Product Management, Social Media Marketing)

### 3. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000/Internships` to view the internship page.

## Usage Guide

### For Students

1. **Browse Internships**: Navigate to the Internships page from the sidebar
2. **Filter & Search**: Use the filter controls to narrow down opportunities
3. **View Details**: Click "View Details" on any internship card to see full information
4. **Save for Later**: Click the bookmark icon to save an internship
5. **Track Applications**: 
   - Open an internship detail view
   - Select a status (Saved, Applied, Interviewing, etc.)
   - Add optional notes
   - Click "Save Internship" or "Update Status"
6. **Manage Applications**: Use the "Saved" and "Applied" tabs to organize your applications

### For Administrators

To add new internships:

```typescript
// Use the POST /api/internships endpoint
const response = await fetch('/api/internships', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'New Internship',
    company: 'Company Name',
    description: '...',
    // ... other fields
  })
});
```

## Future Enhancements

### Planned Features
1. **Smart Recommendations**: Use AI to recommend internships based on user's courses, skills, and career goals
2. **Application Materials**: Allow users to upload and attach resumes/cover letters
3. **Email Reminders**: Send notifications for application deadlines
4. **Calendar Integration**: Add application deadlines to calendar
5. **Interview Prep**: Provide company-specific interview tips and questions
6. **Alumni Connections**: Connect students with alumni who have interned at companies
7. **Application Analytics**: Track application success rates and provide insights
8. **Saved Searches**: Allow users to save filter combinations
9. **Company Profiles**: Detailed company pages with culture, reviews, and interview process
10. **Integration with Roadmap**: Show internships recommended for each semester/year in the user's roadmap

## Technical Details

### Frontend Components
- **Page**: `/app/(with-sidebar)/Internships/page.tsx`
- **UI Components**: Uses shadcn/ui components (Card, Dialog, Select, Tabs, etc.)
- **State Management**: React hooks (useState, useEffect)
- **Styling**: Tailwind CSS with custom gradients and animations

### Backend Routes
- **Internships API**: `/app/api/internships/route.ts`
- **Applications API**: `/app/api/internships/applications/route.ts`

### Database
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (via Neon)
- **Schema**: `/app/db/schema.ts`

## Troubleshooting

### No Internships Showing
1. Ensure database migrations have been run
2. Run the seed script to populate sample data
3. Check that `isActive` is set to true in the database

### Applications Not Saving
1. Verify user authentication is working
2. Check browser console for API errors
3. Ensure `internshipId` is valid

### Filters Not Working
1. Clear browser cache
2. Check that filter values match database values (case-sensitive)
3. Verify API is returning filtered results

## Contributing

When adding new features:
1. Update schema if needed and generate migrations
2. Update API endpoints documentation
3. Test with various filter combinations
4. Ensure responsive design on mobile devices
5. Add appropriate error handling

## License

Part of the Pathfinity project. Internal use only.
