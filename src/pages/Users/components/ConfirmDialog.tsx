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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-md w-full overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{state.title}</h3>
          {state.lines?.length > 0 && (
            <div className="mt-2 space-y-1">
              {state.lines.map((ln: string, idx: number) => (
                <p key={idx} className="text-sm text-gray-600 dark:text-gray-400">{ln}</p>
              ))}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            {t('buttons.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={state.confirming}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.confirming ? 'Đang xử lý...' : t('buttons.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
