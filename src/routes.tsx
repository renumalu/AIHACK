import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import DeadlinesPage from './pages/DeadlinesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FinancialPage from './pages/FinancialPage';
import CareerPage from './pages/CareerPage';
import AdminPage from './pages/AdminPage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Login',
    path: '/login',
    element: <LoginPage />,
    visible: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    name: 'Profile',
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    name: 'Deadlines',
    path: '/deadlines',
    element: <DeadlinesPage />,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    element: <AnalyticsPage />,
  },
  {
    name: 'Financial',
    path: '/financial',
    element: <FinancialPage />,
  },
  {
    name: 'Career',
    path: '/career',
    element: <CareerPage />,
  },
  {
    name: 'Admin',
    path: '/admin',
    element: <AdminPage />,
    visible: false,
  },
];

export default routes;
