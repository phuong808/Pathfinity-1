"use client"

import { Fragment, useEffect, useMemo, useRef, useCallback, useState } from "react"
import {
  Conversation as AiConversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/app/components/ai-elements/conversation"
import { Message, MessageContent } from "@/app/components/ai-elements/message"
import { Response } from "@/app/components/ai-elements/response"
import { useRouter } from "next/navigation"
import { Loader } from "@/app/components/ai-elements/loader"
import { useTTS } from "@/app/components/ai-elements/tts"
import { Button } from "@/app/components/ui/button"
import { RotateCcwIcon } from "lucide-react"

type ChatPart = { type: "text"; text: string } | unknown
type ChatMessage = { id: string | number; role: string; parts: ChatPart[] }
import { extractPathwayJsonFromText } from "@/lib/pathway-json"

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

// Lazy JSON extractor component to avoid blocking main render when messages are large.
function PathwayJsonActions({ text, messageRole, onOpen }: { text: string; messageRole: string; onOpen: (json: string) => void }) {
  const [json, setJson] = useState<string | null>(null);

  useEffect(() => {
    if (messageRole !== 'assistant') return;
    // Defer heavy parsing until browser is idle or after a short timeout.
    const run = () => {
      try {
        const extracted = extractPathwayJsonFromText(text);
        setJson(extracted);
      } catch {
        // swallow parsing errors
      }
    };
    // narrow window type for requestIdleCallback if present
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void };
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(run, { timeout: 500 });
    } else {
      const t = setTimeout(run, 50);
      return () => clearTimeout(t);
    }
  }, [text, messageRole]);

  if (!json) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            try {
              sessionStorage.setItem("pathfinity.roadmapDraft", json);
            } catch {
              try { localStorage.setItem("pathfinity.roadmapDraft", json); } catch {}
            }
            onOpen(json);
          }}
        >
          Open in Viewer
        </Button>
      </div>
    </div>
  );
}

export function Conversation({ messages, status, className }: Props) {
  const router = useRouter();
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
    if (status === "streaming") return;
    if (spokenRef.current.id === id && spokenRef.current.len === len) return;
    speak(lastAssistantText);
    spokenRef.current = { id, len };
  }, [lastAssistant, lastAssistantText, status, speak]);

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
                className="text-left items-start"
            >
              <div className="w-full space-y-1 mb-4">
                <h3 className="font-medium text-xl font-bold">👋 Welcome to Pathfinity!</h3>
              </div>
              <div className="w-full space-y-4 text-base text-muted-foreground whitespace-pre-line">
                <p>Hey there! I&apos;m Pathfinity, your personal career exploration and academic pathway guide. Whether you&apos;re just starting to think about your future, reconsidering your current direction, or planning a career pivot, I&apos;m here to help you confidently move forward.</p>
                
                <div>
                  <p className="mb-2">With me, you can:</p>
                  <p>✨ Explore potential career paths that match your goals</p>
                  <p>✨ Discover relevant majors, programs, and training options</p>
                  <p>✨ Learn about courses and skills needed for your dream path</p>
                  <p>✨ Get personalized guidance — not generic advice</p>
                </div>
                
                <div>
                  <p className="mb-2">Before we begin, I&apos;d love to understand where you are in your journey so I can tailor the experience for you. Which one best describes you right now?</p>
                  <p>1️⃣ I&apos;m a middle or high school student exploring possible majors or careers</p>
                  <p>2️⃣ I&apos;m currently in college and may be reconsidering my major</p>
                  <p>3️⃣ I&apos;m already working and interested in career pivoting or upskilling</p>
                </div>
                
                <p>Just reply with 1, 2, or 3 — or feel free to describe your situation in your own words.</p>
                
                <p>Ready when you are! 🚀</p>
              </div>
            </ConversationEmptyState>
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part, i: number) => {
                if (isTextPart(part)) {
                  const text: string = part.text ?? "";
                  return (
                    <Fragment key={`${message.id}-${i}`}>
                      <Message from={asRole(message.role)}>
                        <MessageContent>
                          <Response>{text}</Response>
                          <PathwayJsonActions
                            text={text}
                            messageRole={String(message.role)}
                            onOpen={() => router.push("/SavedRoadmaps")}
                          />
                        </MessageContent>
                      </Message>
                    </Fragment>
                  );
                }
                return null;
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
