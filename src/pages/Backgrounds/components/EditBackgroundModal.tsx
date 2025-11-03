import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import adminService from '@services/adminService';
import type { Background, UpdateBackgroundData } from '../interface';

interface EditBackgroundModalProps {
  isOpen: boolean;
  background: Background | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditBackgroundModal: React.FC<EditBackgroundModalProps> = ({
  isOpen,
  background,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('backgrounds');
  const [formData, setFormData] = useState<UpdateBackgroundData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (background) {
      setFormData({
        uniqueId: background.uniqueId,
        type: background.type,
        value: background.value || '',
        label: background.label,
        category: background.category,
        sortOrder: background.sortOrder,
        isActive: background.isActive,
      });
    }
  }, [background]);

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
    if (!background) return;

    setIsSubmitting(true);

    try {
      await adminService.updateBackground(background.id, formData);
      toast.success(t('modal.edit.success', 'Cập nhật background thành công'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating background:', error);
      toast.error(error.response?.data?.message || t('modal.edit.error', 'Không thể cập nhật background'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !background) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('modal.edit.title', 'Chỉnh sửa Background')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* UniqueId */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.uniqueId', 'Unique ID')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.uniqueId || ''}
              onChange={(e) => setFormData({ ...formData, uniqueId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.type', 'Loại Background')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type || 'color'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'color' | 'image' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              required
            >
              <option value="color">{t('modal.edit.typeColor', 'Màu sắc')}</option>
              <option value="image">{t('modal.edit.typeImage', 'Hình ảnh')}</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.value', 'Giá trị')}
            </label>
            <input
              type="text"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
            {formData.type === 'color' && formData.value && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('modal.edit.preview', 'Xem trước')}</p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded border border-gray-300 dark:border-neutral-600"
                    style={{ backgroundColor: formData.value }}
                  />
                  <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{formData.value}</span>
                </div>
              </div>
            )}
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.label', 'Nhãn')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.label || ''}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.category', 'Category')}
            </label>
            <input
              type="text"
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.sortOrder', 'Thứ tự sắp xếp')}
            </label>
            <input
              type="number"
              value={formData.sortOrder || 0}
              onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              min="0"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive || false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
              {t('modal.edit.isActive', 'Đang hoạt động')}
            </label>
          </div>

        </form>

        {/* Footer - Cố định */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {t('modal.edit.cancel', 'Hủy')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? t('modal.edit.submitting', 'Đang lưu...') : t('modal.edit.submit', 'Lưu thay đổi')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditBackgroundModal;
