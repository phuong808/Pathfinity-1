// Chat API route for the university course assistant.
import { 
    streamText,
    UIMessage,
    convertToModelMessages,
    InferUITools,
    UIDataTypes,
    stepCountIs,
    createIdGenerator,
    validateUIMessages,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { loadChat, saveChat } from '@/app/db/actions';
import { 
    getCourse,
    getCampuses,
    getMajor,
    getMajorDetails,
    getDegrees,
    getCampusInfo,
} from '@/lib/tools';

const tools = {
    getCourse,
    getCampuses,
    getMajor,
    getMajorDetails,
    getDegrees,
    getCampusInfo,
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
- "Tell me about Windward CC" or "info about UH Manoa" → use getCampusInfo
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
