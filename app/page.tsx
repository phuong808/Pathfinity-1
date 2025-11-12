import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth-server';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50" style={{ fontFamily: 'PPMondwest, system-ui, sans-serif' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200">
        <div className="flex items-center justify-between px-6 lg:px-12 py-4 max-w-7xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-3 group">
            {/* <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:shadow-xl transition-shadow">
              P
            </div> */}
            <span className="text-3xl font-bold text-gray-700 hover:text-gray-900 transition-colors">
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
      <main className="pb-20 px-6">
        <section className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>For University of Hawaii Students</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
              Your AI-Powered{' '}
              <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Career Guide
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Get personalized career advice, visualize your path to success, and connect with mentors—all powered by AI. 
              Pathfinity is your intelligent companion for navigating your academic and career journey at University of Hawaii.
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-pink-600 mb-2">24/7</div>
              <div className="text-gray-600 font-medium">AI Career Support</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-emerald-600 mb-2">100+</div>
              <div className="text-gray-600 font-medium">Degree Pathways</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-6 text-center shadow-lg border border-gray-200">
              <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600 font-medium">Advisors & Clubs</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="max-w-6xl mx-auto mb-24">
            <Image 
              src="/hero-anim-bg-2.webp" 
              alt="Pathfinity Platform" 
              width={1200}
              height={800}
              className="w-full h-auto rounded-3xl shadow-2xl"
              priority
            />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Three Powerful Tools, One Platform</h2>
            <p className="text-xl text-gray-600">Everything you need to navigate your career journey</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 - AI Career Advisor */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-pink-100 hover:border-pink-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full mb-3">
                  CORE FEATURE
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Career Advisor</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Chat with your personal AI advisor anytime, anywhere. Get instant answers about majors, career options, 
                course selections, and more. It&apos;s like having a career counselor in your pocket.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span>Personalized career recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span>24/7 availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-0.5">✓</span>
                  <span>Context-aware conversations</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 - Career Roadmaps */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-emerald-100 hover:border-emerald-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                <Map className="w-8 h-8 text-white" />
              </div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-3">
                  CORE FEATURE
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Career Roadmaps</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Visualize your entire journey from day one to graduation and beyond. Get clear, step-by-step 
                guidance on courses, skills, and milestones to reach your goals.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Interactive visual timelines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Customized for your major</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>Semester-by-semester planning</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 - Connect with Mentors */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border-2 border-orange-100 hover:border-orange-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full mb-3">
                  CORE FEATURE
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Connect with Mentors</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Get guidance from academic advisors and discover student clubs that align with your interests. 
                Build relationships and join communities that support your academic and career goals.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">✓</span>
                  <span>Connect with academic advisors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">✓</span>
                  <span>Discover relevant clubs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">✓</span>
                  <span>Join student communities</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-5xl mx-auto mb-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How Pathfinity Works</h2>
            <p className="text-xl text-gray-600">Start your journey in three simple steps</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-pink-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Chat with Your AI Advisor</h3>
                <p className="text-gray-600 text-lg">
                  Start by asking questions about your interests, career goals, or major options. 
                  Your AI advisor will get to know you and provide personalized recommendations.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Explore Your Roadmap</h3>
                <p className="text-gray-600 text-lg">
                  View a customized roadmap showing exactly what courses to take, skills to develop, 
                  and milestones to hit each semester on your path to success.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-orange-400 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Connect & Grow</h3>
                <p className="text-gray-600 text-lg">
                  Connect with mentors and peers who can guide you, share experiences, and help you 
                  navigate challenges. Build a network that supports your journey.
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

