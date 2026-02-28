import { supabase } from './supabase';
import type {
  Profile,
  ProfileFormData,
  Deadline,
  DeadlineFormData,
  Expense,
  ExpenseFormData,
  RiskScore,
  Recommendation,
  CareerTimeline,
  DeadlineDistribution,
  WeeklyDeadlines,
  RiskTrend,
  BudgetAnalytics,
} from '@/types';

// Profile API
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<ProfileFormData>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Deadline API
export async function getDeadlines(userId: string): Promise<Deadline[]> {
  const { data, error } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getUpcomingDeadlines(userId: string, limit = 5): Promise<Deadline[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .gte('due_date', now)
    .order('due_date', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createDeadline(userId: string, deadline: DeadlineFormData): Promise<Deadline> {
  const { data, error } = await supabase
    .from('deadlines')
    .insert({
      user_id: userId,
      ...deadline,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeadline(id: string, updates: Partial<Deadline>): Promise<Deadline> {
  const { data, error } = await supabase
    .from('deadlines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDeadline(id: string): Promise<void> {
  const { error } = await supabase
    .from('deadlines')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Auto-generate academic deadlines
export async function generateAcademicDeadlines(userId: string, semesterStartDate: string): Promise<void> {
  const startDate = new Date(semesterStartDate);
  
  const deadlines = [
    {
      title: 'Internal Exam 1',
      category: 'academic' as const,
      due_date: new Date(startDate.getTime() + 4 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Internal Exam 2',
      category: 'academic' as const,
      due_date: new Date(startDate.getTime() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Model Exam',
      category: 'academic' as const,
      due_date: new Date(startDate.getTime() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Semester Exam',
      category: 'academic' as const,
      due_date: new Date(startDate.getTime() + 16 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Exam Registration Window',
      category: 'academic' as const,
      due_date: new Date(startDate.getTime() + 14 * 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const { error } = await supabase
    .from('deadlines')
    .insert(
      deadlines.map(d => ({
        user_id: userId,
        title: d.title,
        category: d.category,
        due_date: d.due_date,
        is_auto_generated: true,
        status: 'pending',
      }))
    );

  if (error) throw error;
}

// Expense API
export async function getExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function getMonthlyExpenses(userId: string, year: number, month: number): Promise<Expense[]> {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('expense_date', startDate)
    .lte('expense_date', endDate)
    .order('expense_date', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function createExpense(userId: string, expense: ExpenseFormData): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      ...expense,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Risk Score API
export async function calculateRiskScore(userId: string): Promise<number> {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get pending tasks
  const { data: pendingTasks } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending');

  const pendingCount = pendingTasks?.length || 0;

  // Get missed deadlines
  const { data: missedDeadlines } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'missed');

  const missedCount = missedDeadlines?.length || 0;

  // Get deadlines within next 7 days
  const { data: upcomingDeadlines } = await supabase
    .from('deadlines')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .gte('due_date', now.toISOString())
    .lte('due_date', weekFromNow.toISOString());

  const upcomingCount = upcomingDeadlines?.length || 0;

  // Calculate risk score (0-100)
  let score = 0;
  
  // Pending tasks factor (max 30 points)
  score += Math.min(pendingCount * 3, 30);
  
  // Missed deadlines factor (max 40 points)
  score += Math.min(missedCount * 10, 40);
  
  // Upcoming deadlines density (max 30 points)
  if (upcomingCount > 5) {
    score += 30;
  } else if (upcomingCount > 3) {
    score += 20;
  } else if (upcomingCount > 0) {
    score += 10;
  }

  score = Math.min(score, 100);

  // Save risk score
  await supabase
    .from('risk_scores')
    .insert({
      user_id: userId,
      score,
      pending_tasks_count: pendingCount,
      missed_deadlines_count: missedCount,
      deadlines_within_week: upcomingCount,
    });

  return score;
}

export async function getLatestRiskScore(userId: string): Promise<RiskScore | null> {
  const { data, error } = await supabase
    .from('risk_scores')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getRiskScoreHistory(userId: string, limit = 30): Promise<RiskScore[]> {
  const { data, error } = await supabase
    .from('risk_scores')
    .select('*')
    .eq('user_id', userId)
    .order('calculated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// Recommendations API
export async function getRecommendations(userId: string): Promise<Recommendation[]> {
  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function generateRecommendations(userId: string): Promise<void> {
  const profile = await getProfile(userId);
  const deadlines = await getDeadlines(userId);
  const riskScore = await getLatestRiskScore(userId);
  
  const recommendations: Array<{ recommendation_type: string; message: string; priority: number }> = [];

  // Academic workload recommendations
  const pendingAcademic = deadlines.filter(d => d.status === 'pending' && d.category === 'academic');
  if (pendingAcademic.length >= 3) {
    recommendations.push({
      recommendation_type: 'academic',
      message: `You have ${pendingAcademic.length} academic deadlines pending. Allocate 2-3 study sessions this week.`,
      priority: 3,
    });
  }

  // Risk management alerts
  if (riskScore && riskScore.score > 70) {
    recommendations.push({
      recommendation_type: 'risk',
      message: `Your risk score is ${riskScore.score}%. Reduce low-priority tasks and focus on urgent deadlines.`,
      priority: 5,
    });
  }

  // Budget warnings
  if (profile?.monthly_budget_limit) {
    const now = new Date();
    const expenses = await getMonthlyExpenses(userId, now.getFullYear(), now.getMonth() + 1);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const utilization = (totalSpent / Number(profile.monthly_budget_limit)) * 100;

    if (utilization > 130) {
      recommendations.push({
        recommendation_type: 'budget',
        message: `You are spending ${Math.round(utilization - 100)}% above your budget. Limit non-essential expenses.`,
        priority: 4,
      });
    }
  }

  // Career preparation reminders
  if (profile?.career_goal === 'product_company') {
    recommendations.push({
      recommendation_type: 'career',
      message: 'Internship season approaching. Update your resume and practice DSA problems this month.',
      priority: 2,
    });
  } else if (profile?.career_goal === 'higher_studies') {
    recommendations.push({
      recommendation_type: 'career',
      message: 'Start preparing for entrance exams. Review application deadlines for target universities.',
      priority: 2,
    });
  }

  // Insert recommendations
  if (recommendations.length > 0) {
    await supabase
      .from('recommendations')
      .insert(
        recommendations.map(r => ({
          user_id: userId,
          ...r,
        }))
      );
  }
}

export async function markRecommendationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('recommendations')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

// Career Timeline API
export async function getCareerTimelines(userId: string): Promise<CareerTimeline[]> {
  const { data, error } = await supabase
    .from('career_timelines')
    .select('*')
    .eq('user_id', userId)
    .order('target_date', { ascending: true });

  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function generateCareerTimelines(userId: string, careerGoal: string): Promise<void> {
  const timelines: Array<{ title: string; description: string; target_date: string }> = [];
  const now = new Date();

  if (careerGoal === 'product_company') {
    timelines.push(
      {
        title: 'DSA Practice Plan',
        description: 'Complete 100 LeetCode problems covering arrays, strings, trees, and graphs',
        target_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Resume Review Reminder',
        description: 'Update resume with recent projects and get it reviewed by seniors',
        target_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Internship Application Window',
        description: 'Apply to at least 20 product companies for internship positions',
        target_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    );
  } else if (careerGoal === 'higher_studies') {
    timelines.push(
      {
        title: 'Entrance Exam Preparation',
        description: 'Complete syllabus review and take 10 mock tests',
        target_date: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'University Application Deadlines',
        description: 'Research and shortlist 10 universities, prepare application documents',
        target_date: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        title: 'Document Checklist',
        description: 'Gather transcripts, recommendation letters, and statement of purpose',
        target_date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }
    );
  }

  if (timelines.length > 0) {
    await supabase
      .from('career_timelines')
      .insert(
        timelines.map(t => ({
          user_id: userId,
          ...t,
        }))
      );
  }
}

export async function updateCareerTimeline(id: string, updates: Partial<CareerTimeline>): Promise<CareerTimeline> {
  const { data, error } = await supabase
    .from('career_timelines')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Analytics API
export async function getDeadlineDistribution(userId: string): Promise<DeadlineDistribution[]> {
  const deadlines = await getDeadlines(userId);
  
  const distribution: Record<string, number> = {};
  deadlines.forEach(d => {
    distribution[d.category] = (distribution[d.category] || 0) + 1;
  });

  return Object.entries(distribution).map(([category, count]) => ({
    category,
    count,
  }));
}

export async function getWeeklyDeadlines(userId: string): Promise<WeeklyDeadlines[]> {
  const deadlines = await getDeadlines(userId);
  const now = new Date();
  
  const weeklyData: Record<string, number> = {};
  
  deadlines.forEach(d => {
    const dueDate = new Date(d.due_date);
    const weeksDiff = Math.floor((dueDate.getTime() - now.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksDiff >= 0 && weeksDiff < 8) {
      const weekLabel = `Week ${weeksDiff + 1}`;
      weeklyData[weekLabel] = (weeklyData[weekLabel] || 0) + 1;
    }
  });

  return Object.entries(weeklyData).map(([week, count]) => ({
    week,
    count,
  }));
}

export async function getRiskTrend(userId: string): Promise<RiskTrend[]> {
  const scores = await getRiskScoreHistory(userId, 14);
  
  return scores.map(s => ({
    date: new Date(s.calculated_at).toLocaleDateString(),
    score: s.score,
  })).reverse();
}

export async function getBudgetAnalytics(userId: string): Promise<BudgetAnalytics | null> {
  const profile = await getProfile(userId);
  if (!profile?.monthly_budget_limit) return null;

  const now = new Date();
  const expenses = await getMonthlyExpenses(userId, now.getFullYear(), now.getMonth() + 1);
  
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budgetLimit = Number(profile.monthly_budget_limit);
  const utilization = (totalSpent / budgetLimit) * 100;

  return {
    total_spent: totalSpent,
    budget_limit: budgetLimit,
    utilization_percentage: utilization,
    predicted_overspending: utilization > 100,
  };
}
