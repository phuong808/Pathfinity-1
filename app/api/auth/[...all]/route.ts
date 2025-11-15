import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Add error handling wrapper
const handler = toNextJsHandler(auth.handler);

export const GET = async (req: Request) => {
  try {
    console.log('🔐 Auth GET request:', req.url);
    return await handler.GET(req);
  } catch (error) {
    console.error('❌ Auth GET error:', error);
    return new Response(JSON.stringify({ error: 'Authentication error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST = async (req: Request) => {
  try {
    console.log('🔐 Auth POST request:', req.url);
    return await handler.POST(req);
  } catch (error) {
    console.error('❌ Auth POST error:', error);
    return new Response(JSON.stringify({ error: 'Authentication error', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
