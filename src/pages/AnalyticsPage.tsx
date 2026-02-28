import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  getDeadlineDistribution,
  getWeeklyDeadlines,
  getRiskTrend,
} from '@/db/api';
import type { DeadlineDistribution, WeeklyDeadlines, RiskTrend } from '@/types';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [distribution, setDistribution] = useState<DeadlineDistribution[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyDeadlines[]>([]);
  const [riskTrend, setRiskTrend] = useState<RiskTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [dist, weekly, trend] = await Promise.all([
        getDeadlineDistribution(user.id),
        getWeeklyDeadlines(user.id),
        getRiskTrend(user.id),
      ]);

      setDistribution(dist);
      setWeeklyData(weekly);
      setRiskTrend(trend);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64 bg-muted" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96 bg-muted" />
          <Skeleton className="h-96 bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase gradient-text">ANALYTICS</h1>
        <p className="text-muted-foreground mt-1">
          Visual insights into your deadlines and risk patterns
        </p>
      </div>

      {/* Deadline Distribution */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <PieChart className="h-5 w-5" />
            DEADLINE DISTRIBUTION BY CATEGORY
          </CardTitle>
          <CardDescription>
            Breakdown of your deadlines across different categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {distribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPie>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, count }) => `${category.toUpperCase()}: ${count}`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="count"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPie>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Weekly Deadlines */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <BarChart3 className="h-5 w-5" />
            DEADLINES PER WEEK
          </CardTitle>
          <CardDescription>
            Number of deadlines in the upcoming weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Deadlines" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">No data available</p>
          )}
        </CardContent>
      </Card>

      {/* Risk Score Trend */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <TrendingUp className="h-5 w-5" />
            RISK SCORE TREND
          </CardTitle>
          <CardDescription>
            Your risk score over time (last 14 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={riskTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '0',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={3}
                  name="Risk Score"
                  dot={{ fill: 'hsl(var(--destructive))', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No risk score history yet. Risk scores are calculated daily.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
