"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/select'

type Props = {
  form: any
  setForm: any
  colleges: string[]
  majors: Record<string, string[]>
}

export default function College({ form, setForm, colleges, majors }: Props) {
  const allMajors = Array.from(new Set(Object.values(majors).flat()))

  return (
    <div>
      <h2 className="text-2xl font-semibold">{form.career}</h2>
      <p className="text-sm text-gray-600 mt-1">Select the college and major that best align with your chosen career.</p>

      <label className="block mt-3">
        <span className="text-sm">College</span>
        <div className="mt-1">
          <Select value={form.college} onValueChange={(v) => setForm({ ...form, college: v, major: "" })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a college" />
            </SelectTrigger>
            <SelectContent>
              {colleges.filter((c) => c !== "Select...").map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </label>

      <label className="block mt-3">
        <span className="text-sm">Major</span>
        <div className="mt-1">
          <Select value={form.major} onValueChange={(v) => setForm({ ...form, major: v })}>
            <SelectTrigger className="w-full" disabled={!form.college}>
              <SelectValue placeholder={form.college ? "Select a major" : "Select a college first"} />
            </SelectTrigger>
            <SelectContent>
              {(form.college ? majors[form.college] : allMajors).map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </label>
    </div>
  )
}
