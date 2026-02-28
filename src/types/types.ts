// Database types matching Supabase schema

export type UserRole = 'user' | 'admin';

export type CareerGoal = 'product_company' | 'higher_studies' | 'core_job' | 'government_job';

export type DeadlineCategory = 'academic' | 'financial' | 'career' | 'personal';

export type DeadlineStatus = 'pending' | 'completed' | 'missed';

export type ExpenseCategory = 'food' | 'transport' | 'books' | 'entertainment' | 'utilities' | 'other';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  name: string | null;
  department: string | null;
  year_of_study: number | null;
  semester_start_date: string | null;
  monthly_budget_limit: number | null;
  career_goal: CareerGoal | null;
  created_at: string;
  updated_at: string;
}

export interface Deadline {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: DeadlineCategory;
  due_date: string;
  status: DeadlineStatus;
  is_auto_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  expense_date: string;
  created_at: string;
}

export interface RiskScore {
  id: string;
  user_id: string;
  score: number;
  pending_tasks_count: number;
  missed_deadlines_count: number;
  deadlines_within_week: number;
  calculated_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  message: string;
  priority: number;
  is_read: boolean;
  created_at: string;
}

export interface CareerTimeline {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  is_completed: boolean;
  created_at: string;
}

// Form types
export interface ProfileFormData {
  name: string;
  department: string;
  year_of_study: number;
  semester_start_date: string;
  monthly_budget_limit: number;
  career_goal: CareerGoal;
}

export interface DeadlineFormData {
  title: string;
  description?: string;
  category: DeadlineCategory;
  due_date: string;
}

export interface ExpenseFormData {
  amount: number;
  category: ExpenseCategory;
  description?: string;
  expense_date: string;
}

// Analytics types
export interface DeadlineDistribution {
  category: string;
  count: number;
}

export interface WeeklyDeadlines {
  week: string;
  count: number;
}

export interface RiskTrend {
  date: string;
  score: number;
}

export interface BudgetAnalytics {
  total_spent: number;
  budget_limit: number;
  utilization_percentage: number;
  predicted_overspending: boolean;
}
