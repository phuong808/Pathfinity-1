import { NextRequest, NextResponse } from 'next/server';
import { getDegreeProgramsWithPathways } from '@/app/db/queries';

// Cache for degree programs by campus
const programsCache = new Map<string, { data: unknown[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campus = searchParams.get('campus');

    if (!campus) {
      return NextResponse.json(
        { error: 'Campus parameter is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = programsCache.get(campus);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { programs: cached.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Get programs from database
    const dbPrograms = await getDegreeProgramsWithPathways(campus);

    const transformedPrograms = dbPrograms.map(program => ({
      majorName: program.programName || program.majorTitle || 'Untitled Program',
      degrees: program.degreeCode ? [program.degreeCode] : [],
      institution: program.institution,
      pathwayData: program.pathwayData,
    }));

    programsCache.set(campus, { data: transformedPrograms, timestamp: Date.now() });

    return NextResponse.json(
      { programs: transformedPrograms },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching degree programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch degree programs' },
      { status: 500 }
    );
  }
}