"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import Conversation from "@/app/components/chat/conversation";
import PromptBox from "@/app/components/chat/prompt-box";

const models = [
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
];

interface ChatClientProps {
  id: string;
  initialMessages: UIMessage[];
}

export default function ChatClient({ id, initialMessages }: ChatClientProps) {
  const [model, setModel] = useState(models[0].id);
  const [input, setInput] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const { messages, sendMessage, status, setMessages } = useChat({
    id,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      // Only send the last message to reduce bandwidth
      prepareSendMessagesRequest({ messages, id }) {
        return { 
          body: { 
            message: messages[messages.length - 1], 
            id 
          } 
        };
      },
    }),
  });

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Set initial messages from database on mount
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages, messages.length]);

  const handleSubmit = (message: any) => {
    if (!message.text) {
      return;
    }
    sendMessage({
      text: message.text,
    });
    setInput("");
  };

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        <Conversation messages={messages} status={status} className="h-full" />

        <PromptBox
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          models={models}
          model={model}
          setModel={setModel}
          status={status}
          className="mt-4"
        />
      </div>
    </div>
  );
}
