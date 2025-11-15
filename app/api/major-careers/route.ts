/**
 * API routes for major-career pathway data
 * 
 * Endpoints:
 * GET /api/major-careers - Get all majors for a campus
 * GET /api/major-careers?major=name - Get specific major with careers
 * GET /api/major-careers?degreeType=BS - Filter by degree type
 * GET /api/major-careers?search=term - Search majors
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getMajorsByCampus,
  getMajorWithCareerPathways,
  getMajorsByDegreeType,
  searchMajors,
  getMajorCareerStats,
} from "@/app/db/queries";

const DEFAULT_CAMPUS_ID = "uh-manoa";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campusId = searchParams.get("campus") || DEFAULT_CAMPUS_ID;
    const majorName = searchParams.get("major");
    const degreeType = searchParams.get("degreeType");
    const searchTerm = searchParams.get("search");
    const includeStats = searchParams.get("stats") === "true";

    // Get specific major with career pathways
    if (majorName) {
      const data = await getMajorWithCareerPathways(campusId, majorName);
      
      if (!data) {
        return NextResponse.json(
          { error: "Major not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    }

    // Search majors
    if (searchTerm) {
      const results = await searchMajors(campusId, searchTerm);
      return NextResponse.json({
        results,
        count: results.length,
      });
    }

    // Filter by degree type
    if (degreeType) {
      const majors = await getMajorsByDegreeType(campusId, degreeType);
      return NextResponse.json({
        majors,
        count: majors.length,
        degreeType,
      });
    }

    // Get all majors with optional stats
    const majors = await getMajorsByCampus(campusId);
    const response: any = {
      majors,
      count: majors.length,
    };

    if (includeStats) {
      response.stats = await getMajorCareerStats(campusId);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in major-careers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
