import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface ConfirmDeleteDialogProps {
  onConfirm: () => void;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({ onConfirm }) => {
  const { t } = useTranslation('notes');

  return (
    <div className="flex flex-col items-center p-2">
      <div className="mb-3 flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
        <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {t('delete.confirm.title', { defaultValue: 'Xác nhận xóa' })}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('delete.confirm.message', { defaultValue: 'Bạn có chắc muốn xóa ghi chú này không?' })}
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <button 
          onClick={() => toast.dismiss()} 
          className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
        >
          {t('actions.cancel', { defaultValue: 'Hủy' })}
        </button>
        <button 
          onClick={() => { 
            toast.dismiss(); 
            onConfirm(); 
          }} 
          className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-medium text-sm"
        >
          {t('actions.delete', { defaultValue: 'Xóa' })}
        </button>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;
