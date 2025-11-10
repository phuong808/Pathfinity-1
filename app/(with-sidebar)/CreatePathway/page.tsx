"use client"

import { useState } from "react"
import StepIndicator from "../../components/pathway/step-indicator"
import Career from "@/app/components/pathway/career"
import College from "@/app/components/pathway/college"
import Interests from "@/app/components/pathway/interests"
import Skills from "@/app/components/pathway/skills"
import { Button } from "@/app/components/ui/button"

type FormData = {
  career: string
  college: string
  major: string
  degree: string
  interests: string[]
  tasks: string
  skills: string[]
  careerValidated?: boolean
}

export default function CreatePathwayPage() {
  const [step, setStep] = useState(1)
  const [generatedInterests, setGeneratedInterests] = useState<string[]>([])
  const [generatedSkills, setGeneratedSkills] = useState<string[]>([])
  const [form, setForm] = useState<FormData>({
    career: "",
    college: "",
    major: "",
    degree: "",
    interests: [],
    tasks: "",
    skills: [],
    careerValidated: false,
  })

  function next() {
    setStep((s) => Math.min(5, s + 1))
  }

  function back() {
    setStep((s) => Math.max(1, s - 1))
  }

  const nextEnabled =
    step === 1
      ? !!form.careerValidated
      : step === 2
      ? form.college !== "" && form.major !== "" && form.degree !== ""
      : step === 3
      ? form.interests.length > 0
      : step === 4
      ? form.skills.length > 0
      : true

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Creating New Pathway</h1>

        <div className="min-h-[90vh] flex items-center">
          <div className="w-full">
            <div className="flex flex-col md:flex-row gap-12 md:items-start">
              {/* Left: form column */}
              <div className="flex-1">
                <div className="mt-4">
                  {step === 1 && <Career form={form} setForm={setForm} />}
                  {step === 2 && <College form={form} setForm={setForm} />}
                  {step === 3 && (
                    <Interests
                      form={form}
                      setForm={setForm}
                      interests={generatedInterests}
                      onInterestsChange={setGeneratedInterests}
                    />
                  )}
                  {step === 4 && (
                    <Skills
                      form={form}
                      setForm={setForm}
                      skills={generatedSkills}
                      onSkillsChange={setGeneratedSkills}
                    />
                  )}

                  {/* TODO: ADD PROPER PROFILE CREATION AND ROADMAP */}
                  {step === 5 && (
                    <div className="mt-6 p-6 bg-white rounded shadow">
                      <h2 className="text-2xl font-semibold mb-3">Profile</h2>
                      <pre className="text-sm bg-gray-50 p-4 rounded max-w-3xl overflow-auto">
                        {JSON.stringify(
                          {
                            career: form.career,
                            college: form.college,
                            major: form.major,
                            degree: form.degree,
                            interests: form.interests,
                            skills: form.skills,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: step indicator */}
              <div className="hidden md:flex w-48 items-center justify-center">
                <StepIndicator step={step} />
              </div>
            </div>

            {/* Back and Next buttons */}
            <div className="mt-4 flex gap-5 pr-30">
              <Button
                variant="outline"
                className="mr-2"
                onClick={back}
                disabled={step === 1}
              >
                Back
              </Button>

              <div className="flex gap-2">
                {step < 4 ? (
                  <Button
                    onClick={next}
                    className="!bg-green-600 !text-white !border-green-600 hover:!bg-green-700 active:!bg-green-800 focus-visible:!ring-2 focus-visible:!ring-green-300"
                    disabled={!nextEnabled}
                  >
                    Next
                  </Button>
                ) : step === 4 ? (
                  <Button
                    className="!bg-green-600 !text-white !border-green-600 hover:!bg-green-700 active:!bg-green-800 focus-visible:!ring-2 focus-visible:!ring-green-300"
                    onClick={() => setStep(5)}
                  >
                    Submit
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
