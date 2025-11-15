import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { extractProfileFromConversation, mergeProfileData } from "@/lib/profile-extraction"
import { getUserProfile, upsertUserProfile } from "@/app/db/actions"

/**
 * POST /api/profiles/extract-from-chat
 * Extract profile information from a chat conversation and update user profile
 * 
 * Body: {
 *   messages: Array<{ role: string; content: string }>
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      )
    }

    // Extract profile information from the conversation
    const extractedProfile = await extractProfileFromConversation(messages)

    // Get existing profile
    const existingProfile = await getUserProfile(session.user.id)

    // Merge extracted data with existing profile
    const mergedProfile = mergeProfileData(existingProfile, extractedProfile)

    // Update or create profile
    const updatedProfile = await upsertUserProfile(session.user.id, mergedProfile)

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      extracted: extractedProfile,
    }, { status: 200 })
  } catch (error) {
    console.error("Error extracting profile from chat:", error)
    return NextResponse.json(
      { error: "Failed to extract profile from chat" },
      { status: 500 }
    )
  }
}
