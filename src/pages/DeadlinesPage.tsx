import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  getDeadlines,
  createDeadline,
  updateDeadline,
  deleteDeadline,
} from '@/db/api';
import type { Deadline, DeadlineFormData, DeadlineCategory, DeadlineStatus } from '@/types';
import { Calendar, Plus, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DeadlinesPage() {
  const { user } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DeadlineFormData>({
    title: '',
    description: '',
    category: 'academic',
    due_date: '',
  });

  useEffect(() => {
    if (user) {
      loadDeadlines();
    }
  }, [user]);

  const loadDeadlines = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await getDeadlines(user.id);
      setDeadlines(data);
    } catch (error) {
      console.error('Error loading deadlines:', error);
      toast.error('Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.due_date) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await createDeadline(user.id, formData);
      toast.success('Deadline created!');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'academic',
        due_date: '',
      });
      loadDeadlines();
    } catch (error) {
      console.error('Error creating deadline:', error);
      toast.error('Failed to create deadline');
    }
  };

  const handleStatusChange = async (id: string, status: DeadlineStatus) => {
    try {
      await updateDeadline(id, { status });
      toast.success('Status updated!');
      loadDeadlines();
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deadline?')) return;

    try {
      await deleteDeadline(id);
      toast.success('Deadline deleted!');
      loadDeadlines();
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast.error('Failed to delete deadline');
    }
  };

  const getCategoryColor = (category: DeadlineCategory) => {
    const colors: Record<DeadlineCategory, string> = {
      academic: 'bg-primary text-primary-foreground',
      financial: 'bg-success text-white',
      career: 'bg-warning text-white',
      personal: 'bg-secondary text-secondary-foreground',
    };
    return colors[category];
  };

  const getStatusIcon = (status: DeadlineStatus) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-success" />;
    if (status === 'missed') return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  const groupedDeadlines = {
    pending: deadlines.filter(d => d.status === 'pending'),
    completed: deadlines.filter(d => d.status === 'completed'),
    missed: deadlines.filter(d => d.status === 'missed'),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase gradient-text">DEADLINES</h1>
          <p className="text-muted-foreground mt-1">
            Manage your academic, financial, and career deadlines
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="uppercase pixel-button-press pixel-shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              ADD DEADLINE
            </Button>
          </DialogTrigger>
          <DialogContent className="pixel-border">
            <DialogHeader>
              <DialogTitle className="uppercase">CREATE NEW DEADLINE</DialogTitle>
              <DialogDescription>
                Add a new deadline to track
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="uppercase">TITLE *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Submit Assignment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="pixel-border-thin"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="uppercase">DESCRIPTION</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="pixel-border-thin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="uppercase">CATEGORY *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as DeadlineCategory })}
                >
                  <SelectTrigger className="pixel-border-thin">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">ACADEMIC</SelectItem>
                    <SelectItem value="financial">FINANCIAL</SelectItem>
                    <SelectItem value="career">CAREER</SelectItem>
                    <SelectItem value="personal">PERSONAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="uppercase">DUE DATE *</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="pixel-border-thin"
                  required
                />
              </div>

              <Button type="submit" className="w-full uppercase pixel-button-press">
                CREATE DEADLINE
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending Deadlines */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <Clock className="h-5 w-5 text-warning" />
            PENDING ({groupedDeadlines.pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {groupedDeadlines.pending.length > 0 ? (
            <div className="space-y-3">
              {groupedDeadlines.pending.map((deadline) => (
                <div
                  key={deadline.id}
                  className="p-4 bg-accent pixel-border-thin hover:bg-accent/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(deadline.status)}
                        <h3 className="font-bold uppercase truncate">{deadline.title}</h3>
                        {deadline.is_auto_generated && (
                          <Badge variant="outline" className="pixel-border-thin">AUTO</Badge>
                        )}
                      </div>
                      {deadline.description && (
                        <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        <Badge className={`${getCategoryColor(deadline.category)} pixel-border-thin uppercase`}>
                          {deadline.category}
                        </Badge>
                        <span className="text-muted-foreground">
                          📅 {new Date(deadline.due_date).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(deadline.id, 'completed')}
                        className="pixel-button-press"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(deadline.id, 'missed')}
                        className="pixel-button-press"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      {!deadline.is_auto_generated && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(deadline.id)}
                          className="pixel-button-press"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No pending deadlines</p>
          )}
        </CardContent>
      </Card>

      {/* Completed & Missed */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-success">
              <CheckCircle className="h-5 w-5" />
              COMPLETED ({groupedDeadlines.completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedDeadlines.completed.length > 0 ? (
              <div className="space-y-2">
                {groupedDeadlines.completed.map((deadline) => (
                  <div key={deadline.id} className="p-3 bg-accent pixel-border-thin">
                    <p className="font-medium uppercase text-sm">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{deadline.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No completed deadlines</p>
            )}
          </CardContent>
        </Card>

        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-destructive">
              <XCircle className="h-5 w-5" />
              MISSED ({groupedDeadlines.missed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupedDeadlines.missed.length > 0 ? (
              <div className="space-y-2">
                {groupedDeadlines.missed.map((deadline) => (
                  <div key={deadline.id} className="p-3 bg-accent pixel-border-thin">
                    <p className="font-medium uppercase text-sm">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{deadline.category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No missed deadlines</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
