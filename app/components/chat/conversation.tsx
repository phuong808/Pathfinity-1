"use client"

import { Fragment, useEffect, useMemo, useRef, useCallback } from "react"
import {
  Conversation as AiConversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/app/components/ai-elements/conversation"
import { Message, MessageContent } from "@/app/components/ai-elements/message"
import { Response } from "@/app/components/ai-elements/response"
import { Loader } from "@/app/components/ai-elements/loader"
import { useTTS } from "@/app/components/ai-elements/tts"
import { Button } from "@/app/components/ui/button"
import { RotateCcwIcon } from "lucide-react"

type ChatPart = { type: "text"; text: string } | unknown
type ChatMessage = { id: string | number; role: string; parts: ChatPart[] }

type Props = {
  messages: ChatMessage[]
  status: string
  className?: string
}

function isTextPart(p: ChatPart): p is { type: "text"; text: string } {
  return (
    typeof p === "object" &&
    p !== null &&
    (p as Record<string, unknown>).type === "text" &&
    typeof (p as Record<string, unknown>).text === "string"
  )
}

function asRole(r: unknown): "assistant" | "system" | "user" {
  return r === "assistant" || r === "system" || r === "user" ? r : "assistant";
}

export function Conversation({ messages, status, className }: Props) {
  const { speak, stop } = useTTS();

  // Find the latest assistant message and its concatenated text
  const lastAssistant: ChatMessage | null = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "assistant") return messages[i];
    }
    return null;
  }, [messages]);

  const lastAssistantText = useMemo(() => {
    if (!lastAssistant) return "";
    try {
      return (lastAssistant.parts || [])
        .filter((p) => isTextPart(p))
        .map((p) => p.text)
        .join("");
    } catch {
      return "";
    }
  }, [lastAssistant]);

  const partsToText = useCallback((parts: ChatPart[]) => {
    try {
      return (parts || [])
        .filter((p) => isTextPart(p))
        .map((p) => p.text)
        .join("");
    } catch {
      return "";
    }
  }, []);

  // Track the last spoken assistant message id and length to avoid repeats
  const spokenRef = useRef<{ id: string | null; len: number }>({ id: null, len: 0 });

  // Auto-speak after streaming finishes (to avoid choppy partial sentences)
  useEffect(() => {
    if (!lastAssistant) return;
    const id = String(lastAssistant.id ?? "");
    const len = lastAssistantText.length;
    if (!len) return;
    // Only trigger when not streaming
    if (status === "streaming") return;
    // Avoid repeating the same content
    if (spokenRef.current.id === id && spokenRef.current.len === len) return;

    speak(lastAssistantText);
    spokenRef.current = { id, len };
  }, [lastAssistant, lastAssistantText, status, speak]);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      try { stop(); } catch {}
    };
  }, [stop]);
  return (
    <AiConversation className={className}>
      <ConversationContent>
        {messages.length === 0 ? (
            <ConversationEmptyState
                title="Welcome to Pathfinity!"
                description="Are you exploring, deciding a major, or preparing for a career? I'll help you find the best pathway to reach your goals."
                className="text-left"
            />
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, i: number) => {
                if (isTextPart(part)) {
                  return (
                    <Fragment key={`${message.id}-${i}`}>
                      <Message from={asRole(message.role)}>
                        <MessageContent>
                          <Response>{part.text}</Response>
                        </MessageContent>
                      </Message>
                    </Fragment>
                  )
                }
                return null
              })}
              {message.role === "assistant" ? (
                <div className="-mt-2 mb-2 flex justify-start px-2 text-xs text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speak(partsToText(message.parts))}
                    aria-label="Replay TTS"
                    title="Replay TTS"
                  >
                    <RotateCcwIcon className="mr-1 size-4" /> Replay
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        )}

        {(status === "submitted" || status === "streaming") && <Loader />}
      </ConversationContent>
      <ConversationScrollButton />
    </AiConversation>
  )
}

export default Conversation
