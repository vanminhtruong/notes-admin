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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xl-down:p-3 border-b border-gray-200 dark:border-neutral-700">
          <h2 className="text-lg xl-down:text-base font-semibold text-gray-900 dark:text-white">
            {t('modal.create.title', 'Tạo Background Mới')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded transition-colors"
          >
            <X className="w-5 h-5 xl-down:w-4 xl-down:h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 xl-down:p-3 space-y-4 xl-down:space-y-3">
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
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg xl-down:rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm xl-down:text-xs"
            >
              {t('modal.create.cancel', 'Hủy')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg xl-down:rounded-md hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm xl-down:text-xs"
            >
              {isSubmitting ? t('modal.create.submitting', 'Đang tạo...') : t('modal.create.submit', 'Tạo Background')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateBackgroundModal;
