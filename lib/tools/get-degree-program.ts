import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { degreeProgram as dp, degree as d, campus as cam } from '@/app/db/schema';
import { sql, eq, or, ilike, and } from 'drizzle-orm';
import { normalizeHawaiian } from '@/lib/normalize-hawaiian';

async function tablesReady(): Promise<boolean> {
    try {
        const res = await db.execute(sql`
            SELECT 
                to_regclass('public.degree_programs') AS degree_programs,
                to_regclass('public.degrees') AS degrees,
                to_regclass('public.campuses') AS campuses
        `);
        const rows = (res as { rows?: unknown[] }).rows || (Array.isArray(res) ? res : []);
        const first = rows[0] as Record<string, unknown> | undefined;
        return !!(first?.degree_programs && first?.degrees && first?.campuses);
    } catch {
        return false;
    }
}

export const getDegreeProgram = tool({
    description: "Search for degree programs by major name, degree type, or campus. Returns detailed program information including total credits, duration, and available tracks. Use when users ask about degree programs, majors they can study, or specific program details.",
    inputSchema: z.object({
        query: z.string().optional().describe("Major name or keyword (e.g., 'Computer Science', 'Business', 'Engineering')"),
        campus: z.string().optional().describe("Filter by campus name (e.g., 'UH Manoa', 'Leeward CC')"),
        degreeType: z.string().optional().describe("Filter by degree type (e.g., 'BA', 'BS', 'AA', 'AS')"),
        limit: z.number().optional().default(20),
    }),
    execute: async ({ query, campus, degreeType, limit = 20 }) => {
        try {
            console.log('🎓 getDegreeProgram called with:', { query, campus, degreeType, limit });
            
            const ready = await tablesReady();
            if (!ready) {
                console.log('❌ Tables not ready');
                return {
                    found: false,
                    message: 'Degree program information is not available yet. Try asking about courses or I can help draft a general academic plan.',
                };
            }

            const conditions = [];
            
            // Search by major name or program name
            if (query?.trim()) {
                conditions.push(or(
                    ilike(dp.majorTitle, `%${query}%`),
                    ilike(dp.programName, `%${query}%`),
                    ilike(dp.track, `%${query}%`)
                ));
            }

            // Filter by campus
            if (campus) {
                console.log('🏫 Filtering by campus:', campus, '-> normalized:', normalizeHawaiian(campus));
                const normalizedInput = normalizeHawaiian(campus).toLowerCase();
                
                // Extract key terms from input for better matching
                // e.g., "UH Manoa" -> check for both "manoa" and optionally "uh"/"university"
                const campusTerms = normalizedInput.split(/\s+/).filter(t => t.length > 2);
                
                // Build flexible matching: name contains term OR aliases contain input OR id matches
                const campusConditions = campusTerms.map(term => 
                    sql`translate(LOWER(${cam.name}), 'āēīōūʻ''''', 'aeiou') LIKE ${`%${term}%`}`
                );
                
                conditions.push(sql`(
                    ${sql.join(campusConditions, sql` OR `)} OR
                    ${cam.aliases}::text ILIKE ${`%${campus}%`} OR
                    ${cam.id} ILIKE ${`%${normalizedInput}%`}
                )`);
            }

            // Filter by degree type
            if (degreeType) {
                conditions.push(ilike(d.code, `%${degreeType}%`));
            }

            const programs = await db
                .select({
                    id: dp.id,
                    programName: dp.programName,
                    majorTitle: dp.majorTitle,
                    track: dp.track,
                    totalCredits: dp.totalCredits,
                    typicalDuration: dp.typicalDurationYears,
                    description: dp.description,
                    degreeCode: d.code,
                    degreeName: d.name,
                    degreeLevel: d.level,
                    campusName: cam.name,
                    campusId: cam.id,
                })
                .from(dp)
                .leftJoin(d, eq(dp.degreeId, d.id))
                .leftJoin(cam, eq(dp.campusId, cam.id))
                .where(conditions.length ? and(...conditions) : undefined)
                .orderBy(cam.name, dp.majorTitle)
                .limit(limit);

            console.log('📊 Query returned', programs?.length || 0, 'programs');
            if (programs?.length > 0) {
                console.log('📋 First program:', programs[0].majorTitle, 'at', programs[0].campusName);
            }

            if (!programs?.length) {
                const filters = [
                    query && `"${query}"`,
                    degreeType && `${degreeType} degrees`,
                    campus && `at ${campus}`,
                ].filter(Boolean).join(' ');

                return {
                    found: false,
                    message: `No degree programs found${filters ? ` matching ${filters}` : ''}. Try different keywords or check the campus/degree type.`,
                };
            }

            // Format results
            const list = programs.map((p, i) => {
                const parts = [
                    `${i + 1}. **${p.majorTitle}**`,
                    p.degreeCode && `(${p.degreeCode})`,
                    p.track && `- ${p.track}`,
                ];
                const subtitle = [
                    p.campusName && `   📍 ${p.campusName}`,
                    p.totalCredits && `   📚 ${p.totalCredits} credits`,
                    p.typicalDuration && `   ⏱️ ${p.typicalDuration} years`,
                ].filter(Boolean);
                
                return parts.filter(Boolean).join(' ') + '\n' + subtitle.join(' • ');
            }).join('\n\n');

            console.log('✅ Returning', programs.length, 'programs successfully');

            return {
                found: true,
                count: programs.length,
                programs: programs.map(p => ({
                    id: p.id,
                    programName: p.programName,
                    majorTitle: p.majorTitle,
                    track: p.track,
                    degreeCode: p.degreeCode,
                    campusName: p.campusName,
                    campusId: p.campusId,
                })),
                formatted: `Found ${programs.length} degree program${programs.length > 1 ? 's' : ''}:\n\n${list}`,
            };
        } catch (error) {
            console.error('getDegreeProgram error:', error);
            return {
                found: false,
                error: true,
                message: 'I\'m having trouble searching for degree programs right now. Please try again.',
            };
        }
    }
});
