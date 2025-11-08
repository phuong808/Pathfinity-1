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
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCourseDetails, type CourseDetails, extractPrerequisites, extractGradeOption, extractMajorRestrictions } from "@/lib/course-mapper";

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
function pathwayToTimeline(pathwayData: PathwayData): { items: TimelineItem[], categories: string[], periods: string[] } {
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
        // Get detailed course information from manoa_courses.json
        const courseDetails = getCourseDetails(course.name);
        
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
  const [open, setOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<PathwayRecord | null>(null);

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

  const handlePathwaySelect = (pathwayId: number) => {
    const pathway = pathways.find(p => p.id === pathwayId);
    if (pathway?.pathwayData) {
      const { items, categories: pathwayCategories, periods: pathwayPeriods } = pathwayToTimeline(pathway.pathwayData);
      setTimelineData(items);
      setCategories(pathwayCategories);
      setPeriods(pathwayPeriods);
      setSelectedPathwayId(pathwayId);
      setSelectedPathway(pathway);
      setOpen(false);
      setSelectedItem(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className="flex flex-col p-5 pl-16 gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={styles.headerTitle}>
                🎓 UH Mānoa Degree Pathway
              </h1>
              {selectedPathway && (
                <p className="text-sm text-blue-100 mt-2 font-medium">
                  {selectedPathway.programName} • {selectedPathway.totalCredits} Total Credits
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[350px] justify-between bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-green-600 font-medium"
                  >
                    <span className="truncate">
                      {selectedPathwayId
                        ? pathways.find((p) => p.id === selectedPathwayId)?.programName
                        : "Select a degree program..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0">
                  <Command>
                    <CommandInput placeholder="Search degree programs..." />
                    <CommandList>
                      <CommandEmpty>No program found.</CommandEmpty>
                      <CommandGroup>
                        {pathways.map((pathway) => (
                          <CommandItem
                            key={pathway.id}
                            value={`${pathway.id}-${pathway.programName}`}
                            onSelect={(currentValue) => {
                              const pathwayId = parseInt(currentValue.split('-')[0]);
                              handlePathwaySelect(pathwayId);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 flex-shrink-0",
                                selectedPathwayId === pathway.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="font-medium truncate">{pathway.programName}</span>
                              <span className="text-xs text-gray-500 truncate">{pathway.institution} • {pathway.totalCredits} credits</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div className={styles.timelineContainer}>
        {/* Grid area with timeline integrated into each row */}
        <div className={styles.timelineGrid}>
          {timelineData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4">🎓</div>
                <p className="text-gray-700 text-xl font-semibold mb-2">No Pathway Selected</p>
                <p className="text-gray-500 text-sm max-w-md">
                  Select a degree program from the dropdown above to view your complete 4-year academic pathway with detailed course information
                </p>
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
      </div>

      {/* Details Panel */}
      {selectedItem && (
        <div className={styles.editPanel}>
          <div className={styles.editPanelHeader}>
            <h3 className="font-bold text-lg text-gray-800">
              {selectedItem.category === 'Courses' && selectedItem.courseDetails ? '📖 Course Information' : 'ℹ️ Item Details'}
            </h3>
            <button
              onClick={() => setSelectedItem(null)}
              className={styles.closeButton}
              aria-label="Close details panel"
            >
              <X size={20} />
            </button>
          </div>
          <div className={styles.editPanelContent}>
            {/* Show detailed course information if available */}
            {selectedItem.category === 'Courses' && selectedItem.courseDetails ? (
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
                    Course information from UH Mānoa catalog
                  </p>
                </div>
              </>
            ) : selectedItem.category === 'Courses' ? (
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
