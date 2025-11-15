import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  upsertUserProfile,
  ProfileData,
} from "@/app/db/actions"

/**
 * GET /api/profiles
 * Retrieve the current user's profile
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await getUserProfile(session.user.id)

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile }, { status: 200 })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profiles
 * Create a new profile for the current user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const profileData: ProfileData = {
      // Core fields
      dreamJob: body.dreamJob,
      major: body.major,
      
      // User categorization
      userType: body.userType,
      
      // Career exploration fields
      interests: body.interests,
      strengths: body.strengths,
      weaknesses: body.weaknesses,
      experience: body.experience,
      jobPreference: body.jobPreference,
      
      // Legacy fields
      career: body.career,
      college: body.college,
      degree: body.degree,
      skills: body.skills,
      roadmap: body.roadmap,
    }

    const newProfile = await createUserProfile(session.user.id, profileData)

    return NextResponse.json({ success: true, profile: newProfile }, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profiles
 * Update the current user's profile (partial update)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const profileData: Partial<ProfileData> = {}

    // Only include fields that are provided
    if (body.dreamJob !== undefined) profileData.dreamJob = body.dreamJob
    if (body.major !== undefined) profileData.major = body.major
    if (body.userType !== undefined) profileData.userType = body.userType
    if (body.interests !== undefined) profileData.interests = body.interests
    if (body.strengths !== undefined) profileData.strengths = body.strengths
    if (body.weaknesses !== undefined) profileData.weaknesses = body.weaknesses
    if (body.experience !== undefined) profileData.experience = body.experience
    if (body.jobPreference !== undefined) profileData.jobPreference = body.jobPreference
    if (body.career !== undefined) profileData.career = body.career
    if (body.college !== undefined) profileData.college = body.college
    if (body.degree !== undefined) profileData.degree = body.degree
    if (body.skills !== undefined) profileData.skills = body.skills
    if (body.roadmap !== undefined) profileData.roadmap = body.roadmap

    const updatedProfile = await updateUserProfile(session.user.id, profileData)

    return NextResponse.json({ success: true, profile: updatedProfile }, { status: 200 })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profiles
 * Create or update (upsert) the current user's profile
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const profileData: ProfileData = {
      // Core fields
      dreamJob: body.dreamJob,
      major: body.major,
      
      // User categorization
      userType: body.userType,
      
      // Career exploration fields
      interests: body.interests,
      strengths: body.strengths,
      weaknesses: body.weaknesses,
      experience: body.experience,
      jobPreference: body.jobPreference,
      
      // Legacy fields
      career: body.career,
      college: body.college,
      degree: body.degree,
      skills: body.skills,
      roadmap: body.roadmap,
    }

    const profile = await upsertUserProfile(session.user.id, profileData)

    return NextResponse.json({ success: true, profile }, { status: 200 })
  } catch (error) {
    console.error("Error upserting profile:", error)
    return NextResponse.json(
      { error: "Failed to upsert profile" },
      { status: 500 }
    )
  }
}
