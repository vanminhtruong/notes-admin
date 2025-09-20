import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Admin, UpdateAdminForm } from '../interfaces/admin.types';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {t('editModal.title', { name: admin.name })}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 p-3 bg-gray-50 dark:bg-neutral-700 rounded-md">
            <div className="flex items-center space-x-3">
              {admin.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-neutral-600 flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-medium">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{admin.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" id="editAdminForm">
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
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('editModal.cancel')}
          </button>
          <button
            type="submit"
            form="editAdminForm"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('editModal.saving') : t('editModal.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAdminModal;
