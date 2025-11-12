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
import { extractPathwayJsonFromText } from "@/lib/pathway-json"

type Props = {
  messages: any[]
  status: string
  className?: string
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
