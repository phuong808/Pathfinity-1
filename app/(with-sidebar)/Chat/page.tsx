import { redirect } from 'next/navigation';
import { createChat } from '@/app/db/actions';
import { getSession } from '@/lib/auth-server';

export default async function ChatPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.id) {
    redirect('/login');
  }

  const id = await createChat(session.user.id);
  redirect(`/Chat/${id}`);
}
