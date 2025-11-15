import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { degreeProgram as dp, campus as cam, degree as d } from '@/app/db/schema';
import { sql, eq, ilike, or, and } from 'drizzle-orm';
import { normalizeHawaiian } from '@/lib/normalize-hawaiian';

async function tablesReady(): Promise<boolean> {
    try {
        const res = await db.execute(sql`SELECT to_regclass('public.degree_programs') AS degree_programs, to_regclass('public.campuses') AS campuses`);
        const rows = (res as { rows?: unknown[] }).rows || (Array.isArray(res) ? res : []);
        const first = rows[0] as Record<string, unknown> | undefined;
        return !!(first?.degree_programs && first?.campuses);
    } catch {
        return false;
    }
}

export const getMajor = tool({
    description: "Search for majors by keyword or list all majors at a campus. Use when asked about majors, programs, or degrees of study.",
    inputSchema: z.object({
        query: z.string().optional().describe("Major name or keyword (e.g., 'computer', 'business', 'engineering')"),
        campus: z.string().optional().describe("Filter by campus name (e.g., 'UH Manoa', 'Leeward CC')"),
        limit: z.number().optional().default(30),
    }),
    execute: async ({ query, campus, limit = 30 }) => {
        try {
            console.log('⚠️  OLD getMajor tool called (should use getDegreeProgram instead!):', { query, campus, limit });
            
            // Gracefully handle environments where tables haven't been created yet
            const ready = await tablesReady();
            if (!ready) {
                return {    
                    found: false,
                    message: 'Majors data is not available yet in this environment. Try asking about courses or campuses, or come back after data is loaded.',
                };
            }

            const conditions = [];
            if (query?.trim()) {
                conditions.push(or(
                    ilike(dp.majorTitle, `%${query}%`),
                    ilike(dp.programName, `%${query}%`)
                ));
            }
            if (campus) {
                // Normalize Hawaiian characters for matching (ā→a, ʻ removed, etc.)
                // Split input into terms for flexible matching (e.g., "UH Manoa" -> ["uh", "manoa"])
                const normalizedInput = normalizeHawaiian(campus).toLowerCase();
                const campusTerms = normalizedInput.split(/\s+/).filter(t => t.length > 2);
                
                const campusConditions = campusTerms.map(term => 
                    sql`translate(LOWER(${cam.name}), 'āēīōūʻ''''', 'aeiou') LIKE ${`%${term}%`}`
                );
                
                conditions.push(sql`(
                    ${sql.join(campusConditions, sql` OR `)} OR
                    ${cam.aliases}::text ILIKE ${`%${campus}%`} OR
                    ${cam.id} ILIKE ${`%${normalizedInput}%`}
                )`);
            }

            const majors = await db
                .select({
                    id: dp.id,
                    title: dp.majorTitle,
                    campus: cam.name,
                    degreeCode: d.code,
                })
                .from(dp)
                .leftJoin(cam, eq(dp.campusId, cam.id))
                .leftJoin(d, eq(dp.degreeId, d.id))
                .where(conditions.length ? and(...conditions) : undefined)
                .orderBy(dp.majorTitle)
                .limit(limit);

            if (!majors?.length) {
                return {
                    found: false,
                    message: `No majors found${query ? ` matching "${query}"` : ''}${campus ? ` at ${campus}` : ''}. Try different keywords or check the campus name.`,
                };
            }

            const list = majors.map((m, i) => 
                `${i + 1}. **${m.title}**${m.campus ? ` @ ${m.campus}` : ''}${m.degreeCode ? ` (${m.degreeCode})` : ''}`
            ).join('\n');

            return {
                found: true,
                count: majors.length,
                majors: majors,
                formatted: `Found ${majors.length} major${majors.length > 1 ? 's' : ''}:\n\n${list}`,
            };
        } catch (error) {
            console.error('getMajor error:', error);
            return {
                found: false,
                error: true,
                message: 'I\'m having trouble searching for majors right now. Please try again in a moment.',
            };
        }
    }
});
