import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import type { Background } from '../interface';

interface BackgroundDetailModalProps {
  isOpen: boolean;
  background: Background | null;
  onClose: () => void;
}

const BackgroundDetailModal: React.FC<BackgroundDetailModalProps> = ({
  isOpen,
  background,
  onClose,
}) => {
  const { t } = useTranslation('backgrounds');

  // Ẩn scroll của body khi modal mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !background) return null;

  const renderSmallPreview = () => {
    if (background.type === 'color') {
      return (
        <div
          className="w-full h-full rounded-lg"
          style={{ backgroundColor: background.value || '#e5e7eb' }}
        />
      );
    } else {
      return (
        <div
          className="w-full h-full rounded-lg bg-cover bg-center"
          style={{
            backgroundImage: background.value ? `url(${background.value})` : 'none',
            backgroundColor: background.value ? 'transparent' : '#e5e7eb',
          }}
        />
      );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-900">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('modal.detail.title', 'Chi tiết Background')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Background Info Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg flex-shrink-0 border-2 border-gray-200 dark:border-neutral-700 overflow-hidden">
              {renderSmallPreview()}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
                {background.label}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {background.uniqueId}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                ID: {background.id}
              </p>
            </div>
          </div>

          {/* Large Preview */}
          <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('preview', 'Xem trước')}</p>
            <div className="w-full h-32 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden">
              {background.type === 'color' ? (
                <div
                  className="w-full h-full"
                  style={{ backgroundColor: background.value || '#e5e7eb' }}
                />
              ) : (
                <div
                  className="w-full h-full bg-cover bg-center"
                  style={{
                    backgroundImage: background.value ? `url(${background.value})` : 'none',
                    backgroundColor: background.value ? 'transparent' : '#e5e7eb',
                  }}
                />
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('type', 'Loại')}</div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                background.type === 'color'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              }`}>
                {background.type === 'color' ? t('typeColor', 'Màu sắc') : t('typeImage', 'Hình ảnh')}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('category', 'Category')}</div>
              <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 truncate max-w-full">
                {background.category}
              </span>
            </div>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('status', 'Trạng thái')}</div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                background.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {background.isActive ? t('active', 'Hoạt động') : t('inactive', 'Không hoạt động')}
              </span>
            </div>
          </div>

          {/* Value Section */}
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
              {t('value', 'Giá trị')}
            </h5>
            <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
              <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                {background.value || 'N/A'}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">{t('sortOrder', 'Thứ tự sắp xếp')}</p>
                <p className="text-gray-900 dark:text-gray-100 font-medium">
                  {background.sortOrder}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">{t('createdAt', 'Ngày tạo')}</p>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(background.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
          >
            {t('modal.detail.close', 'Đóng')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BackgroundDetailModal;
