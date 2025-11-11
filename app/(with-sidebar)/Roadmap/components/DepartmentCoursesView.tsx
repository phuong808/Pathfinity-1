import React from 'react';
import { Button } from "@/app/components/ui/button";
import { CourseCard } from './CourseCard';
import { CourseCatalog } from '../types';

interface DepartmentCoursesViewProps {
  selectedDepartment: string;
  departmentCourses: CourseCatalog[];
  loadingCourses: boolean;
  onBack: () => void;
}

export function DepartmentCoursesView({
  selectedDepartment,
  departmentCourses,
  loadingCourses,
  onBack,
}: DepartmentCoursesViewProps) {
  if (!selectedDepartment) {
    return null;
  }

  if (loadingCourses) {
    return (
      <div className="p-8">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
          >
            ← Back to Departments
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment}</h2>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (departmentCourses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <p className="text-gray-700 text-xl font-semibold mb-2">No Courses Found</p>
          <p className="text-gray-500 text-sm mb-4">
            No courses available for {selectedDepartment}
          </p>
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
          >
            ← Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="bg-white hover:bg-gray-100 text-gray-900 border-2 border-gray-300"
        >
          ← Back to Departments
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{selectedDepartment}</h2>
          <p className="text-gray-600">{departmentCourses.length} courses available</p>
        </div>
      </div>
      
      <div className="grid gap-4">
        {departmentCourses.map((course, index) => (
          <CourseCard 
            key={`${course.course_prefix}-${course.course_number}-${index}`}
            course={course}
          />
        ))}
      </div>
    </div>
  );
}
