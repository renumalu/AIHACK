import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { getProfile, updateProfile, generateAcademicDeadlines, generateCareerTimelines } from '@/db/api';
import type { ProfileFormData, CareerGoal } from '@/types';
import { User, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    department: '',
    year_of_study: 1,
    semester_start_date: '',
    monthly_budget_limit: 0,
    career_goal: 'product_company',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profile = await getProfile(user.id);
      if (profile) {
        setFormData({
          name: profile.name || '',
          department: profile.department || '',
          year_of_study: profile.year_of_study || 1,
          semester_start_date: profile.semester_start_date || '',
          monthly_budget_limit: profile.monthly_budget_limit ? Number(profile.monthly_budget_limit) : 0,
          career_goal: profile.career_goal || 'product_company',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name || !formData.department || !formData.semester_start_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Get current profile to check if semester_start_date changed
      const currentProfile = await getProfile(user.id);
      const semesterDateChanged = currentProfile?.semester_start_date !== formData.semester_start_date;
      const careerGoalChanged = currentProfile?.career_goal !== formData.career_goal;

      // Update profile
      await updateProfile(user.id, formData);
      
      // Generate academic deadlines if semester start date is new or changed
      if (semesterDateChanged && formData.semester_start_date) {
        await generateAcademicDeadlines(user.id, formData.semester_start_date);
        toast.success('Profile updated and academic deadlines generated!');
      } else {
        toast.success('Profile updated successfully!');
      }

      // Generate career timelines if career goal changed
      if (careerGoalChanged && formData.career_goal) {
        await generateCareerTimelines(user.id, formData.career_goal);
        toast.success('Career timeline generated!');
      }

      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase gradient-text">PROFILE SETUP</h1>
        <p className="text-muted-foreground mt-1">
          Configure your student profile for AI predictions
        </p>
      </div>

      <Card className="max-w-2xl pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <User className="h-5 w-5" />
            STUDENT INFORMATION
          </CardTitle>
          <CardDescription>
            Complete your profile to enable deadline generation and AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="uppercase">NAME *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pixel-border-thin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="uppercase">DEPARTMENT *</Label>
              <Input
                id="department"
                type="text"
                placeholder="e.g., Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="pixel-border-thin"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="uppercase">YEAR OF STUDY *</Label>
              <Select
                value={formData.year_of_study.toString()}
                onValueChange={(value) => setFormData({ ...formData, year_of_study: parseInt(value) })}
              >
                <SelectTrigger className="pixel-border-thin">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1ST YEAR</SelectItem>
                  <SelectItem value="2">2ND YEAR</SelectItem>
                  <SelectItem value="3">3RD YEAR</SelectItem>
                  <SelectItem value="4">4TH YEAR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester_start" className="uppercase">SEMESTER START DATE *</Label>
              <Input
                id="semester_start"
                type="date"
                value={formData.semester_start_date}
                onChange={(e) => setFormData({ ...formData, semester_start_date: e.target.value })}
                className="pixel-border-thin"
                required
              />
              <p className="text-xs text-muted-foreground">
                Used to auto-generate academic deadlines (Week 4, 8, 12, 16)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget" className="uppercase">MONTHLY BUDGET LIMIT</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 5000"
                value={formData.monthly_budget_limit || ''}
                onChange={(e) => setFormData({ ...formData, monthly_budget_limit: parseFloat(e.target.value) || 0 })}
                className="pixel-border-thin"
              />
              <p className="text-xs text-muted-foreground">
                Set your monthly spending limit for budget tracking
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career_goal" className="uppercase">CAREER GOAL *</Label>
              <Select
                value={formData.career_goal}
                onValueChange={(value) => setFormData({ ...formData, career_goal: value as CareerGoal })}
              >
                <SelectTrigger className="pixel-border-thin">
                  <SelectValue placeholder="Select career goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_company">PRODUCT COMPANY</SelectItem>
                  <SelectItem value="higher_studies">HIGHER STUDIES</SelectItem>
                  <SelectItem value="core_job">CORE JOB</SelectItem>
                  <SelectItem value="government_job">GOVERNMENT JOB</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                AI will generate personalized career preparation timeline
              </p>
            </div>

            <Button
              type="submit"
              className="w-full uppercase pixel-button-press pixel-shadow-sm"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'SAVING...' : 'SAVE PROFILE'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
