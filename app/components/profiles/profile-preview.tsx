import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { GraduationCap, Heart, Wrench } from "lucide-react"

interface ProfilePreviewProps {
    career: string
    college: string
    major: string
    degree: string
    interests: string[]
    skills: string[]
    onEdit?: (step: number) => void
}

export default function ProfilePreview({
    career,
    college,
    major,
    degree,
    interests,
    skills,
    onEdit,
}: ProfilePreviewProps) {
    return (
        <Card className="w-full h-full flex flex-col overflow-hidden">
            <CardHeader className="border-b py-3 px-5 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-900">{career}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                    Preview your pathway before saving
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
                    {/* Column 1: Education */}
                    <div className="space-y-3 min-w-0 w-full lg:w-auto max-w-sm lg:max-w-none">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 text-gray-700 w-full">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <h3 className="text-base font-semibold">Education</h3>
                                </div>
                                {onEdit && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(2)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2.5 text-xs flex-shrink-0"
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Institution</p>
                                    <p className="text-sm text-gray-900 font-medium break-words">{college}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Program</p>
                                    <p className="text-sm text-gray-900 font-medium break-words">{major}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Degree</p>
                                    <p className="text-sm text-gray-900 font-medium break-words">{degree}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Interests */}
                    <div className="space-y-3 min-w-0 w-full lg:w-auto max-w-sm lg:max-w-none">
                        {interests.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-gray-700 w-full">
                                    <div className="flex items-center gap-2">
                                        <Heart className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <h3 className="text-base font-semibold">Interests</h3>
                                    </div>
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(3)}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2.5 text-xs flex-shrink-0"
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {interests.map((interest, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="bg-green-100 text-green-800 hover:bg-green-200 px-2 py-0.5 text-xs h-fit max-w-full inline-block overflow-hidden text-ellipsis whitespace-nowrap"
                                        >
                                            {interest}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Column 3: Skills */}
                    <div className="space-y-3 min-w-0 w-full lg:w-auto max-w-sm lg:max-w-none">
                        {skills.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2 text-gray-700 w-full">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        <h3 className="text-base font-semibold">Skills</h3>
                                    </div>
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(4)}
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 px-2.5 text-xs flex-shrink-0"
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    {skills.map((skill, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-2 py-0.5 text-xs h-fit max-w-full inline-block overflow-hidden text-ellipsis whitespace-nowrap"
                                        >
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}