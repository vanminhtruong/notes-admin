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
  
  const permitted = hasPermission(permission);

  // Nếu có đúng quyền cha nhưng KHÔNG có bất kỳ quyền con nào, và không phải super admin -> no-permission
  // Áp dụng cho các namespace như manage_users, manage_notes, ... (permission không chứa dấu '.')
  // Bỏ qua view_analytics vì đây là quyền đơn không có quyền con
  if (permitted) {
    try {
      const isNamespace = !permission.includes('.');
      if (isNamespace && !isSuperAdmin() && permission !== 'view_analytics') {
        const adminInfo = getCurrentAdminInfo();
        const perms = adminInfo?.adminPermissions || [];
        const hasExactParent = perms.includes(permission);
        const hasAnyChild = perms.some((p) => p.startsWith(permission + '.'));
        if (hasExactParent && !hasAnyChild) {
          if (location.pathname !== '/no-permission') {
            return <Navigate to="/no-permission" replace />;
          }
        }
      }
    } catch {}
  }

  if (!permitted) {
    // Nếu cấu hình route yêu cầu redirect tới no-permission, thử tìm route khả dụng đầu tiên
    if (redirectTo === '/no-permission') {
      const adminInfo = getCurrentAdminInfo();
      const perms = adminInfo?.adminPermissions || [];
      const hasAny = perms && perms.length > 0;
      if (hasAny) {
        // Xác định route đầu tiên có thể truy cập dựa trên quyền con thực tế
        const hasAnyChild = (ns: string) => perms.some((p) => p.startsWith(ns + '.'));
        if (hasAnyChild('manage_users')) {
          return <Navigate to="/users" replace />;
        }
        if (hasAnyChild('manage_notes')) {
          return <Navigate to="/notes" replace />;
        }
        if (perms.includes('view_analytics')) {
          return <Navigate to="/dashboard" replace />;
        }
        // Có quyền nhưng không map được route cụ thể -> fallback về dashboard (nếu có layout), nếu cũng không thì no-permission
        if (location.pathname !== '/dashboard') {
          return <Navigate to="/dashboard" replace />;
        }
      }
    }
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
