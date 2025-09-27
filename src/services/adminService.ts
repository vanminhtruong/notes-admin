import { getAdminToken, setAdminToken } from '@utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class AdminService {
  private getHeaders() {
    const token = getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Admin: Delete ALL notifications of a specific user
  async adminClearUserNotifications(userId: number) {
    const url = `${API_BASE_URL}/admin/users/${userId}/notifications`;
    const response = await fetch(url, { method: 'DELETE', headers: this.getHeaders() });
    if (!response.ok) {
      let message = 'Không thể xóa tất cả thông báo';
      try { const data = await response.json(); message = data.message || message; } catch {}
      const err = new Error(message);
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  }

  // Admin: Delete a specific notification of user
  async adminDeleteUserNotification(userId: number, notificationId: number) {
    const url = `${API_BASE_URL}/admin/users/${userId}/notifications/${notificationId}`;
    const response = await fetch(url, { method: 'DELETE', headers: this.getHeaders() });
    if (!response.ok) {
      let message = 'Không thể xóa thông báo';
      try { const data = await response.json(); message = data.message || message; } catch {}
      const err = new Error(message);
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  }

  // Admin: Fetch notifications of a specific user
  async adminGetUserNotifications(userId: number, params: { limit?: number; unreadOnly?: boolean; collapse?: string } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const url = `${API_BASE_URL}/admin/users/${userId}/notifications?${queryParams.toString()}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      let message = 'Không thể tải thông báo của người dùng';
      try { const data = await response.json(); message = data.message || message; } catch {}
      const err = new Error(message);
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  }

  // Admin: Fetch group members with roles (owner/admin/member)
  async adminGetGroupMembers(groupId: number) {
    const url = `${API_BASE_URL}/admin/groups/${groupId}/members`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      const err = new Error('Không thể tải danh sách thành viên nhóm');
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  }

  // Admin: Fetch DM messages between target user and a specific other user
  async adminGetDMMessages(userId: number, otherUserId: number, params: { page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    const url = `${API_BASE_URL}/admin/users/${userId}/dm/${otherUserId}/messages?${queryParams}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      const err = new Error('Không thể tải lịch sử chat 1-1');
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  }

  // Admin: Fetch Group messages for a specific group
  async adminGetGroupMessages(groupId: number, params: { page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    const url = `${API_BASE_URL}/admin/groups/${groupId}/messages?${queryParams}`;
    const response = await fetch(url, { headers: this.getHeaders() });
    if (!response.ok) {
      const err = new Error('Không thể tải lịch sử chat nhóm');
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  }

  // Admin login
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Đăng nhập thất bại');
    }

    const data = await response.json();
    
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
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      let errorMessage = 'Không thể tải danh sách người dùng';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use status-based message
        if (response.status === 500) {
          errorMessage = 'Lỗi server (500). Vui lòng kiểm tra kết nối backend hoặc thử lại sau.';
        } else if (response.status === 401) {
          errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint không tồn tại.';
        }
      }
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    return response.json();
  }

  async getUserActivity(userId: number, params: { page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/activity?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải hoạt động người dùng');
    }

    return response.json();
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
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/notes?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách ghi chú');
    }

    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/admin/notes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo ghi chú');
    }

    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/admin/notes/${noteId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật ghi chú');
    }

    return response.json();
  }

  async deleteUserNote(noteId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/notes/${noteId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa ghi chú');
    }

    return response.json();
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
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/shared-notes?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách ghi chú chia sẻ');
    }

    return response.json();
  }

  async getSharedNoteDetail(sharedNoteId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/shared-notes/${sharedNoteId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy chi tiết ghi chú chia sẻ');
    }

    return response.json();
  }

  async deleteSharedNote(sharedNoteId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/shared-notes/${sharedNoteId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa ghi chú chia sẻ');
    }

    return response.json();
  }

  // User management actions
  async toggleUserStatus(userId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thay đổi trạng thái tài khoản');
    }

    return response.json();
  }

  async deleteUserPermanently(userId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/permanent`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa tài khoản vĩnh viễn');
    }

    return response.json();
  }

  // Admin Permissions Management
  async getMyPermissions() {
    const response = await fetch(`${API_BASE_URL}/admin/permissions/me`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể lấy thông tin quyền hạn');
    }

    return response.json();
  }

  async getAllAdmins(params: {
    page?: number;
    limit?: number;
    search?: string;
    adminLevel?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/admin/admins?${queryParams}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tải danh sách admin');
    }

    return response.json();
  }

  async createSubAdmin(adminData: {
    email: string;
    password: string;
    name: string;
    permissions?: string[];
    adminLevel?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/admins`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể tạo phó admin');
    }

    return response.json();
  }

  async updateAdminPermissions(adminId: number, data: {
    permissions?: string[];
    adminLevel?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/permissions`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể cập nhật quyền admin');
    }

    return response.json();
  }

  async toggleAdminStatus(adminId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/toggle-status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thay đổi trạng thái admin');
    }

    return response.json();
  }

  async revokeAdminPermission(adminId: number, permission: string) {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/permissions`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ permission }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa quyền admin');
    }

    return response.json();
  }

  async deleteAdmin(adminId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa admin');
    }

    return response.json();
  }

  // Message Management
  async recallDMMessage(messageId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${messageId}/recall`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thu hồi tin nhắn');
    }

    return response.json();
  }

  async deleteDMMessage(messageId: number, targetUserId?: number) {
    const url = new URL(`${API_BASE_URL}/admin/messages/${messageId}`);
    if (typeof targetUserId === 'number') {
      url.searchParams.set('targetUserId', String(targetUserId));
    }
    console.log('🗑️ AdminService: DELETE request to ' + url.toString());
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa tin nhắn');
    }

    console.log('🗑️ AdminService: DELETE response:', response.status);
    return response.json();
  }

  async recallGroupMessage(messageId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/group-messages/${messageId}/recall`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể thu hồi tin nhắn nhóm');
    }

    return response.json();
  }

  async deleteGroupMessage(messageId: number, targetUserId?: number) {
    const url = new URL(`${API_BASE_URL}/admin/group-messages/${messageId}`);
    if (typeof targetUserId === 'number') {
      url.searchParams.set('targetUserId', String(targetUserId));
    }
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể xóa tin nhắn nhóm');
    }

    return response.json();
  }

  async editDMMessage(messageId: number, content: string) {
    const response = await fetch(`${API_BASE_URL}/admin/messages/${messageId}/edit`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể chỉnh sửa tin nhắn');
    }
    return response.json();
  }

  async editGroupMessage(messageId: number, content: string) {
    const response = await fetch(`${API_BASE_URL}/admin/group-messages/${messageId}/edit`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể chỉnh sửa tin nhắn nhóm');
    }
    return response.json();
  }

  // Settings - Language (persist on backend, no local storage)
  async getLanguage() {
    const response = await fetch(`${API_BASE_URL}/settings/language`, {
      headers: this.getHeaders(),
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      const err = new Error('Không thể lấy ngôn ngữ từ máy chủ');
      (err as any).status = response.status;
      throw err;
    }
    return response.json(); // { language }
  }

  async updateLanguage(language: string) {
    const response = await fetch(`${API_BASE_URL}/settings/language`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ language }),
      credentials: 'include',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const err = new Error(errData.message || 'Không thể cập nhật ngôn ngữ');
      (err as any).status = response.status;
      throw err;
    }
    return response.json(); // { message, language }
  }

  // Refresh token để get permissions mới
  async refreshToken() {
    const response = await fetch(`${API_BASE_URL}/admin/refresh-token`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể làm mới token');
    }

    const data = await response.json();
    
    // Cập nhật token mới vào localStorage
    if (data.token) {
      setAdminToken(data.token);
    }

    return data;
  }

  // Admin profile
  async getMyProfile() {
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải hồ sơ admin');
    }
    return response.json(); // { success, admin }
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
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể cập nhật hồ sơ admin');
    }
    return response.json(); // { success, message, admin }
  }

  // Upload image file (for avatar)
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAdminToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể upload ảnh');
    }

    return response.json(); // { success, data: { url, filename } }
  }

  // Get admin profile by ID (Super Admin only)
  async getAdminProfile(adminId: number) {
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/profile`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể tải hồ sơ admin');
    }
    return response.json(); // { success, admin }
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
    const response = await fetch(`${API_BASE_URL}/admin/admins/${adminId}/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Không thể cập nhật hồ sơ admin');
    }
    return response.json(); // { success, message, admin }
  }
}

export default new AdminService();
