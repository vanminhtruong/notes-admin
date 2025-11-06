import React from 'react';
import { X, Tag as TagIcon, User, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  notesCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface TagDetailModalProps {
  isOpen: boolean;
  tag: Tag;
  onClose: () => void;
}

const TagDetailModal: React.FC<TagDetailModalProps> = ({ isOpen, tag, onClose }) => {
  const { t } = useTranslation('tags');

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('modal.detail.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Tag Preview */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${tag.color}20` }}
            >
              <TagIcon className="w-8 h-8" style={{ color: tag.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold truncate" style={{ color: tag.color }}>
                {tag.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {tag.notesCount || 0} {t('modal.detail.notes')}
              </p>
            </div>
          </div>

          {/* User Info */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              {t('modal.detail.owner')}
            </h5>
            <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-gray-100">{tag.user.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tag.user.email}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('modal.detail.createdAt')}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(tag.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('modal.detail.updatedAt')}
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(tag.updatedAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Color Info */}
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('modal.detail.color')}
            </h5>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-neutral-600"
                style={{ backgroundColor: tag.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                {tag.color}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('modal.detail.close')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default TagDetailModal;
