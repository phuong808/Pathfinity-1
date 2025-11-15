/**
 * API routes for career pathway data
 * 
 * Endpoints:
 * GET /api/career-pathways - Get all career pathways
 * GET /api/career-pathways?category=name - Filter by category
 * GET /api/career-pathways?title=name - Get specific career
 * GET /api/career-pathways?findMajors=title - Find majors for a career
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllCareerPathways,
  getCareerPathwayByTitle,
  getCareerPathwaysByCategory,
  getMajorsForCareer,
} from "@/app/db/queries";

const DEFAULT_CAMPUS_ID = "uh-manoa";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const title = searchParams.get("title");
    const findMajors = searchParams.get("findMajors");
    const campusId = searchParams.get("campus") || DEFAULT_CAMPUS_ID;

    // Find majors that lead to a specific career
    if (findMajors) {
      const majors = await getMajorsForCareer(campusId, findMajors);
      return NextResponse.json({
        careerTitle: findMajors,
        majors,
        count: majors.length,
      });
    }

    // Get specific career by title
    if (title) {
      const career = await getCareerPathwayByTitle(title);
      
      if (!career) {
        return NextResponse.json(
          { error: "Career pathway not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(career);
    }

    // Filter by category
    if (category) {
      const careers = await getCareerPathwaysByCategory(category);
      return NextResponse.json({
        careers,
        count: careers.length,
        category,
      });
    }

    // Get all career pathways
    const careers = await getAllCareerPathways();
    return NextResponse.json({
      careers,
      count: careers.length,
    });
  } catch (error) {
    console.error("Error in career-pathways API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
