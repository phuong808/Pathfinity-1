'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign,
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Filter,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Internship {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string | null;
  location: string | null;
  locationType: string | null;
  duration: string | null;
  isPaid: boolean;
  salaryRange: string | null;
  applicationDeadline: string | null;
  startDate: string | null;
  skills: string[] | null;
  relatedMajors: string[] | null;
  relatedDegrees: string[] | null;
  experienceLevel: string | null;
  applicationUrl: string | null;
  contactEmail: string | null;
  postedDate: string;
  isActive: boolean;
  userApplication: {
    id: number;
    status: string;
    appliedDate: string | null;
  } | null;
}

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/internships');
      const result = await response.json();
      
      if (result.success) {
        setInternships(result.data);
      }
    } catch (error) {
      console.error('Error fetching internships:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Internship Opportunities
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Find internships tailored to your degree pathway and career goals
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : internships.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No internships found
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                Check back soon for new opportunities!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship) => (
              <Card 
                key={internship.id} 
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{internship.title}</CardTitle>
                  <CardDescription className="font-semibold text-blue-600">
                    {internship.company}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                    {internship.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
