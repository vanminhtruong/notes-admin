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
        const code = error.response?.data?.code;
        const customError = new Error(message);
        (customError as any).status = error.response?.status;
        (customError as any).code = code; // Giữ lại error code từ backend
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

  // Admin: Fetch pinned messages in DM conversation
  async adminGetDMPinnedMessages(userId: number, otherUserId: number) {
    return this.axiosInstance.get(`/admin/users/${userId}/dm/${otherUserId}/pinned-messages`);
  }

  // Admin: Fetch blocked users list of a user
  async adminGetUserBlockedList(userId: number) {
    return this.axiosInstance.get(`/admin/users/${userId}/blocked-users`);
  }

  // Admin: Fetch Group messages for a specific group
  async adminGetGroupMessages(groupId: number, params: { page?: number; limit?: number } = {}) {
    return this.axiosInstance.get(`/admin/groups/${groupId}/messages`, { params });
  }

  // Admin: Fetch pinned messages in Group conversation
  async adminGetGroupPinnedMessages(groupId: number) {
    return this.axiosInstance.get(`/admin/groups/${groupId}/pinned-messages`);
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
    e2eeEnabled?: boolean;
    readStatusEnabled?: boolean;
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
    name?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
    avatar?: string;
    password?: string;
    // Chat settings
    e2eeEnabled?: boolean;
    readStatusEnabled?: boolean;
    allowMessagesFromNonFriends?: boolean;
    hidePhone?: boolean;
    hideBirthDate?: boolean;
  }) {
    return this.axiosInstance.put(`/admin/users/${userId}`, userData);
  }

  async editUserChatSettings(userId: number, chatSettings: {
    e2eeEnabled?: boolean;
    readStatusEnabled?: boolean;
    allowMessagesFromNonFriends?: boolean;
    hidePhone?: boolean;
    hideBirthDate?: boolean;
  }) {
    return this.axiosInstance.put(`/admin/users/${userId}/chat-settings`, chatSettings);
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
    folderId?: number | 'null';
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/notes', { params });
  }

  async createUserNote(noteData: {
    userId: number;
    title: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    youtubeUrl?: string;
    category?: string;
    categoryId?: number | null;
    priority?: string;
    reminderAt?: string;
    folderId?: number | null;
  }) {
    return this.axiosInstance.post('/admin/notes', noteData);
  }

  // Alias for consistency with backend naming
  async createNoteForUser(noteData: {
    userId: number;
    title: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    youtubeUrl?: string;
    category?: string;
    categoryId?: number | null;
    priority?: string;
    reminderAt?: string;
    folderId?: number | null;
  }) {
    return this.createUserNote(noteData);
  }

  async updateUserNote(noteId: number, noteData: {
    title?: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    youtubeUrl?: string;
    category?: string;
    categoryId?: number | null;
    priority?: string;
    isArchived?: boolean;
    reminderAt?: string;
    folderId?: number | null;
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

  // Folders Management
  async getAllFolders(params: {
    page?: number;
    limit?: number;
    userId?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/folders', { params });
  }

  async getFolderById(folderId: number) {
    return this.axiosInstance.get(`/admin/folders/${folderId}`);
  }

  async createFolderForUser(folderData: {
    userId: number;
    name: string;
    color?: string;
    icon?: string;
  }) {
    return this.axiosInstance.post('/admin/folders', folderData);
  }

  async updateUserFolder(folderId: number, folderData: {
    name?: string;
    color?: string;
    icon?: string;
  }) {
    return this.axiosInstance.put(`/admin/folders/${folderId}`, folderData);
  }

  async deleteUserFolder(folderId: number, userId: number) {
    return this.axiosInstance.delete(`/admin/folders/${folderId}`, {
      data: { userId }
    });
  }

  async moveNoteToFolder(noteId: number, folderId: number | null) {
    return this.axiosInstance.patch(`/admin/notes/${noteId}/move-to-folder`, { folderId });
  }

  async pinUserNote(noteId: number) {
    return this.axiosInstance.patch(`/admin/notes/${noteId}/pin`);
  }

  async unpinUserNote(noteId: number) {
    return this.axiosInstance.patch(`/admin/notes/${noteId}/unpin`);
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

  // Change admin password by ID (Super Admin only)
  async changeAdminPassword(adminId: number, data: {
    currentPassword: string;
    newPassword: string;
  }) {
    return this.axiosInstance.post(`/admin/admins/${adminId}/change-password`, data);
  }

  // ============ Categories Management ============

  // Get all categories
  async getAllCategories(params: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/categories', { params });
  }

  // Search categories (optimized for dropdown)
  async searchCategories(query: string, userId: number, limit?: number) {
    return this.axiosInstance.get('/admin/categories/search', {
      params: { q: query, userId, limit: limit || 4 }
    });
  }

  // Get category detail
  async getCategoryDetail(categoryId: number) {
    return this.axiosInstance.get(`/admin/categories/${categoryId}`);
  }

  // Create category for user
  async createCategoryForUser(data: {
    userId: number;
    name: string;
    color: string;
    icon: string;
  }) {
    return this.axiosInstance.post('/admin/categories', data);
  }

  // Update category
  async updateCategory(categoryId: number, data: {
    name?: string;
    color?: string;
    icon?: string;
  }) {
    return this.axiosInstance.put(`/admin/categories/${categoryId}`, data);
  }

  // Delete category
  async deleteCategory(categoryId: number) {
    return this.axiosInstance.delete(`/admin/categories/${categoryId}`);
  }

  // Pin category
  async pinCategory(categoryId: number) {
    return this.axiosInstance.patch(`/admin/categories/${categoryId}/pin`);
  }

  // Unpin category
  async unpinCategory(categoryId: number) {
    return this.axiosInstance.patch(`/admin/categories/${categoryId}/unpin`);
  }

  // Get categories stats
  async getCategoriesStats() {
    return this.axiosInstance.get('/admin/categories/stats');
  }

  // ============ Tags Management ============

  // Get all tags
  async getAllTags(params: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string | number;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    return this.axiosInstance.get('/admin/tags', { params });
  }

  // Get tags stats
  async getTagsStats() {
    return this.axiosInstance.get('/admin/tags/stats');
  }

  // Get tag detail
  async getTagDetail(tagId: number, params: { page?: number; limit?: number } = {}) {
    return this.axiosInstance.get(`/admin/tags/${tagId}`, { params });
  }

  // Create tag for user
  async createTagForUser(data: {
    userId: string | number;
    name: string;
    color: string;
  }) {
    return this.axiosInstance.post('/admin/tags', data);
  }

  // Update tag
  async updateTag(tagId: number, data: {
    name?: string;
    color?: string;
  }) {
    return this.axiosInstance.put(`/admin/tags/${tagId}`, data);
  }

  // Delete tag
  async deleteTag(tagId: number) {
    return this.axiosInstance.delete(`/admin/tags/${tagId}`);
  }

  // Toggle pin tag (admin)
  async togglePinTag(tagId: number) {
    return this.axiosInstance.patch(`/admin/tags/${tagId}/pin`);
  }

  // Assign tag to note
  async assignTagToNote(data: {
    noteId: number;
    tagId: number;
  }) {
    return this.axiosInstance.post('/admin/tags/assign', data);
  }

  // Remove tag from note
  async removeTagFromNote(noteId: number, tagId: number) {
    return this.axiosInstance.delete(`/admin/tags/${noteId}/${tagId}`);
  }

  // ============ Backgrounds Management ============

  // Get colors
  async getColors(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  } = {}) {
    return this.axiosInstance.get('/admin/backgrounds/colors', { params });
  }
 
  // Get images
  async getImages(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isActive?: boolean;
  } = {}) {
    return this.axiosInstance.get('/admin/backgrounds/images', { params });
  }

  // Get all backgrounds (deprecated - for backward compatibility)
  async getAllBackgrounds(params: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    category?: string;
    isActive?: boolean;
  } = {}) {
    return this.axiosInstance.get('/admin/backgrounds', { params });
  }

  // Get background detail
  async getBackgroundDetail(backgroundId: number) {
    return this.axiosInstance.get(`/admin/backgrounds/${backgroundId}`);
  }

  // Create background
  async createBackground(data: {
    uniqueId: string;
    type: 'color' | 'image';
    value: string | null;
    label: string;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    // Route khác nhau dựa trên type
    const endpoint = data.type === 'color' 
      ? '/admin/backgrounds/colors' 
      : '/admin/backgrounds/images';
    return this.axiosInstance.post(endpoint, data);
  }

  // Update background
  async updateBackground(backgroundId: number, data: {
    uniqueId?: string;
    type?: 'color' | 'image';
    value?: string | null;
    label?: string;
    category?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return this.axiosInstance.put(`/admin/backgrounds/${backgroundId}`, data);
  }

  // Delete background
  async deleteBackground(backgroundId: number) {
    return this.axiosInstance.delete(`/admin/backgrounds/${backgroundId}`);
  }

  // Toggle background active status
  async toggleBackgroundActive(backgroundId: number) {
    return this.axiosInstance.patch(`/admin/backgrounds/${backgroundId}/toggle-active`);
  }
}

export default new AdminService();
