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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 xl-down:p-3 sm-down:p-2">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-2xl shadow-black/20 max-w-md xl-down:max-w-sm sm-down:max-w-xs w-full overflow-hidden border border-gray-100 dark:border-neutral-800">
        {/* Header with icon */}
        <div className="p-6 xl-down:p-5 sm-down:p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 xl-down:w-10 xl-down:h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <svg className="w-6 h-6 xl-down:w-5 xl-down:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg xl-down:text-base sm-down:text-sm font-bold text-gray-900 dark:text-gray-100">{state.title}</h3>
          </div>
        </div>
        
        {/* Content */}
        {state.lines?.length > 0 && (
          <div className="px-6 py-4 xl-down:px-5 xl-down:py-3 sm-down:px-4 sm-down:py-2.5">
            <div className="space-y-1.5 xl-down:space-y-1">
              {state.lines.map((ln: string, idx: number) => (
                <p key={idx} className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{ln}</p>
              ))}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="px-6 pb-6 xl-down:px-5 xl-down:pb-5 sm-down:px-4 sm-down:pb-4 flex justify-end sm-down:flex-col gap-3 xl-down:gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 text-sm xl-down:text-xs rounded-xl xl-down:rounded-lg border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 font-medium transition-all duration-200 shadow-sm"
          >
            {t('buttons.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={state.confirming}
            className="px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 text-sm xl-down:text-xs rounded-xl xl-down:rounded-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 flex items-center justify-center gap-2"
          >
            {state.confirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('buttons.processing')}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('buttons.confirm')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
