import React, { useState, useEffect } from 'react';
import { X, User, Calendar, FileText } from 'lucide-react';
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
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  notesCount?: number;
}

interface CategoryDetailModalProps {
  isOpen: boolean;
  category: Category;
  onClose: () => void;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({ isOpen, category, onClose }) => {
  const { t } = useTranslation('categories');
  const [detail, setDetail] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      fetchDetail();
    }
  }, [isOpen, category]);

  const fetchDetail = async () => {
    try {
      setIsLoading(true);
      const response: any = await adminService.getCategoryDetail(category.id);
      setDetail(response.category);
    } catch (error: any) {
      console.error('Error fetching category detail:', error);
      toast.error('Cannot load category detail');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.Tag;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700 sticky top-0 bg-white dark:bg-neutral-900">
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

        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : detail ? (
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Category Info */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${detail.color}20` }}
              >
                <IconComponent className="w-8 h-8" style={{ color: detail.color }} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold" style={{ color: detail.color }}>
                  {detail.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {detail.id}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
                <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {detail.notesCount || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('notesCount')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
                <div className="w-6 h-6 rounded-full mx-auto mb-2" style={{ backgroundColor: detail.color }} />
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {detail.color}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('modal.edit.color')}</div>
              </div>
              <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 text-center">
                <IconComponent className="w-6 h-6 mx-auto mb-2" style={{ color: detail.color }} />
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {detail.icon}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{t('modal.edit.icon')}</div>
              </div>
            </div>

            {/* User Info */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
              <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {t('modal.detail.owner')}
              </h5>
              <div className="flex items-center gap-3">
                {detail.user.avatar ? (
                  <img
                    src={detail.user.avatar}
                    alt={detail.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {detail.user.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {detail.user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{t('modal.detail.createdAt')}</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="w-4 h-4" />
                    {new Date(detail.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">{t('modal.detail.updatedAt')}</p>
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Calendar className="w-4 h-4" />
                    {new Date(detail.updatedAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Notes */}
            {detail.sampleNotes && detail.sampleNotes.length > 0 && (
              <div className="border-t border-gray-200 dark:border-neutral-700 pt-4">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Sample Notes ({detail.sampleNotes.length})
                </h5>
                <div className="space-y-2">
                  {detail.sampleNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {note.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="p-4 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
          >
            {t('modal.detail.close')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CategoryDetailModal;
