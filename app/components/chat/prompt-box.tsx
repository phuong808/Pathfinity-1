"use client"

import { useState } from "react"
import TextBox from './text-box'
import VoiceBox from './voice-box'
import type { PromptInputMessage } from "@/app/components/ai-elements/prompt-input"

type ModelOption = { id: string; name: string }

type Props = {
  input: string
  setInput: (v: string) => void
  onSubmit: (message: PromptInputMessage) => void
  models: ModelOption[]
  model: string
  setModel: (v: string) => void
  status: any
  className?: string
}

export function PromptBox({
  input,
  setInput,
  onSubmit,
  models,
  model,
  setModel,
  status,
  className,
}: Props) {
  const [voiceMode, setVoiceMode] = useState(false)

  if (voiceMode) {
    return (
      <VoiceBox
        className={className}
        onClose={() => setVoiceMode(false)}
        onStartRecording={() => {
          // TODO: future speech recognition start/stop
        }}
      />
    )
  }

  return (
    <TextBox
      input={input}
      setInput={setInput}
      onSubmit={onSubmit}
      models={models}
      model={model}
      setModel={setModel}
      status={status}
      className={className}
      onStartVoice={() => setVoiceMode(true)}
    />
  )
}

export default PromptBox;
