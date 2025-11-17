"use client"

import React, { useMemo } from "react"
import type { Course } from "./types"
import {
  getCourseDetails,
  extractPrerequisites,
  extractGradeOption,
  extractMajorRestrictions,
  CAMPUSES,
} from '@/lib/course-mapper'

export function CourseMenu({ course, pos, onClose }: { course: Course; pos: { x: number; y: number } | null; onClose: () => void }) {
  if (!course || !pos) return null

  // Try to find detailed course information by scanning campuses and returning
  // the first match. This allows the menu to work even when a campus isn't
  // explicitly provided to the roadmap component.
  const { courseDetails, campus } = useMemo(() => {
    for (const c of CAMPUSES) {
      const details = getCourseDetails(course.name, c.id)
      if (details) return { courseDetails: details, campus: c }
    }
    return { courseDetails: undefined, campus: CAMPUSES.find(c => c.id === 'manoa') }
  }, [course.name])

  return (
    <div
      className="absolute z-50"
      style={{ left: pos.x, top: pos.y, transform: "translateY(8px)" }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="bg-white border rounded shadow-lg p-4 w-80">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold">{course.name}</div>
          </div>
          <button
            aria-label="Close"
            className="text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            ✕
          </button>
        </div>

        {/* If we found course details, show richer information */}
        {courseDetails ? (
          <div className="mt-3 text-sm text-gray-700 space-y-2">
            <div className="font-semibold text-gray-800">{courseDetails.course_title}</div>
            <div className="text-gray-700">{courseDetails.course_desc}</div>

            <div className="flex gap-4 mt-2 text-sm">
              <div className="text-gray-600">Dept: {courseDetails.dept_name}</div>
              <div className="text-gray-600">Credits: {courseDetails.num_units}</div>
            </div>

            {courseDetails.metadata && (
              <div className="mt-2 text-xs text-gray-700 bg-slate-100 p-2 rounded">
                <div className="font-medium">Prerequisites</div>
                <div className="text-sm">{extractPrerequisites(courseDetails.metadata)}</div>

                <div className="mt-2 font-medium">Grade Option</div>
                <div className="text-sm">{extractGradeOption(courseDetails.metadata)}</div>

                {extractMajorRestrictions(courseDetails.metadata) !== 'None' && (
                  <div className="mt-2 font-medium text-red-700">Major Restrictions</div>
                )}
                {extractMajorRestrictions(courseDetails.metadata) !== 'None' && (
                  <div className="text-sm text-red-700">{extractMajorRestrictions(courseDetails.metadata)}</div>
                )}
              </div>
            )}

            <div className="mt-3 text-xs text-blue-800 bg-blue-50 p-2 rounded border border-blue-100">
              Course information from {campus?.displayName}
            </div>
          </div>
        ) : (
          <div className="mt-3 text-sm text-gray-700">Details about this course are not available.</div>
        )}
      </div>
    </div>
  )
}

export default CourseMenu
