'use client';

import React, { useState, useEffect } from 'react';
import styles from './roadmap.module.css';
import { Button } from "@/app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { Check, ChevronsUpDown, X, BookOpen, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getCourseDetails, 
  type CourseDetails, 
  extractPrerequisites, 
  extractGradeOption, 
  extractMajorRestrictions, 
  CAMPUSES,
  getMajorsByCampus,
  type MajorData 
} from "@/lib/course-mapper";

// Course type from API (different from pathway Course)
interface CourseCatalog {
  course_prefix: string;
  course_number: string;
  course_title: string;
  course_desc: string;
  num_units: string;
  dept_name: string;
  inst_ipeds: number;
  metadata: string;
}

// Memoized Course Card Component for better performance
const CourseCard = React.memo(({ course }: { course: CourseCatalog }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-blue-600">
            {course.course_prefix} {course.course_number}
          </h3>
          <p className="text-gray-900 font-semibold">{course.course_title}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          {course.num_units} {course.num_units === '1' ? 'unit' : 'units'}
        </span>
      </div>
      <p className="text-gray-700 mb-3">{course.course_desc}</p>
      {course.metadata && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
          {course.metadata}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return prevProps.course.course_prefix === nextProps.course.course_prefix &&
         prevProps.course.course_number === nextProps.course.course_number;
});

CourseCard.displayName = 'CourseCard';

// Semester and course category colors
const SEMESTER_COLORS: Record<string, string> = {
  'Courses': '#3498db',
  'Internships': '#e67e22',
  'Clubs & Extra Curriculars': '#9b59b6',
  'Part-Time Jobs': '#16a085',
  'Fall Semester': '#E57A44',
  'Spring Semester': '#6B9B6E',
  'Summer Semester': '#F4D47C',
  'Year 1': '#3498db',
  'Year 2': '#9b59b6',
  'Year 3': '#e67e22',
  'Year 4': '#16a085',
};

// Bold color palettes organized by year
const YEAR_COLOR_PALETTES: Record<number, string[]> = {
  1: [ // Year 1 - Blues
    '#0066CC', // Strong Blue
    '#0080FF', // Bright Blue
    '#1E90FF', // Dodger Blue
    '#4169E1', // Royal Blue
    '#0047AB', // Cobalt Blue
  ],
  2: [ // Year 2 - Greens
    '#00A86B', // Jade Green
    '#00AA55', // Emerald
    '#228B22', // Forest Green
    '#32CD32', // Lime Green
    '#2E8B57', // Sea Green
  ],
  3: [ // Year 3 - Oranges & Reds
    '#FF6347', // Tomato
    '#FF4500', // Orange Red
    '#FF8C00', // Dark Orange
    '#FFA500', // Orange
    '#FF7F50', // Coral
  ],
  4: [ // Year 4 - Purples & Magentas
    '#9370DB', // Medium Purple
    '#8A2BE2', // Blue Violet
    '#9932CC', // Dark Orchid
    '#BA55D3', // Medium Orchid
    '#DA70D6', // Orchid
  ],
};

// Bold timeline colors by year
const YEAR_TIMELINE_COLORS: Record<number, string[]> = {
  1: [ // Year 1 - Light Blues
    '#B3D9FF', // Light Blue
    '#CCE5FF', // Pale Blue
    '#E6F2FF', // Very Light Blue
  ],
  2: [ // Year 2 - Light Greens
    '#B3E6CC', // Light Green
    '#CCF2E0', // Pale Green
    '#E6F9F0', // Very Light Green
  ],
  3: [ // Year 3 - Light Oranges
    '#FFD9B3', // Light Orange
    '#FFE6CC', // Pale Orange
    '#FFF2E6', // Very Light Orange
  ],
  4: [ // Year 4 - Light Purples
    '#E6CCFF', // Light Purple
    '#F0E0FF', // Pale Purple
    '#F7F0FF', // Very Light Purple
  ],
};

// Function to generate a bold color for courses based on year and item ID
function getItemColor(itemId: string, category: string, description?: string): string {
  if (category === 'Courses' && description) {
    // Extract year from description
    const yearMatch = description.match(/Year (\d+)/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      const palette = YEAR_COLOR_PALETTES[year] || YEAR_COLOR_PALETTES[1];
      const index = parseInt(itemId) % palette.length;
      return palette[index];
    }
  }
  return SEMESTER_COLORS[category] || '#999';
}

// Function to get timeline color based on year and semester
function getTimelineColor(period: string): string {
  const yearMatch = period.match(/Year (\d+)/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    const palette = YEAR_TIMELINE_COLORS[year] || YEAR_TIMELINE_COLORS[1];
    
    // Different shade based on semester
    if (period.includes('Fall')) {
      return palette[0];
    } else if (period.includes('Spring')) {
      return palette[1];
    } else if (period.includes('Summer')) {
      return palette[2];
    }
  }
  return '#f9f9f9';
}

// Types for our timeline data
interface TimelineItem {
  id: string;
  category: string;
  name: string;
  startYear: number;
  startMonth: number; // 0-11 (January = 0)
  endYear: number;
  endMonth: number; // 0-11
  description?: string;
  courseDetails?: CourseDetails; // Added course details from manoa_courses.json
}

interface PathwayData {
  program_name: string;
  institution: string;
  total_credits: number;
  years: Year[];
}

interface Course {
  name: string;
  credits: number;
}

interface Semester {
  semester_name: string;
  credits: number;
  courses: Course[];
  activities?: string[];
  internships?: string[];
  milestones?: string[];
}

interface Year {
  year_number: number;
  semesters: Semester[];
}

interface PathwayRecord {
  id: number;
  programName: string;
  institution: string;
  totalCredits: string;
  pathwayData?: PathwayData;
  createdAt: Date;
  updatedAt: Date;
}

// Helper to get semester display name
function getSemesterDisplayName(semesterName: string): string {
  const map: Record<string, string> = {
    'fall_semester': 'Fall Semester',
    'spring_semester': 'Spring Semester',
    'summer_semester': 'Summer Semester',
  };
  return map[semesterName] || semesterName;
}

// Convert pathway data to timeline format organized by semester periods
function pathwayToTimeline(pathwayData: PathwayData, campusId: string = 'manoa'): { items: TimelineItem[], categories: string[], periods: string[] } {
  const items: TimelineItem[] = [];
  const categories = ['Courses', 'Internships', 'Clubs & Extra Curriculars', 'Part-Time Jobs'];
  const periods: string[] = [];
  let itemId = 1;
  const baseYear = 2025; // Starting year for the timeline

  pathwayData.years.forEach((year) => {
    year.semesters.forEach((semester) => {
      // Skip empty summer semesters
      if (semester.courses.length === 0 && semester.semester_name === 'summer_semester') {
        return;
      }

      // Determine start month based on semester name
      let startMonth = 0;
      let endMonth = 4;
      
      if (semester.semester_name === 'fall_semester') {
        startMonth = 8; // September
        endMonth = 11; // December
      } else if (semester.semester_name === 'spring_semester') {
        startMonth = 0; // January
        endMonth = 4; // May
      } else if (semester.semester_name === 'summer_semester') {
        startMonth = 5; // June
        endMonth = 7; // August
      }

      const actualYear = baseYear + year.year_number - 1;
      const semesterLabel = `Year ${year.year_number} - ${getSemesterDisplayName(semester.semester_name)}`;
      
      // Track periods for vertical timeline
      periods.push(semesterLabel);

      // Add each course to the "Courses" category
      semester.courses.forEach((course) => {
        // Get detailed course information from the selected campus courses.json
        const courseDetails = getCourseDetails(course.name, campusId);
        
        items.push({
          id: `${itemId++}`,
          category: 'Courses',
          name: course.name,
          startYear: actualYear,
          startMonth,
          endYear: actualYear,
          endMonth,
          description: `${course.credits} credits • ${semesterLabel}`,
          courseDetails, // Add the detailed course information
        });
      });

      // Add activities to "Clubs & Extra Curriculars" category
      semester.activities?.forEach((activity) => {
        items.push({
          id: `${itemId++}`,
          category: 'Clubs & Extra Curriculars',
          name: activity,
          startYear: actualYear,
          startMonth,
          endYear: actualYear,
          endMonth,
          description: `Activity • ${semesterLabel}`,
        });
      });

      // Add internships to "Internships" category
      semester.internships?.forEach((internship) => {
        items.push({
          id: `${itemId++}`,
          category: 'Internships',
          name: internship,
          startYear: actualYear,
          startMonth,
          endYear: actualYear,
          endMonth,
          description: `Internship/Work Experience • ${semesterLabel}`,
        });
      });

      // Add milestones to appropriate categories (could be distributed based on type)
      semester.milestones?.forEach((milestone) => {
        items.push({
          id: `${itemId++}`,
          category: 'Part-Time Jobs',
          name: milestone,
          startYear: actualYear,
          startMonth,
          endYear: actualYear,
          endMonth,
          description: `Milestone • ${semesterLabel}`,
        });
      });
    });
  });

  return { items, categories, periods };
}

export default function RoadmapPage() {
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [pathways, setPathways] = useState<PathwayRecord[]>([]);
  const [selectedPathwayId, setSelectedPathwayId] = useState<number | null>(null);
  const [selectedPathway, setSelectedPathway] = useState<PathwayRecord | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string>('manoa');
  const [campusOpen, setCampusOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'courses' | 'majors'>('courses');
  const [selectedMajor, setSelectedMajor] = useState<MajorData | null>(null);
  const [majorSearchTerm, setMajorSearchTerm] = useState('');
  
  // New states for department and courses
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentCourses, setDepartmentCourses] = useState<CourseCatalog[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Only show Courses category
  const visibleCategories = ['Courses'];

  // Fetch pathways on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/pathways');
        if (response.ok) {
          const data = await response.json();
          setPathways(data);
        }
      } catch (error) {
        console.error('Error fetching pathways:', error);
      }
    };
    fetchData();
  }, []);

  // Fetch departments when campus changes
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const response = await fetch(`/api/courses/departments?campus=${selectedCampus}`);
        if (response.ok) {
          const data = await response.json();
          setDepartments(data.departments);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoadingDepartments(false);
      }
    };
    fetchDepartments();
  }, [selectedCampus]);

  // Fetch courses when department changes with abort controller for optimization
  useEffect(() => {
    if (selectedDepartment) {
      const abortController = new AbortController();
      
      const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
          const response = await fetch(
            `/api/courses?campus=${selectedCampus}&department=${encodeURIComponent(selectedDepartment)}`,
            { signal: abortController.signal }
          );
          if (response.ok) {
            const data = await response.json();
            setDepartmentCourses(data.courses);
          }
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
          console.error('Error fetching courses:', error);
        } finally {
          if (!abortController.signal.aborted) {
            setLoadingCourses(false);
          }
        }
      };
      fetchCourses();
      
      // Cleanup function to abort the request if component unmounts or dependencies change
      return () => {
        abortController.abort();
      };
    } else {
      setDepartmentCourses([]);
    }
  }, [selectedDepartment, selectedCampus]);

  const handleCampusSelect = (campusId: string) => {
    setSelectedCampus(campusId);
    setCampusOpen(false);
    
    // Clear department and courses when campus changes
    setSelectedDepartment(null);
    setDepartmentCourses([]);
    
    // Clear selected major when campus changes in majors mode
    if (viewMode === 'majors') {
      setSelectedMajor(null);
    }
    
    // Reload the pathway with the new campus if one is selected
    if (selectedPathwayId && viewMode === 'courses') {
      const pathway = pathways.find(p => p.id === selectedPathwayId);
      if (pathway?.pathwayData) {
        const { items, categories: pathwayCategories, periods: pathwayPeriods } = pathwayToTimeline(pathway.pathwayData, campusId);
        setTimelineData(items);
        setCategories(pathwayCategories);
        setPeriods(pathwayPeriods);
        setSelectedItem(null);
      }
    }
  };

  const handleViewModeChange = (mode: 'courses' | 'majors') => {
    setViewMode(mode);
    setSelectedMajor(null);
    // Clear course data when switching to majors
    if (mode === 'majors') {
      setTimelineData([]);
      setSelectedPathwayId(null);
      setSelectedPathway(null);
      setSelectedItem(null);
    }
    // Clear department selection when switching modes
    setSelectedDepartment(null);
    setDepartmentCourses([]);
  };

  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartment(department);
  };

  // Handle major selection and load its pathway
  const handleMajorSelect = (major: MajorData) => {
    // If the major has pathway data, load it into the timeline
    if (major.pathwayData) {
      const { items, categories: pathwayCategories, periods: pathwayPeriods } = pathwayToTimeline(major.pathwayData, selectedCampus);
      setTimelineData(items);
      setCategories(pathwayCategories);
      setPeriods(pathwayPeriods);
      setSelectedItem(null);
      setSelectedMajor(major); // Set selected major for display in header
      
      // Switch to courses view to display the timeline
      setViewMode('courses');
    }
  };

  // Compute majors list based on current campus and search term
  const filteredMajors = React.useMemo(() => {
    if (viewMode !== 'majors') return [];
    const allMajors = getMajorsByCampus(selectedCampus);
    if (!majorSearchTerm.trim()) return allMajors;
    const searchLower = majorSearchTerm.toLowerCase();
    return allMajors.filter(major => 
      major.majorName.toLowerCase().includes(searchLower)
    );
  }, [viewMode, selectedCampus, majorSearchTerm]);

  // Compute dynamic header title based on selections
  const headerTitle = React.useMemo(() => {
    const campusName = CAMPUSES.find(c => c.id === selectedCampus)?.displayName || "UH";
    
    // If viewing a specific major's pathway
    if (selectedMajor && viewMode === 'courses' && timelineData.length > 0) {
      return `🎓 ${campusName} Degree Pathway`;
    }
    
    // If viewing a department's courses
    if (selectedDepartment && viewMode === 'courses') {
      return `📚 ${campusName} Courses Offered`;
    }
    
    // If in majors view mode
    if (viewMode === 'majors') {
      return `🎓 ${campusName} Degree Pathway`;
    }
    
    // If in courses view with a pathway loaded
    if (viewMode === 'courses' && timelineData.length > 0) {
      return `🎓 ${campusName} Degree Pathway`;
    }
    
    // Default - browsing departments/courses
    return `📚 ${campusName} Courses Offered`;
  }, [selectedCampus, viewMode, selectedMajor, selectedDepartment, timelineData.length]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className="flex flex-col p-5 pl-16 gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={styles.headerTitle}>
                {headerTitle}
              </h1>
              {selectedMajor && viewMode === 'courses' && timelineData.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewModeChange('majors')}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
                  >
                    ← Back to Majors
                  </Button>
                  <p className="text-sm text-blue-100 font-medium">
                    {selectedMajor.majorName} • {selectedMajor.pathwayData?.total_credits || 0} Total Credits • {CAMPUSES.find(c => c.id === selectedCampus)?.displayName}
                  </p>
                </div>
              )}
              {!selectedMajor && selectedPathway && viewMode === 'courses' && (
                <p className="text-sm text-blue-100 mt-2 font-medium">
                  {selectedPathway.programName} • {selectedPathway.totalCredits} Total Credits • {CAMPUSES.find(c => c.id === selectedCampus)?.displayName}
                </p>
              )}
              {viewMode === 'majors' && (
                <p className="text-sm text-blue-100 mt-2 font-medium">
                  Explore Majors at {CAMPUSES.find(c => c.id === selectedCampus)?.displayName}
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {/* Campus Selector */}
              <Popover open={campusOpen} onOpenChange={setCampusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={campusOpen}
                    className="w-[200px] justify-between bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-blue-600 font-medium"
                  >
                    <span className="truncate">
                      {CAMPUSES.find((c) => c.id === selectedCampus)?.displayName || "Select campus..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search campus..." />
                    <CommandList>
                      <CommandEmpty>No campus found.</CommandEmpty>
                      <CommandGroup>
                        {CAMPUSES.map((campus) => (
                          <CommandItem
                            key={campus.id}
                            value={campus.id}
                            onSelect={() => handleCampusSelect(campus.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCampus === campus.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {campus.displayName}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              
              {/* View Mode Toggle */}
              <div className="flex gap-1 bg-white rounded-lg p-1 border-2 border-gray-300">
                <Button
                  variant={viewMode === 'majors' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('majors')}
                  className={cn(
                    "flex items-center gap-2",
                    viewMode === 'majors' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <GraduationCap className="h-4 w-4" />
                  Majors
                </Button>
                <Button
                  variant={viewMode === 'courses' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('courses')}
                  className={cn(
                    "flex items-center gap-2",
                    viewMode === 'courses' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <BookOpen className="h-4 w-4" />
                  Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className={styles.timelineContainer}>
        {viewMode === 'courses' ? (
          // Courses View
          <div className={styles.timelineGrid}>
            {/* Show department courses if a department is selected */}
            {selectedDepartment && departmentCourses.length > 0 ? (
              <div className="p-8">
                <div className="mb-6 flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDepartment(null)}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
                  >
                    ← Back to Departments
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment}</h2>
                    <p className="text-gray-600">{departmentCourses.length} courses available</p>
                  </div>
                </div>
                
                {loadingCourses ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-4xl mb-4">⏳</div>
                      <p className="text-gray-600">Loading courses...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {departmentCourses.map((course, index) => (
                      <CourseCard 
                        key={`${course.course_prefix}-${course.course_number}-${index}`}
                        course={course}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : selectedDepartment && !loadingCourses ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-gray-700 text-xl font-semibold mb-2">No Courses Found</p>
                  <p className="text-gray-500 text-sm mb-4">
                    No courses available for {selectedDepartment}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDepartment(null)}
                    className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
                  >
                    ← Back to Departments
                  </Button>
                </div>
              </div>
            ) : timelineData.length === 0 ? (
              /* Show departments grid when no department is selected */
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse Departments</h2>
                  <p className="text-gray-600">
                    Select a department to view all available courses at {CAMPUSES.find(c => c.id === selectedCampus)?.displayName}
                  </p>
                </div>
                
                {loadingDepartments ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <div className="text-4xl mb-4">⏳</div>
                      <p className="text-gray-600">Loading departments...</p>
                    </div>
                  </div>
                ) : departments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => handleDepartmentSelect(dept)}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl hover:scale-105 transition-all border-2 border-gray-200 hover:border-blue-500 text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {dept}
                            </h3>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                      <div className="text-6xl mb-4">📚</div>
                      <p className="text-gray-700 text-xl font-semibold mb-2">No Departments Found</p>
                      <p className="text-gray-500 text-sm">
                        No departments available for this campus
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-4">Or explore degree pathways by major</p>
                  <Button
                    onClick={() => handleViewModeChange('majors')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Explore Majors
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Header row with Timeline + Category headers */}
                <div className={styles.headerRow}>
                  <div className={styles.timelineHeaderCell}>
                    Timeline
                  </div>
                  {categories.filter(cat => visibleCategories.includes(cat)).map((category) => (
                    <div
                      key={category}
                      className={styles.categoryHeader}
                      style={{ backgroundColor: SEMESTER_COLORS[category] || '#999' }}
                    >
                      <span className={styles.categoryHeaderLabel}>{category}</span>
                    </div>
                  ))}
                </div>

                {/* Content rows - each period gets a row with timeline label + content */}
                <div className={styles.contentRows}>
                {periods.map((period, periodIndex) => {
                  // Extract year and semester from period string
                  const match = period.match(/Year (\d+) - (.+)/);
                  const year = match ? match[1] : '';
                  const semester = match ? match[2] : period;
                  
                  // Get items for this period
                  const itemsForPeriod = timelineData.filter(item => {
                    const itemPeriod = item.description?.split(' • ')[1];
                    return itemPeriod === period && visibleCategories.includes(item.category);
                  });
                  
                  // Calculate total credits for this semester
                  const totalCredits = itemsForPeriod.reduce((sum, item) => {
                    if (item.category === 'Courses' && item.courseDetails) {
                      return sum + (parseInt(item.courseDetails.num_units) || 0);
                    }
                    return sum;
                  }, 0);
                  
                  return (
                    <div key={periodIndex} className={styles.contentRow}>
                      {/* Timeline cell for this row - now a header */}
                      <div 
                        className={styles.timelineCell}
                        style={{ backgroundColor: getTimelineColor(period) }}
                      >
                        <div className={styles.timelineLabel}>
                          <span className={styles.timelineYear}>Year {year}</span>
                          <span className={styles.timelineSemester}>{semester}</span>
                        </div>
                        {totalCredits > 0 && (
                          <div className={styles.semesterCredits}>
                            {totalCredits} Credits
                          </div>
                        )}
                      </div>
                      
                      {/* Course grid */}
                      <div className={styles.contentColumn}>
                        {itemsForPeriod.map((item) => {
                          const itemColor = getItemColor(item.id, item.category, item.description);
                          const courseDetails = item.courseDetails;
                          
                          return (
                            <div
                              key={item.id}
                              className={cn(
                                styles.itemCard,
                                selectedItem?.id === item.id && styles.itemCardSelected
                              )}
                              style={{
                                borderLeftColor: itemColor,
                              }}
                              onClick={() => setSelectedItem(item)}
                            >
                              {/* Course Header with Code and Credits */}
                              <div className={styles.courseHeader}>
                                <div className={styles.itemCardLabel}>{item.name}</div>
                                {courseDetails && (
                                  <div className={styles.courseCredits}>
                                    {courseDetails.num_units} CR
                                  </div>
                                )}
                              </div>
                              
                              {/* Course Title */}
                              {courseDetails && (
                                <div className={styles.courseTitle}>
                                  {courseDetails.course_title}
                                </div>
                              )}
                              
                              {/* Course Description */}
                              {courseDetails && courseDetails.course_desc && (
                                <div className={styles.courseDescription}>
                                  {courseDetails.course_desc}
                                </div>
                              )}
                              
                              {/* Metadata Tags */}
                              {courseDetails && (
                                <div className={styles.courseMetadata}>
                                  <div className={cn(styles.metadataTag, styles.departmentTag)}>
                                    📚 {courseDetails.dept_name}
                                  </div>
                                  {courseDetails.metadata && extractPrerequisites(courseDetails.metadata) !== 'None' && (
                                    <div className={cn(styles.metadataTag, styles.prerequisiteTag)}>
                                      ⚠️ Has Prerequisites
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Fallback for non-detailed courses */}
                              {!courseDetails && (
                                <div className={styles.itemCardDetails}>
                                  {item.description?.split(' • ')[0]}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          </div>
        ) : (
          // Majors View
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search for a major..."
                  value={majorSearchTerm}
                  onChange={(e) => setMajorSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Majors Grid */}
              {filteredMajors.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-2xl shadow-lg">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-700 text-xl font-semibold mb-2">
                    {selectedCampus === 'manoa' 
                      ? "No majors found"
                      : "No pathway data available for this campus"}
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {selectedCampus === 'manoa'
                      ? "Try a different search term"
                      : "Currently, only UH Mānoa has complete degree pathway data. Select UH Mānoa from the campus dropdown to explore available majors."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">
                    Found {filteredMajors.length} major{filteredMajors.length !== 1 ? 's' : ''} at {CAMPUSES.find(c => c.id === selectedCampus)?.displayName}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMajors.map((major, index) => (
                      <div
                        key={`${major.majorName}-${index}`}
                        onClick={() => handleMajorSelect(major)}
                        className={cn(
                          "p-5 bg-white rounded-xl shadow-md border-2 cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1",
                          selectedMajor?.majorName === major.majorName
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">🎓</div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                              {major.majorName}
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {major.degrees.map((degree, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded"
                                >
                                  {degree}
                                </span>
                              ))}
                            </div>
                            {major.pathwayData && (
                              <div className="mt-2 text-xs text-green-600 font-medium flex items-center gap-1">
                                <span>✓</span>
                                <span>4-year pathway available</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Details Panel - Only show for course items, not for major selection */}
      {selectedItem && (
        <div className={styles.editPanel}>
          <div className={styles.editPanelHeader}>
            <h3 className="font-bold text-lg text-gray-800">
              {selectedItem?.category === 'Courses' && selectedItem.courseDetails ? '📖 Course Information' : 'ℹ️ Item Details'}
            </h3>
            <button
              onClick={() => {
                setSelectedItem(null);
              }}
              className={styles.closeButton}
              aria-label="Close details panel"
            >
              <X size={20} />
            </button>
          </div>
          <div className={styles.editPanelContent}>
            {/* Show course or item information */}
            {selectedItem.category === 'Courses' && selectedItem.courseDetails ? (
              // Detailed course information available
              <>
                <div className={styles.formGroup}>
                  <label>Course Code</label>
                  <p className="text-lg font-bold text-blue-600">{selectedItem.name}</p>
                </div>
                    
                    <div className={styles.formGroup}>
                      <label>Course Title</label>
                      <p className="text-base font-semibold text-gray-800">{selectedItem.courseDetails.course_title}</p>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Description</label>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedItem.courseDetails.course_desc}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className={styles.formGroup}>
                        <label>Credits</label>
                        <p className="text-base font-semibold text-gray-800">{selectedItem.courseDetails.num_units}</p>
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Department</label>
                        <p className="text-sm text-gray-700">{selectedItem.courseDetails.dept_name}</p>
                      </div>
                    </div>

                    {selectedItem.courseDetails.metadata && (
                      <>
                        <div className={styles.formGroup}>
                          <label>Prerequisites</label>
                          <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            {extractPrerequisites(selectedItem.courseDetails.metadata)}
                          </p>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Grade Option</label>
                          <p className="text-sm text-gray-700">
                            {extractGradeOption(selectedItem.courseDetails.metadata)}
                          </p>
                        </div>

                        {extractMajorRestrictions(selectedItem.courseDetails.metadata) !== 'None' && (
                          <div className={styles.formGroup}>
                            <label>Major Restrictions</label>
                            <p className="text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                              {extractMajorRestrictions(selectedItem.courseDetails.metadata)}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className={styles.formGroup}>
                      <label>Semester</label>
                      <p className="text-sm text-gray-700">{selectedItem.description?.split(' • ')[1]}</p>
                    </div>

                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                      <p className="text-sm text-blue-900 font-medium flex items-center gap-2">
                        <span className="text-lg">✓</span>
                        Course information from {CAMPUSES.find(c => c.id === selectedCampus)?.displayName} catalog
                      </p>
                    </div>
              </>
            ) : selectedItem.category === 'Courses' ? (
                  // Course without detailed information
                  <>
                    <div className={styles.formGroup}>
                      <label>Course Code</label>
                      <p className="text-lg font-bold text-blue-600">{selectedItem.name}</p>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Details</label>
                      <p className="text-sm text-gray-700">{selectedItem.description}</p>
                    </div>
                    
                    <div className="mt-4 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-300">
                      <p className="text-sm text-yellow-900 font-medium flex items-center gap-2">
                        <span className="text-lg">ℹ️</span>
                        Detailed course information not found in the database
                      </p>
                    </div>
                  </>
                ) : (
                  // Other types of items
                  <>
                    <div className={styles.formGroup}>
                      <label>Type</label>
                      <p className="text-sm text-gray-700">{selectedItem.category}</p>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Name</label>
                      <p className="text-base font-semibold text-gray-800">{selectedItem.name}</p>
                    </div>
                    
                    <div className={styles.formGroup}>
                      <label>Details</label>
                      <p className="text-sm text-gray-700">{selectedItem.description}</p>
                    </div>
                  </>
                )}
          </div>
        </div>
      )}
    </div>
  );
}