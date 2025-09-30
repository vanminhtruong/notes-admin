import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldOff, LogOut } from 'lucide-react';
import { removeAdminToken } from '@utils/auth';
import { useNavigate } from 'react-router-dom';

const NoPermission: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

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
            {t('noPermission.hint', { defaultValue: 'Sau khi được cấp quyền, vui lòng đăng nhập lại.' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoPermission;
