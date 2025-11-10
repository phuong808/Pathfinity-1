// Chat API route for the university course assistant.
import { 
    streamText,
    UIMessage,
    convertToModelMessages,
    tool,
    InferUITools,
    UIDataTypes,
    stepCountIs,
    createIdGenerator,
    validateUIMessages,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { db } from '@/app/db/index';
import { course as c, campus as cam, major as m, degree as d, majorDegree as md } from '@/app/db/schema';
import { sql, eq } from 'drizzle-orm';
import { loadChat, saveChat } from '@/app/db/actions';

const tools = {
    getCourse: tool({
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
    }),

    getCampuses: tool({
        description: "List all UH system campuses. Use when asked 'what campuses' or 'list universities'.",
        inputSchema: z.object({}),
        execute: async () => {
            try {
                const campuses = await db
                    .select({
                        name: cam.name,
                        type: cam.type,
                    })
                    .from(cam)
                    .orderBy(cam.type, cam.name);

                if (!campuses?.length) return 'No campuses found.';

                const unis = campuses.filter(c => c.type === 'university');
                const ccs = campuses.filter(c => c.type === 'community_college');
                const other = campuses.filter(c => c.type !== 'university' && c.type !== 'community_college');

                const lines = [`**${campuses.length} UH System Campuses:**\n`];
                
                if (unis.length) {
                    lines.push('🎓 **Universities:**');
                    unis.forEach(c => lines.push(`  • ${c.name}`));
                    lines.push('');
                }
                
                if (ccs.length) {
                    lines.push('🏫 **Community Colleges:**');
                    ccs.forEach(c => lines.push(`  • ${c.name}`));
                    lines.push('');
                }
                
                if (other.length) {
                    lines.push('**Other:**');
                    other.forEach(c => lines.push(`  • ${c.name}`));
                }

                return lines.join('\n');
            } catch (error) {
                console.error('getCampuses error:', error);
                return 'Having trouble loading campuses. Try again?';
            }
        }
    }),

    getMajor: tool({
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
    }),

    getMajorDetails: tool({
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
    }),

    getDegrees: tool({
        description: "List all degree types (B.S., M.A., Ph.D., etc.). Use when asked about degree TYPES, not specific majors.",
        inputSchema: z.object({
            level: z.string().optional().describe("Filter: 'baccalaureate', 'associate', 'graduate', 'doctorate', 'certificate'"),
        }),
        execute: async ({ level }) => {
            try {
                let query = db.select({
                    code: d.code,
                    name: d.name,
                    level: d.level,
                }).from(d).orderBy(d.level, d.code);

                if (level) {
                    query = query.where(eq(d.level, level)) as any;
                }

                const degrees = await query;
                if (!degrees?.length) return level ? `No ${level} degrees found.` : 'No degrees found.';

                const byLevel = degrees.reduce((acc, deg) => {
                    const lvl = deg.level || 'Other';
                    if (!acc[lvl]) acc[lvl] = [];
                    acc[lvl].push(deg);
                    return acc;
                }, {} as Record<string, typeof degrees>);

                const lines = [`**${degrees.length} Degree Types:**\n`];
                Object.entries(byLevel).forEach(([lvl, degs]) => {
                    lines.push(`**${lvl.toUpperCase()}:**`);
                    degs.forEach(d => lines.push(`  • ${d.code}${d.name ? ` - ${d.name}` : ''}`));
                    lines.push('');
                });

                return lines.join('\n');
            } catch (error) {
                console.error('getDegrees error:', error);
                return 'Having trouble loading degrees. Try again?';
            }
        }
    }),
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
    try {
        const { message, id }: { message?: ChatMessage; id: string } = await req.json();

        const previousMessages = await loadChat(id);
        const allMessages = message ? [...previousMessages, message] : previousMessages;
        const messages = await validateUIMessages({
            messages: allMessages,
            tools: tools as any,
        });

        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages: convertToModelMessages(messages),
            tools,
            system: `You're a friendly UH academic advisor helping students explore courses and programs.

**Your Style:**
- Warm, conversational, enthusiastic
- Keep answers concise (2-4 sentences unless showing data)
- NEVER mention tools, errors, or technical issues
- If something fails, try a different approach silently
- Use "credits" not "units" when showing course info

**How to Help:**

When students ask about **courses:**
- "Tell me about COM 2163" → use getCourse with query: "COM 2163"
- "Find accounting courses" → use getCourse with query: "accounting"
- "List courses" → use getCourse with no query
- Always ask if they want more details or filters

When students ask about **campuses:**
- "What campuses" or "list universities" → use getCampuses
- After showing campuses, suggest exploring majors there

When students ask about **majors:**
- "What majors are offered" → use getMajor with no query
- "What majors at UH Manoa" → use getMajor with campus: "UH Manoa"
- "Tell me about Computer Science" → use getMajor with query: "Computer Science"
- If they want deep details (degrees, credits), use getMajorDetails

When students ask about **degrees (types):**
- "What degrees are available" → use getDegrees
- "What's a B.S. vs B.A." → use getDegrees then explain
- Clarify: "Degrees are credentials (B.S., M.A.), majors are fields of study"

**Golden Rules:**
1. ONE tool per response maximum
2. Never repeat yourself - always move forward
3. If results are empty, suggest alternatives cheerfully
4. Always end with a helpful next step or question
5. Format lists cleanly with bullet points
6. Convert months to years for duration (48 months = 4 years)
7. Never say "I hit a snag" or expose errors

**Example Good Responses:**
- "Here are 15 courses I found! Want to filter by campus or search for something specific?"
- "I found 8 majors matching that. Would you like details on any of them?"
- "UH Manoa offers Computer Science with B.S., B.A., and M.S. options. Want to see the requirements?"

**Example Bad Responses:**
- "I'll use the getCourse tool now..." (never mention tools)
- "Error: No results found" (say: "Couldn't find that, try...")
- Showing 50+ results without context (limit and explain)

Remember: You're a helpful guide, not a database. Make it feel like a conversation!`,
            stopWhen: stepCountIs(2),
        });

        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            generateMessageId: createIdGenerator({
                prefix: 'msg',
                size: 16,
            }),
            onFinish: async ({ messages }) => {
                await saveChat({ chatId: id, messages });
            },
        });
    } catch (error) {
        console.error('Error streaming chat completion:', error);
        return new Response('Failed to stream chat completion', { status: 500 });
    }
}
