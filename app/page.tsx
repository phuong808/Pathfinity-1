import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import Link from 'next/link';
import { 
  GraduationCap, 
  TrendingUp, 
  Users, 
  Briefcase, 
  Map, 
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  // If the user is authenticated, send them to the dashboard (which lives
  // under the `(with-sidebar)` route group so it includes the sidebar).
  if (session) {
    redirect('/Chat');
  }

  // Otherwise render the public landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
              P
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Pathfinity
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <section className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>For University of Hawaii Students</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Career Pathway
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Navigate your academic journey with confidence. Pathfinity helps UH students 
              explore majors, connect with mentors, discover internships, and map their path 
              to a successful career—all in one intelligent platform.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold text-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features" 
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-24">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600 font-medium">Career Pathways</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">50+</div>
              <div className="text-gray-600 font-medium">Degree Programs</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Internship Opportunities</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600">Powerful tools designed for UH students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                <GraduationCap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Explore Majors</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover the perfect major that aligns with your interests, strengths, and career goals. 
                Browse UH&apos;s comprehensive programs with detailed insights.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6">
                <Map className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Career Roadmaps</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize your path from freshman year to career success. Get personalized roadmaps 
                with milestones, courses, and actionable steps.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Find Internships</h3>
              <p className="text-gray-600 leading-relaxed">
                Access curated internship opportunities from local Hawaii companies and global 
                organizations. Build real-world experience while studying.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect with Mentors</h3>
              <p className="text-gray-600 leading-relaxed">
                Network with UH alumni, professors, and industry professionals who can guide 
                your academic and career journey.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-6">
                <MessageSquare className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Career Advisor</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant answers to your career questions with our intelligent AI assistant. 
                Available 24/7 to help you make informed decisions.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border border-gray-200">
              <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center mb-6">
                <TrendingUp className="w-7 h-7 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Career Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Access salary data, job market trends, and growth projections for different 
                careers. Make data-driven decisions about your future.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-5xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Pathfinity Works</h2>
            <p className="text-xl text-gray-600">Your journey in three simple steps</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Create Your Profile</h3>
                <p className="text-gray-600 text-lg">
                  Sign up with your UH credentials and tell us about your interests, skills, and career aspirations.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Explore & Discover</h3>
                <p className="text-gray-600 text-lg">
                  Browse majors, career paths, and opportunities tailored to your profile. Chat with our AI advisor for personalized guidance.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Build Your Future</h3>
                <p className="text-gray-600 text-lg">
                  Follow your personalized roadmap, connect with mentors, apply for internships, and achieve your career goals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-600 via-emerald-600 to-blue-700 rounded-3xl p-12 lg:p-16 text-center shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of UH students who are already discovering their path to success with Pathfinity.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-white text-blue-600 font-bold text-lg hover:shadow-2xl transition-all duration-200 hover:scale-105 group"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6 mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold">
                  P
                </div>
                <span className="text-xl font-bold text-white">Pathfinity</span>
              </div>
              <p className="text-sm text-gray-400">
                Empowering University of Hawaii students to discover their career pathways.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/Majors" className="hover:text-white transition-colors">Majors</Link></li>
                <li><Link href="/Careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/Roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">University of Hawaii</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">About UH</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Academic Resources</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Career Services</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Pathfinity. Made with aloha for UH students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

