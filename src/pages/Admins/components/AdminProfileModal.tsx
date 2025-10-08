import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import ImagePreviewModal from '@components/ImagePreviewModal';
import type { Admin } from '../interfaces/admin.types';

interface AdminProfileModalProps {
  isOpen: boolean;
  admin: Admin | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  admin,
  onClose,
  onUpdate,
}) => {
  const { t } = useTranslation('admins');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image preview modal state
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && admin) {
      loadProfile();
    }
  }, [isOpen, admin]);

  const loadProfile = async () => {
    if (!admin) return;
    setLoading(true);
    try {
      const response = await adminService.getAdminProfile(admin.id) as any;
      setProfileData(response.admin);
      setFormData({
        name: response.admin.name || '',
        avatar: response.admin.avatar || '',
        phone: response.admin.phone || '',
        birthDate: response.admin.birthDate || '',
        gender: response.admin.gender || 'unspecified',
        theme: response.admin.theme || 'light',
        language: response.admin.language || 'vi',
        rememberLogin: !!response.admin.rememberLogin,
        hidePhone: !!response.admin.hidePhone,
        hideBirthDate: !!response.admin.hideBirthDate,
        allowMessagesFromNonFriends: !!response.admin.allowMessagesFromNonFriends,
      });
    } catch (error: any) {
      toast.error(error.message || t('loadProfileError', { defaultValue: 'Không thể tải hồ sơ admin' }));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('avatar.invalidFileType', { defaultValue: 'Chỉ chấp nhận file hình ảnh' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatar.fileTooLarge', { defaultValue: 'File quá lớn. Tối đa 5MB' }));
      return;
    }

    setUploading(true);
    try {
      const response = await adminService.uploadImage(file);
      const avatarUrl = response.data.url;
      const fullAvatarUrl = avatarUrl.startsWith('http') 
        ? avatarUrl 
        : `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:3000'}${avatarUrl}`;
      
      setFormData((prev: any) => ({ ...prev, avatar: fullAvatarUrl }));
      toast.success(t('avatar.uploadSuccess', { defaultValue: 'Upload avatar thành công' }));
    } catch (error: any) {
      toast.error(error.message || t('avatar.uploadFailed', { defaultValue: 'Upload avatar thất bại' }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async () => {
    if (!admin) return;
    setSaving(true);
    try {
      await adminService.updateAdminProfile(admin.id, formData);
      toast.success(t('updateProfileSuccess', { defaultValue: 'Cập nhật hồ sơ thành công' }));
      setEditMode(false);
      loadProfile();
      onUpdate?.();
    } catch (error: any) {
      toast.error(error.message || t('updateProfileError', { defaultValue: 'Cập nhật hồ sơ thất bại' }));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = (avatarSrc?: string) => {
    if (avatarSrc) {
      setImagePreviewSrc(avatarSrc);
      setImagePreviewOpen(true);
    }
  };

  if (!isOpen || !admin) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-3 sm:p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 p-4 sm:p-6 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
              {t('profileTitle', { defaultValue: 'Hồ sơ Admin' })} - {admin.name}
            </h2>
            <div className="flex items-center gap-2 justify-end">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {t('editProfile', { defaultValue: 'Sửa hồ sơ' })}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">{t('loading', { defaultValue: 'Đang tải...' })}</span>
            </div>
          ) : profileData ? (
            <div className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative flex-shrink-0">
                  <div 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    onClick={() => handleAvatarClick(editMode ? formData.avatar : profileData.avatar)}
                  >
                    {(editMode ? formData.avatar : profileData.avatar) ? (
                      <img 
                        src={editMode ? formData.avatar : profileData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-white text-lg sm:text-2xl font-semibold">
                        {profileData.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                
                {editMode && (
                  <div className="text-center sm:text-left">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('avatar.title', { defaultValue: 'Ảnh đại diện' })}
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md w-full sm:w-auto"
                      >
                        {uploading ? t('avatar.uploading', { defaultValue: 'Đang upload...' }) : t('avatar.upload', { defaultValue: 'Chọn ảnh' })}
                      </button>
                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={() => setFormData((prev: any) => ({ ...prev, avatar: '' }))}
                          disabled={uploading}
                          className="px-3 py-1.5 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded-md w-full sm:w-auto"
                        >
                          {t('avatar.remove', { defaultValue: 'Xóa ảnh' })}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('avatar.hint', { defaultValue: 'JPG, PNG hoặc GIF. Tối đa 5MB.' })}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              {/* Profile Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('name', { defaultValue: 'Họ và tên' })}
                  </label>
                  {editMode ? (
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <p className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-gray-900 dark:text-gray-100">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Email</label>
                  <p className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">{profileData.email}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('adminLevel', { defaultValue: 'Cấp độ' })}
                  </label>
                  <p className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base text-gray-500 dark:text-gray-400">{profileData.adminLevel}</p>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('phone', { defaultValue: 'Số điện thoại' })}
                  </label>
                  {editMode ? (
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                      placeholder="+84 912 345 678"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-900 dark:text-gray-100">{profileData.phone || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('birthDate', { defaultValue: 'Ngày sinh' })}
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-900 dark:text-gray-100">{profileData.birthDate || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('gender', { defaultValue: 'Giới tính' })}
                  </label>
                  {editMode ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="unspecified">{t('genderOptions.unspecified', { defaultValue: 'Không xác định' })}</option>
                      <option value="male">{t('genderOptions.male', { defaultValue: 'Nam' })}</option>
                      <option value="female">{t('genderOptions.female', { defaultValue: 'Nữ' })}</option>
                      <option value="other">{t('genderOptions.other', { defaultValue: 'Khác' })}</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 text-gray-900 dark:text-gray-100">
                      {profileData.gender === 'male' ? t('genderOptions.male', { defaultValue: 'Nam' }) :
                       profileData.gender === 'female' ? t('genderOptions.female', { defaultValue: 'Nữ' }) :
                       profileData.gender === 'other' ? t('genderOptions.other', { defaultValue: 'Khác' }) :
                       t('genderOptions.unspecified', { defaultValue: 'Không xác định' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Settings */}
              {editMode && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('settings', { defaultValue: 'Cài đặt' })}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        name="rememberLogin" 
                        checked={formData.rememberLogin} 
                        onChange={handleInputChange} 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('rememberLogin', { defaultValue: 'Ghi nhớ đăng nhập' })}
                      </span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        name="hidePhone" 
                        checked={formData.hidePhone} 
                        onChange={handleInputChange} 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('hidePhone', { defaultValue: 'Ẩn số điện thoại' })}
                      </span>
                    </label>
                  </div>
                </div>
              )}

            </div>
          ) : null}
        </div>
        
        {/* Footer - Fixed (chỉ hiện khi edit mode) */}
        {editMode && (
          <div className="border-t border-gray-200 dark:border-neutral-600 p-4 sm:p-6 flex-shrink-0">
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    name: profileData.name || '',
                    avatar: profileData.avatar || '',
                    phone: profileData.phone || '',
                    birthDate: profileData.birthDate || '',
                    gender: profileData.gender || 'unspecified',
                    theme: profileData.theme || 'light',
                    language: profileData.language || 'vi',
                    rememberLogin: !!profileData.rememberLogin,
                    hidePhone: !!profileData.hidePhone,
                    hideBirthDate: !!profileData.hideBirthDate,
                    allowMessagesFromNonFriends: !!profileData.allowMessagesFromNonFriends,
                  });
                }}
                disabled={saving}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 w-full sm:w-auto"
              >
                {t('cancel', { defaultValue: 'Hủy' })}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg w-full sm:w-auto"
              >
                {saving ? t('saving', { defaultValue: 'Đang lưu...' }) : t('save', { defaultValue: 'Lưu' })}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={imagePreviewOpen}
        src={imagePreviewSrc}
        alt="Admin Avatar"
        onClose={() => {
          setImagePreviewOpen(false);
          setImagePreviewSrc(null);
        }}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AdminProfileModal;
