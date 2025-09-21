import React from 'react';
import { useTranslation } from 'react-i18next';
import { isSuperAdmin } from '@utils/auth';
import type { Admin } from '../interfaces/admin.types';

interface AdminCardProps {
  admin: Admin;
  currentAdmin?: any;
  onEdit: (admin: Admin) => void;
  onToggleStatus: (adminId: number) => void;
  onDelete: (adminId: number) => void;
  onRevokePermission: (adminId: number, permission: string) => void;
}

const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  currentAdmin,
  onEdit,
  onToggleStatus,
  onDelete,
  onRevokePermission,
}) => {
  const { t, i18n } = useTranslation('admins');
  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';

  // Chỉ Super Admin mới có thể modify các admin khác
  const canModify = isSuperAdmin() && 
    admin.adminLevel !== 'super_admin' && 
    admin.id !== currentAdmin?.id;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {admin.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.name}
              className="w-10 h-10 xl-down:w-9 xl-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 xl-down:w-9 xl-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-300 font-medium">
                {admin.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100">{admin.name}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-2xs text-gray-600 dark:text-gray-400">{admin.email}</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 xl-down:gap-1.5 sm-down:gap-1">
          <span className="px-2 py-1 sm-down:py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs xl-down:text-xs sm-down:text-2xs font-medium rounded-full">
            {admin.adminLevel === 'super_admin' ? t('superAdmin') : 
             admin.adminLevel === 'sub_admin' ? t('subAdmin') :
             admin.adminLevel === 'dev' ? t('dev') :
             admin.adminLevel === 'mod' ? t('mod') : 'Admin'}
          </span>
          <span className={`px-2 py-1 sm-down:py-0.5 text-xs xl-down:text-xs sm-down:text-2xs font-medium rounded-full ${getStatusColor(admin.isActive)}`}>
            {admin.isActive ? t('active') : t('inactive')}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="text-sm xl-down:text-xs sm-down:text-2xs font-medium text-gray-700 dark:text-gray-300 mb-2">{t('permissionsLabel')}</h4>
        <div className="flex flex-wrap gap-1 sm-down:gap-0.5">
          {admin.adminPermissions?.slice(0, 3).map((permission: string) => (
            <div
              key={permission}
              className="group relative flex items-center px-2 py-1 sm-down:py-0.5 text-xs xl-down:text-2xs sm-down:text-2xs bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
            >
              <span>{t(`permissions.${permission}.label`, { defaultValue: permission })}</span>
              {canModify && (
                <button
                  onClick={() => onRevokePermission(admin.id, permission)}
                  className="ml-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                  title={t('revokePermission')}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {admin.adminPermissions?.length > 3 && (
            <span className="px-2 py-1 sm-down:py-0.5 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 text-xs xl-down:text-2xs sm-down:text-2xs rounded">
              +{admin.adminPermissions.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 text-xs xl-down:text-[11px] sm-down:text-2xs text-gray-500 dark:text-gray-400">
        {t('createdAt')}: {new Date(admin.createdAt).toLocaleDateString(
          i18n.language === 'vi' ? 'vi-VN' : i18n.language === 'ko' ? 'ko-KR' : 'en-US'
        )}
      </div>

      {canModify && (
        <div className="mt-4 xl-down:mt-3 sm-down:mt-2 flex justify-end gap-2 sm-down:gap-1.5">
          <button
            onClick={() => onEdit(admin)}
            className="px-3 py-1 md-down:px-2.5 md-down:py-1 sm-down:px-2 sm-down:py-1 text-sm sm-down:text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            {t('edit')}
          </button>
          <button
            onClick={() => onToggleStatus(admin.id)}
            className={`px-3 py-1 md-down:px-2.5 md-down:py-1 sm-down:px-2 sm-down:py-1 text-sm sm-down:text-xs rounded transition-colors ${
              admin.isActive
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {admin.isActive ? t('deactivate') : t('activate')}
          </button>
          <button
            onClick={() => onDelete(admin.id)}
            className="px-3 py-1 md-down:px-2.5 md-down:py-1 sm-down:px-2 sm-down:py-1 text-sm sm-down:text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCard;
