'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { 
  Search, 
  Award, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Building2,
  TrendingUp,
  Users
} from 'lucide-react';

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

export default function PeoplePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedAlumnus, setSelectedAlumnus] = useState<Alumnus | null>(null);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Notable Alumni
          </h1>
          <p className="text-gray-600">
            Discover {alumni.length} distinguished graduates from University of Hawaiʻi at Mānoa
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by name, major, achievements, or career..."
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
              Found {filteredAlumni.length} alumni
            </p>
          )}
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
              No alumni found matching &quot;{searchQuery}&quot;
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Try searching with different keywords or select a different category
            </p>
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
