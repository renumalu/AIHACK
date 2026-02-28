import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getMonthlyExpenses,
  createExpense,
  deleteExpense,
  getBudgetAnalytics,
} from '@/db/api';
import type { Expense, ExpenseFormData, ExpenseCategory, BudgetAnalytics } from '@/types';
import { Wallet, Plus, Trash2, TrendingUp, AlertTriangle } from 'lucide-react';

export default function FinancialPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgetAnalytics, setBudgetAnalytics] = useState<BudgetAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: 0,
    category: 'food',
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user]);

  const loadFinancialData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const now = new Date();
      const [expensesData, analytics] = await Promise.all([
        getMonthlyExpenses(user.id, now.getFullYear(), now.getMonth() + 1),
        getBudgetAnalytics(user.id),
      ]);

      setExpenses(expensesData);
      setBudgetAnalytics(analytics);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      await createExpense(user.id, formData);
      toast.success('Expense added!');
      setDialogOpen(false);
      setFormData({
        amount: 0,
        category: 'food',
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
      });
      loadFinancialData();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpense(id);
      toast.success('Expense deleted!');
      loadFinancialData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    const icons: Record<ExpenseCategory, string> = {
      food: '🍔',
      transport: '🚗',
      books: '📚',
      entertainment: '🎮',
      utilities: '💡',
      other: '📦',
    };
    return icons[category];
  };

  const getBudgetStatus = () => {
    if (!budgetAnalytics) return null;

    const { utilization_percentage } = budgetAnalytics;
    
    if (utilization_percentage > 100) {
      return {
        level: 'OVER BUDGET',
        color: 'text-destructive',
        bgColor: 'bg-destructive',
      };
    }
    if (utilization_percentage > 80) {
      return {
        level: 'WARNING',
        color: 'text-warning',
        bgColor: 'bg-warning',
      };
    }
    return {
      level: 'ON TRACK',
      color: 'text-success',
      bgColor: 'bg-success',
    };
  };

  const budgetStatus = getBudgetStatus();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase gradient-text">FINANCIAL TRACKER</h1>
          <p className="text-muted-foreground mt-1">
            Track expenses and manage your monthly budget
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="uppercase pixel-button-press pixel-shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              ADD EXPENSE
            </Button>
          </DialogTrigger>
          <DialogContent className="pixel-border">
            <DialogHeader>
              <DialogTitle className="uppercase">ADD NEW EXPENSE</DialogTitle>
              <DialogDescription>
                Record a new expense transaction
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="uppercase">AMOUNT *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="pixel-border-thin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="uppercase">CATEGORY *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as ExpenseCategory })}
                >
                  <SelectTrigger className="pixel-border-thin">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">FOOD</SelectItem>
                    <SelectItem value="transport">TRANSPORT</SelectItem>
                    <SelectItem value="books">BOOKS</SelectItem>
                    <SelectItem value="entertainment">ENTERTAINMENT</SelectItem>
                    <SelectItem value="utilities">UTILITIES</SelectItem>
                    <SelectItem value="other">OTHER</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="uppercase">DESCRIPTION</Label>
                <Input
                  id="description"
                  placeholder="e.g., Lunch at cafeteria"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pixel-border-thin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date" className="uppercase">DATE *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  className="pixel-border-thin"
                  required
                />
              </div>

              <Button type="submit" className="w-full uppercase pixel-button-press">
                ADD EXPENSE
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Overview */}
      {budgetAnalytics && budgetStatus && (
        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase">
              <TrendingUp className="h-5 w-5" />
              BUDGET OVERVIEW
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-accent pixel-border-thin">
                <p className="text-xs uppercase text-muted-foreground mb-1">TOTAL SPENT</p>
                <p className="text-2xl font-bold">₹{budgetAnalytics.total_spent.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-accent pixel-border-thin">
                <p className="text-xs uppercase text-muted-foreground mb-1">BUDGET LIMIT</p>
                <p className="text-2xl font-bold">₹{budgetAnalytics.budget_limit.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-accent pixel-border-thin">
                <p className="text-xs uppercase text-muted-foreground mb-1">UTILIZATION</p>
                <p className={`text-2xl font-bold ${budgetStatus.color}`}>
                  {budgetAnalytics.utilization_percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm uppercase">BUDGET USAGE</span>
                <Badge className={`${budgetStatus.bgColor} text-white pixel-border-thin`}>
                  {budgetStatus.level}
                </Badge>
              </div>
              <Progress
                value={Math.min(budgetAnalytics.utilization_percentage, 100)}
                className="h-4 pixel-border-thin"
              />
            </div>

            {budgetAnalytics.predicted_overspending && (
              <div className="p-4 bg-destructive/10 border-2 border-destructive pixel-border-thin">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase text-destructive mb-1">OVERSPENDING DETECTED</p>
                    <p className="text-sm">
                      You are spending {(budgetAnalytics.utilization_percentage - 100).toFixed(1)}% above your budget. 
                      Consider limiting non-essential expenses.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expense List */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <Wallet className="h-5 w-5" />
            THIS MONTH'S EXPENSES
          </CardTitle>
          <CardDescription>
            All expenses for the current month
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length > 0 ? (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="p-4 bg-accent pixel-border-thin hover:bg-accent/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{getCategoryIcon(expense.category)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="uppercase pixel-border-thin">
                            {expense.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </span>
                        </div>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold">₹{Number(expense.amount).toFixed(2)}</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(expense.id)}
                        className="pixel-button-press"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No expenses recorded this month</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
