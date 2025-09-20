import React from 'react';
import { Navigate } from 'react-router-dom';
import { isSuperAdmin, getVisibleUserActivityTabs } from '@utils/auth';

interface UserActivityRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const UserActivityRoute: React.FC<UserActivityRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  // Super admin has access to everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check if user has access to at least one tab
  const visibleTabs = getVisibleUserActivityTabs();
  if (visibleTabs.length === 0) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default UserActivityRoute;
