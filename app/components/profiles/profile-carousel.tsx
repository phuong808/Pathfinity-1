"use client"

import { useState } from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "@/app/components/ui/carousel"
import ProfileCard from "@/app/components/profiles/profile-card"

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

interface ProfileCarouselProps {
    profiles: Profile[]
    onViewMore: (profile: Profile) => void
}

export default function ProfileCarousel({ profiles }: ProfileCarouselProps) {
    const [api, setApi] = useState<CarouselApi>()

    if (profiles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-500 mb-2">No roadmaps found</div>
                <p className="text-sm text-gray-400">
                    Create your first profile to generate a personalized roadmap
                </p>
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            <Carousel
                setApi={setApi}
                opts={{
                    align: "center",
                    loop: false,
                }}
                className="w-full max-w-6xl mx-auto px-12"
            >
                <CarouselContent className="-ml-4">
                    {profiles.map((profile) => (
                        <CarouselItem
                            key={profile.id}
                            className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                        >
                            <div className="h-[500px] w-full">
                                <ProfileCard
                                    id={profile.id}
                                    career={profile.career}
                                    college={profile.college}
                                    major={profile.major}
                                    degree={profile.degree}
                                    interests={profile.interests}
                                    skills={profile.skills}
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-0" />
                <CarouselNext className="right-0" />
            </Carousel>
        </div>
    )
}
