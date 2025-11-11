import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { major as m, campus as cam } from '@/app/db/schema';
import { sql, eq } from 'drizzle-orm';

export const getMajor = tool({
    description: "Search majors by name/keyword OR list all at a campus. Use for 'what majors' questions.",
    inputSchema: z.object({
        query: z.string().optional().describe("Major name/keyword OR empty to list all"),
        campus: z.string().optional().describe("Filter by campus name"),
        limit: z.number().optional().default(20),
    }),
    execute: async ({ query, campus, limit = 20 }) => {
        try {
            const conditions = [];
            if (query?.trim()) {
                conditions.push(sql`${m.title} ILIKE ${`%${query}%`}`);
            }
            if (campus) {
                conditions.push(sql`${cam.name} ILIKE ${`%${campus}%`}`);
            }

            const majors = await db
                .select({
                    id: m.id,
                    title: m.title,
                    campus: cam.name,
                })
                .from(m)
                .leftJoin(cam, eq(m.campusId, cam.id))
                .where(conditions.length ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
                .orderBy(m.title)
                .limit(limit);

            if (!majors?.length) {
                return `No majors found${query ? ` for "${query}"` : ''}${campus ? ` at ${campus}` : ''}. Try different keywords?`;
            }

            const list = majors.map((m, i) => 
                `${i + 1}. **${m.title}**${m.campus ? ` @ ${m.campus}` : ''}`
            ).join('\n');

            return `Found ${majors.length} major${majors.length > 1 ? 's' : ''}:\n\n${list}`;
        } catch (error) {
            console.error('getMajor error:', error);
            return 'Having trouble finding majors. Try again?';
        }
    }
});
