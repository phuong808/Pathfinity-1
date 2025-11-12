import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/db"
import { profile } from "@/app/db/schema"
import { auth } from "@/lib/auth"
import { generateRoadmapForProfile } from "@/app/db/actions"
import { sql } from "drizzle-orm"

/**
 * Find the lowest available ID in the profiles table
 */
async function findLowestAvailableId(): Promise<number> {
  // Get all existing IDs
  const existingProfiles = await db
    .select({ id: profile.id })
    .from(profile)
    .orderBy(profile.id)

  const existingIds = new Set(existingProfiles.map(p => p.id))

  // Find the first gap in the sequence starting from 1
  let lowestId = 1
  while (existingIds.has(lowestId)) {
    lowestId++
  }

  return lowestId
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { career, college, major, degree, interests, skills } = body

    // Find the lowest available ID
    const nextId = await findLowestAvailableId()

    // Insert the profile into the database with explicit ID
    const [newProfile] = await db
      .insert(profile)
      .values({
        id: nextId,
        userId: session.user.id,
        career,
        college,
        major,
        degree,
        interests,
        skills,
        roadmap: null,
      })
      .returning()

    // Generate roadmap in the background (non-blocking)
    generateRoadmapForProfile(newProfile.id).catch((error) => {
      console.error(`Background roadmap generation failed for profile ${newProfile.id}:`, error)
    })

    return NextResponse.json({ success: true, profile: newProfile }, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    )
  }
}
