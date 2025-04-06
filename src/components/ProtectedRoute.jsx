import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log authentication state for debugging
    console.log('Protected route auth state:', { 
      isAuthenticated, 
      isLoading, 
      path: location.pathname,
      error
    });
  }, [isAuthenticated, isLoading, location.pathname, error]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Only redirect if authentication check is complete and user is not authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login from', location.pathname);
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If we get here, user is authenticated
  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute;
