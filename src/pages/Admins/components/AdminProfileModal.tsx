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
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-gray-200 dark:border-neutral-700">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
            {t('profileTitle', { defaultValue: 'Hồ sơ Admin' })} - {admin.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loading', { defaultValue: 'Đang tải...' })}</span>
            </div>
          ) : profileData ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Avatar Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-neutral-700">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <div 
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-300 dark:hover:ring-blue-600 transition-all shadow-lg"
                      onClick={() => handleAvatarClick(editMode ? formData.avatar : profileData.avatar)}
                    >
                      {(editMode ? formData.avatar : profileData.avatar) ? (
                        <img 
                          src={editMode ? formData.avatar : profileData.avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-white text-2xl sm:text-3xl font-bold">
                          {profileData.email.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {profileData.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {profileData.email}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {profileData.adminLevel === 'super_admin' ? 'Super Admin' : profileData.adminLevel === 'dev' ? 'Developer' : profileData.adminLevel === 'mod' ? 'Moderator' : 'Sub Admin'}
                    </div>
                    
                    {editMode && (
                      <div className="mt-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-1 w-full sm:w-auto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {uploading ? t('avatar.uploading', { defaultValue: 'Đang upload...' }) : t('avatar.upload', { defaultValue: 'Chọn ảnh' })}
                          </button>
                          {formData.avatar && (
                            <button
                              type="button"
                              onClick={() => setFormData((prev: any) => ({ ...prev, avatar: '' }))}
                              disabled={uploading}
                              className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-1 w-full sm:w-auto"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {t('avatar.remove', { defaultValue: 'Xóa ảnh' })}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
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
                </div>
              </div>

              {/* Profile Information */}
              <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-neutral-700">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {t('personalInfo', { defaultValue: 'Thông tin cá nhân' })}
                  </h3>
                </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('name', { defaultValue: 'Họ và tên' })}
                  </label>
                  {editMode ? (
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-neutral-900 rounded-md text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-neutral-700">{profileData.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <p className="px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-neutral-900 rounded-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700">{profileData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('adminLevel', { defaultValue: 'Cấp độ' })}
                  </label>
                  <p className="px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-neutral-900 rounded-md text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700">{profileData.adminLevel}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('phone', { defaultValue: 'Số điện thoại' })}
                  </label>
                  {editMode ? (
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="+84 912 345 678"
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-neutral-900 rounded-md text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-neutral-700">{profileData.phone || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('birthDate', { defaultValue: 'Ngày sinh' })}
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  ) : (
                    <p className="px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-neutral-900 rounded-md text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-neutral-700">{profileData.birthDate || '-'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('gender', { defaultValue: 'Giới tính' })}
                  </label>
                  {editMode ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-md border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="unspecified">{t('genderOptions.unspecified', { defaultValue: 'Không xác định' })}</option>
                      <option value="male">{t('genderOptions.male', { defaultValue: 'Nam' })}</option>
                      <option value="female">{t('genderOptions.female', { defaultValue: 'Nữ' })}</option>
                      <option value="other">{t('genderOptions.other', { defaultValue: 'Khác' })}</option>
                    </select>
                  ) : (
                    <p className="px-3 py-2 text-sm sm:text-base bg-gray-50 dark:bg-neutral-900 rounded-md text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-neutral-700">
                      {profileData.gender === 'male' ? t('genderOptions.male', { defaultValue: 'Nam' }) :
                       profileData.gender === 'female' ? t('genderOptions.female', { defaultValue: 'Nữ' }) :
                       profileData.gender === 'other' ? t('genderOptions.other', { defaultValue: 'Khác' }) :
                       t('genderOptions.unspecified', { defaultValue: 'Không xác định' })}
                    </p>
                  )}
                </div>
              </div>
              </div>

              {/* Settings */}
              {editMode && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {t('settings', { defaultValue: 'Cài đặt' })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="rememberLogin" 
                        checked={formData.rememberLogin} 
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t('rememberLogin', { defaultValue: 'Ghi nhớ đăng nhập' })}
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="hidePhone" 
                        checked={formData.hidePhone} 
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
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
        
        {/* Footer - Fixed */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-neutral-700 flex-shrink-0">
          {editMode ? (
            <>
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
                className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
              >
                {t('cancel', { defaultValue: 'Hủy' })}
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || uploading}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md transition-colors w-full sm:w-auto"
              >
                {saving ? t('saving', { defaultValue: 'Đang lưu...' }) : t('save', { defaultValue: 'Lưu' })}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t('editProfile', { defaultValue: 'Chỉnh sửa' })}
            </button>
          )}
        </div>
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
