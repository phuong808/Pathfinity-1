import React from 'react';
import { cn } from "@/lib/utils";
import { CAMPUSES, type MajorData } from "@/lib/course-mapper";

interface MajorsViewProps {
  filteredMajors: MajorData[];
  selectedCampus: string;
  selectedMajor: MajorData | null;
  majorSearchTerm: string;
  onMajorSearchChange: (value: string) => void;
  onMajorSelect: (major: MajorData) => void;
}

export function MajorsView({
  filteredMajors,
  selectedCampus,
  selectedMajor,
  majorSearchTerm,
  onMajorSearchChange,
  onMajorSelect,
}: MajorsViewProps) {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search for a major..."
            value={majorSearchTerm}
            onChange={(e) => onMajorSearchChange(e.target.value)}
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
                  onClick={() => onMajorSelect(major)}
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
  );
}
