import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Layout = () => {
  const { darkMode } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // This effect ensures we navigate back to the correct path after a refresh
  useEffect(() => {
    // Store the current full path in sessionStorage when it changes
    const currentPath = location.pathname;
    if (currentPath !== '/dashboard') {
      sessionStorage.setItem('lastDashboardPath', currentPath);
      console.log('Saved last dashboard path:', currentPath);
    }
  }, [location.pathname]);
  
  // After authentication completes, check if we need to redirect to a saved path
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const savedPath = sessionStorage.getItem('lastDashboardPath');
      const currentPath = location.pathname;
      
      // If we're at /dashboard but have a saved more specific path, redirect to it
      if (currentPath === '/dashboard' && savedPath && savedPath !== '/dashboard') {
        console.log('Redirecting to saved path:', savedPath);
        navigate(savedPath, { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, location.pathname, navigate]);

  return (
    <div className={`flex h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'}`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;