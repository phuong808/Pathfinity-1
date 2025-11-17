"use client"

import React from "react"

export function SemesterLabel({ label }: { label: string }) {
  return (
    <div className="text-sm font-medium" style={{ pointerEvents: "none" }}>
      {label}
    </div>
  )
}

export default SemesterLabel
