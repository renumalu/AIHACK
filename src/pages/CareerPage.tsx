import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  getCareerTimelines,
  updateCareerTimeline,
} from '@/db/api';
import type { CareerTimeline } from '@/types';
import { Briefcase, CheckCircle, Calendar, Target } from 'lucide-react';

export default function CareerPage() {
  const { user, profile } = useAuth();
  const [timelines, setTimelines] = useState<CareerTimeline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCareerTimelines();
    }
  }, [user]);

  const loadCareerTimelines = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getCareerTimelines(user.id);
      setTimelines(data);
    } catch (error) {
      console.error('Error loading career timelines:', error);
      toast.error('Failed to load career timelines');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    try {
      await updateCareerTimeline(id, { is_completed: !currentStatus });
      toast.success(currentStatus ? 'Marked as incomplete' : 'Marked as complete!');
      loadCareerTimelines();
    } catch (error) {
      console.error('Error updating timeline:', error);
      toast.error('Failed to update timeline');
    }
  };

  const getCareerGoalTitle = () => {
    const goals: Record<string, string> = {
      product_company: 'PRODUCT COMPANY TRACK',
      higher_studies: 'HIGHER STUDIES TRACK',
      core_job: 'CORE JOB TRACK',
      government_job: 'GOVERNMENT JOB TRACK',
    };
    return profile?.career_goal ? goals[profile.career_goal] : 'CAREER TRACK';
  };

  const getDaysRemaining = (targetDate: string | null) => {
    if (!targetDate) return null;
    
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'OVERDUE';
    if (days === 0) return 'TODAY';
    if (days === 1) return '1 DAY';
    return `${days} DAYS`;
  };

  const completedCount = timelines.filter(t => t.is_completed).length;
  const totalCount = timelines.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase gradient-text">CAREER TIMELINE</h1>
        <p className="text-muted-foreground mt-1">
          Your personalized career preparation roadmap
        </p>
      </div>

      {!profile?.career_goal ? (
        <Card className="border-warning bg-warning/10 pixel-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Target className="h-6 w-6 text-warning shrink-0 mt-1" />
              <div>
                <h3 className="font-bold uppercase mb-2">CAREER GOAL NOT SET</h3>
                <p className="text-sm mb-4">
                  Set your career goal in your profile to generate a personalized timeline.
                </p>
                <Button asChild variant="outline" className="pixel-button-press">
                  <a href="/profile">GO TO PROFILE</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress Overview */}
          <Card className="pixel-border pixel-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase">
                <Briefcase className="h-5 w-5" />
                {getCareerGoalTitle()}
              </CardTitle>
              <CardDescription>
                Track your progress towards your career goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm uppercase">OVERALL PROGRESS</span>
                  <Badge className="pixel-border-thin">
                    {completedCount} / {totalCount} COMPLETED
                  </Badge>
                </div>
                <div className="h-4 bg-muted pixel-border-thin overflow-hidden">
                  <div
                    className="h-full bg-success transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Items */}
          <Card className="pixel-border pixel-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase">
                <Calendar className="h-5 w-5" />
                MILESTONES
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timelines.length > 0 ? (
                <div className="space-y-4">
                  {timelines.map((timeline, index) => {
                    const daysRemaining = getDaysRemaining(timeline.target_date);
                    const isOverdue = daysRemaining === 'OVERDUE';
                    
                    return (
                      <div
                        key={timeline.id}
                        className={`p-4 pixel-border-thin transition-colors ${
                          timeline.is_completed
                            ? 'bg-success/10 border-success'
                            : isOverdue
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-accent'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={timeline.is_completed}
                              onCheckedChange={() => handleToggleComplete(timeline.id, timeline.is_completed)}
                              className="mt-1 pixel-border-thin"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="pixel-border-thin">
                                  MILESTONE {index + 1}
                                </Badge>
                                {timeline.is_completed && (
                                  <Badge className="bg-success text-white pixel-border-thin">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    COMPLETED
                                  </Badge>
                                )}
                                {!timeline.is_completed && daysRemaining && (
                                  <Badge
                                    variant="outline"
                                    className={`pixel-border-thin ${
                                      isOverdue ? 'border-destructive text-destructive' : ''
                                    }`}
                                  >
                                    {daysRemaining}
                                  </Badge>
                                )}
                              </div>
                              <h3 className={`font-bold uppercase mb-2 ${
                                timeline.is_completed ? 'line-through text-muted-foreground' : ''
                              }`}>
                                {timeline.title}
                              </h3>
                              {timeline.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {timeline.description}
                                </p>
                              )}
                              {timeline.target_date && (
                                <p className="text-xs text-muted-foreground">
                                  📅 Target: {new Date(timeline.target_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No career timeline generated yet. Update your profile to generate one.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Career Tips */}
          <Card className="pixel-border pixel-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 uppercase">
                <Target className="h-5 w-5" />
                CAREER TIPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.career_goal === 'product_company' && (
                  <>
                    <div className="p-3 bg-accent pixel-border-thin">
                      <p className="text-sm">💡 Practice coding daily on platforms like LeetCode and HackerRank</p>
                    </div>
                    <div className="p-3 bg-accent pixel-border-thin">
                      <p className="text-sm">💡 Build 2-3 strong projects showcasing full-stack skills</p>
                    </div>
                    <div className="p-3 bg-accent pixel-border-thin">
                      <p className="text-sm">💡 Network with alumni working in product companies</p>
                    </div>
                  </>
                )}
                {profile.career_goal === 'higher_studies' && (
                  <>
                    <div className="p-3 bg-accent pixel-border-thin">
                      <p className="text-sm">💡 Maintain a strong GPA throughout your undergraduate studies</p>
                    </div>
                    <div className="p-3 bg-accent pixel-border-thin">
                      <p className="text-sm">💡 Start preparing for entrance exams (GRE/GATE) early</p>
                    </div>
                    <div className="p-3 bg-accent pixel-border-thin">
                      <p className="text-sm">💡 Build relationships with professors for recommendation letters</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
