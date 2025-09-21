import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CreateAdminForm, AdminLevel } from '../interfaces/admin.types';
import PermissionSelector from './PermissionSelector';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAdminForm) => Promise<boolean>;
  availablePermissions: string[];
  loading?: boolean;
}

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availablePermissions,
  loading = false
}) => {
  const { t } = useTranslation('admins');
  const [formData, setFormData] = useState<CreateAdminForm>({
    email: '',
    name: '',
    password: '',
    permissions: [],
    adminLevel: 'sub_admin'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = t('createModal.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('createModal.emailInvalid');
    }

    if (!formData.name.trim()) {
      newErrors.name = t('createModal.nameRequired');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('createModal.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('createModal.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await onSubmit(formData);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      permissions: [],
      adminLevel: 'sub_admin'
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('createModal.title')}</h2>
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
          <form onSubmit={handleSubmit} className="space-y-4" id="createAdminForm">
            {/* Admin Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('level')}
              </label>
              <select
                value={formData.adminLevel}
                onChange={(e) => setFormData({ ...formData, adminLevel: e.target.value as AdminLevel })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
              >
                <option value="sub_admin">{t('subAdmin')}</option>
                <option value="dev">{t('dev')}</option>
                <option value="mod">{t('mod')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('createModal.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 ${
                  errors.email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-neutral-600'
                }`}
                placeholder={t('createModal.emailPlaceholder')}
              />
              {errors.email && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('createModal.name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 ${
                  errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-neutral-600'
                }`}
                placeholder={t('createModal.namePlaceholder')}
              />
              {errors.name && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('createModal.password')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 ${
                  errors.password ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-neutral-600'
                }`}
                placeholder={t('createModal.passwordPlaceholder')}
              />
              {errors.password && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('createModal.permissions')}
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
            {t('createModal.cancel')}
          </button>
          <button
            type="submit"
            form="createAdminForm"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('createModal.creating') : t('createModal.create')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAdminModal;
