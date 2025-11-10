import { NextResponse } from 'next/server'
import { db } from '@/app/db/index'
import { major, degree, majorDegree } from '@/app/db/schema'
import { eq } from 'drizzle-orm'

// In-memory cache
const cache = new Map<string, { data: any[], timestamp: number }>()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

/**
 * GET /api/degrees?majorId=... or ?majorTitle=...
 * Returns array of { id, code, name, level }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const majorId = searchParams.get('majorId')
    const majorTitle = searchParams.get('majorTitle')

    let targetMajorId = majorId ? Number(majorId) : undefined
    const cacheKey = majorId || majorTitle || ''

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      })
    }

    if (!targetMajorId && majorTitle) {
      const found = await db.select().from(major).where(eq(major.title, majorTitle)).limit(1)
      if (found.length === 0) return NextResponse.json([], { status: 200 })
      targetMajorId = found[0].id
    }

    if (!targetMajorId) {
      return NextResponse.json({ error: 'majorId or majorTitle required' }, { status: 400 })
    }

    // join majorDegree -> degree
    const rows = await db
      .select({ id: degree.id, code: degree.code, name: degree.name, level: degree.level })
      .from(degree)
      .innerJoin(majorDegree, eq(degree.id, majorDegree.degreeId))
      .where(eq(majorDegree.majorId, targetMajorId))

    // Update cache
    cache.set(cacheKey, { data: rows, timestamp: Date.now() })

    return NextResponse.json(rows, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
  } catch (err) {
    console.error('Error fetching degrees', err)
    return NextResponse.json({ error: 'Failed to fetch degrees' }, { status: 500 })
  }
}
