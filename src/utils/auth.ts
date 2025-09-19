import { jwtDecode } from 'jwt-decode';

interface AdminTokenPayload {
  id?: number; // new shape
  userId?: number; // backward compatibility
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const validateAdminToken = (token: string): AdminTokenPayload | null => {
  try {
    const decoded = jwtDecode<AdminTokenPayload>(token);
    
    // Kiểm tra token có phải của admin không
    if (decoded.role !== 'admin') {
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
    return adminData !== null && adminData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin authentication:', error);
    return false;
  }
};
