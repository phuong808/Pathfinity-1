"use client"

import { Fragment, useEffect, useState } from "react"
import {
  Conversation as AiConversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/app/components/ai-elements/conversation"
import { Message, MessageContent } from "@/app/components/ai-elements/message"
import { Response } from "@/app/components/ai-elements/response"
import { Button } from "@/app/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader } from "@/app/components/ai-elements/loader"

type Props = {
  messages: any[]
  status: string
  className?: string
}

// Robust extraction of PathwayData JSON from assistant text.
function extractFirstJsonFromText(text: string): string | null {
  if (!text) return null;

  // 1. Gather all fenced code blocks (json or generic)
  const fenceGlobal = /```(json)?\s*([\s\S]*?)```/gi;
  const candidates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = fenceGlobal.exec(text)) !== null) {
    candidates.push(match[2]);
  }

  // Helper to clean and validate a candidate
  const tryParse = (raw: string): string | null => {
    if (!raw) return null;
    // Remove TypeScript-esque comments or markdown explanations inside block
    const cleaned = raw
      .split('\n')
      .filter(line => !/^\s*(?:\/\/|#)/.test(line)) // remove comment lines
      .join('\n')
      .trim();
    // Heuristic: take substring from first '{' to last '}'
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) return null;
    const jsonSlice = cleaned.slice(startIdx, endIdx + 1);
    try {
      const parsed = JSON.parse(jsonSlice);
      const hasYears = Array.isArray((parsed as any).years);
      const hasNestedYears = (parsed as any).pathwayData && Array.isArray((parsed as any).pathwayData.years);
      if (hasYears) return JSON.stringify(parsed, null, 2);
      if (hasNestedYears) return JSON.stringify((parsed as any).pathwayData, null, 2);
      return null;
    } catch {
      return null;
    }
  };

  // Try fenced blocks first
  for (const c of candidates) {
    const parsed = tryParse(c);
    if (parsed) return parsed;
  }

  // 2. Fallback: locate first plausible JSON object in raw text
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const slice = text.slice(firstBrace, lastBrace + 1);
    // Attempt incremental shrinking if parse fails (remove trailing non-JSON)
    for (let i = slice.length; i >= 2; i--) {
      const attempt = slice.slice(0, i);
      try {
        const parsed = JSON.parse(attempt);
        const hasYears = Array.isArray((parsed as any).years);
        const hasNestedYears = (parsed as any).pathwayData && Array.isArray((parsed as any).pathwayData.years);
        if (hasYears) return JSON.stringify(parsed, null, 2);
        if (hasNestedYears) return JSON.stringify((parsed as any).pathwayData, null, 2);
      } catch {
        // ignore
      }
    }
  }

  return null;
}

// Lazy JSON extractor component to avoid blocking main render when messages are large.
function PathwayJsonActions({ text, messageRole, onOpen }: { text: string; messageRole: string; onOpen: (json: string) => void }) {
  const [json, setJson] = useState<string | null>(null);

  useEffect(() => {
    if (messageRole !== 'assistant') return;
    // Defer heavy parsing until browser is idle or after a short timeout.
    const run = () => {
      try {
        const extracted = extractFirstJsonFromText(text);
        setJson(extracted);
      } catch (e) {
        // swallow parsing errors
      }
    };
    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(run, { timeout: 500 });
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
              {message.parts.map((part: any, i: number) => {
                switch (part.type) {
                  case "text": {
                    const text: string = part.text ?? "";
                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <MessageContent>
                            <Response>{text}</Response>
                            <PathwayJsonActions
                              text={text}
                              messageRole={message.role}
                              onOpen={() => router.push("/SavedRoadmaps")}
                            />
                          </MessageContent>
                        </Message>
                      </Fragment>
                    );
                  }
                  default:
                    return null;
                }
              })}
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
