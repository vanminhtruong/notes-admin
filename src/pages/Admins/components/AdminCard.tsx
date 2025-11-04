import React, { useState, useRef, useEffect } from 'react';
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
  onViewProfile: (admin: Admin) => void;
}

const AdminCard: React.FC<AdminCardProps> = ({
  admin,
  currentAdmin,
  onEdit,
  onToggleStatus,
  onDelete,
  onRevokePermission,
  onViewProfile,
}) => {
  const { t, i18n } = useTranslation('admins');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (isActive: boolean) =>
    isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';

  // Chỉ Super Admin mới có thể modify các admin khác
  const canModify = isSuperAdmin() && 
    admin.adminLevel !== 'super_admin' && 
    admin.id !== currentAdmin?.id;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          {admin.avatar ? (
            <img
              src={admin.avatar}
              alt={admin.name}
              className="w-10 h-10 xl-down:w-9 xl-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 xl-down:w-9 xl-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">
                {admin.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{admin.name}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-2xs text-gray-600 dark:text-gray-400 truncate">{admin.email}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 xl-down:gap-1.5 sm-down:gap-1 flex-shrink-0">
          <span className="px-2 py-1 sm-down:py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs xl-down:text-xs sm-down:text-2xs font-medium rounded-full whitespace-nowrap">
            {admin.adminLevel === 'super_admin' ? t('superAdmin') : 
             admin.adminLevel === 'sub_admin' ? t('subAdmin') :
             admin.adminLevel === 'dev' ? t('dev') :
             admin.adminLevel === 'mod' ? t('mod') : 'Admin'}
          </span>
          <span className={`px-2 py-1 sm-down:py-0.5 text-xs xl-down:text-xs sm-down:text-2xs font-medium rounded-full whitespace-nowrap ${getStatusColor(admin.isActive)}`}>
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
              className="group relative flex items-center px-2 py-1 sm-down:py-0.5 text-xs xl-down:text-2xs sm-down:text-2xs bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors whitespace-nowrap"
            >
              <span>{t(`permissions.${permission}.label`, { defaultValue: permission })}</span>
              {canModify && (
                <button
                  onClick={() => onRevokePermission(admin.id, permission)}
                  className="ml-1 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity flex-shrink-0"
                  title={t('revokePermission')}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {admin.adminPermissions?.length > 3 && (
            <span className="px-2 py-1 sm-down:py-0.5 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 text-xs xl-down:text-2xs sm-down:text-2xs rounded whitespace-nowrap">
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

      <div className="mt-4 xl-down:mt-3 sm-down:mt-2 flex flex-wrap justify-end gap-2 sm-down:gap-1.5">
        {/* View Profile button - always visible for super admin */}
        {isSuperAdmin() && admin.adminLevel !== 'super_admin' && (
          <button
            onClick={() => onViewProfile(admin)}
            className="px-3 py-1 md-down:px-2.5 md-down:py-1 sm-down:px-2 sm-down:py-1 text-sm sm-down:text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors whitespace-nowrap"
          >
            {t('viewProfile', { defaultValue: 'Xem hồ sơ' })}
          </button>
        )}
        
        {/* Modification buttons - only for non-super-admin */}
        {canModify && (
          <>
            {/* Only Edit button visible */}
            <button
              onClick={() => onEdit(admin)}
              className="px-3 py-1 md-down:px-2.5 md-down:py-1 sm-down:px-2 sm-down:py-1 text-sm sm-down:text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors whitespace-nowrap"
            >
              {t('edit')}
            </button>

            {/* More actions dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="px-2 py-1 md-down:px-1.5 md-down:py-1 sm-down:px-1.5 sm-down:py-1 text-sm sm-down:text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                title={t('moreActions', { defaultValue: 'Thêm' })}
              >
                <svg className="w-4 h-4 sm-down:w-3 sm-down:h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg border border-gray-200 dark:border-neutral-700 z-10">
                  <button
                    onClick={() => {
                      onToggleStatus(admin.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 ${
                      admin.isActive
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-green-600 dark:text-green-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {admin.isActive ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                    {admin.isActive ? t('deactivate') : t('activate')}
                  </button>
                  <div className="border-t border-gray-200 dark:border-neutral-700"></div>
                  <button
                    onClick={() => {
                      onDelete(admin.id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {t('delete')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCard;
