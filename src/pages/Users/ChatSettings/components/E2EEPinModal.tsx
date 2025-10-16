import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check } from 'lucide-react';

interface E2EEPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    e2eePinHash: string;
  };
}

const E2EEPinModal: React.FC<E2EEPinModalProps> = ({ isOpen, onClose, user }) => {
  const { t } = useTranslation('chatSettings');
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(user.e2eePinHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              🔐 {t('pinModal.title', 'E2EE PIN Hash')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user.name} ({user.email})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
          {/* Info Notice */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">ℹ️</span>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  {t('pinModal.infoTitle', 'Thông tin quan trọng')}
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('pinModal.infoText', 'Đây là PIN hash đã được mã hóa bằng bcrypt. PIN gốc không thể giải mã được từ hash này. Hash này được sử dụng để xác thực khi user nhập PIN.')}
                </p>
              </div>
            </div>
          </div>

          {/* PIN Hash Display */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('pinModal.hashLabel', 'PIN Hash (Bcrypt)')}
            </label>
            <div className="relative">
              <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-600 rounded-lg p-4 pr-12 font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {user.e2eePinHash}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-lg bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                title={copied ? t('pinModal.copied', 'Đã sao chép') : t('pinModal.copy', 'Sao chép')}
              >
                {copied ? (
                  <Check size={20} className="text-green-600 dark:text-green-400" />
                ) : (
                  <Copy size={20} className="text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Hash Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('pinModal.hashAlgorithm', 'Thuật toán mã hóa')}
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                Bcrypt
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {t('pinModal.hashLength', 'Độ dài hash')}
              </div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {user.e2eePinHash.length} {t('pinModal.characters', 'ký tự')}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                  {t('pinModal.warningTitle', 'Cảnh báo bảo mật')}
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('pinModal.warningText', 'Không chia sẻ hash này cho người dùng. Nếu cần reset PIN, hãy sử dụng chức năng reset PIN trong hệ thống.')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-neutral-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            {t('pinModal.close', 'Đóng')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default E2EEPinModal;
