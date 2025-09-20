import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasPermission } from '@utils/auth';

interface PermissionRouteProps {
  children: React.ReactNode;
  permission: string;
  redirectTo?: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ 
  children, 
  permission, 
  redirectTo = '/dashboard' 
}) => {
  if (!hasPermission(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
