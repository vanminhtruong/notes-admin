import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldOff, LogOut } from 'lucide-react';
import { removeAdminToken, getCurrentAdminInfo, hasPermission, isSuperAdmin } from '@utils/auth';
import { useAdminPermissions } from '@hooks/useAdminPermissions';
import { useNavigate } from 'react-router-dom';

const NoPermission: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const permissionsRevision = useAdminPermissions();

  useEffect(() => {
    if (isSuperAdmin() || hasPermission('view_dashboard')) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const permissions = getCurrentAdminInfo()?.adminPermissions ?? [];
    const destinations = [
      ['manage_users.view', '/users'],
      ['manage_users.chat_settings.view', '/users/chat-settings'],
      ['manage_notes.view', '/notes'],
      ['manage_notes.archive', '/notes?tab=archived'],
      ['manage_notes.shared.view', '/notes?tab=shared'],
      ['manage_notes.shared.delete', '/notes?tab=shared'],
      ['manage_notes.folders.view', '/notes?tab=folders'],
      ['manage_notes.tags.view', '/notes?tab=tags'],
      ['manage_notes.categories.view', '/categories'],
      ['manage_notes.backgrounds.view', '/backgrounds'],
    ];
    const destination = destinations.find(([permission]) => permissions.includes(permission));
    if (destination) navigate(destination[1], { replace: true });
    else if (permissions.some(permission => permission.startsWith('manage_users.activity.'))) {
      navigate('/users/activity', { replace: true });
    }
  }, [permissionsRevision, navigate]);

  const handleLogout = () => {
    removeAdminToken();
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {t('noPermission.title', { defaultValue: 'Không có quyền truy cập' })}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('noPermission.message', { defaultValue: 'Tài khoản của bạn hiện không có quyền truy cập nào. Vui lòng liên hệ Super Admin để được cấp quyền.' })}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {t('layout.logout', { defaultValue: 'Đăng xuất' })}
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('noPermission.hint', { defaultValue: 'Quyền mới sẽ tự động cập nhật tại đây.' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoPermission;
