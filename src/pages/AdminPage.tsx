import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import type { Profile, UserRole } from '@/types';
import { Shield, Users, AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function AdminPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadUsers();
    }
  }, [profile]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Use RPC to bypass type checking issues
      const { error } = await (supabase as any).rpc('update_user_role', {
        user_id: userId,
        new_role: newRole,
      });

      if (error) throw error;
      
      toast.success('User role updated!');
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update user role');
    }
  };

  // Redirect if not admin
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!profile) {
    return null;
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role === 'user').length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold uppercase gradient-text">ADMIN PANEL</h1>
        <p className="text-muted-foreground mt-1">
          Manage users and system settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-sm">
              <Users className="h-4 w-4" />
              TOTAL USERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{users.length}</p>
          </CardContent>
        </Card>

        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-sm">
              <Shield className="h-4 w-4" />
              ADMINS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-destructive">{adminCount}</p>
          </CardContent>
        </Card>

        <Card className="pixel-border pixel-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 uppercase text-sm">
              <Users className="h-4 w-4" />
              REGULAR USERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{userCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="pixel-border pixel-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 uppercase">
            <Users className="h-5 w-5" />
            USER MANAGEMENT
          </CardTitle>
          <CardDescription>
            View and manage user roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-accent pixel-border-thin hover:bg-accent/80 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold uppercase truncate">{user.username}</p>
                      <Badge
                        className={`pixel-border-thin ${
                          user.role === 'admin'
                            ? 'bg-destructive text-destructive-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                    {user.name && (
                      <p className="text-sm text-muted-foreground">{user.name}</p>
                    )}
                    {user.department && (
                      <p className="text-xs text-muted-foreground">{user.department}</p>
                    )}
                  </div>
                  <div className="shrink-0">
                    {user.id !== profile.id ? (
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="w-32 pixel-border-thin">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">USER</SelectItem>
                          <SelectItem value="admin">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="pixel-border-thin">
                        YOU
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Notice */}
      <Card className="border-warning bg-warning/10 pixel-border">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-1" />
            <div>
              <h3 className="font-bold uppercase mb-2">ADMIN PRIVILEGES</h3>
              <p className="text-sm">
                As an admin, you have full access to all user data and can modify user roles. 
                Use these privileges responsibly. The first registered user automatically becomes an admin.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
