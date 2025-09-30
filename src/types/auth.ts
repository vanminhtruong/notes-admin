export interface AdminTokenPayload {
  id?: number; // new shape
  userId?: number; // backward compatibility
  email: string;
  role: string;
  adminLevel?: 'super_admin' | 'sub_admin' | 'dev' | 'mod';
  adminPermissions?: string[];
  iat?: number;
  exp?: number;
}
