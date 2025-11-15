import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { GraduationCap, Heart, Wrench } from "lucide-react"

interface ProfileCardProps {
    id: number
    career: string
    college: string
    major: string
    degree: string
    interests: string[]
    skills: string[]
}

export default function ProfileCard({
    id,
    career,
    college,
    major,
    degree,
    interests,
    skills,
}: ProfileCardProps) {
    // Limit items shown in carousel card
    const maxItemsToShow = 3
    const displayInterests = interests.slice(0, maxItemsToShow)
    const displaySkills = skills.slice(0, maxItemsToShow)
    const hasMoreInterests = interests.length > maxItemsToShow
    const hasMoreSkills = skills.length > maxItemsToShow

    return (
        <Card className="w-full h-full flex flex-col overflow-hidden">
            <CardHeader className="py-2 px-4] flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-900">
                    {career}
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
                <div className="space-y-3">
                    {/* Education Section */}
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-gray-700">
                            <GraduationCap className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <h3 className="text-sm font-semibold">Education</h3>
                        </div>
                        <div className="space-y-1 pl-6">
                            <div>
                                <p className="text-xs text-gray-500">Institution</p>
                                <p className="text-sm text-gray-900 font-medium truncate">{college}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Program</p>
                                <p className="text-sm text-gray-900 font-medium truncate">{major}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Degree</p>
                                <p className="text-sm text-gray-900 font-medium truncate">{degree}</p>
                            </div>
                        </div>
                    </div>

                    {/* Interests Section */}
                    {interests.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Heart className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <h3 className="text-sm font-semibold">Interests</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-6">
                                {displayInterests.map((interest, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-0.5 text-xs h-fit"
                                    >
                                        {interest}
                                    </Badge>
                                ))}
                                {hasMoreInterests && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs h-fit"
                                    >
                                        +{interests.length - maxItemsToShow} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Skills Section */}
                    {skills.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Wrench className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <h3 className="text-sm font-semibold">Skills</h3>
                            </div>
                            <div className="flex flex-wrap gap-1.5 pl-6">
                                {displaySkills.map((skill, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-0.5 text-xs h-fit"
                                    >
                                        {skill}
                                    </Badge>
                                ))}
                                {hasMoreSkills && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs h-fit"
                                    >
                                        +{skills.length - maxItemsToShow} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>

            <CardFooter className="border-t flex justify-center items-center flex-shrink-0">
                <Button
                    variant="link"
                    size="sm"
                    className="text-green-600 hover:text-green-700 h-auto p-0 text-sm flex items-center gap-1"
                    onClick={() => {
                        // TODO: Implement view roadmap functionality
                        console.log("View roadmap for profile:", id)
                    }}
                >
                    View Roadmap
                </Button>
            </CardFooter>
        </Card>
    )
}
