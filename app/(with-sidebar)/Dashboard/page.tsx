'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { 
  User,
  GraduationCap,
  Target,
  Award,
  Heart,
  Save,
  Sparkles,
  CheckCircle
} from 'lucide-react';

interface ProfileFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  major: string;
  year: string;
  
  // Academic Background
  gpa: string;
  previousEducation: string;
  academicAchievements: string;
  
  // Interests & Passions
  interests: string;
  hobbies: string;
  
  // Goals & Aspirations
  careerGoals: string;
  personalGoals: string;
  shortTermGoals: string;
  
  // Strengths & Skills
  technicalSkills: string;
  softSkills: string;
  strengths: string;
}

export default function DashboardPage() {
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    email: '',
    major: '',
    year: '',
    gpa: '',
    previousEducation: '',
    academicAchievements: '',
    interests: '',
    hobbies: '',
    careerGoals: '',
    personalGoals: '',
    shortTermGoals: '',
    technicalSkills: '',
    softSkills: '',
    strengths: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Your Student Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us understand you better so we can provide personalized guidance for your academic journey
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in slide-in-from-top">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Profile saved successfully!</p>
          </div>
        )}

        {/* Main Form */}
        <div className="space-y-6">
          
          {/* Personal Information Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Personal Information</CardTitle>
                  <CardDescription>Tell us about yourself</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@university.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="major" className="text-sm font-semibold text-gray-700">
                    Current/Intended Major
                  </Label>
                  <Input
                    id="major"
                    placeholder="e.g., Computer Science, Undecided"
                    value={formData.major}
                    onChange={(e) => handleInputChange('major', e.target.value)}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-semibold text-gray-700">
                    Academic Year
                  </Label>
                  <Input
                    id="year"
                    placeholder="e.g., Freshman, Sophomore"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    className="border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Background Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Academic Background</CardTitle>
                  <CardDescription>Share your educational journey</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gpa" className="text-sm font-semibold text-gray-700">
                  Current GPA (if applicable)
                </Label>
                <Input
                  id="gpa"
                  placeholder="e.g., 3.7"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange('gpa', e.target.value)}
                  className="border-gray-300 focus:border-purple-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousEducation" className="text-sm font-semibold text-gray-700">
                  Previous Education & Schools
                </Label>
                <Textarea
                  id="previousEducation"
                  placeholder="Tell us about your high school, previous colleges, or other educational background..."
                  value={formData.previousEducation}
                  onChange={(e) => handleInputChange('previousEducation', e.target.value)}
                  className="border-gray-300 focus:border-purple-500 min-h-[100px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicAchievements" className="text-sm font-semibold text-gray-700">
                  Academic Achievements & Awards
                </Label>
                <Textarea
                  id="academicAchievements"
                  placeholder="List any honors, awards, scholarships, or notable academic accomplishments..."
                  value={formData.academicAchievements}
                  onChange={(e) => handleInputChange('academicAchievements', e.target.value)}
                  className="border-gray-300 focus:border-purple-500 min-h-[100px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interests & Passions Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-gradient-to-r from-rose-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100">
                  <Heart className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Interests & Passions</CardTitle>
                  <CardDescription>What excites and motivates you?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests" className="text-sm font-semibold text-gray-700">
                  Academic & Career Interests
                </Label>
                <Textarea
                  id="interests"
                  placeholder="What subjects, fields, or career paths interest you? (e.g., technology, healthcare, business, arts, science)"
                  value={formData.interests}
                  onChange={(e) => handleInputChange('interests', e.target.value)}
                  className="border-gray-300 focus:border-rose-500 min-h-[120px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hobbies" className="text-sm font-semibold text-gray-700">
                  Hobbies & Extracurricular Activities
                </Label>
                <Textarea
                  id="hobbies"
                  placeholder="What do you enjoy doing outside of school? (e.g., sports, music, volunteering, clubs, personal projects)"
                  value={formData.hobbies}
                  onChange={(e) => handleInputChange('hobbies', e.target.value)}
                  className="border-gray-300 focus:border-rose-500 min-h-[120px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Goals & Aspirations Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Target className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Goals & Aspirations</CardTitle>
                  <CardDescription>Where do you see yourself heading?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careerGoals" className="text-sm font-semibold text-gray-700">
                  Career Goals & Dreams
                </Label>
                <Textarea
                  id="careerGoals"
                  placeholder="What are your long-term career aspirations? What kind of work do you envision yourself doing?"
                  value={formData.careerGoals}
                  onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                  className="border-gray-300 focus:border-emerald-500 min-h-[120px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortTermGoals" className="text-sm font-semibold text-gray-700">
                  Short-Term Academic Goals
                </Label>
                <Textarea
                  id="shortTermGoals"
                  placeholder="What do you want to achieve this semester or year? (e.g., improve GPA, join clubs, complete projects)"
                  value={formData.shortTermGoals}
                  onChange={(e) => handleInputChange('shortTermGoals', e.target.value)}
                  className="border-gray-300 focus:border-emerald-500 min-h-[100px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalGoals" className="text-sm font-semibold text-gray-700">
                  Personal Development Goals
                </Label>
                <Textarea
                  id="personalGoals"
                  placeholder="What personal skills or qualities do you want to develop? (e.g., leadership, communication, confidence)"
                  value={formData.personalGoals}
                  onChange={(e) => handleInputChange('personalGoals', e.target.value)}
                  className="border-gray-300 focus:border-emerald-500 min-h-[100px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Skills Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader className="border-b bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Strengths & Skills</CardTitle>
                  <CardDescription>What are you good at?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strengths" className="text-sm font-semibold text-gray-700">
                  Natural Strengths & Talents
                </Label>
                <Textarea
                  id="strengths"
                  placeholder="What comes naturally to you? What do others compliment you on? (e.g., problem-solving, creativity, leadership)"
                  value={formData.strengths}
                  onChange={(e) => handleInputChange('strengths', e.target.value)}
                  className="border-gray-300 focus:border-amber-500 min-h-[120px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technicalSkills" className="text-sm font-semibold text-gray-700">
                  Technical Skills
                </Label>
                <Textarea
                  id="technicalSkills"
                  placeholder="List any technical skills you have (e.g., programming languages, software, tools, certifications)"
                  value={formData.technicalSkills}
                  onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                  className="border-gray-300 focus:border-amber-500 min-h-[100px] resize-y"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="softSkills" className="text-sm font-semibold text-gray-700">
                  Soft Skills & Personal Qualities
                </Label>
                <Textarea
                  id="softSkills"
                  placeholder="Describe your interpersonal skills and character traits (e.g., communication, teamwork, adaptability, time management)"
                  value={formData.softSkills}
                  onChange={(e) => handleInputChange('softSkills', e.target.value)}
                  className="border-gray-300 focus:border-amber-500 min-h-[100px] resize-y"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center pt-4 pb-8">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 mb-4">
          <p className="text-sm text-gray-500">
            Your information is private and secure. We use it only to provide personalized guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
