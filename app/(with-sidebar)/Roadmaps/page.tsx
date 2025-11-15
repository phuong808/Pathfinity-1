"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Spinner } from "@/app/components/ui/spinner"
import ProfileCarousel from "@/app/components/profiles/profile-carousel"

interface Profile {
    id: number
    userId: string
    career: string
    college: string
    major: string
    degree: string
    interests: string[]
    skills: string[]
    roadmap: any
    createdAt: Date
    updatedAt: Date
}

export default function RoadmapsPage() {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    useEffect(() => {
        async function fetchProfiles() {
            try {
                const response = await fetch("/api/profiles")
                if (!response.ok) {
                    throw new Error("Failed to fetch profiles")
                }
                const data = await response.json()
                setProfiles(data.profiles || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
                setLoading(false)
            }
        }

        fetchProfiles()
    }, [])

    const handleViewMore = (profile: Profile) => {
        setSelectedProfile(profile)
        setModalOpen(true)
    }

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Roadmaps</h1>
                <p className="text-gray-600">
                    View and manage your personalized learning pathways
                </p>
            </div>

            <Tabs defaultValue="my-roadmaps" className="w-full">
                <div className="flex justify-center mb-6">
                    <TabsList>
                        <TabsTrigger value="my-roadmaps">My Roadmaps</TabsTrigger>
                        <TabsTrigger value="catalog">Roadmap Catalog</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="my-roadmaps" className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner className="w-10 h-10" />
                            <div className="text-gray-500 pt-10">Loading your roadmaps...</div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-red-500">Error: {error}</div>
                        </div>
                    ) : (
                        <ProfileCarousel
                            profiles={profiles}
                            onViewMore={handleViewMore}
                        />
                    )}
                </TabsContent>

                <TabsContent value="catalog" className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="text-gray-500 mb-2">Roadmap Catalog</div>
                        <p className="text-sm text-gray-400">
                            TODO: Browse and explore pre-built roadmaps
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
