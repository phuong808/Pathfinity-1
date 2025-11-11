import { tool } from 'ai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { course as c, campus as cam } from '@/app/db/schema';
import { sql, eq } from 'drizzle-orm';

export const getCourse = tool({
    description: "Search for courses - by code ('COM 2163'), keyword ('accounting'), or list all. One tool for all course needs.",
    inputSchema: z.object({
        query: z.string().optional().describe("Course code OR keyword OR empty"),
        campus: z.string().optional().describe("Filter by campus"),
        limit: z.number().optional().default(15),
    }),
    execute: async ({ query, campus, limit = 15 }) => {
        try {
            // Check if it's a course code
            const codeMatch = query?.trim().match(/^([A-Z]+)\s*(\d+[A-Z]*)$/i);
            
            if (codeMatch) {
                // Exact course lookup
                const [, prefix, number] = codeMatch;
                const result = await db
                    .select({
                        prefix: c.coursePrefix,
                        number: c.courseNumber,
                        title: c.courseTitle,
                        desc: c.courseDesc,
                        credits: c.numUnits,
                        dept: c.deptName,
                        campus: cam.name,
                    })
                    .from(c)
                    .leftJoin(cam, eq(c.campusId, cam.id))
                    .where(sql`UPPER(${c.coursePrefix}) = ${prefix.toUpperCase()} AND UPPER(${c.courseNumber}) = ${number.toUpperCase()}`)
                    .limit(1);

                if (!result?.length) {
                    return `Couldn't find ${query}. Try searching by keyword?`;
                }

                const course = result[0];
                return [
                    `**${course.prefix} ${course.number}** - ${course.title || 'Untitled'}`,
                    course.campus && `📍 ${course.campus}`,
                    course.dept && `Department: ${course.dept}`,
                    course.credits && `Credits: ${course.credits}`,
                    course.desc && `\n${course.desc}`,
                ].filter(Boolean).join('\n');
            }

            // Keyword search or list
            const conditions = [];
            if (query?.trim()) {
                conditions.push(sql`(
                    ${c.courseTitle} ILIKE ${`%${query}%`} OR 
                    ${c.courseDesc} ILIKE ${`%${query}%`} OR
                    ${c.deptName} ILIKE ${`%${query}%`}
                )`);
            }
            if (campus) {
                conditions.push(sql`${cam.name} ILIKE ${`%${campus}%`}`);
            }

            const courses = await db
                .select({
                    prefix: c.coursePrefix,
                    number: c.courseNumber,
                    title: c.courseTitle,
                    credits: c.numUnits,
                    campus: cam.name,
                })
                .from(c)
                .leftJoin(cam, eq(c.campusId, cam.id))
                .where(conditions.length ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
                .orderBy(c.coursePrefix, c.courseNumber)
                .limit(limit);

            if (!courses?.length) {
                return `No courses found. Try a different search?`;
            }

            const list = courses.map((c, i) => 
                `${i + 1}. **${c.prefix} ${c.number}** - ${c.title}${c.credits ? ` (${c.credits} cr)` : ''}${c.campus ? ` @ ${c.campus}` : ''}`
            ).join('\n');

            return `Found ${courses.length} course${courses.length > 1 ? 's' : ''}:\n\n${list}`;
        } catch (error) {
            console.error('getCourse error:', error);
            return 'Having trouble with that search. Try again?';
        }
    }
});
