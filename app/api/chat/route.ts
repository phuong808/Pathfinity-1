// Chat API route for the university course assistant.
// Defines tools used by the assistant:
// The file contains the system prompt and streaming response wiring.
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
import { semanticSearch } from '@/lib/semantic-search';
import { db } from '@/app/db/index';
import { embedding as e, course as c, campus as cam } from '@/app/db/schema';
import { sql, eq } from 'drizzle-orm';
import { loadChat, saveChat } from '@/app/db/actions';

const tools = {
    getCourseByCode: tool({
        description: "Get detailed information about a specific course by its exact course code (e.g., 'COM 2163', 'ICS 101'). Use this when user mentions a specific course code.",
        inputSchema: z.object({
            courseCode: z.string().describe("The exact course code (e.g., 'COM 2163')"),
        }),
        execute: async ({ courseCode }) => {
            try {
                // Parse course code into prefix and number
                const match = courseCode.trim().match(/^([A-Z]+)\s*(\d+[A-Z]*)$/i);
                if (!match) {
                    return `Invalid course code format: ${courseCode}. Expected format like 'COM 2163' or 'ICS 101'.`;
                }
                
                const [, prefix, number] = match;
                const normalizedPrefix = prefix.toUpperCase();
                const normalizedNumber = number.toUpperCase();
                
                // Join courses with campus and get embedding metadata
                const result = await db
                    .select({
                        courseId: c.id,
                        coursePrefix: c.coursePrefix,
                        courseNumber: c.courseNumber,
                        courseTitle: c.courseTitle,
                        courseDesc: c.courseDesc,
                        numUnits: c.numUnits,
                        deptName: c.deptName,
                        campusId: cam.id,
                        campusName: cam.name,
                        campusType: cam.type,
                        instIpeds: cam.instIpeds,
                        embeddingMetadata: e.metadata,
                    })
                    .from(c)
                    .leftJoin(cam, eq(c.campusId, cam.id))
                    .leftJoin(e, eq(e.courseId, c.id))
                    .where(sql`UPPER(${c.coursePrefix}) = ${normalizedPrefix} AND UPPER(${c.courseNumber}) = ${normalizedNumber}`)
                    .limit(1);

                if (!result || result.length === 0) {
                    return `Course ${courseCode} not found in the knowledge base. Please verify the course code or try searching with keywords.`;
                }

                const course = result[0];
                const metadata = course.embeddingMetadata as any;

                const lines = [
                    `Course: ${course.coursePrefix} ${course.courseNumber} - ${course.courseTitle || 'No title'}`,
                ];

                if (course.campusName) lines.push(`Campus: ${course.campusName}`);
                if (course.deptName) lines.push(`Department: ${course.deptName}`);
                
                // Units/Credits
                if (course.numUnits !== undefined && course.numUnits !== null && String(course.numUnits).trim() !== '') {
                    lines.push(`Units/Credits: ${course.numUnits}`);
                } else {
                    lines.push(`Units/Credits: Not specified`);
                }
                
                if (course.courseDesc) lines.push(`Description: ${course.courseDesc}`);
                
                // Additional metadata from embedding
                if (metadata?.metadata && String(metadata.metadata).trim()) {
                    lines.push(`Additional Info: ${metadata.metadata}`);
                }
                
                // Prerequisites from various possible fields
                const prereqs = metadata?.prerequisites || metadata?.required_prep || metadata?.required_prereq;
                if (prereqs) lines.push(`Prerequisites: ${prereqs}`);

                // Institution info
                if (course.instIpeds) lines.push(`Institution IPEDS: ${course.instIpeds}`);
                if (course.campusType) lines.push(`Campus Type: ${course.campusType}`);

                return lines.join('\n\n');
            } catch (error) {
                console.error('Get course error:', error);
                return 'Error retrieving course information. Please try again.';
            }
        }
    }),
    
    listCourses: tool({
        description: "List courses from the knowledge base. Use when user wants to see all courses, browse courses, or list courses from a specific department/campus.",
        inputSchema: z.object({
            department: z.string().optional().describe("Filter by department name"),
            campus: z.string().optional().describe("Filter by campus name"),
            limit: z.number().optional().default(20).describe("Maximum number of courses to return"),
        }),
        execute: async ({ department, campus, limit = 20 }) => {
            try {
                // Build WHERE conditions
                const conditions = [];
                if (department) {
                    conditions.push(sql`${c.deptName} ILIKE ${`%${department}%`}`);
                }
                if (campus) {
                    conditions.push(sql`${cam.name} ILIKE ${`%${campus}%`}`);
                }

                // Build base query with joins
                const baseQuery = db
                    .select({
                        courseId: c.id,
                        coursePrefix: c.coursePrefix,
                        courseNumber: c.courseNumber,
                        courseTitle: c.courseTitle,
                        courseDesc: c.courseDesc,
                        numUnits: c.numUnits,
                        deptName: c.deptName,
                        campusName: cam.name,
                    })
                    .from(c)
                    .leftJoin(cam, eq(c.campusId, cam.id));

                // Apply WHERE conditions and execute
                const courses = conditions.length > 0
                    ? await baseQuery
                        .where(sql`${sql.join(conditions, sql` AND `)}`)
                        .orderBy(c.coursePrefix, c.courseNumber)
                        .limit(limit)
                    : await baseQuery
                        .orderBy(c.coursePrefix, c.courseNumber)
                        .limit(limit);

                if (!courses || courses.length === 0) {
                    return 'No courses found matching those criteria.';
                }

                const formattedResults = courses.map((course, index) => {
                    const lines = [
                        `[${index + 1}] ${course.coursePrefix} ${course.courseNumber} - ${course.courseTitle || 'No title'}`,
                    ];
                    
                    if (course.campusName) lines.push(`   Campus: ${course.campusName}`);
                    if (course.deptName) lines.push(`   Department: ${course.deptName}`);
                    
                    // Handle units
                    if (course.numUnits !== undefined && course.numUnits !== null && String(course.numUnits).trim() !== '') {
                        lines.push(`   Units: ${course.numUnits}`);
                    }
                    
                    if (course.courseDesc) {
                        const desc = String(course.courseDesc);
                        const truncated = desc.length > 200 ? desc.substring(0, 200) + '...' : desc;
                        lines.push(`   Description: ${truncated}`);
                    }
                    
                    return lines.join('\n');
                }).join('\n\n');

                return formattedResults;
            } catch (error) {
                console.error('List courses error:', error);
                return 'Error retrieving course list. Please try again.';
            }
        }
    }),
    
    searchKnowledgeBase: tool({
        description: "Search the course knowledge base for specific courses or topics. Use when user asks about specific course codes, prerequisites, topics, or detailed course information.",
        inputSchema: z.object({
            query: z.string().describe("The search query to find relevant information"),
        }),
        execute: async ({ query }) => {
            try {
                const results = await semanticSearch(query, 5, 0.3);

                if (!results || results.length === 0) {
                    return 'No relevant course information found. Try rephrasing your question or ask about a specific course code.';
                }

                const formattedResults = results.map((result: any, index: number) => {
                    // Build header with source and course info from normalized tables
                    const headerParts = [`[${index + 1}]`];
                    if (result.source) headerParts.push(result.source);
                    
                    // Build course code from normalized fields
                    if (result.coursePrefix && result.courseNumber) {
                        headerParts.push(`${result.coursePrefix} ${result.courseNumber}`);
                    }
                    
                    const header = headerParts.join(' | ');

                    const lines: string[] = [];

                    // Use normalized course fields directly from the join
                    if (result.coursePrefix && result.courseNumber) {
                        const courseParts = [`${result.coursePrefix} ${result.courseNumber}`];
                        if (result.courseTitle) courseParts.push(result.courseTitle);
                        lines.push(`Course: ${courseParts.join(' - ')}`);
                    } else if (result.title) {
                        lines.push(`Course: ${result.title}`);
                    }

                    if (result.campusName) lines.push(`Campus: ${result.campusName}`);
                    if (result.deptName) lines.push(`Department: ${result.deptName}`);
                    if (result.numUnits) lines.push(`Units: ${result.numUnits}`);
                    if (result.courseDesc) {
                        const desc = String(result.courseDesc);
                        const truncated = desc.length > 300 ? desc.substring(0, 300) + '...' : desc;
                        lines.push(`Description: ${truncated}`);
                    }

                    // Check metadata object for additional fields
                    const content = result.content;
                    if (content && typeof content === 'object') {
                        // Helper function to extract fields from metadata object
                        const pick = (obj: any, candidates: string[]) => {
                            for (const k of candidates) {
                                if (obj[k] !== undefined && obj[k] !== null && String(obj[k]).trim() !== '') {
                                    return obj[k];
                                }
                            }
                            return undefined;
                        };

                        const metadata = pick(content, ['metadata', 'additional_info', 'additional', 'notes']);
                        const outcomes = pick(content, ['learner_outcomes', 'outcomes', 'learning_outcomes']);
                        const prereqs = pick(content, ['prerequisites', 'required_prep', 'required_prereq', 'prereq']);
                        const sectionNotes = pick(content, ['section_notes', 'sectionNotes', 'section', 'section_note']);

                        if (metadata) lines.push(`Additional Info: ${String(metadata)}`);
                        
                        // Handle outcomes (array or string)
                        if (Array.isArray(outcomes)) {
                            lines.push(`Learner Outcomes:\n${outcomes.map(o => `  • ${o}`).join('\n')}`);
                        } else if (outcomes) {
                            lines.push(`Learner Outcomes: ${String(outcomes)}`);
                        }
                        
                        if (prereqs) lines.push(`Prerequisites: ${String(prereqs)}`);
                        if (sectionNotes) lines.push(`Section Notes: ${String(sectionNotes)}`);
                    }

                    // Fallback if no structured fields found
                    if (lines.length === 0) {
                        if (typeof content === 'string') {
                            return `${header}\n${content.trim()}`;
                        }
                        return `${header}\n${JSON.stringify(content, null, 2)}`;
                    }

                    return `${header}\n${lines.join('\n')}`;
                }).join('\n\n');

                return formattedResults;
            } catch (error) {
                console.error('Search error:', error);
                return 'Error searching the course knowledge base. Please try again or refine your query.';
            }
        }
    })
};

export type ChatTools = InferUITools<typeof tools>;
export type ChatMessage = UIMessage<never, UIDataTypes, ChatTools>;

export async function POST(req: Request) {
    try {
        const { message, id }: { message?: ChatMessage; id: string } = await req.json();

        // Load previous messages from database
        const previousMessages = await loadChat(id);

        // Append new message to previous messages if provided
        const allMessages = message ? [...previousMessages, message] : previousMessages;

        // Validate messages against tools to ensure consistency
        const messages = await validateUIMessages({
            messages: allMessages,
            tools: tools as any,
        });

        const result = streamText({
            model: openai('gpt-4.1-mini'),
            messages: convertToModelMessages(messages),
            tools,
            system: `You are a helpful university course assistant with access to the course knowledge base.

DATABASE STRUCTURE:
The system has a normalized database with three main tables:
1. **campuses** table: Contains university/college campus information
   - Fields: id, name, instIpeds (institution IPEDS code), description, type, website, contact info
   - Examples: UH Manoa, Kapiolani CC, Hawaii CC, Kauai CC, UH Maui, UH West Oahu, Honolulu CC, Leeward CC, UH Hilo, PCATT
2. **courses** table: Contains course catalog information
   - Fields: coursePrefix (e.g., "COM", "ICS"), courseNumber (e.g., "2163", "101"), courseTitle, courseDesc, numUnits, deptName
   - Each course is linked to a campus via campusId
3. **embeddings** table: Contains vector embeddings for semantic search
   - Links to both campuses and courses for context-aware retrieval

HOW TO RESPOND:

For greetings and casual conversation:
- Respond naturally and briefly, then offer to help with courses
- Example: "Hello! I'm doing well, thank you. I'm here to help you find course information. What courses are you interested in?"

For specific course code lookups:
- Use getCourseByCode when user mentions a specific course code (e.g., "COM 2163", "tell me about ICS 101")
- This tool queries the courses table joined with campus data
- Returns complete information: course title, description, units, department, campus, IPEDS code
- Use for questions about specific fields: credits, department, campus, prerequisites
- Example queries: "COM 2163", "what is ICS 101", "credits for COM 2187", "tell me about ENG 100"

For listing/browsing courses:
- Use listCourses tool for requests like "list all courses", "show me courses", "what courses are available"
- Can filter by department or campus name if user specifies
- Returns results from the courses table with campus information
- Present results in a clear, organized way
- If many results, suggest being more specific
- IMPORTANT: Only call this tool ONCE per response - do not repeat calls

For listing universities/campuses:
- Users may ask to "list universities", "what universities are included", or "which campuses are available"
- The system includes multiple University of Hawaii campuses and institutions:
  * UH Manoa, UH Hilo, UH West Oahu (4-year universities)
  * Kapiolani CC, Hawaii CC, Honolulu CC, Kauai CC, Leeward CC, UH Maui (community colleges)
  * PCATT (Pacific Center for Advanced Technology Training)
- Use listCourses with a reasonable limit (e.g., 100) and aggregate unique campus names from results
- Or use searchKnowledgeBase with query "campus university" to get campus information
- Present as a bulleted list with campus names
- IMPORTANT: Make only ONE tool call for listing

For topic-based searches:
- Use searchKnowledgeBase for topic-based searches, not exact course codes
- Examples: "AWS courses", "courses about networking", "cybersecurity training", "computer science classes"
- This tool uses semantic search across embeddings linked to courses and campuses
- Always cite results with [1], [2], etc.
- Best for discovering courses by subject matter or keywords

For course-related questions:
- Choose the appropriate tool based on the question type:
  * getCourseByCode: When user asks about a specific course code or its attributes
  * listCourses: When user wants to browse or see multiple courses (can filter by campus/department)
  * searchKnowledgeBase: When user searches by topic/keyword
- If results found: Answer concisely with citations when appropriate
- If no results: Explain you couldn't find that specific information and suggest alternatives

IMPORTANT RULES:
- When asked about credits/units for a course, use getCourseByCode to get complete info
- If credits are "Not specified", clearly state that
- For campus/department information, tools now query the normalized tables with proper joins
- Never call the same tool twice in one response
- Be conversational and helpful, not robotic
- All course data is now properly normalized - course codes are split into prefix + number

For non-course questions (sports, weather, celebrities, general facts):
- Politely decline and redirect to course information
- Example: "I can only help with course information from our catalog. I don't have access to information about sports teams or other topics. Is there a course or program I can help you find?"

RULES:
- Always use tools for course-related questions
- Choose the RIGHT tool: getCourseByCode for specific codes, listCourses for browsing, searchKnowledgeBase for topics
- NEVER call the same tool multiple times in one response
- Be conversational and helpful, not robotic
- Cite sources with [1], [2] when providing course information from searchKnowledgeBase
- Keep responses concise (2-5 sentences typically)
- Guide users toward more specific queries if their question is too broad
- When credits/units are not available, clearly state "Not specified" rather than saying you can't find the info
- Prefer using bulleted style lists when tasked with listing things
- Remember: the database is now normalized with separate campus and course tables - use the tools that query these properly`,
            stopWhen: stepCountIs(2),
        });

        return result.toUIMessageStreamResponse({
            originalMessages: messages,
            // Generate server-side message IDs for persistence
            generateMessageId: createIdGenerator({
                prefix: 'msg',
                size: 16,
            }),
            onFinish: async ({ messages }) => {
                // Save messages to database
                await saveChat({ chatId: id, messages });
            },
        });
    } catch (error) {
        console.error('Error streaming chat completion:', error);
        return new Response('Failed to stream chat completion', { status: 500 });
    }
}