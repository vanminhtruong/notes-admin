import React, { useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';

interface Props {
  data: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    birthDate?: string | null;
    gender: 'male' | 'female' | 'other' | 'unspecified';
    theme: 'light' | 'dark';
    language: string;
    rememberLogin: boolean;
    hidePhone: boolean;
    hideBirthDate: boolean;
    allowMessagesFromNonFriends: boolean;
    adminLevel?: 'super_admin' | 'sub_admin' | 'dev' | 'mod' | null;
  };
  saving: boolean;
  onCancel: () => void;
  onSubmit: (patch: Partial<Props['data']>) => Promise<void> | void;
}

const AdminProfileEditForm: React.FC<Props> = ({ data, saving, onCancel, onSubmit }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({
    name: data.name || '',
    avatar: data.avatar || '',
    phone: data.phone || '',
    birthDate: data.birthDate || '',
    gender: data.gender || 'unspecified',
    theme: data.theme || 'light',
    language: data.language || 'vi',
    rememberLogin: !!data.rememberLogin,
    hidePhone: !!data.hidePhone,
    hideBirthDate: !!data.hideBirthDate,
    allowMessagesFromNonFriends: !!data.allowMessagesFromNonFriends,
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = useMemo(() => {
    return form.name.trim().length >= 2;
  }, [form.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('avatar.invalidFileType', { defaultValue: 'Chỉ chấp nhận file hình ảnh' }));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatar.fileTooLarge', { defaultValue: 'File quá lớn. Tối đa 5MB' }));
      return;
    }

    setUploading(true);
    try {
      const response = await adminService.uploadImage(file);
      const avatarUrl = response.data.url;
      console.log('Avatar uploaded:', avatarUrl); // Debug log
      
      // Ensure URL is complete (add base URL if needed)
      const fullAvatarUrl = avatarUrl.startsWith('http') 
        ? avatarUrl 
        : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${avatarUrl}`;
      console.log('Full avatar URL:', fullAvatarUrl);
      
      setForm((prev) => ({ ...prev, avatar: fullAvatarUrl }));
      toast.success(t('avatar.uploadSuccess', { defaultValue: 'Upload avatar thành công' }));
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      toast.error(error.message || t('avatar.uploadFailed', { defaultValue: 'Upload avatar thất bại' }));
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setForm((prev) => ({ ...prev, avatar: '' }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit({ ...form });
  };

  return (
    <form onSubmit={submit} className="bg-white dark:bg-neutral-900 rounded-xl shadow border border-gray-200 dark:border-neutral-800 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
            {form.avatar ? (
              <img 
                key={form.avatar}
                src={form.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  console.error('Failed to load avatar image:', form.avatar);
                  // Reset avatar on error instead of manipulating DOM
                  setForm((prev) => ({ ...prev, avatar: '' }));
                }}
              />
            ) : (
              <span className="text-white text-lg sm:text-2xl font-semibold">{data.email.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {t('avatar.title', { defaultValue: 'Ảnh đại diện' })}
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md w-full sm:w-auto"
            >
              {uploading ? t('avatar.uploading', { defaultValue: 'Đang upload...' }) : t('avatar.upload', { defaultValue: 'Chọn ảnh' })}
            </button>
            {form.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={uploading}
                className="px-3 py-1.5 text-xs bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-md w-full sm:w-auto"
              >
                {t('avatar.remove', { defaultValue: 'Xóa ảnh' })}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('avatar.hint', { defaultValue: 'JPG, PNG hoặc GIF. Tối đa 5MB.' })}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('name', { defaultValue: 'Họ và tên' })}</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            placeholder={t('namePlaceholder', { defaultValue: 'Nhập họ và tên' })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
          <input value={data.email} disabled className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('level', { defaultValue: 'Cấp độ' })}</label>
          <input value={data.adminLevel || '-'} disabled className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800 text-gray-500" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('phone', { defaultValue: 'Số điện thoại' })}</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            placeholder="+84 912 345 678"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('birthDate', { defaultValue: 'Ngày sinh' })}</label>
          <input
            type="date"
            name="birthDate"
            value={form.birthDate || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('gender.title', { defaultValue: 'Giới tính' })}</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          >
            <option value="unspecified">{t('gender.unspecified', { defaultValue: 'Không xác định' })}</option>
            <option value="male">{t('gender.male', { defaultValue: 'Nam' })}</option>
            <option value="female">{t('gender.female', { defaultValue: 'Nữ' })}</option>
            <option value="other">{t('gender.other', { defaultValue: 'Khác' })}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('language', { defaultValue: 'Ngôn ngữ' })}</label>
          <input
            name="language"
            value={form.language}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            placeholder="vi"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('theme.title', { defaultValue: 'Giao diện' })}</label>
          <select
            name="theme"
            value={form.theme}
            onChange={handleChange}
            className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          >
            <option value="light">{t('theme.light', { defaultValue: 'Sáng' })}</option>
            <option value="dark">{t('theme.dark', { defaultValue: 'Tối' })}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <label className="flex items-start gap-3">
          <input type="checkbox" name="rememberLogin" checked={form.rememberLogin} onChange={handleChange} className="mt-0.5" />
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">{t('rememberLogin', { defaultValue: 'Ghi nhớ đăng nhập' })}</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="hidePhone" checked={form.hidePhone} onChange={handleChange} className="mt-0.5" />
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">{t('hidePhone', { defaultValue: 'Ẩn số điện thoại' })}</span>
        </label>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="hideBirthDate" checked={form.hideBirthDate} onChange={handleChange} className="mt-0.5" />
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">{t('hideBirthDate', { defaultValue: 'Ẩn ngày sinh' })}</span>
        </label>
        <label className="flex items-start gap-3 sm:col-span-2 lg:col-span-1 xl:col-span-1">
          <input type="checkbox" name="allowMessagesFromNonFriends" checked={form.allowMessagesFromNonFriends} onChange={handleChange} className="mt-0.5" />
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-tight">{t('allowMessagesFromNonFriends', { defaultValue: 'Cho phép người lạ nhắn tin' })}</span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-300 dark:border-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-700 w-full sm:w-auto">
          {t('actions.cancel', { defaultValue: 'Hủy' })}
        </button>
        <button
          type="submit"
          disabled={!canSubmit || saving}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg w-full sm:w-auto"
        >
          {saving ? t('actions.saving', { defaultValue: 'Đang lưu...' }) : t('actions.save', { defaultValue: 'Lưu' })}
        </button>
      </div>
    </form>
  );
};

export default AdminProfileEditForm;
