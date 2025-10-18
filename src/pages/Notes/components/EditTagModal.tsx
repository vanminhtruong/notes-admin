import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EditTagModalProps {
  hook: any;
}

const EditTagModal: React.FC<EditTagModalProps> = ({ hook }) => {
  const { t } = useTranslation('notes');
  if (!hook.showEditModal || !hook.editingTag) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 xl-down:p-3">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xl-down:p-3 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg xl-down:text-base font-semibold text-gray-900 dark:text-white">{t('tags.modal.edit')}</h3>
          <button
            onClick={hook.closeEditModal}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg xl-down:rounded-md transition-colors"
          >
            <X className="w-5 h-5 xl-down:w-4 xl-down:h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={hook.handleUpdate} className="p-4 xl-down:p-3 space-y-4 xl-down:space-y-3">
          {/* Tag Name */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tags.form.name.label')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={hook.editingTag.name}
              onChange={(e) => hook.setEditingTag({ ...hook.editingTag, name: e.target.value })}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs"
              placeholder={t('tags.form.name.placeholder')}
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('tags.form.color.label')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hook.editingTag.color}
                onChange={(e) => hook.setEditingTag({ ...hook.editingTag, color: e.target.value })}
                className="w-20 h-10 xl-down:w-16 xl-down:h-8 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md cursor-pointer"
              />
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-10 h-10 xl-down:w-8 xl-down:h-8 rounded-lg xl-down:rounded-md border border-gray-300 dark:border-neutral-600"
                  style={{ backgroundColor: hook.editingTag.color }}
                />
                <input
                  type="text"
                  value={hook.editingTag.color}
                  onChange={(e) => hook.setEditingTag({ ...hook.editingTag, color: e.target.value })}
                  className="flex-1 px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs font-mono uppercase"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={hook.closeEditModal}
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg xl-down:rounded-md transition-colors text-sm xl-down:text-xs"
            >
              {t('tags.actions.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg xl-down:rounded-md transition-colors text-sm xl-down:text-xs"
            >
              {t('tags.actions.update')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditTagModal;
