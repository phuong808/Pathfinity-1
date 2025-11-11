import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { major as m, campus as cam, degree as d, majorDegree as md } from '@/app/db/schema';
import { sql, eq } from 'drizzle-orm';

export const getMajorDetails = tool({
    description: "Get full details about a major: degrees offered, credits, duration. Use ONLY when user wants deep details about ONE major.",
    inputSchema: z.object({
        majorName: z.string().describe("The exact major name from getMajor results"),
        campus: z.string().optional().describe("Campus name if known"),
    }),
    execute: async ({ majorName, campus }) => {
        try {
            const conditions = [sql`${m.title} ILIKE ${`%${majorName}%`}`];
            if (campus) {
                conditions.push(sql`${cam.name} ILIKE ${`%${campus}%`}`);
            }

            const result = await db
                .select({
                    majorTitle: m.title,
                    campusName: cam.name,
                    degreeCode: d.code,
                    degreeName: d.name,
                    credits: md.requiredCredits,
                    duration: md.typicalDuration,
                })
                .from(m)
                .leftJoin(cam, eq(m.campusId, cam.id))
                .leftJoin(md, eq(md.majorId, m.id))
                .leftJoin(d, eq(md.degreeId, d.id))
                .where(sql`${sql.join(conditions, sql` AND `)}`)
                .limit(10);

            if (!result?.length) {
                return `Couldn't find "${majorName}". Try getMajor first to see available majors?`;
            }

            const major = result[0];
            const lines = [
                `**${major.majorTitle}**`,
                major.campusName && `📍 ${major.campusName}`,
                ''
            ];

            const degrees = result.filter(r => r.degreeCode);
            if (degrees.length) {
                lines.push(`**Degrees Offered (${degrees.length}):**`);
                degrees.forEach(deg => {
                    const years = deg.duration ? (deg.duration / 12).toFixed(1) : '?';
                    lines.push(`  • **${deg.degreeCode}** - ${deg.degreeName || deg.degreeCode}`);
                    if (deg.credits) lines.push(`    ${deg.credits} credits, ~${years} years`);
                });
            } else {
                lines.push('No degree information available.');
            }

            return lines.filter(Boolean).join('\n');
        } catch (error) {
            console.error('getMajorDetails error:', error);
            return 'Having trouble getting major details. Try again?';
        }
    }
});
