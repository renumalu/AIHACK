import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    setLoading(true);
    const { error } = await signInWithUsername(username, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      toast.success('Login successful!');
      navigate(from, { replace: true });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please enter username and password');
      return;
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithUsername(username, password);
    setLoading(false);

    if (error) {
      toast.error(error.message || 'Registration failed');
    } else {
      toast.success('Registration successful! Logging you in...');
      // Auto login after registration
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md pixel-border pixel-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold uppercase gradient-text">
            DEADLINE RADAR AI
          </CardTitle>
          <CardDescription className="text-base">
            Predictive student life intelligence system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 pixel-border-thin">
              <TabsTrigger value="login" className="uppercase">LOGIN</TabsTrigger>
              <TabsTrigger value="register" className="uppercase">REGISTER</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username" className="uppercase">USERNAME</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pixel-border-thin"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="uppercase">PASSWORD</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pixel-border-thin"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full uppercase pixel-button-press pixel-shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'LOADING...' : 'LOGIN'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username" className="uppercase">USERNAME</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Choose username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pixel-border-thin"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Only letters, numbers, and underscores allowed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="uppercase">PASSWORD</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Choose password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pixel-border-thin"
                    disabled={loading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full uppercase pixel-button-press pixel-shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'CREATING...' : 'REGISTER'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
