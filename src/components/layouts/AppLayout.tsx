import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  BarChart3, 
  Wallet, 
  Briefcase,
  Menu,
  LogOut,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'DASHBOARD', href: '/dashboard', icon: LayoutDashboard },
  { name: 'PROFILE', href: '/profile', icon: User },
  { name: 'DEADLINES', href: '/deadlines', icon: Calendar },
  { name: 'ANALYTICS', href: '/analytics', icon: BarChart3 },
  { name: 'FINANCIAL', href: '/financial', icon: Wallet },
  { name: 'CAREER', href: '/career', icon: Briefcase },
  { name: 'AI ASSISTANT', href: '/ai-assistant', icon: Sparkles },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const NavLinks = () => {
    const links = navigation.map((item) => {
      const isActive = location.pathname === item.href;
      return (
        <Link
          key={item.name}
          to={item.href}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase transition-colors pixel-border-thin ${
            isActive
              ? 'bg-primary text-primary-foreground pixel-shadow-sm'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      );
    });

    if (profile?.role === 'admin') {
      links.push(
        <Link
          key="admin"
          to="/admin"
          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium uppercase transition-colors pixel-border-thin ${
            location.pathname === '/admin'
              ? 'bg-destructive text-destructive-foreground pixel-shadow-sm'
              : 'text-sidebar-foreground hover:bg-destructive/10'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Shield className="h-5 w-5" />
          ADMIN
        </Link>
      );
    }

    return <>{links}</>;
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r border-border bg-sidebar pixel-border-thin shrink-0">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold uppercase text-sidebar-foreground gradient-text">
              DEADLINE RADAR
            </h1>
            <p className="text-xs text-sidebar-foreground/70 mt-1">AI INTELLIGENCE</p>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <NavLinks />
          </nav>
          <div className="p-4 border-t border-sidebar-border">
            <div className="mb-3 p-3 bg-sidebar-accent pixel-border-thin">
              <p className="text-xs uppercase text-sidebar-foreground/70">USER</p>
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.username || 'Guest'}
              </p>
              {profile?.role === 'admin' && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-destructive text-destructive-foreground pixel-border-thin">
                  ADMIN
                </span>
              )}
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full uppercase pixel-button-press pixel-shadow-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border bg-card p-4 pixel-border-thin">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold uppercase gradient-text">DEADLINE RADAR</h1>
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="pixel-button-press">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 pixel-border">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold uppercase gradient-text">MENU</h2>
                  </div>
                  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLinks />
                  </nav>
                  <div className="p-4 border-t border-border">
                    <div className="mb-3 p-3 bg-accent pixel-border-thin">
                      <p className="text-xs uppercase text-muted-foreground">USER</p>
                      <p className="text-sm font-medium truncate">
                        {profile?.username || 'Guest'}
                      </p>
                      {profile?.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-destructive text-destructive-foreground pixel-border-thin">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full uppercase pixel-button-press"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      LOGOUT
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
