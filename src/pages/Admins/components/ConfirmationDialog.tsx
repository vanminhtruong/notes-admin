import React from 'react';
import { createPortal } from 'react-dom';
import type { TFunction } from 'i18next';
import type { ConfirmAction } from '../hooks/Manager-useState/useAdminsListState';

interface ConfirmationDialogProps {
  t: TFunction;
  confirmAction: ConfirmAction | null;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ t, confirmAction, onConfirm, onCancel }) => {
  if (!confirmAction) return null;

  const title = confirmAction.type === 'toggle' ? t('confirmDialog.changeStatus')
    : confirmAction.type === 'delete' ? t('confirmDialog.confirmDelete')
    : t('confirmRevokePermission');

  const message = confirmAction.type === 'toggle'
    ? t('confirmDialog.changeStatusMessage', { name: confirmAction.adminName })
    : confirmAction.type === 'delete'
    ? t('confirmDialog.deleteMessage', { name: confirmAction.adminName })
    : t('revokePermissionMessage', {
        name: confirmAction.adminName,
        permission: t(`permissions.${confirmAction.permission}.label`, { defaultValue: confirmAction.permission })
      });

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-neutral-700">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700"
            >
              {t('confirmDialog.cancel')}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                confirmAction.type === 'delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {t('confirmDialog.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationDialog;
