"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Spinner } from "@/app/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface PathwayData {
    program_name: string
    institution: string
    total_credits: number
    years: any[]
}

export default function RoadmapDetailPage() {
    const params = useParams()
    const slug = params.slug as string
    const [pathwayData, setPathwayData] = useState<PathwayData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchPathwayData() {
            try {
                // Fetch all pathways
                const response = await fetch("/api/pathways")
                if (!response.ok) {
                    throw new Error("Failed to fetch pathways")
                }
                const pathways = await response.json()

                // Find the pathway that matches the slug
                const pathway = pathways.find((p: any) => {
                    const pathwaySlug = p.programName
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/--+/g, '-')
                        .trim()
                    return pathwaySlug === slug
                })

                if (!pathway) {
                    throw new Error("Pathway not found")
                }

                setPathwayData(pathway.pathwayData)
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchPathwayData()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                <div className="flex flex-col items-center justify-center py-12">
                    <Spinner className="w-10 h-10" />
                    <div className="text-gray-500 pt-10">Loading roadmap...</div>
                </div>
            </div>
        )
    }

    if (error || !pathwayData) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                <div className="flex items-center justify-center py-12">
                    <div className="text-red-500">Error: {error || "Pathway not found"}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {pathwayData.program_name}
                </h1>
                <p className="text-gray-600">{pathwayData.institution}</p>
                <p className="text-sm text-gray-500 mt-1">
                    Total Credits: {pathwayData.total_credits}
                </p>
            </div>

            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Pathway Data (Placeholder)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-[600px]">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                            {JSON.stringify(pathwayData, null, 2)}
                        </pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
