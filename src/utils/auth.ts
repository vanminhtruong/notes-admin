import { jwtDecode } from 'jwt-decode';

interface AdminTokenPayload {
  id?: number; // new shape
  userId?: number; // backward compatibility
  email: string;
  role: string;
  adminLevel?: 'super_admin' | 'sub_admin' | 'dev' | 'mod';
  adminPermissions?: string[];
  iat?: number;
  exp?: number;
}

// Runtime overrides for real-time permission updates via sockets
let __adminPermissionsOverride: string[] | null = null;
let __adminLevelOverride: AdminTokenPayload['adminLevel'] | null = null;

export const setAdminPermissionOverride = (data: { permissions?: string[]; adminLevel?: AdminTokenPayload['adminLevel'] } | null) => {
  __adminPermissionsOverride = data?.permissions ?? null;
  __adminLevelOverride = data?.adminLevel ?? null;
};

export const validateAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const decoded = jwtDecode<AdminTokenPayload>(token);
    
    // Kiểm tra token có phải của admin không (role admin hoặc có adminLevel)
    if (decoded.role !== 'admin' && !decoded.adminLevel) {
      return null;
    }
    
    // Kiểm tra token có hết hạn không
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
};

export const getAdminFromToken = (token: string): AdminTokenPayload | null => {
  return validateAdminToken(token);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<AdminTokenPayload>(token);
    return decoded.exp ? decoded.exp * 1000 < Date.now() : false;
  } catch {
    return true;
  }
};

export const setAdminToken = (token: string): void => {
  localStorage.setItem('admin_token', token);
};

export const getAdminToken = (): string | null => {
  return localStorage.getItem('admin_token');
};

export const removeAdminToken = (): void => {
  localStorage.removeItem('admin_token');
};

export const isAdminAuthenticated = (): boolean => {
  try {
    const token = getAdminToken();
    if (!token) return false;
    
    const adminData = validateAdminToken(token);
    return adminData !== null && (adminData.role === 'admin' || !!adminData.adminLevel);
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
};

export const isSuperAdmin = (): boolean => {
  try {
    const token = getAdminToken();
    if (!token) return false;
    
    const adminData = validateAdminToken(token);
    return adminData !== null && adminData.adminLevel === 'super_admin';
  } catch (error) {
    console.error('Error checking super admin:', error);
    return false;
  }
};

export const hasPermission = (permission: string): boolean => {
  try {
    const token = getAdminToken();
    if (!token) {
      return false;
    }
    
    const adminData = validateAdminToken(token);
    if (!adminData) {
      return false;
    }
    
    // Apply real-time overrides if present
    const effectiveLevel = __adminLevelOverride ?? adminData.adminLevel;
    const userPermissions = (__adminPermissionsOverride ?? adminData.adminPermissions) || [];

    // Super admin có tất cả quyền
    if (effectiveLevel === 'super_admin') {
      return true;
    }
    
    // Kiểm tra exact match trước
    if (userPermissions.includes(permission)) {
      return true;
    }
    
    // Kiểm tra nested permissions: nếu có parent permission thì có quyền
    // Ví dụ: cần 'manage_users', user có 'manage_users.view' -> OK
    const hasNestedPermission = userPermissions.some(userPerm => 
      userPerm.startsWith(permission + '.')
    );
    
    // Debug log sẽ xóa sau khi test
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Permission check:', {
        requested: permission,
        userPermissions,
        exactMatch: userPermissions.includes(permission),
        nestedMatch: hasNestedPermission,
        result: hasNestedPermission
      });
    }
    
    return hasNestedPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

export const getCurrentAdminInfo = (): AdminTokenPayload | null => {
  try {
    const token = getAdminToken();
    if (!token) return null;
    
    return validateAdminToken(token);
  } catch (error) {
    console.error('Error getting admin info:', error);
    return null;
  }
};

// Helper function to check user activity tab permissions
export const hasUserActivityTabPermission = (tab: 'messages' | 'groups' | 'friends' | 'notifications' | 'monitor'): boolean => {
  const permissionMap = {
    messages: 'manage_users.activity.messages',
    groups: 'manage_users.activity.groups', 
    friends: 'manage_users.activity.friends',
    notifications: 'manage_users.activity.notifications',
    monitor: 'manage_users.activity.monitor'
  };
  
  return hasPermission(permissionMap[tab]);
};

// Get visible user activity tabs based on permissions
export const getVisibleUserActivityTabs = (): Array<{key: string, label: string, icon: string}> => {
  const allTabs = [
    { key: 'messages', label: 'userActivity.tabs.messages', icon: '💬' },
    { key: 'groups', label: 'userActivity.tabs.groups', icon: '👥' },
    { key: 'friends', label: 'userActivity.tabs.friends', icon: '👫' },
    { key: 'notifications', label: 'userActivity.tabs.notifications', icon: '🔔' },
    { key: 'monitor', label: 'userActivity.tabs.monitor', icon: '🕵️' }
  ];

  // Super admin sees all tabs
  if (isSuperAdmin()) {
    return allTabs;
  }

  // Filter tabs based on permissions
  return allTabs.filter(tab => hasUserActivityTabPermission(tab.key as any));
};
