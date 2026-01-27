import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import adminService from '@services/adminService';
import type { CreateBackgroundData } from '../interface';

interface CreateBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateBackgroundModal: React.FC<CreateBackgroundModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('backgrounds');
  const [formData, setFormData] = useState<CreateBackgroundData>({
    uniqueId: '',
    type: 'color',
    value: '',
    label: '',
    category: 'basic',
    sortOrder: 0,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await adminService.createBackground(formData);
      toast.success(t('modal.create.success', 'Tạo background thành công'));
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        uniqueId: '',
        type: 'color',
        value: '',
        label: '',
        category: 'basic',
        sortOrder: 0,
        isActive: true,
      });
    } catch (error: any) {
      console.error('Error creating background:', error);
      toast.error(error.response?.data?.message || t('modal.create.error', 'Không thể tạo background'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-2xl shadow-black/20 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-gray-100 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t('modal.create.title', 'Tạo Background Mới')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* UniqueId */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.create.uniqueId', 'Unique ID')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.uniqueId}
              onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
              className="w-full px-3 xl-down:px-2 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('modal.create.uniqueIdPlaceholder', 'Ví dụ: bg-blue-500')}
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.create.type', 'Loại Background')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'color' | 'image' })}
              className="w-full px-3 xl-down:px-2 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="color">{t('modal.create.typeColor', 'Màu sắc')}</option>
              <option value="image">{t('modal.create.typeImage', 'Hình ảnh')}</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.create.value', 'Giá trị')}
            </label>
            <input
              type="text"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 xl-down:px-2 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={formData.type === 'color' ? '#f28b82' : 'https://example.com/image.jpg'}
            />
            {formData.type === 'color' && formData.value && (
              <div className="mt-2 flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded border border-gray-300 dark:border-neutral-600"
                  style={{ backgroundColor: formData.value }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('modal.create.preview', 'Xem trước:')}</span>
              </div>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.create.label', 'Nhãn')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 xl-down:px-2 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('modal.create.labelPlaceholder', 'Ví dụ: Xanh dương')}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.create.category', 'Category')}
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 xl-down:px-2 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={t('modal.create.categoryPlaceholder', 'Ví dụ: basic, gradient')}
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.create.sortOrder', 'Thứ tự sắp xếp')}
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 xl-down:px-2 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min="0"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm xl-down:text-xs text-gray-700 dark:text-gray-300">
              {t('modal.create.isActive', 'Đang hoạt động')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all duration-200 shadow-sm"
            >
              {t('modal.create.cancel', 'Hủy')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex-1 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('modal.create.submitting', 'Đang tạo...')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('modal.create.submit', 'Tạo Background')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateBackgroundModal;
