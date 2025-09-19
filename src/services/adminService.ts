import { getAdminToken } from '@utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class AdminService {
  private getHeaders() {
    const token = getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
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

    return response.json();
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
}

export default new AdminService();
