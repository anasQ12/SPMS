import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { UserRole } from '../../types';

// RequireAuth - redirects to login if not authenticated
export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// RequireRole - redirects to unauthorized if role doesn't match
export const RequireRole: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, activeRole } = useAuth();

  if (!user || !activeRole || !roles.includes(activeRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Can - conditionally render based on role
export const Can: React.FC<{
  role?: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ role, children, fallback = null }) => {
  const { user, activeRole } = useAuth();

  if (!user || !activeRole) return <>{fallback}</>;

  if (!role) return <>{children}</>;

  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(activeRole)) return <>{fallback}</>;

  return <>{children}</>;
};
