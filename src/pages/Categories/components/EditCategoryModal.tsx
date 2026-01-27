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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black/20 border border-gray-100 dark:border-neutral-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-neutral-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <LucideIcons.Edit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t('modal.edit.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/80 dark:bg-neutral-800/80 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200 shadow-sm"
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

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-700 transition-all duration-200 shadow-sm"
            >
              {t('modal.edit.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex-1 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t('modal.edit.submitting')}
                </>
              ) : (
                <>
                  <LucideIcons.Check className="w-4 h-4" />
                  {t('modal.edit.submit')}
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

export default EditCategoryModal;
