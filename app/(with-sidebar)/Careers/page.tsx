'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  Search, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  GraduationCap,
  MapPin,
  Users,
  Target,
  Award,
  ChevronRight
} from 'lucide-react';

interface Career {
  id: string;
  title: string;
  category: string;
  description: string;
  salaryRange: string;
  growthOutlook: string;
  education: string;
  skills: string[];
  workEnvironment: string;
  relatedMajors: string[];
  typicalPath: string[];
}

// Career data - comprehensive list of career paths
const careers: Career[] = [
  {
    id: '1',
    title: 'Software Engineer',
    category: 'Technology',
    description: 'Design, develop, and maintain software applications and systems. Work on everything from mobile apps to large-scale enterprise systems.',
    salaryRange: '$80,000 - $150,000+',
    growthOutlook: 'Excellent (22% growth)',
    education: 'Bachelor\'s in Computer Science or related field',
    skills: ['Programming', 'Problem Solving', 'Algorithms', 'System Design', 'Collaboration'],
    workEnvironment: 'Office/Remote',
    relatedMajors: ['Computer Science', 'Software Engineering', 'Information Technology'],
    typicalPath: ['Junior Developer', 'Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager']
  },
  {
    id: '2',
    title: 'Data Scientist',
    category: 'Technology',
    description: 'Analyze complex data sets to extract insights and build predictive models. Use statistics, machine learning, and programming to solve business problems.',
    salaryRange: '$90,000 - $160,000+',
    growthOutlook: 'Excellent (36% growth)',
    education: 'Bachelor\'s/Master\'s in Data Science, Statistics, or Computer Science',
    skills: ['Python/R', 'Machine Learning', 'Statistics', 'Data Visualization', 'SQL'],
    workEnvironment: 'Office/Remote',
    relatedMajors: ['Data Science', 'Statistics', 'Computer Science', 'Mathematics'],
    typicalPath: ['Data Analyst', 'Junior Data Scientist', 'Data Scientist', 'Senior Data Scientist', 'Lead Data Scientist']
  },
  {
    id: '3',
    title: 'Registered Nurse',
    category: 'Healthcare',
    description: 'Provide patient care, educate patients about health conditions, and coordinate with doctors and other healthcare professionals.',
    salaryRange: '$60,000 - $95,000',
    growthOutlook: 'Excellent (9% growth)',
    education: 'Bachelor of Science in Nursing (BSN)',
    skills: ['Patient Care', 'Critical Thinking', 'Communication', 'Compassion', 'Medical Knowledge'],
    workEnvironment: 'Hospital/Clinic',
    relatedMajors: ['Nursing', 'Healthcare Administration'],
    typicalPath: ['RN', 'Charge Nurse', 'Nurse Manager', 'Director of Nursing']
  },
  {
    id: '4',
    title: 'Marketing Manager',
    category: 'Business',
    description: 'Develop and execute marketing strategies to promote products or services. Manage campaigns, analyze market trends, and oversee marketing teams.',
    salaryRange: '$70,000 - $130,000',
    growthOutlook: 'Good (10% growth)',
    education: 'Bachelor\'s in Marketing, Business, or Communications',
    skills: ['Strategy', 'Digital Marketing', 'Analytics', 'Leadership', 'Creativity'],
    workEnvironment: 'Office/Hybrid',
    relatedMajors: ['Marketing', 'Business Administration', 'Communications'],
    typicalPath: ['Marketing Coordinator', 'Marketing Specialist', 'Marketing Manager', 'Senior Marketing Manager', 'Director of Marketing']
  },
  {
    id: '5',
    title: 'Financial Analyst',
    category: 'Finance',
    description: 'Analyze financial data, prepare reports, and provide recommendations for investment decisions. Help organizations make informed financial decisions.',
    salaryRange: '$65,000 - $110,000',
    growthOutlook: 'Good (9% growth)',
    education: 'Bachelor\'s in Finance, Accounting, or Economics',
    skills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Forecasting', 'Communication'],
    workEnvironment: 'Office',
    relatedMajors: ['Finance', 'Accounting', 'Economics', 'Business Administration'],
    typicalPath: ['Junior Analyst', 'Financial Analyst', 'Senior Analyst', 'Finance Manager', 'Director of Finance']
  },
  {
    id: '6',
    title: 'UX/UI Designer',
    category: 'Design',
    description: 'Create intuitive and engaging user experiences for digital products. Design interfaces, conduct user research, and prototype solutions.',
    salaryRange: '$70,000 - $120,000',
    growthOutlook: 'Excellent (16% growth)',
    education: 'Bachelor\'s in Design, HCI, or related field',
    skills: ['Figma/Sketch', 'User Research', 'Prototyping', 'Visual Design', 'Empathy'],
    workEnvironment: 'Office/Remote',
    relatedMajors: ['Graphic Design', 'Interactive Media', 'Human-Computer Interaction'],
    typicalPath: ['Junior Designer', 'UX/UI Designer', 'Senior Designer', 'Lead Designer', 'Design Director']
  },
  {
    id: '7',
    title: 'Civil Engineer',
    category: 'Engineering',
    description: 'Design and oversee construction of infrastructure projects like roads, bridges, and buildings. Ensure projects meet safety and environmental standards.',
    salaryRange: '$70,000 - $115,000',
    growthOutlook: 'Good (8% growth)',
    education: 'Bachelor\'s in Civil Engineering',
    skills: ['CAD Software', 'Project Management', 'Problem Solving', 'Math', 'Technical Writing'],
    workEnvironment: 'Office/Field',
    relatedMajors: ['Civil Engineering', 'Construction Management', 'Environmental Engineering'],
    typicalPath: ['Junior Engineer', 'Civil Engineer', 'Senior Engineer', 'Project Manager', 'Principal Engineer']
  },
  {
    id: '8',
    title: 'Teacher (K-12)',
    category: 'Education',
    description: 'Educate students in various subjects, create lesson plans, assess student progress, and foster a positive learning environment.',
    salaryRange: '$45,000 - $75,000',
    growthOutlook: 'Good (4% growth)',
    education: 'Bachelor\'s in Education + Teaching License',
    skills: ['Communication', 'Patience', 'Creativity', 'Organization', 'Subject Expertise'],
    workEnvironment: 'School',
    relatedMajors: ['Education', 'Subject-specific Education (Math Ed, English Ed)'],
    typicalPath: ['Student Teacher', 'Teacher', 'Lead Teacher', 'Department Head', 'Principal']
  },
  {
    id: '9',
    title: 'Cybersecurity Analyst',
    category: 'Technology',
    description: 'Protect organizations from cyber threats by monitoring networks, identifying vulnerabilities, and implementing security measures.',
    salaryRange: '$75,000 - $130,000',
    growthOutlook: 'Excellent (35% growth)',
    education: 'Bachelor\'s in Cybersecurity, IT, or Computer Science',
    skills: ['Network Security', 'Threat Analysis', 'Ethical Hacking', 'Risk Assessment', 'Problem Solving'],
    workEnvironment: 'Office/Remote',
    relatedMajors: ['Cybersecurity', 'Information Technology', 'Computer Science'],
    typicalPath: ['Security Analyst', 'Senior Analyst', 'Security Engineer', 'Security Architect', 'CISO']
  },
  {
    id: '10',
    title: 'Physical Therapist',
    category: 'Healthcare',
    description: 'Help patients recover from injuries and improve mobility through exercise, manual therapy, and education.',
    salaryRange: '$75,000 - $100,000',
    growthOutlook: 'Excellent (18% growth)',
    education: 'Doctor of Physical Therapy (DPT)',
    skills: ['Anatomy Knowledge', 'Patient Care', 'Manual Therapy', 'Communication', 'Empathy'],
    workEnvironment: 'Clinic/Hospital',
    relatedMajors: ['Kinesiology', 'Exercise Science', 'Biology'],
    typicalPath: ['PT Assistant', 'Physical Therapist', 'Senior PT', 'Clinical Director', 'Practice Owner']
  },
  {
    id: '11',
    title: 'Environmental Scientist',
    category: 'Science',
    description: 'Study the environment and develop solutions to environmental problems. Conduct research, collect data, and advise policymakers.',
    salaryRange: '$60,000 - $95,000',
    growthOutlook: 'Good (8% growth)',
    education: 'Bachelor\'s/Master\'s in Environmental Science or related field',
    skills: ['Data Analysis', 'Field Research', 'Lab Skills', 'Report Writing', 'Problem Solving'],
    workEnvironment: 'Office/Field',
    relatedMajors: ['Environmental Science', 'Biology', 'Chemistry', 'Ecology'],
    typicalPath: ['Field Technician', 'Environmental Scientist', 'Senior Scientist', 'Project Manager', 'Research Director']
  },
  {
    id: '12',
    title: 'Architect',
    category: 'Design',
    description: 'Design buildings and structures, balancing aesthetics, functionality, and safety. Work with clients to bring their vision to life.',
    salaryRange: '$65,000 - $115,000',
    growthOutlook: 'Average (3% growth)',
    education: 'Bachelor\'s/Master\'s in Architecture + Licensure',
    skills: ['CAD/BIM Software', 'Creativity', 'Technical Drawing', 'Project Management', 'Building Codes'],
    workEnvironment: 'Office/Site Visits',
    relatedMajors: ['Architecture', 'Architectural Engineering'],
    typicalPath: ['Intern Architect', 'Architect', 'Senior Architect', 'Project Architect', 'Principal']
  },
  {
    id: '13',
    title: 'Social Worker',
    category: 'Social Services',
    description: 'Help individuals, families, and communities cope with challenges. Provide counseling, resources, and advocacy services.',
    salaryRange: '$50,000 - $75,000',
    growthOutlook: 'Excellent (12% growth)',
    education: 'Bachelor\'s/Master\'s in Social Work',
    skills: ['Empathy', 'Communication', 'Crisis Management', 'Case Management', 'Cultural Competence'],
    workEnvironment: 'Office/Field',
    relatedMajors: ['Social Work', 'Psychology', 'Human Services'],
    typicalPath: ['Case Worker', 'Social Worker', 'Clinical Social Worker', 'Program Manager', 'Director']
  },
  {
    id: '14',
    title: 'Mechanical Engineer',
    category: 'Engineering',
    description: 'Design, develop, and test mechanical devices and systems. Work on products ranging from small components to large machinery.',
    salaryRange: '$70,000 - $115,000',
    growthOutlook: 'Good (10% growth)',
    education: 'Bachelor\'s in Mechanical Engineering',
    skills: ['CAD Software', 'Thermodynamics', 'Problem Solving', 'Project Management', 'Manufacturing'],
    workEnvironment: 'Office/Lab/Factory',
    relatedMajors: ['Mechanical Engineering', 'Aerospace Engineering', 'Manufacturing Engineering'],
    typicalPath: ['Junior Engineer', 'Mechanical Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager']
  },
  {
    id: '15',
    title: 'Graphic Designer',
    category: 'Design',
    description: 'Create visual content for brands, publications, and digital media. Design logos, layouts, and marketing materials.',
    salaryRange: '$45,000 - $80,000',
    growthOutlook: 'Average (3% growth)',
    education: 'Bachelor\'s in Graphic Design or related field',
    skills: ['Adobe Creative Suite', 'Typography', 'Branding', 'Creativity', 'Communication'],
    workEnvironment: 'Office/Remote/Freelance',
    relatedMajors: ['Graphic Design', 'Visual Communications', 'Digital Media'],
    typicalPath: ['Junior Designer', 'Graphic Designer', 'Senior Designer', 'Art Director', 'Creative Director']
  },
  {
    id: '16',
    title: 'Accountant',
    category: 'Finance',
    description: 'Prepare and examine financial records, ensure accuracy, and help organizations maintain compliance with regulations.',
    salaryRange: '$55,000 - $90,000',
    growthOutlook: 'Good (6% growth)',
    education: 'Bachelor\'s in Accounting (CPA certification recommended)',
    skills: ['Financial Analysis', 'Tax Knowledge', 'Attention to Detail', 'Excel', 'Auditing'],
    workEnvironment: 'Office',
    relatedMajors: ['Accounting', 'Finance', 'Business Administration'],
    typicalPath: ['Junior Accountant', 'Accountant', 'Senior Accountant', 'Accounting Manager', 'Controller']
  },
  {
    id: '17',
    title: 'Film & Video Editor',
    category: 'Media & Arts',
    description: 'Edit film, television, or video content. Work with directors to create compelling visual narratives through post-production.',
    salaryRange: '$50,000 - $95,000',
    growthOutlook: 'Good (7% growth)',
    education: 'Bachelor\'s in Film, Media Production, or related field',
    skills: ['Video Editing Software', 'Storytelling', 'Color Grading', 'Sound Editing', 'Creativity'],
    workEnvironment: 'Studio/Remote',
    relatedMajors: ['Cinematic Arts', 'Film Production', 'Media Arts'],
    typicalPath: ['Assistant Editor', 'Video Editor', 'Senior Editor', 'Lead Editor', 'Post-Production Supervisor']
  },
  {
    id: '18',
    title: 'Human Resources Manager',
    category: 'Business',
    description: 'Oversee recruitment, employee relations, training, and organizational development. Ensure compliance with labor laws.',
    salaryRange: '$70,000 - $120,000',
    growthOutlook: 'Good (9% growth)',
    education: 'Bachelor\'s in HR, Business, or Psychology',
    skills: ['Recruitment', 'Conflict Resolution', 'Leadership', 'Communication', 'Labor Law'],
    workEnvironment: 'Office',
    relatedMajors: ['Human Resources', 'Business Administration', 'Psychology'],
    typicalPath: ['HR Coordinator', 'HR Specialist', 'HR Manager', 'Senior HR Manager', 'VP of HR']
  },
  {
    id: '19',
    title: 'Marine Biologist',
    category: 'Science',
    description: 'Study ocean life and ecosystems. Conduct research, collect specimens, and work to preserve marine environments.',
    salaryRange: '$50,000 - $85,000',
    growthOutlook: 'Good (5% growth)',
    education: 'Bachelor\'s/Master\'s in Marine Biology or related field',
    skills: ['Research Methods', 'Scuba Diving', 'Data Analysis', 'Lab Skills', 'Scientific Writing'],
    workEnvironment: 'Lab/Field/Ocean',
    relatedMajors: ['Marine Biology', 'Oceanography', 'Biology', 'Environmental Science'],
    typicalPath: ['Research Assistant', 'Marine Biologist', 'Senior Scientist', 'Research Lead', 'Principal Investigator']
  },
  {
    id: '20',
    title: 'Journalist',
    category: 'Media & Arts',
    description: 'Research, write, and report news stories for various media outlets. Investigate issues and inform the public.',
    salaryRange: '$40,000 - $75,000',
    growthOutlook: 'Declining (-6% growth)',
    education: 'Bachelor\'s in Journalism, Communications, or English',
    skills: ['Writing', 'Research', 'Interviewing', 'Multimedia', 'Critical Thinking'],
    workEnvironment: 'Office/Field',
    relatedMajors: ['Journalism', 'Communications', 'English', 'Media Studies'],
    typicalPath: ['Reporter', 'Staff Writer', 'Senior Reporter', 'Editor', 'Editor-in-Chief']
  }
];

const categories = ['All', 'Technology', 'Healthcare', 'Business', 'Finance', 'Design', 'Engineering', 'Education', 'Science', 'Social Services', 'Media & Arts'];

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  // Filter careers based on search and category
  const filteredCareers = useMemo(() => {
    let filtered = careers;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(career => career.category === selectedCategory);
    }

    // Filter by search query (case insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(career => {
        const title = career.title.toLowerCase();
        const description = career.description.toLowerCase();
        const category = career.category.toLowerCase();
        const skills = career.skills.join(' ').toLowerCase();
        const majors = career.relatedMajors.join(' ').toLowerCase();
        
        return title.includes(query) || 
               description.includes(query) || 
               category.includes(query) ||
               skills.includes(query) ||
               majors.includes(query);
      });
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Career Paths
          </h1>
          <p className="text-gray-600">
            Explore {careers.length} diverse career opportunities and find your path
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by career title, skills, or related majors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {category}
              </Button>
            ))}
          </div>
          {searchQuery && (
            <p className="mt-3 text-sm text-gray-600">
              Found {filteredCareers.length} career{filteredCareers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Career Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => (
            <Card 
              key={career.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-green-500"
              onClick={() => setSelectedCareer(career)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {career.category}
                  </Badge>
                  <Briefcase className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <CardTitle className="text-lg leading-tight mb-2">
                  {career.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {career.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{career.salaryRange}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>{career.growthOutlook}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span className="text-xs line-clamp-1">{career.education}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {career.skills.slice(0, 3).map((skill, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {career.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{career.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  Learn More
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No careers found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try searching with different keywords or select a different category
            </p>
          </div>
        )}

        {/* Career Detail Modal/Sidebar */}
        {selectedCareer && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCareer(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div>
                  <Badge className="mb-2">{selectedCareer.category}</Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedCareer.title}
                  </h2>
                  <p className="text-gray-600">{selectedCareer.description}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCareer(null)}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Salary Range</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCareer.salaryRange}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Growth Outlook</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCareer.growthOutlook}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Work Environment</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedCareer.workEnvironment}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Education */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Education Required</h3>
                  </div>
                  <p className="text-gray-700">{selectedCareer.education}</p>
                </div>

                {/* Skills */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Related Majors */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Related Majors</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.relatedMajors.map((major, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm py-1 px-3">
                        {major}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Career Path */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Typical Career Path</h3>
                  </div>
                  <div className="relative">
                    {selectedCareer.typicalPath.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-3 mb-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                          <p className="font-medium text-gray-900">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
