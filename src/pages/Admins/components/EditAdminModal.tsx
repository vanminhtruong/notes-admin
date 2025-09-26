import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Admin, UpdateAdminForm, AdminLevel } from '../interfaces/admin.types';
import PermissionSelector from './PermissionSelector';

interface EditAdminModalProps {
  isOpen: boolean;
  admin: Admin | null;
  onClose: () => void;
  onSubmit: (adminId: number, data: UpdateAdminForm) => Promise<boolean>;
  availablePermissions: string[];
  loading?: boolean;
}

const EditAdminModal: React.FC<EditAdminModalProps> = ({
  isOpen,
  admin,
  onClose,
  onSubmit,
  availablePermissions,
  loading = false
}) => {
  const { t } = useTranslation('admins');
  const [formData, setFormData] = useState<UpdateAdminForm>({
    permissions: [],
    adminLevel: 'sub_admin'
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        permissions: admin.adminPermissions || [],
        adminLevel: admin.adminLevel
      });
    }
  }, [admin]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!admin) return;

    const success = await onSubmit(admin.id, formData);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      permissions: [],
      adminLevel: 'sub_admin'
    });
    onClose();
  };

  if (!isOpen || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
            {t('editModal.title', { name: admin.name })}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 dark:bg-neutral-700 rounded-md">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {admin.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">{admin.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4" id="editAdminForm">
            {/* Admin Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('level')}
              </label>
              <select
                value={formData.adminLevel}
                onChange={(e) => setFormData({ ...formData, adminLevel: e.target.value as AdminLevel })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
              >
                <option value="sub_admin">{t('subAdmin')}</option>
                <option value="dev">{t('dev')}</option>
                <option value="mod">{t('mod')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('editModal.permissions')}
              </label>
              <PermissionSelector
                selectedPermissions={formData.permissions}
                availablePermissions={availablePermissions}
                onChange={(permissions) => setFormData({ ...formData, permissions })}
                excludeManageAdmins={true}
              />
            </div>

          </form>
        </div>
        
        {/* Footer - Fixed */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors w-full sm:w-auto"
          >
            {t('editModal.cancel')}
          </button>
          <button
            type="submit"
            form="editAdminForm"
            disabled={loading}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {loading ? t('editModal.saving') : t('editModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
