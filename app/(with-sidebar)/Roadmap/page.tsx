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
        items.push({
          id: `${itemId++}`,
          category: 'Courses',
          name: course.name,
          startYear: actualYear,
          startMonth,
          endYear: actualYear,
          endMonth,
          description: `${course.credits} credits • ${semesterLabel}`,
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
        <div className="flex flex-col p-4 gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={styles.headerTitle}>
                � UH Mānoa Degree Pathway Roadmap
              </h1>
              {selectedPathway && (
                <p className="text-sm text-gray-600 mt-1">
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
                    className="w-[350px] justify-between"
                  >
                    {selectedPathwayId
                      ? pathways.find((p) => p.id === selectedPathwayId)?.programName
                      : "Select a degree program..."}
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
                                "mr-2 h-4 w-4",
                                selectedPathwayId === pathway.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{pathway.programName}</span>
                              <span className="text-xs text-gray-500">{pathway.institution} • {pathway.totalCredits} credits</span>
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
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">No pathway selected</p>
                <p className="text-gray-400 text-sm">Select a degree program from the dropdown above to view the 4-year roadmap</p>
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
                  
                  return (
                    <div key={periodIndex} className={styles.contentRow}>
                      {/* Timeline cell for this row */}
                      <div 
                        className={styles.timelineCell}
                        style={{ backgroundColor: getTimelineColor(period) }}
                      >
                        <div className={styles.timelineLabel}>
                          <span className={styles.timelineYear}>Year {year}</span>
                          <span className={styles.timelineSemester}>{semester}</span>
                        </div>
                      </div>
                      
                      {/* Category columns */}
                      {categories.filter(cat => visibleCategories.includes(cat)).map((category) => {
                        // Get items for this period and category
                        const itemsForCell = timelineData.filter(item => {
                          const itemPeriod = item.description?.split(' • ')[1];
                          return item.category === category && itemPeriod === period;
                        });

                        return (
                          <div key={category} className={styles.contentColumn}>
                            {itemsForCell.map((item) => {
                              const itemColor = getItemColor(item.id, category, item.description);
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
                                  <div className={styles.itemCardLabel}>{item.name}</div>
                                  <div className={styles.itemCardDetails}>
                                    {item.description?.split(' • ')[0]}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
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
            <h3 className="font-bold">Item Details</h3>
            <button
              onClick={() => setSelectedItem(null)}
              className={styles.closeButton}
              aria-label="Close details panel"
            >
              <X size={20} />
            </button>
          </div>
          <div className={styles.editPanelContent}>
            <div className={styles.formGroup}>
              <label className="text-gray-700 font-semibold">Type</label>
              <p className="text-sm text-gray-600 mt-1">{selectedItem.category}</p>
            </div>
            <div className={styles.formGroup}>
              <label className="text-gray-700 font-semibold">Name</label>
              <p className="text-sm text-gray-600 mt-1">{selectedItem.name}</p>
            </div>
            <div className={styles.formGroup}>
              <label className="text-gray-700 font-semibold">Details</label>
              <p className="text-sm text-gray-600 mt-1">{selectedItem.description}</p>
            </div>
            <div className={styles.formGroup}>
              <label className="text-gray-700 font-semibold">Period</label>
              <p className="text-sm text-gray-600 mt-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedItem.startMonth]} {selectedItem.startYear} - {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][selectedItem.endMonth]} {selectedItem.endYear}
              </p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                💡 Click on any item to view its details. Each card represents a course, internship, activity, or job in your pathway.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <p className="text-center text-sm text-gray-600">
          📅 Click on any card to view details • View courses, internships, activities, and jobs organized by category and semester across your 4-year journey
        </p>
      </div>
    </div>
  );
}
