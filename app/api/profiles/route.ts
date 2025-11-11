import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/db"
import { profile } from "@/app/db/schema"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { career, college, major, degree, interests, skills } = body

    // Insert the profile into the database
    const [newProfile] = await db
      .insert(profile)
      .values({
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

    return NextResponse.json({ success: true, profile: newProfile }, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    )
  }
}
