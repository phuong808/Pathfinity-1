# Course Details Feature

## Overview
The Roadmap page now displays detailed course information from the UH Mānoa course catalog when you click on any course card.

## What's New

### Enhanced Course Display
When you click on a course in your roadmap timeline, the details panel now shows:

- **Course Code**: The official course identifier (e.g., "ICS 111", "CINE 255")
- **Course Title**: Full name of the course
- **Description**: Comprehensive course description
- **Department**: The department offering the course
- **Credits**: Number of credit hours
- **Prerequisites**: Required courses or conditions
- **Grade Option**: Grading system (A-F only, CR/NC, etc.)
- **Major Restrictions**: Any major-specific requirements or restrictions

### How It Works

1. **Data Source**: Course information is pulled from `manoa_courses.json`, which contains the complete UH Mānoa course catalog
2. **Intelligent Matching**: The system automatically matches course names from pathways to the course database
3. **Format Handling**: Supports various course name formats:
   - Standard: "ICS 111", "MATH 241"
   - With focus areas: "CINE 255 (DH)"
   - With alternatives: "CINE 315 or 321" (shows first option)
   - Requirement codes: "FQ", "FW", etc.

### Files Modified

- **`lib/course-mapper.ts`**: New utility module for mapping course names to detailed information
  - `getCourseDetails()`: Main function to retrieve course data
  - `extractPrerequisites()`: Parses prerequisite information
  - `extractGradeOption()`: Parses grading options
  - `extractMajorRestrictions()`: Parses major restrictions
  - `isRepeatable()`: Checks if a course can be repeated

- **`app/(with-sidebar)/Roadmap/page.tsx`**: Updated roadmap component
  - Extended `TimelineItem` interface with `courseDetails` field
  - Modified `pathwayToTimeline()` to fetch course details
  - Enhanced details panel to display comprehensive course information

### Visual Indicators

The details panel shows context-aware feedback:
- ✅ **Green badge**: Course information successfully loaded from catalog
- ⚠️ **Yellow badge**: Course code not found in database (may be a requirement code or elective)
- ℹ️ **Blue badge**: Non-course items (internships, activities, etc.)

## Usage Example

1. Navigate to the Roadmap page
2. Select a degree program from the dropdown
3. Click on any course card in the timeline
4. View detailed course information in the right panel

## Technical Details

### Course Database Structure
```json
{
  "course_prefix": "ICS",
  "course_number": "111",
  "course_title": "Introduction to Computer Science",
  "course_desc": "Overview of the fundamentals of computer science...",
  "num_units": "3",
  "dept_name": "Information and Computer Sciences",
  "inst_ipeds": 141574,
  "metadata": "Prerequisites: MATH 135 or consent..."
}
```

### Type Safety
All course data is fully typed with TypeScript interfaces for type safety and better developer experience.

## Future Enhancements

Potential improvements:
- Search/filter courses by department or prerequisites
- Show prerequisite course trees visually
- Highlight related courses in the timeline
- Display historical grade distributions
- Link to official course catalog pages
