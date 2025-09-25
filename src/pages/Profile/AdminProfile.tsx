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
      const res = await adminService.getMyProfile();
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
      const res = await adminService.updateMyProfile(patch as any);
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
      <div className="max-w-3xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-40 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 dark:text-red-400">{t('noPermission', { defaultValue: 'Bạn không có quyền xem hồ sơ' })}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-600 dark:text-red-400">{t('loadFailed', { defaultValue: 'Không thể tải hồ sơ' })}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{t('title', { defaultValue: 'Hồ sơ Admin' })}</h1>
        {!editMode && canEdit && (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            {t('edit', { defaultValue: 'Sửa thông tin' })}
          </button>
        )}
      </div>

      {!editMode && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow border border-gray-200 dark:border-neutral-800 p-6">
          <div className="flex items-start gap-6">
            <button
              type="button"
              onClick={() => data.avatar && setPreviewOpen(true)}
              className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              title={data.avatar ? t('previewAvatar', { defaultValue: 'Xem ảnh đại diện' }) : undefined}
            >
              {data.avatar ? (
                <img src={data.avatar} alt="avatar" className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" />
              ) : (
                <span className="text-white text-3xl font-semibold">{data.email.charAt(0).toUpperCase()}</span>
              )}
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('name', { defaultValue: 'Họ và tên' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('level', { defaultValue: 'Cấp độ' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.adminLevel || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('phone', { defaultValue: 'Số điện thoại' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('birthDate', { defaultValue: 'Ngày sinh' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.birthDate || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('gender.title', { defaultValue: 'Giới tính' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('language', { defaultValue: 'Ngôn ngữ' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.language}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('theme.title', { defaultValue: 'Giao diện' })}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{data.theme}</p>
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
