import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-3 sm:p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl shadow-black/20 border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {/* Header - Fixed */}
        <div className="relative flex justify-between items-center p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent truncate pr-2">
              {t('editModal.title', { name: admin.name })}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {/* Admin Info Card */}
          <div className="mb-5 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-neutral-800 dark:to-neutral-800/50 rounded-xl border border-gray-100 dark:border-neutral-700">
            <div className="flex items-center gap-4">
              {admin.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.name}
                  className="w-14 h-14 rounded-xl object-cover shadow-md ring-2 ring-white dark:ring-neutral-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
                  <span className="text-lg text-white font-bold">
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{admin.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" id="editAdminForm">
            {/* Admin Level */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {t('level')}
              </label>
              <div className="relative">
                <select
                  value={formData.adminLevel}
                  onChange={(e) => setFormData({ ...formData, adminLevel: e.target.value as AdminLevel })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer transition-all duration-200"
                >
                  <option value="sub_admin">{t('subAdmin')}</option>
                  <option value="dev">{t('dev')}</option>
                  <option value="mod">{t('mod')}</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
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
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 sm:p-6 border-t border-gray-100 dark:border-neutral-800 flex-shrink-0 bg-gray-50/50 dark:bg-neutral-800/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all duration-200 w-full sm:w-auto shadow-sm"
          >
            {t('editModal.cancel')}
          </button>
          <button
            type="submit"
            form="editAdminForm"
            disabled={loading}
            className="group px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('editModal.saving')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('editModal.save')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditAdminModal;
