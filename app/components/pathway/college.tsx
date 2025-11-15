"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/app/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface CampusItem {
  id: string
  name: string
}

interface MajorItem {
  id: number
  title: string
}

interface DegreeItem {
  id: number
  code: string
  name: string
  level: string
}

type Props = {
  form: any
  setForm: any
  colleges?: string[]
  majors?: Record<string, string[]>
  degrees?: Record<string, string[]>
}

// In-memory cache for API responses (persists across component re-renders)
const cache = {
  campuses: null as string[] | null,
  majors: new Map<string, string[]>(),
  degrees: new Map<string, string[]>(),
}

export default function College({ form, setForm, colleges, majors, degrees }: Props) {
  const [campusList, setCampusList] = useState<string[]>(cache.campuses || colleges || [])
  const [majorList, setMajorList] = useState<string[]>([])
  const [degreeList, setDegreeList] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController()

    // Fetch campuses once if not cached
    if (!cache.campuses) {
      fetch('/api/campuses', { signal: controller.signal })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then((data: CampusItem[]) => {
          const names = data.map(c => c.name)
          cache.campuses = names
          setCampusList(names)
        })
        .catch(err => {
          if (err?.name !== 'AbortError') {
            console.error('Failed to fetch campuses:', err)
          }
        })
    }

    // Fetch majors when college is selected
    if (!form.college) {
      setMajorList([])
    } else if (cache.majors.has(form.college)) {
      setMajorList(cache.majors.get(form.college)!)
    } else {
      fetch(`/api/majors?campusName=${encodeURIComponent(form.college)}`, { signal: controller.signal })
        .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch majors'))
        .then((data: MajorItem[]) => {
          const titles = data.map(m => m.title)
          cache.majors.set(form.college, titles)
          setMajorList(titles)
        })
        .catch(err => {
          if (err?.name !== 'AbortError') {
            console.error('Failed to fetch majors:', err)
            setMajorList((majors && majors[form.college]) || [])
          }
        })
    }

    // Fetch degrees when major is selected
    if (!form.major || !form.college) {
      setDegreeList([])
    } else {
      const cacheKey = `${form.college}:${form.major}`
      if (cache.degrees.has(cacheKey)) {
        const cached = cache.degrees.get(cacheKey)!
        console.log(`[Degrees] Using cached degrees for ${cacheKey}:`, cached)
        setDegreeList(cached)
      } else {
        const params = new URLSearchParams({
          majorTitle: form.major,
          campusName: form.college,
        })
        const url = `/api/degrees?${params.toString()}`
        console.log(`[Degrees] Fetching from API:`, url)
        
        fetch(url, { signal: controller.signal })
          .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch degrees'))
          .then((data: DegreeItem[]) => {
            console.log(`[Degrees] Received from API:`, data)
            const names = data.map(d => d.name || d.code)
            console.log(`[Degrees] Degree names:`, names)
            cache.degrees.set(cacheKey, names)
            setDegreeList(names)
          })
          .catch(err => {
            if (err?.name !== 'AbortError') {
              console.error('Failed to fetch degrees:', err)
              setDegreeList([])
            }
          })
      }
    }

    return () => controller.abort()
  }, [form.college, form.major, majors])

  return (
    <div>
      <h2 className="text-2xl font-semibold">{form.career}</h2>
      <p className="text-sm text-gray-600 mt-1">Select the college, major, and degree that best align with your chosen career.</p>

      <label className="block mt-3">
        <span className="text-sm">College</span>
        <div className="mt-1">
          <Select value={form.college} onValueChange={(v) => {
            // Clear cache when college changes to ensure fresh data
            cache.majors.clear()
            cache.degrees.clear()
            setForm({ ...form, college: v, major: "", degree: "" })
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a college" />
            </SelectTrigger>
            <SelectContent>
              {campusList.filter((c) => c !== "Select...").map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </label>

      <AnimatePresence initial={false}>
        {form.college && (
          <motion.div
            key="major"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.20 }}
            layout
          >
            <label className="block mt-3">
              <span className="text-sm">Major</span>
              <div className="mt-1">
                <Select value={form.major} onValueChange={(v) => {
                  // Clear degree cache when major changes
                  const oldCacheKey = `${form.college}:${form.major}`
                  cache.degrees.delete(oldCacheKey)
                  setForm({ ...form, major: v, degree: "" })
                }}>
                  <SelectTrigger className="w-full" disabled={!form.college}>
                    <SelectValue placeholder={form.college ? "Select a major" : "Select a college first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[20rem]">
                    {majorList.length > 0 ? (
                      majorList.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-gray-500">
                        No majors available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {form.major && (
          <motion.div
            key="degree"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.20 }}
            layout
          >
            <label className="block mt-3">
              <span className="text-sm">Degree</span>
              <div className="mt-1">
                <Select value={form.degree || ""} onValueChange={(v) => setForm({ ...form, degree: v })}>
                  <SelectTrigger className="w-full" disabled={!form.major}>
                    <SelectValue placeholder={form.major ? "Select a degree" : "Select a major first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {degreeList.length > 0 ? (
                      degreeList.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-6 text-center text-sm text-gray-500">
                        No degrees available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
