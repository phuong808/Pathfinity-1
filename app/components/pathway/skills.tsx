"use client"

import { Button } from '@/app/components/ui/button'
import { RotateCcw, CheckSquare, Square } from 'lucide-react'
import CustomSelect from './custom-select'

type Props = {
  form: any
  setForm: any
  skills: string[]
}

export default function Skills({ form, setForm, skills }: Props) {
  const allSelected = skills.every((a) => form.skills.includes(a))

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{form.career}</h2>
          <p className="text-sm text-gray-600 mt-1">Select the skills that apply to you.</p>
        </div>

        <div className="flex gap-2">
          <Button
            className="inline-flex items-center px-3 py-1.5 rounded text-sm !bg-green-600 !text-white !border-green-600 hover:!bg-green-700 active:!bg-green-800 focus-visible:!ring-2 focus-visible:!ring-green-300"
            onClick={() => setForm({ ...form, skills: allSelected ? [] : [...skills] })}
            aria-pressed={allSelected}
          >
            {allSelected ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
            Select all
          </Button>

          <Button variant="outline" className="inline-flex items-center px-3 py-1.5">
            <RotateCcw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <CustomSelect
            key={skill}
            label={skill}
            selected={form.skills.includes(skill)}
            onToggle={(label: string) => {
              const has = form.skills.includes(label)
              setForm({
                ...form,
                skills: has ? form.skills.filter((i: string) => i !== label) : [...form.skills, label],
              })
            }}
          />
        ))}
      </div>
    </div>
  )
}
