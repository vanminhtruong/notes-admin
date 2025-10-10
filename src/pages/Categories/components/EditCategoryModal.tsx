import React, { useState } from 'react';
import { X } from 'lucide-react';
import adminService from '@services/adminService';
import { toast } from 'react-toastify';
import * as LucideIcons from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  userId: number;
}

interface EditCategoryModalProps {
  isOpen: boolean;
  category: Category;
  onClose: () => void;
  onSuccess: () => void;
}

const ICON_OPTIONS = [
  'Tag', 'Briefcase', 'Home', 'Heart', 'Star', 'Book', 'Coffee', 'Music',
  'ShoppingCart', 'Camera', 'Plane', 'Car', 'Bike', 'Utensils', 'Gamepad2',
  'Palette', 'Code', 'Database', 'Cpu', 'Zap', 'Shield', 'Award', 'Gift'
];

const COLOR_OPTIONS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#F43F5E', '#8B5CF6', '#14B8A6', '#F59E0B'
];

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ isOpen, category, onClose, onSuccess }) => {
  const { t } = useTranslation('categories');
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [icon, setIcon] = useState(category.icon);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error(t('modal.edit.errorNoName'));
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.updateCategory(category.id, {
        name,
        color,
        icon
      });
      toast.success(t('modal.edit.success'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating category:', error);
      toast.error(error.response?.data?.message || t('modal.edit.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Tag;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('modal.edit.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('modal.edit.categoryName')} <span className="text-red-500">{t('modal.edit.required')}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('modal.edit.icon')}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {ICON_OPTIONS.map((iconName) => {
                const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-2 rounded border-2 transition-colors ${
                      icon === iconName
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto" style={{ color }} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('modal.edit.color')}
            </label>
            <div className="grid grid-cols-8 gap-2">
              {COLOR_OPTIONS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption
                      ? 'border-gray-900 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-neutral-600'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('modal.edit.preview')}</p>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20` }}
              >
                <IconComponent className="w-5 h-5" style={{ color }} />
              </div>
              <span className="font-semibold" style={{ color }}>
                {name}
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {t('modal.edit.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('modal.edit.submitting') : t('modal.edit.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditCategoryModal;
