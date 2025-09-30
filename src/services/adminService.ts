import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { getAdminToken, setAdminToken } from '@utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class AdminService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Thêm token vào mỗi request
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = getAdminToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Xử lý error tập trung
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError<any>) => {
        const message = error.response?.data?.message || error.message || 'Đã xảy ra lỗi';
        const customError = new Error(message);
        (customError as any).status = error.response?.status;
        return Promise.reject(customError);
      }
    );
  }

  // Admin: Delete ALL notifications of a specific user
  async adminClearUserNotifications(userId: number) {
    return this.axiosInstance.delete(`/admin/users/${userId}/notifications`);
  }

  async updateSharedNote(sharedNoteId: number, data: {
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    message?: string;
  }) {
    return this.axiosInstance.put(`/admin/shared-notes/${sharedNoteId}`, data);
  }

  // Admin: Delete a specific notification of user
  async adminDeleteUserNotification(userId: number, notificationId: number) {
    return this.axiosInstance.delete(`/admin/users/${userId}/notifications/${notificationId}`);
  }

  // Admin: Fetch notifications of a specific user
  async adminGetUserNotifications(userId: number, params: { limit?: number; unreadOnly?: boolean; collapse?: string } = {}) {
    return this.axiosInstance.get(`/admin/users/${userId}/notifications`, { params });
  }

  // Admin: Fetch group members with roles (owner/admin/member)
  async adminGetGroupMembers(groupId: number) {
    return this.axiosInstance.get(`/admin/groups/${groupId}/members`);
  }

  // Admin: Fetch DM messages between target user and a specific other user
  async adminGetDMMessages(userId: number, otherUserId: number, params: { page?: number; limit?: number } = {}) {
    return this.axiosInstance.get(`/admin/users/${userId}/dm/${otherUserId}/messages`, { params });
  }

  // Admin: Fetch Group messages for a specific group
  async adminGetGroupMessages(groupId: number, params: { page?: number; limit?: number } = {}) {
    return this.axiosInstance.get(`/admin/groups/${groupId}/messages`, { params });
  }

  // Admin login
  async login(email: string, password: string) {
    const data: any = await this.axiosInstance.post('/admin/login', { email, password });
    
    // Lưu token vào localStorage để sử dụng cho các API call tiếp theo
    if (data.token) {
      setAdminToken(data.token);
    }

    return data;
  }

  // Users management
  async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/users', { params });
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
  }) {
    return this.axiosInstance.post('/admin/users', userData);
  }

  async editUser(userId: number, userData: {
    name: string;
    email: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    avatar?: string;
  }) {
    return this.axiosInstance.put(`/admin/users/${userId}`, userData);
  }

  async getUserActivity(userId: number, params: { page?: number; limit?: number } = {}) {
    return this.axiosInstance.get(`/admin/users/${userId}/activity`, { params });
  }

  // Notes management
  async getAllUsersNotes(params: {
    page?: number;
    limit?: number;
    userId?: number;
    category?: string;
    priority?: string;
    search?: string;
    isArchived?: boolean;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/notes', { params });
  }

  async createNoteForUser(noteData: {
    userId: number;
    title: string;
    content?: string;
    imageUrl?: string;
    category?: string;
    priority?: string;
    reminderAt?: string;
  }) {
    return this.axiosInstance.post('/admin/notes', noteData);
  }

  async updateUserNote(noteId: number, noteData: {
    title?: string;
    content?: string;
    imageUrl?: string;
    category?: string;
    priority?: string;
    isArchived?: boolean;
    reminderAt?: string;
  }) {
    return this.axiosInstance.put(`/admin/notes/${noteId}`, noteData);
  }

  async deleteUserNote(noteId: number) {
    return this.axiosInstance.delete(`/admin/notes/${noteId}`);
  }

  // Shared Notes Management
  async getAllSharedNotes(params: {
    page?: number;
    limit?: number;
    userId?: number;
    search?: string;
    sharedByUserId?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/shared-notes', { params });
  }

  async getSharedNoteDetail(sharedNoteId: number) {
    return this.axiosInstance.get(`/admin/shared-notes/${sharedNoteId}`);
  }

  async deleteSharedNote(sharedNoteId: number) {
    return this.axiosInstance.delete(`/admin/shared-notes/${sharedNoteId}`);
  }

  // User management actions
  async toggleUserStatus(userId: number) {
    return this.axiosInstance.patch(`/admin/users/${userId}/toggle-status`);
  }

  async deleteUserPermanently(userId: number) {
    return this.axiosInstance.delete(`/admin/users/${userId}/permanent`);
  }

  // User sessions management
  async getUserSessions(userId: number) {
    return this.axiosInstance.get(`/admin/users/${userId}/sessions`);
  }

  async logoutUserSession(userId: number, sessionId: number) {
    return this.axiosInstance.delete(`/admin/users/${userId}/sessions/${sessionId}`);
  }

  async logoutAllUserSessions(userId: number) {
    return this.axiosInstance.delete(`/admin/users/${userId}/sessions`);
  }

  // Admin Permissions Management
  async getMyPermissions() {
    return this.axiosInstance.get('/admin/permissions/me');
  }

  async getAllAdmins(params: {
    page?: number;
    limit?: number;
    search?: string;
    adminLevel?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/admins', { params });
  }

  async createSubAdmin(adminData: {
    email: string;
    password: string;
    name: string;
    permissions?: string[];
    adminLevel?: string;
  }) {
    return this.axiosInstance.post('/admin/admins', adminData);
  }

  async updateAdminPermissions(adminId: number, data: {
    permissions?: string[];
    adminLevel?: string;
  }) {
    return this.axiosInstance.put(`/admin/admins/${adminId}/permissions`, data);
  }

  async toggleAdminStatus(adminId: number) {
    return this.axiosInstance.patch(`/admin/admins/${adminId}/toggle-status`);
  }

  async revokeAdminPermission(adminId: number, permission: string) {
    return this.axiosInstance.delete(`/admin/admins/${adminId}/permissions`, { data: { permission } });
  }

  async deleteAdmin(adminId: number) {
    return this.axiosInstance.delete(`/admin/admins/${adminId}`);
  }

  // Message Management
  async recallDMMessage(messageId: number) {
    return this.axiosInstance.patch(`/admin/messages/${messageId}/recall`);
  }

  async deleteDMMessage(messageId: number, targetUserId?: number) {
    const params = targetUserId ? { targetUserId } : {};
    return this.axiosInstance.delete(`/admin/messages/${messageId}`, { params });
  }

  async recallGroupMessage(messageId: number) {
    return this.axiosInstance.patch(`/admin/group-messages/${messageId}/recall`);
  }

  async deleteGroupMessage(messageId: number, targetUserId?: number) {
    const params = targetUserId ? { targetUserId } : {};
    return this.axiosInstance.delete(`/admin/group-messages/${messageId}`, { params });
  }

  async editDMMessage(messageId: number, content: string) {
    return this.axiosInstance.patch(`/admin/messages/${messageId}/edit`, { content });
  }

  async editGroupMessage(messageId: number, content: string) {
    return this.axiosInstance.patch(`/admin/group-messages/${messageId}/edit`, { content });
  }

  // Settings - Language (persist on backend, no local storage)
  async getLanguage() {
    return this.axiosInstance.get('/settings/language', { withCredentials: true });
  }

  async updateLanguage(language: string) {
    return this.axiosInstance.put('/settings/language', { language }, { withCredentials: true });
  }

  // Refresh token để get permissions mới
  async refreshToken() {
    const data: any = await this.axiosInstance.post('/admin/refresh-token');
    
    // Cập nhật token mới vào localStorage
    if (data.token) {
      setAdminToken(data.token);
    }

    return data;
  }

  // Admin profile
  async getMyProfile() {
    return this.axiosInstance.get('/admin/me');
  }

  async updateMyProfile(data: {
    name?: string;
    avatar?: string;
    phone?: string;
    birthDate?: string; // YYYY-MM-DD
    gender?: 'male' | 'female' | 'other' | 'unspecified';
    theme?: 'light' | 'dark';
    language?: string;
    rememberLogin?: boolean;
    hidePhone?: boolean;
    hideBirthDate?: boolean;
    allowMessagesFromNonFriends?: boolean;
  }) {
    return this.axiosInstance.put('/admin/me', data);
  }

  // Upload image file (for avatar)
  async uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    // Response interceptor đã unwrap response.data, nên data ở đây là object trực tiếp
    const data = await this.axiosInstance.post<any>('/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as any;

    try {
      const rawUrl: string | undefined = data?.data?.url || data?.url;
      const origin = new URL(API_BASE_URL).origin;
      const absoluteUrl = rawUrl
        ? (rawUrl.startsWith('http') ? rawUrl : origin + (rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`))
        : undefined;
      // Trả về cả hai dạng để client tương thích
      return {
        ...data,
        url: absoluteUrl || rawUrl,
        data: {
          ...(data?.data || {}),
          url: absoluteUrl || rawUrl,
        },
      };
    } catch {
      return data;
    }
  }

  // Get admin profile by ID (Super Admin only)
  async getAdminProfile(adminId: number) {
    return this.axiosInstance.get(`/admin/admins/${adminId}/profile`);
  }

  // Update admin profile by ID (Super Admin only)
  async updateAdminProfile(adminId: number, data: {
    name?: string;
    avatar?: string;
    phone?: string;
    birthDate?: string;
    gender?: 'male' | 'female' | 'other' | 'unspecified';
    theme?: 'light' | 'dark';
    language?: string;
    rememberLogin?: boolean;
    hidePhone?: boolean;
    hideBirthDate?: boolean;
    allowMessagesFromNonFriends?: boolean;
  }) {
    return this.axiosInstance.put(`/admin/admins/${adminId}/profile`, data);
  }
}

export default new AdminService();
