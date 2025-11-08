"use client"

import { useState } from "react"
import StepIndicator from "../../components/pathway/step-indicator"
import Career from '@/app/components/pathway/career'
import College from '@/app/components/pathway/college'
import Interests from '@/app/components/pathway/interests'
import Skills from '@/app/components/pathway/skills'
import { Button } from '@/app/components/ui/button'

type FormData = {
  career: string
  organization?: string
  college: string
  major: string
  interests: string[]
  tasks: string
  skills: string[]
}

// TODO: Replace with real data from database
const colleges = [
  "Select...",
  "Hawaii Community College",
  "University of Hawaii at Hilo",
  "Honolulu Community College",
  "Kapiolani Community College",
  "Kauai Community College",
  "Leeward Community College",
  "University of Hawaii at Manoa",
  "University of Hawaii: Maui College",
  "University of Hawaii: West Oahu",
]

// TODO: Replace with real data from database
const majors: Record<string, string[]> = {
  "Hawaii Community College": ["Sustainable Agriculture", "Marine Science", "General Studies"],
  "University of Hawaii at Hilo": ["Marine Biology", "Environmental Science", "Computer Science"],
  "Honolulu Community College": ["Culinary Arts", "Engineering Technology", "Automotive Technology"],
  "Kapiolani Community College": ["Nursing", "Business Administration", "Culinary Arts"],
  "Kauai Community College": ["Hospitality Management", "Liberal Arts", "Early Childhood Education"],
  "Leeward Community College": ["Engineering", "Business", "Nursing"],
  "University of Hawaii at Manoa": ["Computer Science", "Biology", "Business Administration"],
  "University of Hawaii: Maui College": ["Hospitality Management", "Sustainable Technology", "Business"],
  "University of Hawaii: West Oahu": ["Public Administration", "Information Technology", "Business Administration"],
}

// TODO: Replace with AI generated data
const interests = ['Machine Learning', 'Product Design', 'Startups']

// TODO: Replace with API skills taxonomy
const skills = ['JavaScript', 'Data Analysis', 'Communication']

export default function CreatePathwayPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    career: "",
    organization: "",
    college: "",
    major: "",
    interests: [],
    tasks: "",
    skills: [],
  })

  function next() {
    setStep((s) => Math.min(4, s + 1))
  }

  function back() {
    setStep((s) => Math.max(1, s - 1))
  }

  const nextEnabled =
    step === 1
      ? form.career.trim() !== ""
      : step === 2
      ? form.college !== "" && form.major !== ""
      : true

  const allMajors = Array.from(new Set(Object.values(majors).flat()))

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Creating New Pathway</h1>

        <div className="min-h-[90vh] flex items-center">
          <div className="w-full">
            <div className="flex flex-col md:flex-row gap-12 md:items-start">

              {/* Left: form column */}
              <div className="flex-1">
                <div className="mt-4">
                  {step === 1 && <Career form={form} setForm={setForm} />}
                  {step === 2 && <College form={form} setForm={setForm} colleges={colleges} majors={majors} />}
                  {step === 3 && <Interests form={form} setForm={setForm} interests={interests} />}
                  {step === 4 && <Skills form={form} setForm={setForm} skills={skills} />}
                </div>
              </div>

              {/* Right: step indicator */}
              <div className="hidden md:flex w-48 items-center justify-center">
                <StepIndicator step={step} />
              </div>
            </div>

            {/* Back and Next buttons */}
            <div className="mt-4 flex gap-5 pr-30">
              <Button variant="outline" className="mr-2" onClick={back} disabled={step === 1}>
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
                ) : (
                  <Button
                    className="!bg-green-600 !text-white !border-green-600 hover:!bg-green-700 active:!bg-green-800 focus-visible:!ring-2 focus-visible:!ring-green-300"
                    onClick={() => console.log('Submit form (placeholder)', form)}
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}