'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Search, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import pathwaysData from '@/app/db/data/manoa_degree_pathways.json';

interface Pathway {
  program_name: string;
  institution: string;
  total_credits: number;
  years: Array<{
    year_number: number;
    semesters: Array<{
      semester_name: string;
      credits: number;
      courses: Array<{
        name: string;
        credits: number;
      }>;
    }>;
  }>;
}

export default function MajorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const pathways = pathwaysData as Pathway[];

  // Extract degree type from program name (BA, BS, BMus, etc.)
  const getDegreeType = (programName: string) => {
    const match = programName.match(/\(([^)]+)\)/);
    return match ? match[1] : 'Degree';
  };

  // Calculate total years
  const getTotalYears = (pathway: Pathway) => {
    return pathway.years.length;
  };

  // Filter pathways based on search query (case insensitive)
  const filteredPathways = useMemo(() => {
    if (!searchQuery.trim()) return pathways;
    
    const query = searchQuery.toLowerCase().trim();
    return pathways.filter(pathway => {
      const programName = pathway.program_name.toLowerCase();
      const degreeType = getDegreeType(pathway.program_name).toLowerCase();
      const institution = pathway.institution.toLowerCase();
      
      // Extract major/specialization (text after "in")
      const majorMatch = pathway.program_name.match(/\sin\s(.+?)(?:\s*[-:]\s*|\s*\(|$)/i);
      const major = majorMatch ? majorMatch[1].toLowerCase() : '';
      
      // Extract specialization after dash (e.g., "- Finance")
      const dashMatch = pathway.program_name.match(/-\s*(.+?)(?:\s*\(|$)/i);
      const dashSpecialization = dashMatch ? dashMatch[1].toLowerCase().trim() : '';
      
      // Extract track/specialization (text in parentheses with "Track")
      const trackMatch = pathway.program_name.match(/\((.+?Track.*?)\)/i);
      const track = trackMatch ? trackMatch[1].toLowerCase() : '';
      
      // Search through all course names in all years and semesters
      const courseNames = pathway.years.flatMap(year => 
        year.semesters.flatMap(semester => 
          semester.courses.map(course => course.name.toLowerCase())
        )
      );
      
      // Check if any course name includes the query
      const hasCourseMatch = courseNames.some(courseName => courseName.includes(query));
      
      return programName.includes(query) || 
             degreeType.includes(query) || 
             institution.includes(query) ||
             major.includes(query) ||
             dashSpecialization.includes(query) ||
             track.includes(query) ||
             hasCourseMatch;
    });
  }, [searchQuery, pathways]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Degree Pathways
          </h1>
          <p className="text-gray-600">
            Explore {pathways.length} degree programs at University of Hawaiʻi at Mānoa
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by program, degree type, major, track, or course code (e.g., BA, Computer Science, CINE 255)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Found {filteredPathways.length} program{filteredPathways.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPathways.map((pathway, index) => (
            <Card 
              key={index}
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer hover:border-green-500"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {getDegreeType(pathway.program_name)}
                  </Badge>
                  <GraduationCap className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <CardTitle className="text-lg leading-tight mb-2">
                  {pathway.program_name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {pathway.institution}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span>{pathway.total_credits} Total Credits</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>{getTotalYears(pathway)} Year Program</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    {pathway.years.reduce((total, year) => 
                      total + year.semesters.reduce((semTotal, sem) => 
                        semTotal + sem.courses.length, 0
                      ), 0
                    )} courses across {pathway.years.reduce((total, year) => 
                      total + year.semesters.length, 0
                    )} semesters
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPathways.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No programs found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
