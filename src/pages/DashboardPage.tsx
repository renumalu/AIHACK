import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  getUpcomingDeadlines,
  getLatestRiskScore,
  calculateRiskScore,
  getRecommendations,
  generateRecommendations,
} from '@/db/api';
import type { Deadline, RiskScore, Recommendation } from '@/types';
import { AlertTriangle, TrendingUp, Calendar, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Deadline[]>([]);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [deadlines, score, recs] = await Promise.all([
        getUpcomingDeadlines(user.id, 5),
        getLatestRiskScore(user.id),
        getRecommendations(user.id),
      ]);

      setUpcomingDeadlines(deadlines);
      setRiskScore(score);
      setRecommendations(recs.slice(0, 3));

      // Calculate risk score if not exists or outdated
      if (!score || isScoreOutdated(score.calculated_at)) {
        const newScore = await calculateRiskScore(user.id);
        const updatedScore = await getLatestRiskScore(user.id);
        setRiskScore(updatedScore);
      }

      // Generate recommendations if none exist
      if (recs.length === 0) {
        await generateRecommendations(user.id);
        const newRecs = await getRecommendations(user.id);
        setRecommendations(newRecs.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const isScoreOutdated = (calculatedAt: string) => {
    const scoreDate = new Date(calculatedAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - scoreDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  };

  const getRiskLevel = (score: number): { level: string; color: string; bgColor: string } => {
    if (score <= 40) return { level: 'LOW RISK', color: 'text-success', bgColor: 'bg-success' };
    if (score <= 70) return { level: 'MEDIUM RISK', color: 'text-warning', bgColor: 'bg-warning' };
    return { level: 'HIGH RISK', color: 'text-destructive', bgColor: 'bg-destructive' };
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}D ${hours}H`;
    if (hours > 0) return `${hours}H`;
    return 'DUE SOON';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 bg-muted" />
          <Skeleton className="h-48 bg-muted" />
          <Skeleton className="h-48 bg-muted" />
        </div>
      </div>
    );
  }

  const riskData = riskScore ? getRiskLevel(riskScore.score) : null;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold uppercase gradient-text">DASHBOARD</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {profile?.name || profile?.username || 'Student'}!
        </p>
      </div>

      {/* Profile Setup Warning */}
      {!profile?.semester_start_date && (
        <Card className="border-warning bg-warning/10 pixel-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold uppercase mb-2">PROFILE SETUP REQUIRED</h3>
                <p className="text-sm mb-4">
                  Complete your profile to enable deadline generation and AI recommendations.
                </p>
                <Button asChild variant="outline" className="pixel-button-press">
                  <Link to="/profile">
                    SETUP PROFILE <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Risk Score Card */}
        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase">
              <TrendingUp className="h-5 w-5" />
              RISK SCORE
            </CardTitle>
          </CardHeader>
          <CardContent>
            {riskData ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${riskData.color}`}>
                    {riskScore?.score}
                  </div>
                  <Badge className={`mt-2 ${riskData.bgColor} text-white pixel-border-thin`}>
                    {riskData.level}
                  </Badge>
                </div>
                <Progress value={riskScore?.score} className="h-3 pixel-border-thin" />
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div>⚡ Pending: {riskScore?.pending_tasks_count}</div>
                  <div>❌ Missed: {riskScore?.missed_deadlines_count}</div>
                  <div>📅 This Week: {riskScore?.deadlines_within_week}</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No risk data available</p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines Card */}
        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase">
              <Calendar className="h-5 w-5" />
              UPCOMING DEADLINES
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.slice(0, 3).map((deadline) => (
                  <div
                    key={deadline.id}
                    className="p-3 bg-accent pixel-border-thin hover:bg-accent/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate uppercase">
                          {deadline.title}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {deadline.category}
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0 pixel-border-thin">
                        {getTimeRemaining(deadline.due_date)}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full uppercase pixel-button-press">
                  <Link to="/deadlines">
                    VIEW ALL <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                <Button asChild variant="outline" className="mt-4 uppercase pixel-button-press">
                  <Link to="/deadlines">ADD DEADLINE</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Recommendations Card */}
        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase">
              <Zap className="h-5 w-5 text-warning pixel-bounce" />
              AI RECOMMENDATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 bg-accent pixel-border-thin"
                  >
                    <Badge variant="outline" className="mb-2 uppercase pixel-border-thin">
                      {rec.recommendation_type}
                    </Badge>
                    <p className="text-sm">{rec.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recommendations yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="uppercase">QUICK ACTIONS</CardTitle>
          <CardDescription>Navigate to key features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto py-4 pixel-button-press pixel-shadow-sm">
              <Link to="/deadlines" className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span className="uppercase">MANAGE DEADLINES</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 pixel-button-press pixel-shadow-sm">
              <Link to="/analytics" className="flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span className="uppercase">VIEW ANALYTICS</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 pixel-button-press pixel-shadow-sm">
              <Link to="/financial" className="flex flex-col items-center gap-2">
                <Zap className="h-6 w-6" />
                <span className="uppercase">TRACK EXPENSES</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 pixel-button-press pixel-shadow-sm">
              <Link to="/career" className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-6 w-6" />
                <span className="uppercase">CAREER PLAN</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
