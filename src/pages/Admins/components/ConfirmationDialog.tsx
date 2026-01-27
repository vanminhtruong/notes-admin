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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl shadow-black/20 max-w-md w-full border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {/* Header with icon */}
        <div className={`p-6 ${
          confirmAction.type === 'delete' 
            ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20' 
            : 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
              confirmAction.type === 'delete'
                ? 'bg-gradient-to-br from-red-500 to-orange-600 shadow-red-500/25'
                : 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-500/25'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {confirmAction.type === 'delete' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                )}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all duration-200 shadow-sm"
          >
            {t('confirmDialog.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-200 shadow-lg flex items-center gap-2 ${
              confirmAction.type === 'delete'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-red-500/25 hover:shadow-red-500/40'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-blue-500/40'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('confirmDialog.confirm')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationDialog;
