import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission, getCurrentAdminInfo, isSuperAdmin } from '@utils/auth';

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
  const location = useLocation();
  
  if (!hasPermission(permission)) {
    // Nếu đang redirect về dashboard nhưng không có quyền view_analytics
    // và không phải super admin, kiểm tra xem có quyền nào không
    if (redirectTo === '/dashboard' && !hasPermission('view_analytics') && !isSuperAdmin()) {
      const adminInfo = getCurrentAdminInfo();
      const permissions = adminInfo?.adminPermissions || [];
      
      // Nếu không có quyền nào hoặc mảng quyền rỗng, redirect về no-permission
      if (permissions.length === 0) {
        // Tránh loop: nếu đã ở no-permission thì không redirect nữa
        if (location.pathname !== '/no-permission') {
          return <Navigate to="/no-permission" replace />;
        }
      }
    }
    
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
