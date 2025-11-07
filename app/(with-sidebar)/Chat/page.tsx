import { redirect } from 'next/navigation';

export default async function ChatPage() {
  // Redirect to the new chat route without creating a database entry
  redirect('/Chat/new');
}
