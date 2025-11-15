import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { degreeProgram as dp, campus as cam, degree as d } from '@/app/db/schema';
import { sql, eq, ilike, and } from 'drizzle-orm';
import { normalizeHawaiian } from '@/lib/normalize-hawaiian';

// Lightweight table existence check to handle environments where migrations haven't run.
async function ensureProgramsTable(): Promise<boolean> {
    try {
        // Query pg_catalog to see if the degree_programs table exists
        const rows = await db.execute(sql`SELECT to_regclass('public.degree_programs') AS reg`);
        const rowsArray = (rows as { rows?: unknown[] }).rows || (Array.isArray(rows) ? rows : []);
        const first = rowsArray[0] as Record<string, unknown> | undefined;
        if (!first) return false;
        const value = first.reg ?? first.to_regclass; // fallback variations
        return value !== null;
    } catch {
        return false;
    }
}

export const getMajorDetails = tool({
    description: "Get full details about a major: degrees offered, credits, duration. Use ONLY when user wants deep details about ONE major.",
    inputSchema: z.object({
        majorName: z.string().describe("The exact major name from getMajor results"),
        campus: z.string().optional().describe("Campus name if known"),
    }),
    execute: async ({ majorName, campus }) => {
        // Guard: verify degree_programs table exists to avoid confusing "relation does not exist" errors.
        const hasPrograms = await ensureProgramsTable();
        if (!hasPrograms) {
            return {
                found: false,
                message: 'Major details are not available yet in this environment. You can still ask me to draft a basic roadmap based on general knowledge.',
            };
        }
        try {
            const conditions = [ilike(dp.majorTitle, `%${majorName}%`)];
            if (campus) {
                // Normalize Hawaiian characters for matching + check aliases
                conditions.push(sql`(
                    translate(LOWER(${cam.name}), 'āēīōūʻ''''', 'aeiou') LIKE ${`%${normalizeHawaiian(campus)}%`} OR
                    ${cam.aliases}::text ILIKE ${`%${campus}%`}
                )`);
            }

            const result = await db
                .select({
                    majorTitle: dp.majorTitle,
                    programName: dp.programName,
                    track: dp.track,
                    campusName: cam.name,
                    degreeCode: d.code,
                    degreeName: d.name,
                    credits: dp.totalCredits,
                    duration: dp.typicalDurationYears,
                    description: dp.description,
                })
                .from(dp)
                .leftJoin(cam, eq(dp.campusId, cam.id))
                .leftJoin(d, eq(dp.degreeId, d.id))
                .where(and(...conditions))
                .limit(10);

            if (!result?.length) {
                return {
                    found: false,
                    message: `Couldn't find "${majorName}". Try listing majors first, or I can still draft a general roadmap if you'd like.`,
                };
            }

            const major = result[0];
            const lines = [
                `**${major.majorTitle}**`,
                major.campusName && `📍 ${major.campusName}`,
                major.description && `\n${major.description}`,
                ''
            ];

            // Group by unique degree codes
            const uniqueDegrees = Array.from(
                new Map(result.filter(r => r.degreeCode).map(r => [r.degreeCode, r])).values()
            );

            if (uniqueDegrees.length) {
                lines.push(`**Degrees Offered (${uniqueDegrees.length}):**`);
                uniqueDegrees.forEach(deg => {
                    const years = deg.duration ? deg.duration.toString() : '?';
                    lines.push(`  • **${deg.degreeCode}** - ${deg.degreeName || deg.degreeCode}`);
                    if (deg.track) lines.push(`    Track: ${deg.track}`);
                    if (deg.credits) lines.push(`    ${deg.credits} credits, ~${years} years`);
                });
            } else {
                lines.push('No degree information available.');
            }

            return {
                found: true,
                formatted: lines.filter(Boolean).join('\n'),
            };
        } catch (error) {
            // If the error still leaks a missing relation, surface a clearer message.
            const msg = String((error as Error)?.message || '');
            if (/relation.*degree_programs.*does not exist/i.test(msg)) {
                return {
                    found: false,
                    message: 'Major details are unavailable right now (database not migrated). I can still provide a general overview or create a basic roadmap.'
                };
            }
            console.error('getMajorDetails error:', error);
            return {
                found: false,
                error: true,
                message: 'I\'m having trouble getting major details right now. Please try again later.'
            };
        }
    }
});
