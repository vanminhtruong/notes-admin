import axios from 'axios';
import { getAdminToken } from '@utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const getApiOrigin = () => {
  try {
    const u = new URL(API_BASE_URL);
    return u.origin;
  } catch {
    return window.location.origin;
  }
};

export const uploadService = {
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);

    const token = getAdminToken();
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_BASE_URL}/uploads/image`, form, {
      headers,
    });

    const origin = getApiOrigin();
    const data = response.data?.data || {};
    const url: string = data.url?.startsWith('http') ? data.url : `${origin}${data.url}`;
    return { url, filename: data.filename };
  },

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
    const form = new FormData();
    form.append('file', file);

    const token = getAdminToken();
    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_BASE_URL}/uploads/file`, form, {
      headers,
    });

    const origin = getApiOrigin();
    const data = response.data?.data || {};
    const url: string = data.url?.startsWith('http') ? data.url : `${origin}${data.url}`;
    return { url, filename: data.filename };
  },
};
