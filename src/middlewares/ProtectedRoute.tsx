import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdminAuthenticated, removeAdminToken } from '@utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  useEffect(() => {
    // Kiểm tra token khi component mount
    if (!isAdminAuthenticated()) {
      removeAdminToken(); // Xóa token không hợp lệ
    }
  }, []);

  if (!isAdminAuthenticated()) {
    removeAdminToken(); // Xóa token không hợp lệ
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
