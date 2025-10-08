import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { User } from '../interfaces';
import { hasPermission } from '@utils/auth';
import adminService from '@services/adminService';
import { X, Edit, Save, XCircle, User as UserIcon, Mail, Phone, Calendar, Users, Shield, Settings, Eye, EyeOff, Clock, Camera, Key } from 'lucide-react';
import { validateEditUser } from '../validates/userValidations';
import { toYMD, formatDateOnly } from '@utils/date';

interface UserDetailModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  formatDate: (date: string) => string;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
  onUserUpdated?: (updatedUser: User) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, user, onClose, formatDate, getStatusBadge, getRoleBadge, onUserUpdated }) => {
  const { t } = useTranslation('users');
  const canEdit = hasPermission('manage_users.edit');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: 'unspecified',
    avatar: '',
    password: ''
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);


  // Initialize edit data when user changes or editing starts
  useEffect(() => {
    if (user && isEditing) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        birthDate: toYMD(user.birthDate),
        gender: user.gender || 'unspecified',
        avatar: user.avatar || '',
        password: ''
      });
    }
  }, [user, isEditing]);

  // Close with ESC (chỉ khi modal mở)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, isEditing]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: toYMD(user?.birthDate),
      gender: user?.gender || 'unspecified',
      avatar: user?.avatar || '',
      password: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    
    const { valid, messages } = validateEditUser({
      name: editData.name,
      email: editData.email,
      phone: editData.phone,
      birthDate: editData.birthDate,
      gender: editData.gender,
    }, t);
    if (!valid) {
      // Hiển thị thông báo lỗi đầu tiên
      if (messages[0]) toast.error(messages[0]);
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await adminService.editUser(user.id, {
        name: editData.name.trim(),
        email: editData.email.trim(),
        phone: editData.phone.trim() || undefined,
        birthDate: editData.birthDate || undefined,
        gender: editData.gender,
        avatar: editData.avatar?.trim() || undefined,
        password: editData.password?.trim() ? editData.password.trim() : undefined,
      });

      toast.success(t('edit.success'));
      setIsEditing(false);

      // Call callback to update user data in parent component (axios interceptor đã unwrap data)
      const resp: any = response as any;
      const updatedUserRaw: Partial<User> | undefined = resp?.user || resp?.data?.user;
      if (onUserUpdated && updatedUserRaw) {
        // Giữ lại password hash nếu backend không trả về (phòng trường hợp proxy/transform strip)
        const merged: User = {
          ...(user as User),
          ...(updatedUserRaw as User),
          password: (updatedUserRaw as any)?.password ?? (user as any)?.password,
        };
        onUserUpdated(merged);
      }
    } catch (error: any) {
      toast.error(error.message || t('edit.failed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleClickChangeAvatar = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSelectAvatar: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingAvatar(true);
      const resp = await adminService.uploadImage(file);
      const url = resp?.data?.url || resp?.url;
      if (!url) throw new Error('Không thể upload ảnh');
      setEditData(prev => ({ ...prev, avatar: url }));
      toast.success(t('edit.changeAvatarSuccess') as string);
    } catch (err: any) {
      toast.error(err?.message || t('edit.changeAvatarFailed'));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!open || !user) return null;

  const modal = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-auto" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl xl-down:max-w-xl lg-down:max-w-lg md-down:max-w-md sm-down:max-w-sm xs-down:max-w-[95%] mx-4 xl-down:mx-3 sm-down:mx-2 bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md shadow-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden max-h-[90vh] xl-down:max-h-[92vh] sm-down:max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 xl-down:px-5 lg-down:px-4 md-down:px-3.5 sm-down:px-3 xs-down:px-2.5 py-4 xl-down:py-3.5 lg-down:py-3 md-down:py-2.5 sm-down:py-2 bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-3 xl-down:gap-2.5 sm-down:gap-2 min-w-0">
            <UserIcon className="w-6 h-6 xl-down:w-5 xl-down:h-5 md-down:w-4.5 md-down:h-4.5 sm-down:w-4 sm-down:h-4 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg xl-down:text-base md-down:text-sm sm-down:text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
              {isEditing ? t('edit.title') : t('detail.title')}
            </h3>
          </div>
        {/* Hidden file input for avatar upload */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleSelectAvatar} />
          <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1">
            {!isEditing && canEdit && (
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 px-3 xl-down:px-2.5 md-down:px-2 sm-down:px-1.5 py-1.5 xl-down:py-1 sm-down:py-0.5 text-sm xl-down:text-xs sm-down:text-[10px] bg-blue-600 text-white rounded-lg xl-down:rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                <span className="sm-down:hidden">{t('edit.button')}</span>
              </button>
            )}
            {isEditing && (
              <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 px-3 xl-down:px-2.5 md-down:px-2 sm-down:px-1.5 py-1.5 xl-down:py-1 sm-down:py-0.5 text-sm xl-down:text-xs sm-down:text-[10px] bg-green-600 text-white rounded-lg xl-down:rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                  <span className="sm-down:hidden">{isSaving ? t('edit.saving') : t('edit.save')}</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 px-3 xl-down:px-2.5 md-down:px-2 sm-down:px-1.5 py-1.5 xl-down:py-1 sm-down:py-0.5 text-sm xl-down:text-xs sm-down:text-[10px] bg-gray-500 text-white rounded-lg xl-down:rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 sm-down:w-3 sm-down:h-3" />
                  <span className="sm-down:hidden">{t('edit.cancel')}</span>
                </button>
              </div>
            )}
            <button
              onClick={isEditing ? handleCancelEdit : onClose}
              className="p-2 xl-down:p-1.5 sm-down:p-1 rounded-lg xl-down:rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label={t('detail.close') as string}
            >
              <X className="w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 space-y-6 xl-down:space-y-5 lg-down:space-y-4 md-down:space-y-3.5 sm-down:space-y-3 overflow-y-auto flex-1">
          {/* Top: Avatar + Basic info */}
          <div className="flex items-center gap-4 xl-down:gap-3 sm-down:gap-2.5">
            {(isEditing ? (editData.avatar || user.avatar) : user.avatar) ? (
              <div className="relative">
                <img src={(isEditing ? (editData.avatar || user.avatar) : user.avatar) as string} alt={user.name} className="w-16 h-16 xl-down:w-14 xl-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10 rounded-full object-cover" />
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleClickChangeAvatar}
                    className="absolute -bottom-1 -right-1 -translate-x-1/4 -translate-y-1/4 p-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 disabled:opacity-50"
                    disabled={uploadingAvatar}
                    title={t('edit.changeAvatar') as string}
                  >
                    {uploadingAvatar ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-16 h-16 xl-down:w-14 xl-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl xl-down:text-lg md-down:text-base sm-down:text-sm font-semibold">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleClickChangeAvatar}
                    className="absolute -bottom-1 -right-1 -translate-x-1/4 -translate-y-1/4 p-1 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 disabled:opacity-50"
                    disabled={uploadingAvatar}
                    title={t('edit.changeAvatar') as string}
                  >
                    {uploadingAvatar ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 flex-wrap">
                <h4 className="text-xl xl-down:text-lg md-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</h4>
                {getRoleBadge(user.role)}
                {getStatusBadge(!!user.isActive)}
                {user.isOnline ? (
                  <span className="px-2 xl-down:px-1.5 sm-down:px-1 py-0.5 xl-down:py-0 text-xs xl-down:text-[10px] sm-down:text-[9px] rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">{t('online')}</span>
                ) : (
                  <span className="px-2 xl-down:px-1.5 sm-down:px-1 py-0.5 xl-down:py-0 text-xs xl-down:text-[10px] sm-down:text-[9px] rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{t('offline')}</span>
                )}
              </div>
              <p className="text-sm xl-down:text-xs sm-down:text-[11px] text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2.5">
            <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1">
              <UserIcon className="w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5 text-blue-500" />
              <h5 className="text-base xl-down:text-sm sm-down:text-xs font-semibold text-gray-900 dark:text-gray-100">{t('personalInfo')}</h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl-down:gap-3 sm-down:gap-2.5">
              {/* Name */}
              <div className="space-y-1 xl-down:space-y-0.5">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('name')}</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 xl-down:px-2.5 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 text-sm xl-down:text-xs sm-down:text-[11px] border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                )}
              </div>

              {/* Email (immutable) */}
              <div className="space-y-1 xl-down:space-y-0.5">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" />
                  {t('email')}
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    disabled
                    readOnly
                    title="Email không thể thay đổi"
                    className="w-full px-3 xl-down:px-2.5 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 text-sm xl-down:text-xs sm-down:text-[11px] border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                ) : (
                  <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1 xl-down:space-y-0.5 sm:col-span-2">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Key className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" />
                  {t('password')}
                </label>
                {isEditing ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={editData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder={t('edit.newPasswordPlaceholder') || 'Nhập mật khẩu mới (để trống nếu không đổi)'}
                        className="w-full pr-10 pl-3 xl-down:pl-2.5 sm-down:pl-2 py-2 xl-down:py-1.5 sm-down:py-1 text-sm xl-down:text-xs sm-down:text-[11px] border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] text-gray-500 dark:text-gray-400">{t('edit.passwordHint') || 'Để trống nếu không muốn thay đổi. Tối thiểu 6 ký tự.'}</p>
                  </div>
                ) : (
                  <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-mono text-gray-600 dark:text-gray-400 break-all">{user.password || t('notAvailable')}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1 xl-down:space-y-0.5">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" />
                  {t('phone')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('phoneOptional')}
                    className="w-full px-3 xl-down:px-2.5 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 text-sm xl-down:text-xs sm-down:text-[11px] border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.phone || t('notProvided')}</p>
                )}
              </div>

              {/* Birth Date */}
              <div className="space-y-1 xl-down:space-y-0.5">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" />
                  {t('birthDate')}
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={editData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-3 xl-down:px-2.5 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 text-sm xl-down:text-xs sm-down:text-[11px] border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.birthDate ? formatDateOnly(user.birthDate) : t('notProvided')}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1 xl-down:space-y-0.5">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" />
                  {t('genderLabel')}
                </label>
                {isEditing ? (
                  <select
                    value={editData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3 xl-down:px-2.5 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 text-sm xl-down:text-xs sm-down:text-[11px] border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">{t('gender.male')}</option>
                    <option value="female">{t('gender.female')}</option>
                    <option value="other">{t('gender.other')}</option>
                    <option value="unspecified">{t('gender.unspecified')}</option>
                  </select>
                ) : (
                  <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{t(`gender.${user.gender || 'unspecified'}`)}</p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-1 xl-down:space-y-0.5">
                <label className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 sm-down:w-2 sm-down:h-2" />
                  {t('role')}
                </label>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.role}</p>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2.5">
            <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1">
              <Settings className="w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5 text-purple-500" />
              <h5 className="text-base xl-down:text-sm sm-down:text-xs font-semibold text-gray-900 dark:text-gray-100">{t('accountSettings')}</h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl-down:gap-3 sm-down:gap-2.5">
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('theme')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.theme || 'light'}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('language')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.language || 'en'}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('e2eeEnabled')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.e2eeEnabled ? t('enabled') : t('disabled')}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('readStatusEnabled')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.readStatusEnabled ? t('enabled') : t('disabled')}</p>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2.5">
            <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1">
              <Eye className="w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5 text-green-500" />
              <h5 className="text-base xl-down:text-sm sm-down:text-xs font-semibold text-gray-900 dark:text-gray-100">{t('privacySettings')}</h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl-down:gap-3 sm-down:gap-2.5">
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('hidePhone')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.hidePhone ? t('hidden') : t('visible')}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('hideBirthDate')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.hideBirthDate ? t('hidden') : t('visible')}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('allowMessagesFromNonFriends')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.allowMessagesFromNonFriends ? t('allowed') : t('blocked')}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2.5">
            <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1">
              <Clock className="w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5 text-orange-500" />
              <h5 className="text-base xl-down:text-sm sm-down:text-xs font-semibold text-gray-900 dark:text-gray-100">{t('timestamps')}</h5>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl-down:gap-3 sm-down:gap-2.5">
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('createdAt')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{formatDate(user.createdAt)}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('updatedAt')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.updatedAt ? formatDate(user.updatedAt) : t('notAvailable')}</p>
              </div>
              <div className="space-y-1 xl-down:space-y-0.5">
                <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('lastSeenAt')}</p>
                <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100">{user.lastSeenAt ? formatDate(user.lastSeenAt) : t('neverLoggedIn')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};

export default UserDetailModal;
