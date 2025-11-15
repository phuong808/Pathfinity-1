import { NextResponse } from 'next/server'
import onetOccupations from '@/app/db/data/onet-occupations.json'

/**
 * O*NET Titles Autocomplete API
 * 
 * Provides job title suggestions using local O*NET alternate titles JSON.
 * Searches through all alternate titles and returns matching results with O*NET-SOC codes.
 * 
 * Query params:
 *   - q: search query (min 2 characters)
 * 
 * Returns: Array of { id: code, code, name: title, displayName: title }
 */

// In-memory cache for autocomplete results
const cache = new Map<string, { ts: number; data: any }>()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// Type the JSON import
const occupationsMap = onetOccupations as Record<string, string>

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q') || searchParams.get('query') || ''

    // Validate input
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        error: 'Query parameter "q" must be at least 2 characters' 
      }, { status: 400 })
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim()
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data)
    }

    // Search through the JSON for matching titles
    const searchLower = query.toLowerCase()
    const matches: Array<{ id: string; code: string; name: string; displayName: string }> = []
    
    for (const [title, code] of Object.entries(occupationsMap)) {
      if (title.toLowerCase().includes(searchLower)) {
        matches.push({
          id: code,
          code: code,
          name: title,
          displayName: title,
        })
        
        // Limit results to 10
        if (matches.length >= 10) break
      }
    }
    
    // Cache the results
    cache.set(cacheKey, { ts: Date.now(), data: matches })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('O*NET autocomplete error:', error)
    
    return NextResponse.json({ 
      error: 'Failed to fetch title suggestions',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
