/**
 * API route for specific major by ID
 * GET /api/major-careers/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db";
import { majorCareerMapping, careerPathway } from "@/app/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const majorId = parseInt(params.id);

    if (isNaN(majorId)) {
      return NextResponse.json(
        { error: "Invalid major ID" },
        { status: 400 }
      );
    }

    // Get major
    const [major] = await db.select()
      .from(majorCareerMapping)
      .where(eq(majorCareerMapping.id, majorId))
      .limit(1);

    if (!major) {
      return NextResponse.json(
        { error: "Major not found" },
        { status: 404 }
      );
    }

    // Get career pathways
    const careers = major.careerPathwayIds && major.careerPathwayIds.length > 0
      ? await db.select()
          .from(careerPathway)
          .where(inArray(careerPathway.id, major.careerPathwayIds))
      : [];

    return NextResponse.json({
      ...major,
      careerPathways: careers,
    });
  } catch (error) {
    console.error("Error in major-careers/[id] API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
