"use client"

import React from "react"
import type { Node, Edge } from "@xyflow/react"
import { Position } from "@xyflow/react"
import type { Course, Program } from "./types"
import { NODE_WIDTH, NODE_HEIGHT, COLUMN_GAP, ROW_GAP } from "./types"
import CourseLabelButton from "./course-node"
import SemesterLabel from "./semester-label"
import YearLabel from "./YearLabel"

export function buildNodesAndEdges(program?: Program | null, onCourseClick?: (course: Course, nodeId: string, ev: React.MouseEvent) => void) {
  if (!program) {
    return { nodes: [], edges: [] }
  }
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  let semIndex = 0
  const semesterCourseIds: string[][] = []

  
  const semesterMeta: {
    id: string
    semIndex: number
    courseCount: number
    x: number
    y: number
    semesterName?: string
  }[] = []

  program.years.forEach((year) => {
    year.semesters.forEach((semester) => {
    
      const realCourseCount = semester.courses.length
      if (realCourseCount === 0) return

      const courseCount = realCourseCount
  const x = semIndex * COLUMN_GAP
  const y = -20

      semesterMeta.push({
        id: `sem-${semIndex}`,
        semIndex,
        courseCount,
        x,
        y,
        semesterName: semester.semester_name,
        yearNumber: year.year_number,
      } as any)
      semIndex += 1
    })
  })

  
  const semesterGroupNodes: Node[] = []
  const courseNodes: Node[] = []
  const yearGroupNodes: Node[] = []

  
  const semesterLabelNodes: Node[] = []

  semesterMeta.forEach((s) => {
    const paddingX = 24
    const paddingY = 28
    const width = NODE_WIDTH + paddingX * 2
    const height = Math.max(s.courseCount * ROW_GAP, NODE_HEIGHT) + paddingY * 2

    semesterGroupNodes.push({
      id: `${s.id}-group`,
      type: "default",
      data: { label: null },
      position: { x: s.x - paddingX, y: s.y - paddingY },
      selectable: false,
      draggable: false,
      connectable: false,
      style: {
        width,
        height,
        borderRadius: 10,
        background: "transparent",
        border: "none",
        pointerEvents: "none",
      },
    })

    
    const rawName = (s.semesterName || "").toLowerCase()
    let semLabel = s.semesterName || ""
    if (rawName.includes("fall")) semLabel = "Fall Semester"
    else if (rawName.includes("spring")) semLabel = "Spring Semester"
    else if (rawName.includes("summer")) semLabel = "Summer Semester"

    const semLabelWidth = 150
    const semLabelHeight = 10
    const semLabelX = s.x - paddingX + (width - semLabelWidth) / 2
    const semLabelY = s.y - semLabelHeight

    semesterLabelNodes.push({
      id: `${s.id}-sem-label`,
      type: "default",
      data: {
        label: <SemesterLabel label={semLabel} />,
      },
      position: { x: semLabelX, y: semLabelY },
      selectable: false,
      draggable: false,
      connectable: false,
      style: {
        width: semLabelWidth,
        height: semLabelHeight,
        background: "transparent",
        border: "none",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    })
  })

  
  semIndex = 0
  program.years.forEach((year) => {
    year.semesters.forEach((semester) => {
      const thisSemesterIds: string[] = []

  if (semester.courses.length === 0) return

      semester.courses.forEach((course, cIdx) => {
        const id = `y${year.year_number}_s${semIndex}_c${cIdx}`
        thisSemesterIds.push(id)

        
        const label = <CourseLabelButton course={course} id={id} onCourseClick={onCourseClick} />

        courseNodes.push({
          id,
          type: "default",
          data: { label, course },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
          position: {
            x: semIndex * COLUMN_GAP,
            y: cIdx * ROW_GAP,
          },
          style: {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            padding: 0,
            borderRadius: 8,
            background: "var(--background)",
            border: "1px solid var(--muted)",
            boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        })
      })

      semesterCourseIds.push(thisSemesterIds)
      semIndex += 1
    })
  })

  
  const yearLabelNodes: Node[] = []

  program.years.forEach((year) => {
  const semsForYear = semesterMeta.filter((m) => (m as any).yearNumber === year.year_number)
    if (semsForYear.length === 0) return

    const startIndex = Math.min(...semsForYear.map((m) => m.semIndex))
    const endIndex = Math.max(...semsForYear.map((m) => m.semIndex))

    const paddingX = 20
    const paddingY = 30

    const x = startIndex * COLUMN_GAP - paddingX
    const width = (endIndex - startIndex) * COLUMN_GAP + NODE_WIDTH + paddingX * 2

  let maxCourses = 1
    maxCourses = Math.max(...semsForYear.map((m) => m.courseCount), maxCourses)

    const height = Math.max(maxCourses * ROW_GAP, NODE_HEIGHT) + paddingY * 2
    yearGroupNodes.push({
      id: `year-${year.year_number}-group`,
      type: "default",
      data: { label: null },
      position: { x, y: -paddingY - 6 },
      selectable: false,
      draggable: false,
      connectable: false,
      style: {
        width,
        height,
        borderRadius: 12,
        background: "rgba(5,150,105,0.08)",
        border: "1px solid rgba(5,150,105,0.12)",
        pointerEvents: "none",
      },
    })

  const labelWidth = 180
    const labelHeight = 0
    const labelX = x + (width - labelWidth) / 2
  const labelY = -paddingY - 6 - labelHeight - 24

    yearLabelNodes.push({
      id: `year-${year.year_number}-label`,
      type: "default",
      data: {
        label: <YearLabel yearNumber={year.year_number} />,
      },
      position: { x: labelX, y: labelY },
      selectable: false,
      draggable: false,
      connectable: false,
      style: {
        width: labelWidth,
        height: labelHeight,
        background: "transparent",
        border: "none",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    })
  })

  
  nodes.push(
    ...yearGroupNodes,
    ...yearLabelNodes,
    ...semesterGroupNodes,
    ...semesterLabelNodes,
    ...courseNodes
  )

  
  for (let i = 0; i < semesterCourseIds.length - 1; i++) {
    const from = semesterCourseIds[i]
    const to = semesterCourseIds[i + 1]
    from.forEach((fid) =>
      to.forEach((tid) =>
        edges.push({
          id: `e-${fid}-${tid}`,
          source: fid,
          target: tid,
          animated: false,
          markerEnd: { type: "arrow", color: "var(--muted)" },
          style: { stroke: "var(--muted)" },
        })
      )
    )
  }

  return { nodes, edges }
}

export default buildNodesAndEdges
