import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { internshipApplication } from '@/app/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/internships/applications
 * Get all applications for the authenticated user
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applications = await db
      .select()
      .from(internshipApplication)
      .where(eq(internshipApplication.userId, session.user.id));

    return NextResponse.json({
      success: true,
      data: applications,
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/internships/applications
 * Create or update an internship application
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { internshipId, status, notes, resumeUrl, coverLetterUrl } = body;

    if (!internshipId) {
      return NextResponse.json(
        { success: false, error: 'internshipId is required' },
        { status: 400 }
      );
    }

    // Check if application already exists
    const existing = await db
      .select()
      .from(internshipApplication)
      .where(
        and(
          eq(internshipApplication.userId, session.user.id),
          eq(internshipApplication.internshipId, internshipId)
        )
      );

    let result;

    if (existing.length > 0) {
      // Update existing application
      result = await db
        .update(internshipApplication)
        .set({
          status: status || existing[0].status,
          notes: notes !== undefined ? notes : existing[0].notes,
          resumeUrl: resumeUrl !== undefined ? resumeUrl : existing[0].resumeUrl,
          coverLetterUrl: coverLetterUrl !== undefined ? coverLetterUrl : existing[0].coverLetterUrl,
          appliedDate: status === 'applied' && !existing[0].appliedDate ? new Date() : existing[0].appliedDate,
          updatedAt: new Date(),
        })
        .where(eq(internshipApplication.id, existing[0].id))
        .returning();
    } else {
      // Create new application
      result = await db
        .insert(internshipApplication)
        .values({
          userId: session.user.id,
          internshipId,
          status: status || 'saved',
          notes,
          resumeUrl,
          coverLetterUrl,
          appliedDate: status === 'applied' ? new Date() : null,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });

  } catch (error) {
    console.error('Error creating/updating application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/internships/applications?id=123
 * Delete an application
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    await db
      .delete(internshipApplication)
      .where(
        and(
          eq(internshipApplication.id, parseInt(id)),
          eq(internshipApplication.userId, session.user.id)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete application' },
      { status: 500 }
    );
  }
}
