import { useAdminPermissions } from '@hooks/useAdminPermissions';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { toast } from 'react-toastify';
import AdminProfileEditForm from './components/AdminProfileEditForm';
import ImagePreviewModal from '@components/ImagePreviewModal';
import { hasPermission, isSuperAdmin } from '@utils/auth';

interface AdminProfileData {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  isActive: boolean;
  theme: 'light' | 'dark';
  language: string;
  rememberLogin: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  allowMessagesFromNonFriends: boolean;
  role: 'admin' | 'user';
  adminLevel?: 'super_admin' | 'sub_admin' | 'dev' | 'mod' | null;
  adminPermissions?: string[] | null;
  lastSeenAt?: string | null;
  createdAt?: string | null;
}

const AdminProfile: React.FC = () => {
  useAdminPermissions();
  const { t } = useTranslation('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<AdminProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const canView = isSuperAdmin() || hasPermission('profile.self.view');
  const canEdit = isSuperAdmin() || hasPermission('profile.self.edit');

  const load = async () => {
    setLoading(true);
    try {
      const res: any = await adminService.getMyProfile();
      setData(res?.admin || null);
    } catch (e: any) {
      // Nếu có error message cụ thể từ server thì hiển thị, còn không thì dùng key dịch
      const errorMessage = e?.message && e.message !== 'Failed to load profile' && e.message !== 'Không thể tải hồ sơ' 
        ? e.message 
        : t('loadFailed', { defaultValue: 'Không thể tải hồ sơ' });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) {
      load();
    } else {
      setLoading(false);
    }
  }, [canView]);

  // Realtime: khi hồ sơ cập nhật từ nơi khác
  useEffect(() => {
    const s = getAdminSocket();
    const onUpdated = (p: any) => {
      if (p?.admin) setData(p.admin);
    };
    try { s.on('admin_profile_updated', onUpdated); } catch {}
    return () => { try { s.off('admin_profile_updated', onUpdated); } catch {} };
  }, []);

  const onSubmit = async (patch: Partial<AdminProfileData>) => {
    setSaving(true);
    try {
      const res: any = await adminService.updateMyProfile(patch as any);
      setData(res?.admin || null);
      toast.success(t('messages.updateSuccess', { defaultValue: 'Cập nhật hồ sơ thành công' }));
      setEditMode(false);
    } catch (e: any) {
      // Nếu có error message cụ thể từ server thì hiển thị, còn không thì dùng key dịch
      const errorMessage = e?.message && e.message !== 'Update failed' && e.message !== 'Cập nhật thất bại' 
        ? e.message 
        : t('messages.updateFailed', { defaultValue: 'Cập nhật thất bại' });
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 xl-down:p-4 sm-down:p-3">
        <div className="flex flex-col items-center justify-center py-16 xl-down:py-12 sm-down:py-8">
          <div className="relative">
            <div className="w-16 h-16 xl-down:w-12 xl-down:h-12 rounded-full border-4 border-cyan-100 dark:border-cyan-900/30"></div>
            <div className="absolute top-0 left-0 w-16 h-16 xl-down:w-12 xl-down:h-12 rounded-full border-4 border-transparent border-t-cyan-600 animate-spin"></div>
          </div>
          <span className="mt-4 text-gray-500 dark:text-gray-400 font-medium">{t('loading', { defaultValue: 'Đang tải...' })}</span>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto p-6 xl-down:p-4 sm-down:p-3">
        <div className="text-center py-16 xl-down:py-12 sm-down:py-8">
          <div className="w-20 h-20 xl-down:w-16 xl-down:h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 flex items-center justify-center">
            <svg className="w-10 h-10 xl-down:w-8 xl-down:h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium text-lg xl-down:text-base">{t('noPermission', { defaultValue: 'Bạn không có quyền xem hồ sơ' })}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-6 xl-down:p-4 sm-down:p-3">
        <div className="text-center py-16 xl-down:py-12 sm-down:py-8">
          <div className="w-20 h-20 xl-down:w-16 xl-down:h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
            <svg className="w-10 h-10 xl-down:w-8 xl-down:h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium text-lg xl-down:text-base">{t('loadFailed', { defaultValue: 'Không thể tải hồ sơ' })}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-5 md:p-6">
      {/* Header Section */}
      <div className="relative mb-6 xl-down:mb-5 sm-down:mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 via-blue-600/5 to-indigo-600/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-indigo-500/10 rounded-2xl xl-down:rounded-xl -z-10" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 xl-down:p-4 sm-down:p-3">
          <div className="flex items-center gap-4 xl-down:gap-3">
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 sm-down:w-10 sm-down:h-10 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 dark:shadow-cyan-500/15">
              <svg className="w-7 h-7 xl-down:w-6 xl-down:h-6 sm-down:w-5 sm-down:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{t('title', { defaultValue: 'Hồ sơ Admin' })}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm xl-down:text-xs">{t('subtitle', { defaultValue: 'Quản lý thông tin cá nhân' })}</p>
            </div>
          </div>
          {!editMode && canEdit && (
            <button
              onClick={() => setEditMode(true)}
              className="group px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl xl-down:rounded-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 flex items-center gap-2.5 text-sm xl-down:text-xs font-medium w-full sm:w-auto justify-center"
            >
              <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{t('edit', { defaultValue: 'Sửa thông tin' })}</span>
            </button>
          )}
        </div>
      </div>

      {!editMode && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6 xl-down:p-5 sm-down:p-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 xl-down:gap-5 sm-down:gap-4">
            {/* Avatar */}
            <button
              type="button"
              onClick={() => data.avatar && setPreviewOpen(true)}
              className="group relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xl shadow-cyan-500/20 focus:outline-none focus:ring-4 focus:ring-cyan-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/30"
              title={data.avatar ? t('previewAvatar', { defaultValue: 'Xem ảnh đại diện' }) : undefined}
            >
              {data.avatar ? (
                <img src={data.avatar} alt="avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <span className="text-white text-3xl sm:text-4xl font-bold">{data.email.charAt(0).toUpperCase()}</span>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-neutral-900"></div>
            </button>
            
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl-down:gap-3 w-full">
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('name', { defaultValue: 'Họ và tên' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm">{data.name}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Email</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm truncate">{data.email}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('level', { defaultValue: 'Cấp độ' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20 text-cyan-700 dark:text-cyan-300 text-sm xl-down:text-xs font-medium border border-cyan-200/50 dark:border-cyan-700/50">
                    {data.adminLevel || '-'}
                  </span>
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('phone', { defaultValue: 'Số điện thoại' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm">{data.phone || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('birthDate', { defaultValue: 'Ngày sinh' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm">{data.birthDate || '-'}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('gender.title', { defaultValue: 'Giới tính' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm capitalize">{data.gender}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('language', { defaultValue: 'Ngôn ngữ' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm uppercase">{data.language}</p>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800/50 rounded-xl xl-down:rounded-lg p-4 xl-down:p-3">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{t('theme.title', { defaultValue: 'Giao diện' })}</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-base xl-down:text-sm capitalize">{data.theme}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {editMode && (
        <AdminProfileEditForm
          data={data}
          saving={saving}
          onCancel={() => setEditMode(false)}
          onSubmit={onSubmit}
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal
        open={previewOpen}
        src={data?.avatar}
        alt={data?.name || data?.email}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  );
};

export default AdminProfile;
