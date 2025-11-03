'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Target,
  Award,
  BookOpen,
  Calendar,
  Heart,
  TrendingUp,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Brain,
  Sparkles,
  Compass,
  Star,
  Lightbulb,
  Users,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface StudentProfile {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  highSchool: string;
  expectedEnrollment: string;
  
  // Academic Background
  gpa: string;
  satScore: string;
  actScore: string;
  apCourses: string[];
  favoriteSubjects: string[];
  challengingSubjects: string[];
  academicAchievements: string[];
  
  // Career Exploration
  dreamCareers: string[];
  careerInterestAreas: string[];
  consideringMajors: string[];
  uncertainAbout: string[];
  
  // Interests & Passions
  hobbies: string[];
  extracurriculars: string[];
  volunteerWork: string[];
  personalProjects: string[];
  
  // Skills & Strengths
  naturalStrengths: string[];
  skillsToImprove: string[];
  learningPreferences: string[];
  workStyle: string[];
  
  // Values & Priorities
  careerValues: string[];
  workLifeBalance: string;
  importantFactors: string[];
  dealBreakers: string[];
  
  // Personality & Preferences
  personalityTraits: string[];
  idealWorkEnvironment: string[];
  preferredTeamSize: string;
  leadershipInterest: string;
  
  // Future Goals
  collegeGoals: string[];
  careerGoals: string[];
  personalGoals: string[];
  timelinePreference: string;
  
  // Practical Considerations
  budgetConcerns: string;
  geographicPreference: string[];
  willingToRelocate: boolean;
  graduateSchoolInterest: string;
  
  // Exploration Progress
  majorExplorationStatus: {
    researchedMajors: number;
    attendedInfoSessions: number;
    talkedToProfessionals: number;
    completedAssessments: number;
  };
  
  // Support & Resources
  mentors: string[];
  roleModels: string[];
  supportSystem: string[];
}

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('personal');
  
  // Sample profile for incoming college student
  const [profile] = useState<StudentProfile>({
    firstName: 'Alex',
    lastName: 'Chen',
    email: 'alex.chen@hawaii.edu',
    phone: '(808) 555-0199',
    location: 'Honolulu, HI',
    dateOfBirth: '2006-08-20',
    highSchool: 'Punahou School',
    expectedEnrollment: 'Fall 2025',
    
    gpa: '3.8',
    satScore: '1350',
    actScore: '30',
    apCourses: ['AP Computer Science', 'AP Calculus AB', 'AP English', 'AP Psychology'],
    favoriteSubjects: ['Computer Science', 'Mathematics', 'Creative Writing', 'Biology'],
    challengingSubjects: ['Physics', 'Foreign Language'],
    academicAchievements: [
      'Honor Roll (All 4 years)',
      'Science Fair Regional Winner',
      'National Honor Society Member',
      'Math Competition Finalist'
    ],
    
    dreamCareers: ['Software Developer', 'Video Game Designer', 'Environmental Scientist', 'Marine Biologist'],
    careerInterestAreas: ['Technology', 'Environmental Conservation', 'Creative Industries', 'Healthcare'],
    consideringMajors: ['Computer Science', 'Marine Biology', 'Environmental Science', 'Information Technology', 'Digital Media'],
    uncertainAbout: ['Which tech specialization to choose', 'STEM vs Creative field', 'Job market outlook', 'Graduate school necessity'],
    
    hobbies: ['Gaming', 'Photography', 'Beach Cleanup', 'Coding Projects', 'Surfing', 'YouTube Content Creation'],
    extracurriculars: ['Robotics Club', 'Environmental Club President', 'School Newspaper - Tech Columnist', 'Varsity Swimming'],
    volunteerWork: ['Beach Conservation Programs', 'Coding Tutor for Middle School', 'Animal Shelter Helper'],
    personalProjects: ['Built personal website', 'Created mobile game prototype', 'Started environmental awareness blog'],
    
    naturalStrengths: ['Problem Solving', 'Creativity', 'Quick Learner', 'Detail-Oriented', 'Team Collaboration'],
    skillsToImprove: ['Public Speaking', 'Time Management', 'Networking', 'Writing Skills'],
    learningPreferences: ['Hands-on Practice', 'Visual Learning', 'Project-Based', 'Self-Paced'],
    workStyle: ['Collaborative', 'Flexible Schedule', 'Mix of Solo and Team Work', 'Creative Freedom'],
    
    careerValues: ['Making a Positive Impact', 'Work-Life Balance', 'Continuous Learning', 'Creative Expression', 'Job Stability'],
    workLifeBalance: 'Very Important',
    importantFactors: ['Job Satisfaction', 'Growth Opportunities', 'Flexible Schedule', 'Good Salary', 'Location'],
    dealBreakers: ['Long Commute', 'No Growth Potential', 'Toxic Work Culture', 'Repetitive Tasks'],
    
    personalityTraits: ['Curious', 'Adaptable', 'Introverted', 'Creative', 'Analytical'],
    idealWorkEnvironment: ['Hybrid/Remote Options', 'Collaborative Spaces', 'Modern Tech Setup', 'Casual Dress Code'],
    preferredTeamSize: 'Small to Medium (5-15 people)',
    leadershipInterest: 'Maybe in the future',
    
    collegeGoals: [
      'Explore different fields through diverse coursework',
      'Build strong portfolio of projects',
      'Get internship experience',
      'Join relevant student organizations',
      'Maintain good GPA while learning what I love'
    ],
    careerGoals: [
      'Land entry-level job in tech or environmental sector',
      'Work on projects that help the environment',
      'Build skills in emerging technologies',
      'Find work that combines creativity and problem-solving'
    ],
    personalGoals: [
      'Develop confidence in my abilities',
      'Build professional network',
      'Travel and experience different cultures',
      'Maintain physical and mental health'
    ],
    timelinePreference: 'Open to exploration - willing to take time to find right fit',
    
    budgetConcerns: 'Moderate - Need to consider ROI of major choice',
    geographicPreference: ['Hawaii', 'West Coast', 'Pacific Northwest'],
    willingToRelocate: true,
    graduateSchoolInterest: 'Maybe - depends on career path chosen',
    
    majorExplorationStatus: {
      researchedMajors: 8,
      attendedInfoSessions: 3,
      talkedToProfessionals: 5,
      completedAssessments: 2
    },
    
    mentors: ['High School CS Teacher', 'Family Friend (Marine Biologist)'],
    roleModels: ['Jane Goodall', 'Steve Jobs', 'Local Environmental Activist'],
    supportSystem: ['Parents', 'Older Sibling (UH Alumni)', 'School Counselor', 'Close Friends']
  });

  const sections = [
    { id: 'personal', label: 'About Me', icon: User },
    { id: 'academic', label: 'Academic Background', icon: GraduationCap },
    { id: 'exploration', label: 'Career Exploration', icon: Compass },
    { id: 'interests', label: 'Interests & Passions', icon: Heart },
    { id: 'strengths', label: 'Strengths & Skills', icon: Star },
    { id: 'values', label: 'Values & Priorities', icon: Award },
    { id: 'personality', label: 'Work Style', icon: Brain },
    { id: 'goals', label: 'Goals & Aspirations', icon: Target },
    { id: 'practical', label: 'Practical Factors', icon: TrendingUp },
    { id: 'progress', label: 'Exploration Progress', icon: Activity }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My College & Career Profile
              </h1>
              <p className="text-gray-600">
                Help us understand you better so we can guide you to the perfect major and career path 🎓
              </p>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              className={isEditing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Welcome Banner for New Students */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-8 w-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to Your College Journey! 🌺</h3>
                <p className="text-gray-700 text-sm mb-3">
                  Choosing a major can feel overwhelming, but you don&apos;t have to figure it all out right now! 
                  This profile helps us understand your interests, strengths, and dreams so we can recommend 
                  majors and careers that align with who you are.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-600">Complete your profile to get personalized recommendations</Badge>
                  <Badge variant="outline">Explore multiple majors - it&apos;s okay to be undecided!</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Profile Sections</CardTitle>
                <CardDescription className="text-xs">
                  {Object.values(profile.majorExplorationStatus).reduce((a, b) => a + b, 0)} activities completed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'default' : 'ghost'}
                      className={`w-full justify-start text-sm ${
                        activeSection === section.id ? 'bg-green-600 hover:bg-green-700' : ''
                      }`}
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {section.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Information */}
            {activeSection === 'personal' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    About Me
                  </CardTitle>
                  <CardDescription>Tell us a bit about yourself</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">First Name</label>
                      <Input value={profile.firstName} disabled={!isEditing} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Last Name</label>
                      <Input value={profile.lastName} disabled={!isEditing} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <Input value={profile.email} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Phone</label>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <Input value={profile.phone} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Current Location</label>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <Input value={profile.location} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Date of Birth</label>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Input type="date" value={profile.dateOfBirth} disabled={!isEditing} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">High School</label>
                      <Input value={profile.highSchool} disabled={!isEditing} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Expected Enrollment</label>
                      <Input value={profile.expectedEnrollment} disabled={!isEditing} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Academic Background */}
            {activeSection === 'academic' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    Academic Background
                  </CardTitle>
                  <CardDescription>Your high school performance and academic interests</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">GPA</label>
                      <Input value={profile.gpa} disabled={!isEditing} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">SAT Score</label>
                      <Input value={profile.satScore} disabled={!isEditing} placeholder="Optional" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">ACT Score</label>
                      <Input value={profile.actScore} disabled={!isEditing} placeholder="Optional" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">AP/Honors Courses Taken</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.apCourses.map((course, idx) => (
                        <Badge key={idx} variant="secondary">
                          {course}
                          {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" />}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Badge variant="outline" className="cursor-pointer">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Course
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Favorite Subjects 💚</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.favoriteSubjects.map((subject, idx) => (
                        <Badge key={idx} className="bg-green-600">
                          {subject}
                          {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" />}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Subjects That Were Challenging</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.challengingSubjects.map((subject, idx) => (
                        <Badge key={idx} variant="outline">
                          {subject}
                          {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" />}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Academic Achievements</label>
                    <ul className="space-y-2">
                      {profile.academicAchievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Career Exploration */}
            {activeSection === 'exploration' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-green-600" />
                    Career Exploration
                  </CardTitle>
                  <CardDescription>What careers and majors are you considering?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Pro Tip:</p>
                        <p className="text-sm text-blue-700">It&apos;s totally normal to be interested in multiple fields! List everything that excites you - we&apos;ll help you find connections between them.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Dream Careers ✨</label>
                    <p className="text-xs text-gray-500 mb-2">What jobs sound exciting to you? Don&apos;t worry about being &quot;realistic&quot; yet!</p>
                    <div className="space-y-2">
                      {profile.dreamCareers.map((career, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
                          <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span className="text-gray-700 flex-1">{career}</span>
                          {isEditing && <Trash2 className="h-4 w-4 text-gray-400 cursor-pointer" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Career Interest Areas</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.careerInterestAreas.map((area, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {area}
                          {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" />}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Majors You&apos;re Considering 🤔</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.consideringMajors.map((major, idx) => (
                        <Badge key={idx} className="bg-green-600 text-sm">
                          {major}
                          {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" />}
                        </Badge>
                      ))}
                      {isEditing && (
                        <Badge variant="outline" className="cursor-pointer">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Major
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">What You&apos;re Uncertain About</label>
                    <p className="text-xs text-gray-500 mb-2">It&apos;s okay not to have all the answers! What questions do you have?</p>
                    <ul className="space-y-2">
                      {profile.uncertainAbout.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg">
                          <span className="text-yellow-600">❓</span>
                          <span className="text-gray-700 flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interests & Passions */}
            {activeSection === 'interests' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-600" />
                    Interests & Passions
                  </CardTitle>
                  <CardDescription>What do you love doing in and out of school?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Hobbies & Personal Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.hobbies.map((hobby, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {hobby}
                          {isEditing && <X className="h-3 w-3 ml-1 cursor-pointer" />}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Extracurricular Activities</label>
                    <div className="space-y-2">
                      {profile.extracurriculars.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Volunteer & Community Service</label>
                    <div className="space-y-2">
                      {profile.volunteerWork.map((volunteer, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                          <Heart className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{volunteer}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Personal Projects</label>
                    <p className="text-xs text-gray-500 mb-2">Things you&apos;ve built, created, or worked on independently</p>
                    <div className="space-y-2">
                      {profile.personalProjects.map((project, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-purple-50 p-3 rounded-lg">
                          <Lightbulb className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <span className="text-gray-700">{project}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths & Skills */}
            {activeSection === 'strengths' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    Strengths & Skills
                  </CardTitle>
                  <CardDescription>What are you naturally good at? What do you want to improve?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Natural Strengths ⭐</label>
                    <p className="text-xs text-gray-500 mb-2">What comes easily to you? What do people compliment you on?</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.naturalStrengths.map((strength, idx) => (
                        <Badge key={idx} className="bg-green-600 text-sm">
                          <Star className="h-3 w-3 mr-1" />
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Skills You Want to Develop</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.skillsToImprove.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">How You Learn Best</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.learningPreferences.map((pref, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Preferred Work Style</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.workStyle.map((style, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Values & Priorities */}
            {activeSection === 'values' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-green-600" />
                    Values & Priorities
                  </CardTitle>
                  <CardDescription>What matters most to you in a career?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Career Values</label>
                    <p className="text-xs text-gray-500 mb-2">What do you want from your future career?</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.careerValues.map((value, idx) => (
                        <Badge key={idx} className="bg-green-600 text-sm">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Work-Life Balance Importance</label>
                    <Input value={profile.workLifeBalance} disabled={!isEditing} />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Important Factors in Choosing a Career</label>
                    <div className="space-y-2">
                      {profile.importantFactors.map((factor, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
                          <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="text-gray-700">{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Deal Breakers ⛔</label>
                    <p className="text-xs text-gray-500 mb-2">What would make you NOT want a job?</p>
                    <div className="space-y-2">
                      {profile.dealBreakers.map((dealbreaker, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                          <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <span className="text-gray-700">{dealbreaker}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personality & Work Style */}
            {activeSection === 'personality' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-green-600" />
                    Personality & Work Style
                  </CardTitle>
                  <CardDescription>Understanding your personality helps us find the right fit</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Personality Traits</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.personalityTraits.map((trait, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Ideal Work Environment</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.idealWorkEnvironment.map((env, idx) => (
                        <Badge key={idx} className="bg-green-600 text-sm">
                          {env}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Preferred Team Size</label>
                      <Input value={profile.preferredTeamSize} disabled={!isEditing} />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Leadership Interest</label>
                      <Input value={profile.leadershipInterest} disabled={!isEditing} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals & Aspirations */}
            {activeSection === 'goals' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Goals & Aspirations
                  </CardTitle>
                  <CardDescription>What do you hope to achieve in college and beyond?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">College Goals 🎓</label>
                    <div className="space-y-2">
                      {profile.collegeGoals.map((goal, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-gray-700 flex-1">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Career Goals 💼</label>
                    <div className="space-y-2">
                      {profile.careerGoals.map((goal, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-gray-700 flex-1">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">Personal Goals 🌟</label>
                    <div className="space-y-2">
                      {profile.personalGoals.map((goal, idx) => (
                        <div key={idx} className="flex items-start gap-3 bg-purple-50 p-3 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </div>
                          <span className="text-gray-700 flex-1">{goal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Timeline Preference</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700">{profile.timelinePreference}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Practical Considerations */}
            {activeSection === 'practical' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Practical Considerations
                  </CardTitle>
                  <CardDescription>Important practical factors in your decision</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Budget Concerns</label>
                    <Input value={profile.budgetConcerns} disabled={!isEditing} />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Geographic Preferences</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.geographicPreference.map((location, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {location}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Willing to Relocate</label>
                      <div className="flex items-center gap-2 h-10">
                        <Badge variant={profile.willingToRelocate ? 'default' : 'secondary'} className="bg-green-600">
                          {profile.willingToRelocate ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Graduate School Interest</label>
                      <Input value={profile.graduateSchoolInterest} disabled={!isEditing} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Support System</label>
                    <div className="flex flex-wrap gap-2">
                      {profile.supportSystem.map((person, idx) => (
                        <Badge key={idx} variant="outline" className="text-sm">
                          <Users className="h-3 w-3 mr-1" />
                          {person}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Role Models</label>
                    <div className="space-y-2">
                      {profile.roleModels.map((model, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-yellow-50 p-3 rounded-lg">
                          <Star className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="text-gray-700">{model}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exploration Progress */}
            {activeSection === 'progress' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    Exploration Progress
                  </CardTitle>
                  <CardDescription>Track your major and career exploration journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Majors Researched</span>
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold text-blue-600">{profile.majorExplorationStatus.researchedMajors}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Info Sessions Attended</span>
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-3xl font-bold text-green-600">{profile.majorExplorationStatus.attendedInfoSessions}</p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Professionals Talked To</span>
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-3xl font-bold text-purple-600">{profile.majorExplorationStatus.talkedToProfessionals}</p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Assessments Completed</span>
                        <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                      </div>
                      <p className="text-3xl font-bold text-yellow-600">{profile.majorExplorationStatus.completedAssessments}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Current Mentors</label>
                    <div className="space-y-2">
                      {profile.mentors.map((mentor, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700">{mentor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Next Steps to Consider:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Schedule a meeting with a career counselor</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Take a career interest assessment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Shadow a professional in a field you&apos;re interested in</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Attend UH Mānoa major exploration events</span>
                      </li>
                    </ul>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save All Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
