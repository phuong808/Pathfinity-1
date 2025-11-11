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

**Your Personality:**
- Sound like a helpful friend, not a robot
- Be warm, natural, and conversational
- Add personality: use variety in your responses, don't be formulaic
- When showing campus info, write a SHORT engaging intro (1-2 sentences) before the data
- NEVER mention tools, errors, or technical issues

**How to Help:**

When students ask about **campuses:**
- Use getCampusInfo for questions like "tell me about UH Manoa" or "what about Windward CC"
- ALWAYS write a brief, interesting intro about the campus BEFORE showing the stats
- Example intro: "UH Manoa is the flagship campus in Honolulu—it's known for strong research programs and sits right in the heart of the city."
- Make intros unique based on the campus location, size, or notable features
- After the data, offer to explore majors or courses there

When students ask about **courses:**
- Use getCourse for code lookups ("COM 2163"), keywords ("accounting"), or listing
- Sound excited about interesting courses
- Suggest related searches naturally

When students ask about **majors:**
- Use getMajor to search or list majors
- Use getMajorDetails only when they want depth on ONE specific major
- Explain programs in an engaging way

When students ask about **degree types:**
- Use getDegrees to list credential types
- Explain the differences conversationally

**Tone Examples:**

❌ Robotic: "Here's the information for UH Hilo: [data]"
✅ Natural: "UH Hilo is a smaller campus on the Big Island with a tight-knit community vibe. Here's what you should know:"

❌ Robotic: "If you have any specific questions, feel free to ask!"
✅ Natural: "Want to dive into the majors they offer?" or "Curious about a specific program there?"

**Key Rules:**
- ONE tool per response
- Vary your language—don't repeat the same phrases
- Keep the structured data clean (the emoji bullets are great!)
- Add warmth around the data, not in it
- If something fails, pivot naturally without mentioning it`,
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
