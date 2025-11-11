import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/db';
import { internship, internshipApplication } from '@/app/db/schema';
import { and, eq, ilike, or, sql } from 'drizzle-orm';
import { getSession } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/internships
 * Fetch internships with optional filtering
 * Query params:
 *   - search: search in title, company, description
 *   - location: filter by location
 *   - locationType: 'remote', 'hybrid', 'onsite'
 *   - isPaid: 'true' or 'false'
 *   - experienceLevel: 'freshman', 'sophomore', 'junior', 'senior', 'any'
 *   - userRelevant: 'true' to filter by user's major/degree (requires auth)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const locationType = searchParams.get('locationType');
    const isPaid = searchParams.get('isPaid');
    const experienceLevel = searchParams.get('experienceLevel');
    const userRelevant = searchParams.get('userRelevant') === 'true';

    // Build filter conditions
    const conditions = [eq(internship.isActive, true)];

    // Search across title, company, and description
    if (search) {
      conditions.push(
        or(
          ilike(internship.title, `%${search}%`),
          ilike(internship.company, `%${search}%`),
          ilike(internship.description, `%${search}%`)
        )!
      );
    }

    if (location) {
      conditions.push(ilike(internship.location, `%${location}%`));
    }

    if (locationType) {
      conditions.push(eq(internship.locationType, locationType));
    }

    if (isPaid !== null && isPaid !== undefined) {
      conditions.push(eq(internship.isPaid, isPaid === 'true'));
    }

    if (experienceLevel && experienceLevel !== 'any') {
      conditions.push(
        or(
          eq(internship.experienceLevel, experienceLevel),
          eq(internship.experienceLevel, 'any')
        )!
      );
    }

    // Fetch internships
    const internships = await db
      .select()
      .from(internship)
      .where(and(...conditions))
      .orderBy(sql`${internship.postedDate} DESC`);

    // If userRelevant is requested, filter by user's profile
    if (userRelevant) {
      const session = await getSession();
      if (session?.user) {
        // TODO: When user profile with major/degree is implemented,
        // filter internships based on relatedMajors and relatedDegrees
        // For now, return all internships
      }
    }

    // Get application status for authenticated users
    const session = await getSession();
    const applicationsMap = new Map();
    
    if (session?.user) {
      const applications = await db
        .select()
        .from(internshipApplication)
        .where(eq(internshipApplication.userId, session.user.id));
      
      applications.forEach(app => {
        applicationsMap.set(app.internshipId, {
          id: app.id,
          status: app.status,
          appliedDate: app.appliedDate,
        });
      });
    }

    // Attach application status to each internship
    const internshipsWithStatus = internships.map(i => ({
      ...i,
      userApplication: applicationsMap.get(i.id) || null,
    }));

    return NextResponse.json({
      success: true,
      data: internshipsWithStatus,
      count: internshipsWithStatus.length,
    });

  } catch (error) {
    console.error('Error fetching internships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internships' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/internships
 * Create a new internship (admin only in production)
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
    
    const newInternship = await db
      .insert(internship)
      .values({
        title: body.title,
        company: body.company,
        description: body.description,
        requirements: body.requirements,
        location: body.location,
        locationType: body.locationType,
        duration: body.duration,
        isPaid: body.isPaid ?? true,
        salaryRange: body.salaryRange,
        applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        skills: body.skills,
        relatedMajors: body.relatedMajors,
        relatedDegrees: body.relatedDegrees,
        experienceLevel: body.experienceLevel || 'any',
        applicationUrl: body.applicationUrl,
        contactEmail: body.contactEmail,
        isActive: body.isActive ?? true,
        metadata: body.metadata,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newInternship[0],
    });

  } catch (error) {
    console.error('Error creating internship:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create internship' },
      { status: 500 }
    );
  }
}
