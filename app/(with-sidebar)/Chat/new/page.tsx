import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import ChatClient from "@/app/components/chat/chat-client";

export default async function NewChatPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  // Render the chat client with a special "new" ID
  // The actual chat will be created when the user sends the first message
  return <ChatClient id="new" initialMessages={[]} userId={session.user.id} />;
}
