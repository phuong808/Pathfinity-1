"use client"

import { Input } from '@/app/components/ui/input'

type Props = {
  form: any
  setForm: any
}

export default function Career({ form, setForm }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">What Is Your Desired Career?</h2>

      <label className="block mt-4">
        <span className="text-sm">Career</span>
        <Input
          aria-label="Career"
          value={form.career}
          onChange={(e) => setForm({ ...form, career: e.target.value })}
          className="h-12 text-lg px-4 mt-1"
          placeholder="e.g. Teacher, Software Engineer"
        />
      </label>
    </div>
  )
}
