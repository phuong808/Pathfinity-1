"use client"

import { Fragment } from "react"
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

function extractFirstJsonFromText(text: string): string | null {
  // Try to find a fenced code block with optional language
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/i;
  const m = text.match(fenceRegex);
  const candidate = m ? m[1] : null;
  if (candidate) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object") {
        if (Array.isArray((parsed as any).years) || (parsed as any).pathwayData?.years) {
          return JSON.stringify(parsed, null, 2);
        }
      }
    } catch {}
  }
  // Fallback naive brace matching
  const braceIdx = text.indexOf("{");
  if (braceIdx >= 0) {
    const tail = text.slice(braceIdx);
    const lastBrace = tail.lastIndexOf("}");
    if (lastBrace > 0) {
      const jsonStr = tail.slice(0, lastBrace + 1);
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed && (Array.isArray((parsed as any).years) || (parsed as any).pathwayData?.years)) {
          return JSON.stringify(parsed, null, 2);
        }
      } catch {}
    }
  }
  return null;
}

export function Conversation({ messages, status, className }: Props) {
  const router = useRouter();
  return (
    <AiConversation className={className}>
      <ConversationContent>
        {messages.length === 0 ? (
            <ConversationEmptyState
                title="No messages yet"
                description="Start a conversation to see messages here"
            />
        ) : (
          messages.map((message) => (
            <div key={message.id}>
              {message.parts.map((part: any, i: number) => {
                switch (part.type) {
                  case "text":
                    const text: string = part.text ?? "";
                    const pathwayJson = extractFirstJsonFromText(text);
                    return (
                      <Fragment key={`${message.id}-${i}`}>
                        <Message from={message.role}>
                          <MessageContent>
                            <Response>{text}</Response>
                            {message.role === "assistant" && pathwayJson && (
                              <div className="mt-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    try { localStorage.setItem("pathfinity.roadmapDraft", pathwayJson); } catch {}
                                    router.push("/Roadmap");
                                  }}
                                >
                                  Open as Roadmap
                                </Button>
                              </div>
                            )}
                          </MessageContent>
                        </Message>
                      </Fragment>
                    )
                  default:
                    return null
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
