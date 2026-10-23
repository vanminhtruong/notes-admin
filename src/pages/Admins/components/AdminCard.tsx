import { useAdminPermissions } from '@hooks/useAdminPermissions';
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
  useAdminPermissions();
  const { t, i18n } = useTranslation('admins');
  const presenceLabel = admin.isOnline === undefined
    ? t('presenceUnknown')
    : t(admin.isOnline ? 'online' : 'offline', { ns: 'users' });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <div className="group relative bg-white dark:bg-neutral-800/50 rounded-2xl xl-down:rounded-xl border border-gray-100 dark:border-neutral-700/50 p-5 xl-down:p-4 sm-down:p-3 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-300">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-2xl xl-down:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-4 xl-down:space-x-3 min-w-0 flex-1">
          {admin.avatar ? (
            <div className="relative">
              <img
                src={admin.avatar}
                alt={admin.name}
                className="w-12 h-12 xl-down:w-10 xl-down:h-10 sm-down:w-9 sm-down:h-9 rounded-xl xl-down:rounded-lg object-cover flex-shrink-0 ring-2 ring-white dark:ring-neutral-700 shadow-md"
              />
              <div role="img" aria-label={presenceLabel} title={presenceLabel} data-online={admin.isOnline === undefined ? 'unknown' : String(admin.isOnline)} className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-800 ${admin.isOnline === true ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          ) : (
            <div className="relative">
              <div className="w-12 h-12 xl-down:w-10 xl-down:h-10 sm-down:w-9 sm-down:h-9 rounded-xl xl-down:rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                <span className="text-white font-semibold text-lg xl-down:text-base">
                  {admin.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div role="img" aria-label={presenceLabel} title={presenceLabel} data-online={admin.isOnline === undefined ? 'unknown' : String(admin.isOnline)} className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-800 ${admin.isOnline === true ? 'bg-green-500' : 'bg-gray-400'}`} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg xl-down:text-base sm-down:text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{admin.name}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{admin.email}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 xl-down:gap-1.5 sm-down:gap-1 flex-shrink-0">
          <span className="px-3 py-1.5 sm-down:px-2 sm-down:py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 text-blue-700 dark:text-blue-300 text-xs xl-down:text-xs sm-down:text-2xs font-semibold rounded-lg whitespace-nowrap border border-blue-200/50 dark:border-blue-700/50">
            {admin.adminLevel === 'super_admin' ? t('superAdmin') : 
             admin.adminLevel === 'sub_admin' ? t('subAdmin') :
             admin.adminLevel === 'dev' ? t('dev') :
             admin.adminLevel === 'mod' ? t('mod') : 'Admin'}
          </span>
        </div>
      </div>

      <div className="relative mt-5 xl-down:mt-4">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2.5 uppercase tracking-wide">{t('permissionsLabel')}</h4>
        <div className="flex flex-wrap gap-1.5 sm-down:gap-1">
          {admin.adminPermissions?.slice(0, 3).map((permission: string) => (
            <div
              key={permission}
              className="group/perm relative flex items-center px-2.5 py-1.5 sm-down:px-2 sm-down:py-1 text-xs xl-down:text-2xs sm-down:text-2xs bg-gray-50 dark:bg-neutral-700/50 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-600 transition-all duration-200 whitespace-nowrap border border-gray-100 dark:border-neutral-600"
            >
              <span>{t(`permissions.${permission}.label`, { defaultValue: permission })}</span>
              {canModify && (
                <button
                  onClick={() => onRevokePermission(admin.id, permission)}
                  className="ml-1.5 w-4 h-4 flex items-center justify-center opacity-0 group-hover/perm:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all duration-200 flex-shrink-0"
                  title={t('revokePermission')}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {admin.adminPermissions?.length > 3 && (
            <span className="px-2.5 py-1.5 sm-down:px-2 sm-down:py-1 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-neutral-700 dark:to-neutral-600 text-gray-600 dark:text-gray-300 text-xs xl-down:text-2xs sm-down:text-2xs rounded-lg whitespace-nowrap font-medium border border-gray-100 dark:border-neutral-600">
              +{admin.adminPermissions.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700/50">
        <div className="flex items-center gap-2 text-xs xl-down:text-[11px] sm-down:text-2xs text-gray-400 dark:text-gray-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{t('createdAt')}: {new Date(admin.createdAt).toLocaleDateString(
            i18n.language === 'vi' ? 'vi-VN' : i18n.language === 'ko' ? 'ko-KR' : 'en-US'
          )}</span>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap justify-end gap-2 sm-down:gap-1.5">
        {/* View Profile button - always visible for super admin */}
        {isSuperAdmin() && admin.adminLevel !== 'super_admin' && (
          <button
            onClick={() => onViewProfile(admin)}
            className="group/btn px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 text-sm sm-down:text-xs bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-700 dark:text-gray-300 rounded-xl xl-down:rounded-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 font-medium"
          >
            <svg className="w-4 h-4 sm-down:w-3.5 sm-down:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="sm-down:hidden">{t('viewProfile', { defaultValue: 'Xem hồ sơ' })}</span>
          </button>
        )}
        
        {/* Modification buttons - only for non-super-admin */}
        {canModify && (
          <>
            {/* Only Edit button visible */}
            <button
              onClick={() => onEdit(admin)}
              className="group/btn px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1 text-sm sm-down:text-xs bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl xl-down:rounded-lg shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 whitespace-nowrap flex items-center gap-2 font-medium"
            >
              <svg className="w-4 h-4 sm-down:w-3.5 sm-down:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="sm-down:hidden">{t('edit')}</span>
            </button>

            {/* More actions dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 md-down:p-1.5 sm-down:p-1.5 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 text-gray-600 dark:text-gray-400 rounded-xl xl-down:rounded-lg transition-all duration-200"
                title={t('moreActions', { defaultValue: 'Thêm' })}
              >
                <svg className="w-5 h-5 sm-down:w-4 sm-down:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-neutral-800 rounded-xl shadow-xl shadow-gray-200/50 dark:shadow-neutral-900/50 border border-gray-100 dark:border-neutral-700 z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      onToggleStatus(admin.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors flex items-center gap-3 ${
                      admin.isActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      admin.isActive 
                        ? 'bg-amber-100 dark:bg-amber-900/30' 
                        : 'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {admin.isActive ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <span className="font-medium">{admin.isActive ? t('deactivate') : t('activate')}</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-neutral-700"></div>
                  <button
                    onClick={() => {
                      onDelete(admin.id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <span className="font-medium">{t('delete')}</span>
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
