import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ConfirmState } from '../interfaces';

interface ConfirmDialogProps {
  state: ConfirmState;
  onClose: () => void;
  setState: React.Dispatch<React.SetStateAction<ConfirmState>>;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ state, onClose, setState }) => {
  const { t } = useTranslation('users');
  
  if (!state.open) return null;
  
  const handleConfirm = async () => {
    if (!state.onConfirm) return onClose();
    try {
      setState((s) => ({ ...s, confirming: true }));
      await state.onConfirm();
      onClose();
    } finally {
      setState((s) => ({ ...s, confirming: false }));
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 xl-down:p-3 sm-down:p-2">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-xl max-w-md xl-down:max-w-sm sm-down:max-w-xs w-full overflow-hidden">
        <div className="p-5 xl-down:p-4 sm-down:p-3">
          <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100">{state.title}</h3>
          {state.lines?.length > 0 && (
            <div className="mt-2 xl-down:mt-1.5 space-y-1 xl-down:space-y-0.5">
              {state.lines.map((ln: string, idx: number) => (
                <p key={idx} className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">{ln}</p>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 xl-down:px-4 xl-down:pb-4 sm-down:px-3 sm-down:pb-3 flex justify-end xl-down:justify-center xl-down:flex-col sm-down:flex-col gap-3 xl-down:gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-sm xl-down:text-xs rounded-md xl-down:rounded border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium"
          >
            {t('buttons.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={state.confirming}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-sm xl-down:text-xs rounded-md xl-down:rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {state.confirming ? 'Đang xử lý...' : t('buttons.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
