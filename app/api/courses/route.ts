import { NextRequest, NextResponse } from 'next/server';
import { getCoursesByCampus, getCoursesByDepartment } from '@/app/db/queries';

interface CourseCatalog {
  id: number;
  campusId: string;
  coursePrefix: string;
  courseNumber: string;
  courseTitle: string | null;
  courseDesc: string | null;
  numUnits: string | null;
  deptName: string | null;
  metadata: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Cache for courses by campus and department
const coursesCache = new Map<string, { data: ReturnType<typeof transformCourse>[], timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// Transform database course format to match the expected API format
function transformCourse(course: CourseCatalog) {
  return {
    course_prefix: course.coursePrefix,
    course_number: course.courseNumber,
    course_title: course.courseTitle || '',
    course_desc: course.courseDesc || '',
    num_units: course.numUnits || '',
    dept_name: course.deptName || '',
    metadata: course.metadata || '',
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campus = searchParams.get('campus');
    const department = searchParams.get('department');

    if (!campus) {
      return NextResponse.json(
        { error: 'Campus parameter is required' },
        { status: 400 }
      );
    }

    const cacheKey = `${campus}:${department || 'all'}`;

    // Check cache first
    const cached = coursesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(
        { courses: cached.data },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    // Get courses from database
    let courses;
    if (department) {
      courses = await getCoursesByDepartment(campus, department);
    } else {
      courses = await getCoursesByCampus(campus);
    }

    // Transform to expected format
    const transformedCourses = courses.map(transformCourse);

    // Update cache
    coursesCache.set(cacheKey, { data: transformedCourses, timestamp: Date.now() });

    return NextResponse.json(
      { courses: transformedCourses },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
