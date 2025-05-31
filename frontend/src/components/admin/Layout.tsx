import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Menu, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import type { UserInfo } from '../../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getUserInfo = () => {
    try {
      const userInfoString = localStorage.getItem('userInfo');
      if (!userInfoString) return null;
      return JSON.parse(userInfoString);
    } catch (_) {
      // Ignore parsing errors and return null
      return null;
    }
  };

  useEffect(() => {
    // Get user info from local storage
    const userInfo = getUserInfo();
    if (userInfo) {
      setUserInfo(userInfo);
    }
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');

    // Redirect to login page
    navigate('/admin/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: '/admin/dashboard',
      roles: ['admin', 'support'],
    },
    {
      title: 'Users',
      icon: <Users className="h-5 w-5" />,
      href: '/admin/users',
      roles: ['admin'],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:translate-x-0 overflow-hidden flex flex-col h-full',
          !sidebarOpen && '-translate-x-full'
        )}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems
              .filter(item => userInfo && item.roles.includes(userInfo.role))
              .map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors',
                    location.pathname === item.href && 'bg-gray-100 text-gray-900'
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t mt-auto bg-white">
            <div className="mb-4">
              <p className="text-sm font-medium">{userInfo?.name}</p>
              <p className="text-xs text-gray-500">{userInfo?.email}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">Role: {userInfo?.role}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'min-h-screen transition-all duration-200 ease-in-out',
          sidebarOpen ? 'md:ml-64' : ''
        )}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center gap-4 px-4 h-16 bg-white border-b md:hidden">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>

        {/* Page content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
