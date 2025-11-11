'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Search, 
  Award, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Building2,
  TrendingUp,
  Users,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  Globe,
  Link2,
  Sparkles,
  Heart
} from 'lucide-react';

interface Counselor {
  id: string;
  name: string;
  title: string;
  campus: string;
  specializations: string[];
  expertise: string[];
  availability: string;
  email: string;
  phone: string;
  officeLocation: string;
  bio: string;
  languages: string[];
  image?: string;
}

interface Organization {
  id: string;
  name: string;
  category: string;
  campus: string;
  relatedMajors: string[];
  description: string;
  benefits: string[];
  meetingTime: string;
  contactEmail: string;
  website?: string;
  memberCount: number;
  isActive: boolean;
}

interface Alumnus {
  id: string;
  name: string;
  graduationYear: string;
  degree: string;
  major: string;
  category: string;
  currentRole: string;
  organization: string;
  achievements: string[];
  notableWork: string;
  image?: string;
}

// College Counselors
const counselors: Counselor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    title: 'Academic Advisor & Career Counselor',
    campus: 'UH Manoa',
    specializations: ['STEM Pathways', 'Graduate School Prep', 'Research Opportunities'],
    expertise: ['Computer Science', 'Engineering', 'Mathematics', 'Physics'],
    availability: 'Mon-Fri, 9AM-4PM',
    email: 'sjohnson@hawaii.edu',
    phone: '(808) 956-7234',
    officeLocation: 'Queen Liliʻuokalani Center, Room 210',
    bio: 'Dr. Johnson specializes in guiding STEM students through their academic journey and helping them prepare for graduate programs and tech careers.',
    languages: ['English', 'Spanish']
  },
  {
    id: '2',
    name: 'Michael Kawena',
    title: 'Native Hawaiian Student Success Counselor',
    campus: 'UH Manoa',
    specializations: ['Hawaiian Studies', 'Cultural Integration', 'Financial Aid'],
    expertise: ['Hawaiian Language', 'Indigenous Studies', 'Cultural Programs', 'Scholarships'],
    availability: 'Mon-Thu, 8AM-5PM',
    email: 'mkawena@hawaii.edu',
    phone: '(808) 956-8200',
    officeLocation: 'Hawaiʻinuiākea, Room 101',
    bio: 'Michael works with Native Hawaiian students to ensure they have the support and resources needed to succeed academically while maintaining cultural connections.',
    languages: ['English', 'Hawaiian']
  },
  {
    id: '3',
    name: 'Dr. Jennifer Chen',
    title: 'Business & Economics Advisor',
    campus: 'UH Manoa',
    specializations: ['Business Majors', 'Internship Placement', 'Entrepreneurship'],
    expertise: ['Business Administration', 'Economics', 'Accounting', 'Finance'],
    availability: 'Tue-Fri, 10AM-6PM',
    email: 'jchen@hawaii.edu',
    phone: '(808) 956-7891',
    officeLocation: 'Shidler College, Room 305',
    bio: 'Dr. Chen connects business students with internship opportunities and provides guidance on career pathways in finance, consulting, and entrepreneurship.',
    languages: ['English', 'Mandarin', 'Cantonese']
  },
  {
    id: '4',
    name: 'David Martinez',
    title: 'Transfer Student Coordinator',
    campus: 'UH Manoa',
    specializations: ['Transfer Credits', 'Community College Transition', 'Degree Planning'],
    expertise: ['Transfer Advising', 'Credit Evaluation', 'Multi-campus Navigation'],
    availability: 'Mon-Fri, 8AM-3PM',
    email: 'dmartinez@hawaii.edu',
    phone: '(808) 956-6543',
    officeLocation: 'Student Services Center, Room 120',
    bio: 'David specializes in helping transfer students navigate the transition from community colleges and other institutions to UH Manoa.',
    languages: ['English', 'Spanish', 'Portuguese']
  },
  {
    id: '5',
    name: 'Dr. Keiko Yamamoto',
    title: 'International Student Advisor',
    campus: 'UH Manoa',
    specializations: ['International Students', 'Visa Support', 'Cultural Adjustment'],
    expertise: ['Immigration', 'Cross-cultural Advising', 'F-1/J-1 Regulations'],
    availability: 'Mon-Fri, 9AM-5PM',
    email: 'kyamamoto@hawaii.edu',
    phone: '(808) 956-8613',
    officeLocation: 'International Student Services, Room 201',
    bio: 'Dr. Yamamoto provides comprehensive support for international students, including visa maintenance, cultural adaptation, and academic success strategies.',
    languages: ['English', 'Japanese', 'Korean']
  },
  {
    id: '6',
    name: 'Amanda Silva',
    title: 'Health Sciences & Pre-Med Advisor',
    campus: 'UH Manoa',
    specializations: ['Pre-Med', 'Health Sciences', 'Medical School Prep'],
    expertise: ['Biology', 'Chemistry', 'Pre-Health Programs', 'MCAT Prep'],
    availability: 'Tue-Sat, 10AM-6PM',
    email: 'asilva@hawaii.edu',
    phone: '(808) 956-7766',
    officeLocation: 'Biomedical Sciences, Room 403',
    bio: 'Amanda guides pre-med and health science students through rigorous academic requirements and medical school application processes.',
    languages: ['English', 'Tagalog']
  },
  {
    id: '7',
    name: 'Robert Thompson',
    title: 'Veterans & Military Affairs Counselor',
    campus: 'UH Manoa',
    specializations: ['Veterans Benefits', 'Military Transition', 'GI Bill Support'],
    expertise: ['VA Benefits', 'Military Credit Transfer', 'Career Transition'],
    availability: 'Mon-Fri, 7AM-4PM',
    email: 'rthompson@hawaii.edu',
    phone: '(808) 956-7214',
    officeLocation: 'Veterans Center, Room 105',
    bio: 'Robert assists veterans and active-duty military personnel in navigating educational benefits and transitioning to academic life.',
    languages: ['English']
  },
  {
    id: '8',
    name: 'Dr. Maria Gonzales',
    title: 'First-Generation Student Success Coach',
    campus: 'UH Manoa',
    specializations: ['First-Gen Students', 'Academic Success', 'Resource Navigation'],
    expertise: ['Holistic Advising', 'Family Communication', 'College Success Skills'],
    availability: 'Mon-Thu, 9AM-6PM',
    email: 'mgonzales@hawaii.edu',
    phone: '(808) 956-8899',
    officeLocation: 'Academic Success Center, Room 115',
    bio: 'Dr. Gonzales provides specialized support for first-generation college students and their families throughout the college journey.',
    languages: ['English', 'Spanish']
  }
];

// Student Organizations & Clubs
const organizations: Organization[] = [
  {
    id: '1',
    name: 'Association for Computing Machinery (ACM)',
    category: 'Technology & Engineering',
    campus: 'UH Manoa',
    relatedMajors: ['Computer Science', 'Computer Engineering', 'Information Technology'],
    description: 'Premier organization for computing students featuring coding workshops, hackathons, tech talks, and networking with industry professionals.',
    benefits: ['Technical Workshops', 'Industry Networking', 'Career Fair Access', 'Peer Mentorship'],
    meetingTime: 'Thursdays, 5:30 PM',
    contactEmail: 'acm@hawaii.edu',
    website: 'acm.manoa.hawaii.edu',
    memberCount: 150,
    isActive: true
  },
  {
    id: '2',
    name: 'Hawaiian Science & Engineering Mentorship Program (HSEMP)',
    category: 'STEM & Hawaiian Culture',
    campus: 'UH Manoa',
    relatedMajors: ['Engineering', 'Physics', 'Chemistry', 'Hawaiian Studies'],
    description: 'Connects Native Hawaiian STEM students with faculty mentors, research opportunities, and cultural learning experiences.',
    benefits: ['Research Mentorship', 'Cultural Integration', 'Scholarship Info', 'Graduate School Prep'],
    meetingTime: 'Bi-weekly, Wednesdays, 4:00 PM',
    contactEmail: 'hsemp@hawaii.edu',
    website: 'manoa.hawaii.edu/hsemp',
    memberCount: 85,
    isActive: true
  },
  {
    id: '3',
    name: 'Business Student Council',
    category: 'Business & Entrepreneurship',
    campus: 'UH Manoa',
    relatedMajors: ['Business Administration', 'Accounting', 'Finance', 'Marketing', 'Management'],
    description: 'Represents business students and provides professional development, networking events, and career preparation.',
    benefits: ['Executive Training', 'Company Visits', 'Speaker Series', 'Internship Connections'],
    meetingTime: 'Tuesdays, 6:00 PM',
    contactEmail: 'bsc@hawaii.edu',
    website: 'shidler.hawaii.edu/bsc',
    memberCount: 200,
    isActive: true
  },
  {
    id: '4',
    name: 'Pre-Medical Association',
    category: 'Health Sciences',
    campus: 'UH Manoa',
    relatedMajors: ['Biology', 'Chemistry', 'Pre-Medicine', 'Biochemistry'],
    description: 'Supports students preparing for medical school through MCAT prep, clinical experience opportunities, and medical school application guidance.',
    benefits: ['MCAT Study Groups', 'Clinical Shadowing', 'Med School Advising', 'Guest Physicians'],
    meetingTime: 'Mondays & Wednesdays, 5:00 PM',
    contactEmail: 'premed@hawaii.edu',
    memberCount: 180,
    isActive: true
  },
  {
    id: '5',
    name: 'Hui ʻOhana - Hawaiian Student Union',
    category: 'Cultural & Community',
    campus: 'UH Manoa',
    relatedMajors: ['Hawaiian Studies', 'Hawaiian Language', 'All Majors'],
    description: 'Promotes Hawaiian culture, language, and traditions while providing a supportive community for Native Hawaiian students and allies.',
    benefits: ['Cultural Events', 'Language Practice', 'Community Service', 'Leadership Development'],
    meetingTime: 'Thursdays, 4:30 PM',
    contactEmail: 'huiohana@hawaii.edu',
    website: 'manoa.hawaii.edu/huiohana',
    memberCount: 250,
    isActive: true
  },
  {
    id: '6',
    name: 'Society of Women Engineers (SWE)',
    category: 'Engineering & Advocacy',
    campus: 'UH Manoa',
    relatedMajors: ['Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering', 'Computer Engineering'],
    description: 'Empowers women in engineering through professional development, mentorship, and advocacy for gender equality in STEM.',
    benefits: ['Mentorship Program', 'Industry Tours', 'Conference Travel', 'Resume Workshops'],
    meetingTime: 'Fridays, 3:00 PM',
    contactEmail: 'swe@hawaii.edu',
    website: 'swe.manoa.hawaii.edu',
    memberCount: 120,
    isActive: true
  },
  {
    id: '7',
    name: 'Marine Biology Club',
    category: 'Environmental Science',
    campus: 'UH Manoa',
    relatedMajors: ['Marine Biology', 'Oceanography', 'Environmental Science', 'Zoology'],
    description: 'Explores marine ecosystems through field trips, research projects, conservation efforts, and guest speakers from marine institutions.',
    benefits: ['Field Trips', 'Research Opportunities', 'Conservation Projects', 'Diving Certifications'],
    meetingTime: 'Wednesdays, 5:00 PM',
    contactEmail: 'marinebio@hawaii.edu',
    memberCount: 140,
    isActive: true
  },
  {
    id: '8',
    name: 'Public Health Student Association',
    category: 'Health & Social Sciences',
    campus: 'UH Manoa',
    relatedMajors: ['Public Health', 'Social Work', 'Nursing', 'Psychology'],
    description: 'Addresses public health issues through community outreach, research, and education while preparing students for careers in public health.',
    benefits: ['Community Service', 'Research Projects', 'Networking Events', 'Conference Attendance'],
    meetingTime: 'Tuesdays, 4:00 PM',
    contactEmail: 'phsa@hawaii.edu',
    website: 'publichealth.hawaii.edu/phsa',
    memberCount: 95,
    isActive: true
  },
  {
    id: '9',
    name: 'Economics & Finance Society',
    category: 'Business & Economics',
    campus: 'UH Manoa',
    relatedMajors: ['Economics', 'Finance', 'Business Analytics', 'International Business'],
    description: 'Connects economics and finance students with industry professionals, investment opportunities, and economic research.',
    benefits: ['Guest Speakers', 'Investment Competitions', 'Career Workshops', 'Industry Connections'],
    meetingTime: 'Mondays, 6:30 PM',
    contactEmail: 'efsociety@hawaii.edu',
    memberCount: 110,
    isActive: true
  },
  {
    id: '10',
    name: 'Architecture Students Association',
    category: 'Arts & Design',
    campus: 'UH Manoa',
    relatedMajors: ['Architecture', 'Urban Planning', 'Civil Engineering', 'Art'],
    description: 'Supports architecture students through design critiques, portfolio development, site visits, and connections with practicing architects.',
    benefits: ['Design Workshops', 'Site Visits', 'Portfolio Reviews', 'Licensing Info'],
    meetingTime: 'Thursdays, 7:00 PM',
    contactEmail: 'archstudents@hawaii.edu',
    memberCount: 75,
    isActive: true
  },
  {
    id: '11',
    name: 'Data Science Club',
    category: 'Technology & Analytics',
    campus: 'UH Manoa',
    relatedMajors: ['Data Science', 'Statistics', 'Mathematics', 'Computer Science'],
    description: 'Explores data science applications through projects, competitions, and workshops on machine learning, AI, and analytics.',
    benefits: ['Kaggle Competitions', 'ML Workshops', 'Industry Projects', 'Job Referrals'],
    meetingTime: 'Tuesdays, 5:30 PM',
    contactEmail: 'datasci@hawaii.edu',
    memberCount: 130,
    isActive: true
  },
  {
    id: '12',
    name: 'Political Science Student Association',
    category: 'Social Sciences & Government',
    campus: 'UH Manoa',
    relatedMajors: ['Political Science', 'International Relations', 'Pre-Law', 'Public Administration'],
    description: 'Engages students in political discourse, mock trials, legislative visits, and preparation for law school or government careers.',
    benefits: ['Mock Trials', 'Capitol Visits', 'Speaker Series', 'Law School Prep'],
    meetingTime: 'Wednesdays, 6:00 PM',
    contactEmail: 'polisci@hawaii.edu',
    memberCount: 90,
    isActive: true
  },
  {
    id: '13',
    name: 'International Student Association',
    category: 'Cultural Exchange',
    campus: 'UH Manoa',
    relatedMajors: ['All Majors'],
    description: 'Creates a welcoming community for international students and promotes cultural exchange through events, festivals, and support networks.',
    benefits: ['Cultural Events', 'Peer Support', 'Social Activities', 'Visa Workshops'],
    meetingTime: 'Fridays, 4:00 PM',
    contactEmail: 'isa@hawaii.edu',
    website: 'manoa.hawaii.edu/isa',
    memberCount: 300,
    isActive: true
  },
  {
    id: '14',
    name: 'Sustainability Club - Mālama Honua',
    category: 'Environmental & Sustainability',
    campus: 'UH Manoa',
    relatedMajors: ['Environmental Science', 'Sustainability', 'Natural Resources', 'All Majors'],
    description: 'Promotes environmental stewardship through campus sustainability initiatives, community projects, and environmental advocacy.',
    benefits: ['Campus Projects', 'Community Service', 'Environmental Workshops', 'Networking'],
    meetingTime: 'Mondays, 5:00 PM',
    contactEmail: 'malamahonua@hawaii.edu',
    memberCount: 160,
    isActive: true
  },
  {
    id: '15',
    name: 'Psychology Club',
    category: 'Social Sciences',
    campus: 'UH Manoa',
    relatedMajors: ['Psychology', 'Neuroscience', 'Social Work', 'Education'],
    description: 'Provides psychology students with research opportunities, graduate school preparation, and connections to clinical settings.',
    benefits: ['Research Labs', 'Grad School Prep', 'Clinical Exposure', 'Study Groups'],
    meetingTime: 'Tuesdays, 3:30 PM',
    contactEmail: 'psychclub@hawaii.edu',
    memberCount: 175,
    isActive: true
  }
];

// Notable UH Mānoa Alumni
const alumni: Alumnus[] = [
  {
    id: '1',
    name: 'Barack Obama',
    graduationYear: '1979',
    degree: 'BA',
    major: 'Political Science',
    category: 'Politics & Government',
    currentRole: '44th President of the United States',
    organization: 'Obama Foundation',
    achievements: [
      'First African American President',
      'Nobel Peace Prize 2009',
      'Pulitzer Prize for Memoir',
      'Grammy Award Winner'
    ],
    notableWork: 'Served as 44th President of the United States (2009-2017), advocating for healthcare reform, climate action, and diplomacy.'
  },
  {
    id: '2',
    name: 'Bette Midler',
    graduationYear: '1965',
    degree: 'Attended',
    major: 'Drama',
    category: 'Entertainment',
    currentRole: 'Singer, Actress, Comedian',
    organization: 'New York Restoration Project',
    achievements: [
      '4 Grammy Awards',
      '3 Emmy Awards',
      '2 Tony Awards',
      'Golden Globe Awards'
    ],
    notableWork: 'Legendary performer known for "The Rose," "Beaches," and founding the New York Restoration Project for environmental conservation.'
  },
  {
    id: '3',
    name: 'Daniel K. Inouye',
    graduationYear: '1950',
    degree: 'BA',
    major: 'Government & Economics',
    category: 'Politics & Government',
    currentRole: 'U.S. Senator (Deceased)',
    organization: 'U.S. Senate',
    achievements: [
      'Medal of Honor Recipient',
      'Longest-serving U.S. Senator',
      'President Pro Tempore',
      'Watergate Committee Member'
    ],
    notableWork: 'Served as U.S. Senator for Hawaii for nearly 50 years, war hero, and advocate for veterans and Native Hawaiians.'
  },
  {
    id: '4',
    name: 'Carrie Ann Inaba',
    graduationYear: '1986',
    degree: 'BA',
    major: 'World Arts and Cultures',
    category: 'Entertainment',
    currentRole: 'Television Host, Choreographer',
    organization: 'Dancing with the Stars',
    achievements: [
      'Dancing with the Stars Judge',
      'The Talk Co-host',
      'Emmy Award Winner',
      'Professional Dancer & Choreographer'
    ],
    notableWork: 'Known as a judge on "Dancing with the Stars" and former co-host of "The Talk," pioneering Asian American representation on TV.'
  },
  {
    id: '5',
    name: 'Michelle Wie West',
    graduationYear: '2012',
    degree: 'BA',
    major: 'Communications',
    category: 'Sports',
    currentRole: 'Professional Golfer',
    organization: 'LPGA',
    achievements: [
      'U.S. Women\'s Open Champion',
      '5 LPGA Tour Wins',
      'Youngest USGA Champion',
      'Time 100 Most Influential'
    ],
    notableWork: 'Professional golfer who won the U.S. Women\'s Open and became the youngest player to qualify for an LPGA event.'
  },
  {
    id: '6',
    name: 'Kelly Preston',
    graduationYear: '1980',
    degree: 'Attended',
    major: 'Theater & Drama',
    category: 'Entertainment',
    currentRole: 'Actress (Deceased)',
    organization: 'Film Industry',
    achievements: [
      'Jerry Maguire Star',
      'Twins Lead Actress',
      'From Dusk Till Dawn',
      'SpaceCamp'
    ],
    notableWork: 'Acclaimed actress known for roles in "Jerry Maguire," "Twins," and "From Dusk Till Dawn."'
  },
  {
    id: '7',
    name: 'Tia Carrere',
    graduationYear: '1981',
    degree: 'Attended',
    major: 'Theater',
    category: 'Entertainment',
    currentRole: 'Actress, Singer',
    organization: 'Entertainment Industry',
    achievements: [
      'Grammy Award Winner',
      'Wayne\'s World Star',
      'Lilo & Stitch Voice',
      'Dancing with the Stars Contestant'
    ],
    notableWork: 'Actress and Hawaiian music singer, known for "Wayne\'s World" and voicing Nani in "Lilo & Stitch."'
  },
  {
    id: '8',
    name: 'Bruno Mars',
    graduationYear: 'N/A',
    degree: 'Attended (Did not graduate)',
    major: 'Music',
    category: 'Entertainment',
    currentRole: 'Singer, Songwriter, Producer',
    organization: 'Music Industry',
    achievements: [
      '15 Grammy Awards',
      'Billboard Artist of the Decade',
      '200+ Million Records Sold',
      'Super Bowl Halftime Shows'
    ],
    notableWork: 'Global pop superstar with hits like "Just the Way You Are," "Uptown Funk," and "24K Magic."'
  },
  {
    id: '9',
    name: 'Dr. Patricia A. Woertz',
    graduationYear: '1974',
    degree: 'BA',
    major: 'Accounting',
    category: 'Business',
    currentRole: 'Former CEO',
    organization: 'Archer Daniels Midland',
    achievements: [
      'Fortune 500 CEO',
      'Forbes Most Powerful Women',
      'First Female CEO of ADM',
      'Corporate Board Leader'
    ],
    notableWork: 'Led Archer Daniels Midland as CEO and was named one of Forbes\' Most Powerful Women in business.'
  },
  {
    id: '10',
    name: 'Dr. Ellison Onizuka',
    graduationYear: '1969',
    degree: 'BS',
    major: 'Aerospace Engineering',
    category: 'Science & Technology',
    currentRole: 'NASA Astronaut (Deceased)',
    organization: 'NASA',
    achievements: [
      'First Asian American Astronaut',
      'Space Shuttle Missions',
      'Congressional Space Medal',
      'NASA Distinguished Service Medal'
    ],
    notableWork: 'NASA astronaut and the first Asian American in space, who tragically died in the Challenger disaster.'
  },
  {
    id: '11',
    name: 'Dr. Victoria Keith',
    graduationYear: '1974',
    degree: 'BA',
    major: 'Sociology',
    category: 'Academia',
    currentRole: 'Professor & Researcher',
    organization: 'Arizona State University',
    achievements: [
      'Published Author',
      'Social Justice Advocate',
      'Mental Health Researcher',
      'Community Leader'
    ],
    notableWork: 'Renowned sociologist specializing in mental health disparities and social justice in African American communities.'
  },
  {
    id: '12',
    name: 'Tamlyn Tomita',
    graduationYear: '1983',
    degree: 'BA',
    major: 'History',
    category: 'Entertainment',
    currentRole: 'Actress',
    organization: 'Film & Television',
    achievements: [
      'Karate Kid Part II',
      'Joy Luck Club',
      'Teen Wolf Series',
      'Asian American Representation Pioneer'
    ],
    notableWork: 'Actress known for "The Karate Kid Part II" and "The Joy Luck Club," advocating for Asian American representation.'
  },
  {
    id: '13',
    name: 'Angela Perez Baraquio',
    graduationYear: '1999',
    degree: 'BA',
    major: 'Education',
    category: 'Public Service',
    currentRole: 'Educator, Speaker',
    organization: 'Education Sector',
    achievements: [
      'Miss America 2001',
      'First Asian American Miss America',
      'First Teacher to win Miss America',
      'Educational Advocate'
    ],
    notableWork: 'First Asian American and first teacher to be crowned Miss America, advocate for character education.'
  },
  {
    id: '14',
    name: 'Dr. France Córdova',
    graduationYear: '1969',
    degree: 'BS',
    major: 'English',
    category: 'Science & Technology',
    currentRole: 'Former NSF Director',
    organization: 'National Science Foundation',
    achievements: [
      'NASA Chief Scientist',
      'NSF Director',
      'University President',
      'Astrophysicist'
    ],
    notableWork: 'Astrophysicist who served as NASA Chief Scientist and Director of the National Science Foundation.'
  },
  {
    id: '15',
    name: 'Dr. Duane Kurisu',
    graduationYear: '1977',
    degree: 'BA',
    major: 'Economics',
    category: 'Business',
    currentRole: 'Entrepreneur, Philanthropist',
    organization: 'aio Inc.',
    achievements: [
      'Founded aio Digital',
      'Community Leader',
      'Philanthropist',
      'Technology Innovator'
    ],
    notableWork: 'Entrepreneur and philanthropist who founded aio Digital and actively supports Hawaii\'s business community.'
  },
  {
    id: '16',
    name: 'Makani Christensen',
    graduationYear: '2005',
    degree: 'BA',
    major: 'Hawaiian Studies',
    category: 'Arts & Culture',
    currentRole: 'Musician, Cultural Practitioner',
    organization: 'Na Hoa',
    achievements: [
      'Grammy-nominated Artist',
      'Nā Hōkū Hanohano Awards',
      'Hawaiian Music Ambassador',
      'Cultural Educator'
    ],
    notableWork: 'Grammy-nominated Hawaiian musician and member of Na Hoa, preserving and sharing Hawaiian culture globally.'
  },
  {
    id: '17',
    name: 'Dr. Haunani-Kay Trask',
    graduationYear: '1972',
    degree: 'BA',
    major: 'Political Science',
    category: 'Academia',
    currentRole: 'Professor, Activist (Deceased)',
    organization: 'University of Hawaiʻi',
    achievements: [
      'Hawaiian Sovereignty Leader',
      'Published Poet & Scholar',
      'Indigenous Rights Advocate',
      'Author'
    ],
    notableWork: 'Pioneering Native Hawaiian scholar, poet, and sovereignty activist who founded UH\'s Center for Hawaiian Studies.'
  },
  {
    id: '18',
    name: 'Chad Blair',
    graduationYear: '1985',
    degree: 'BA',
    major: 'Journalism',
    category: 'Media',
    currentRole: 'Senior Reporter & Editor',
    organization: 'Civil Beat',
    achievements: [
      'Award-winning Journalist',
      'Hawaii Political Reporter',
      'Media Leader',
      'Public Service Journalism'
    ],
    notableWork: 'Veteran journalist covering Hawaii politics and government for Civil Beat, known for investigative reporting.'
  },
  {
    id: '19',
    name: 'Dr. Clyde Sakamoto',
    graduationYear: '1975',
    degree: 'BS',
    major: 'Electrical Engineering',
    category: 'Science & Technology',
    currentRole: 'Engineer, Entrepreneur',
    organization: 'Technology Sector',
    achievements: [
      'Engineering Leader',
      'Technology Innovator',
      'Mentor',
      'Community Advocate'
    ],
    notableWork: 'Engineering leader and entrepreneur who has contributed to Hawaii\'s technology and innovation ecosystem.'
  },
  {
    id: '20',
    name: 'Keone Young',
    graduationYear: '1973',
    degree: 'BA',
    major: 'Drama',
    category: 'Entertainment',
    currentRole: 'Actor',
    organization: 'Film & Television',
    achievements: [
      'Star Trek Actor',
      'The Mandalorian',
      'Gilmore Girls',
      'Asian American Representation'
    ],
    notableWork: 'Veteran character actor with roles in "Star Trek," "The Mandalorian," and numerous TV shows spanning 40+ years.'
  }
];

const categories = ['All', 'Politics & Government', 'Entertainment', 'Sports', 'Business', 'Science & Technology', 'Academia', 'Arts & Culture', 'Media', 'Public Service'];

const organizationCategories = ['All', 'Technology & Engineering', 'STEM & Hawaiian Culture', 'Business & Entrepreneurship', 'Health Sciences', 'Cultural & Community', 'Environmental Science', 'Arts & Design', 'Social Sciences & Government', 'Cultural Exchange', 'Environmental & Sustainability'];

export default function MentorsPage() {
  const [activeTab, setActiveTab] = useState('counselors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [campusFilter, setCampusFilter] = useState('All');

  // Filter counselors
  const filteredCounselors = useMemo(() => {
    let filtered = counselors;

    if (campusFilter !== 'All') {
      filtered = filtered.filter(c => c.campus === campusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(counselor => 
        counselor.name.toLowerCase().includes(query) ||
        counselor.title.toLowerCase().includes(query) ||
        counselor.specializations.some(s => s.toLowerCase().includes(query)) ||
        counselor.expertise.some(e => e.toLowerCase().includes(query)) ||
        counselor.bio.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, campusFilter]);

  // Filter organizations
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations;

    if (campusFilter !== 'All') {
      filtered = filtered.filter(org => org.campus === campusFilter);
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(org => org.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(query) ||
        org.category.toLowerCase().includes(query) ||
        org.description.toLowerCase().includes(query) ||
        org.relatedMajors.some(m => m.toLowerCase().includes(query))
      );
    }

    return filtered.filter(org => org.isActive);
  }, [searchQuery, selectedCategory, campusFilter]);

  // Filter alumni based on search and category
  const filteredAlumni = useMemo(() => {
    let filtered = alumni;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(alumnus => alumnus.category === selectedCategory);
    }

    // Filter by search query (case insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(alumnus => {
        const name = alumnus.name.toLowerCase();
        const major = alumnus.major.toLowerCase();
        const role = alumnus.currentRole.toLowerCase();
        const category = alumnus.category.toLowerCase();
        const achievements = alumnus.achievements.join(' ').toLowerCase();
        const notableWork = alumnus.notableWork.toLowerCase();
        
        return name.includes(query) || 
               major.includes(query) || 
               role.includes(query) ||
               category.includes(query) ||
               achievements.includes(query) ||
               notableWork.includes(query);
      });
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Users className="h-10 w-10 text-green-600" />
            Mentors & Community
          </h1>
          <p className="text-gray-600">
            Connect with counselors, join student organizations, and discover notable alumni
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="counselors" className="text-base">
              <UserCheck className="h-4 w-4 mr-2" />
              College Counselors
            </TabsTrigger>
            <TabsTrigger value="organizations" className="text-base">
              <Heart className="h-4 w-4 mr-2" />
              Student Organizations
            </TabsTrigger>
            <TabsTrigger value="alumni" className="text-base">
              <Award className="h-4 w-4 mr-2" />
              Notable Alumni
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder={
                  activeTab === 'counselors' ? 'Search counselors by name, specialization, or expertise...' :
                  activeTab === 'organizations' ? 'Search organizations by name, category, or major...' :
                  'Search alumni by name, major, achievements, or career...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>

          {/* Counselors Tab */}
          <TabsContent value="counselors" className="space-y-6">
            {/* Campus Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant={campusFilter === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCampusFilter('All')}
                className={campusFilter === 'All' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                All Campuses
              </Button>
              <Button
                variant={campusFilter === 'UH Manoa' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCampusFilter('UH Manoa')}
                className={campusFilter === 'UH Manoa' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                UH Mānoa
              </Button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Found {filteredCounselors.length} counselor{filteredCounselors.length !== 1 ? 's' : ''}
            </p>

            {/* Counselors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCounselors.map((counselor) => (
                <Card 
                  key={counselor.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-green-500"
                  onClick={() => setSelectedCounselor(counselor)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge className="bg-green-600">{counselor.campus}</Badge>
                      <UserCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                    </div>
                    <CardTitle className="text-xl leading-tight mb-2">
                      {counselor.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {counselor.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{counselor.availability}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="line-clamp-1">{counselor.officeLocation}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {counselor.specializations.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {counselor.specializations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{counselor.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 mt-2">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCounselors.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No counselors found matching your search
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try different keywords or select a different campus
                </p>
              </div>
            )}
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations" className="space-y-6">
            {/* Category Filter */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {organizationCategories.map((category) => (
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
              <p className="mt-3 text-sm text-gray-600">
                Found {filteredOrganizations.length} organization{filteredOrganizations.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Organizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => (
                <Card 
                  key={org.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-green-500"
                  onClick={() => setSelectedOrganization(org)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {org.category}
                      </Badge>
                      <Heart className="h-5 w-5 text-red-500 flex-shrink-0" />
                    </div>
                    <CardTitle className="text-xl leading-tight mb-2">
                      {org.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {org.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{org.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{org.meetingTime}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Related Majors:</p>
                      <div className="flex flex-wrap gap-1">
                        {org.relatedMajors.slice(0, 2).map((major, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {major}
                          </Badge>
                        ))}
                        {org.relatedMajors.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{org.relatedMajors.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button className="w-full bg-green-600 hover:bg-green-700 mt-2">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No organizations found matching your search
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try different keywords or select a different category
                </p>
              </div>
            )}
          </TabsContent>

          {/* Alumni Tab */}
          <TabsContent value="alumni" className="space-y-6">
            {/* Category Filter */}
            <div className="mb-4">
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
              <p className="mt-3 text-sm text-gray-600">
                Found {filteredAlumni.length} alumni
              </p>
            </div>

            {/* Alumni Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => (
            <Card 
              key={alumnus.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-green-500"
              onClick={() => setSelectedAlumnus(alumnus)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {alumnus.category}
                  </Badge>
                  <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
                <CardTitle className="text-xl leading-tight mb-2">
                  {alumnus.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {alumnus.currentRole}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  <span>{alumnus.degree} in {alumnus.major}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <span>Class of {alumnus.graduationYear}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="h-4 w-4 text-green-600" />
                  <span className="line-clamp-1">{alumnus.organization}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {alumnus.achievements.slice(0, 2).map((achievement, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {achievement}
                      </Badge>
                    ))}
                    {alumnus.achievements.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{alumnus.achievements.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
            </div>

            {/* No Results */}
            {filteredAlumni.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  No alumni found matching your search
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try searching with different keywords or select a different category
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Counselor Detail Modal */}
        {selectedCounselor && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCounselor(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="mb-2 bg-green-600">{selectedCounselor.campus}</Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedCounselor.name}
                  </h2>
                  <p className="text-lg text-gray-600">{selectedCounselor.title}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedCounselor(null)}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedCounselor.bio}</p>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Email</span>
                      </div>
                      <p className="text-sm text-gray-900">{selectedCounselor.email}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Phone</span>
                      </div>
                      <p className="text-sm text-gray-900">{selectedCounselor.phone}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Office</span>
                      </div>
                      <p className="text-sm text-gray-900">{selectedCounselor.officeLocation}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Availability</span>
                      </div>
                      <p className="text-sm text-gray-900">{selectedCounselor.availability}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Specializations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCounselor.specializations.map((spec, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Expertise Areas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Expertise Areas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedCounselor.expertise.map((exp, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{exp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Languages</h3>
                  </div>
                  <p className="text-gray-700">{selectedCounselor.languages.join(', ')}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Detail Modal */}
        {selectedOrganization && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrganization(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>{selectedOrganization.category}</Badge>
                    <Badge variant="outline">{selectedOrganization.memberCount} members</Badge>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedOrganization.name}
                  </h2>
                  <p className="text-sm text-gray-500">{selectedOrganization.campus}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedOrganization(null)}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedOrganization.description}</p>
                </div>

                {/* Meeting Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Meetings</span>
                      </div>
                      <p className="text-sm text-gray-900">{selectedOrganization.meetingTime}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Contact</span>
                      </div>
                      <p className="text-sm text-gray-900">{selectedOrganization.contactEmail}</p>
                    </CardContent>
                  </Card>
                </div>

                {selectedOrganization.website && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-600">Website</span>
                      </div>
                      <a 
                        href={`https://${selectedOrganization.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {selectedOrganization.website}
                      </a>
                    </CardContent>
                  </Card>
                )}

                {/* Related Majors */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Majors</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrganization.relatedMajors.map((major, idx) => (
                      <Badge key={idx} variant="secondary" className="text-sm">
                        {major}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Member Benefits</h3>
                  <ul className="space-y-2">
                    {selectedOrganization.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Heart className="h-4 w-4 mr-2" />
                    Join Organization
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alumni Detail Modal */}
        {selectedAlumnus && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAlumnus(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
                <div className="flex-1">
                  <Badge className="mb-2">{selectedAlumnus.category}</Badge>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedAlumnus.name}
                  </h2>
                  <p className="text-lg text-gray-600">{selectedAlumnus.currentRole}</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedAlumnus.organization}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedAlumnus(null)}
                  className="flex-shrink-0"
                >
                  ✕
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Education Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Degree</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAlumnus.degree}</p>
                      <p className="text-sm text-gray-600">{selectedAlumnus.major}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Graduated</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{selectedAlumnus.graduationYear}</p>
                      <p className="text-sm text-gray-600">UH Mānoa</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-gray-600">Field</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 line-clamp-2">{selectedAlumnus.category}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Notable Work */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Notable Work</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{selectedAlumnus.notableWork}</p>
                </div>

                {/* Achievements */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Major Achievements</h3>
                  </div>
                  <ul className="space-y-2">
                    {selectedAlumnus.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-gray-700">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Organization */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Current Organization</h3>
                  </div>
                  <p className="text-gray-700">{selectedAlumnus.organization}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
