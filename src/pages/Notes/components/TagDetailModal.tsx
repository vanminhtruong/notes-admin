import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag as TagIcon, Users, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import Pagination from '@components/common/Pagination';
import { toast } from 'react-toastify';

interface Note {
  id: number;
  title: string;
  content?: string;
  priority: string;
  isArchived: boolean;
  createdAt: string;
}

interface TagDetailModalProps {
  hook: any;
}

const TagDetailModal: React.FC<TagDetailModalProps> = ({ hook }) => {
  const { t } = useTranslation('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotes, setTotalNotes] = useState(0);

  useEffect(() => {
    if (hook.showDetailModal && hook.selectedTag) {
      fetchTagDetail();
    }
  }, [hook.showDetailModal, hook.selectedTag, currentPage]);

  const fetchTagDetail = async () => {
    if (!hook.selectedTag) return;

    try {
      setLoading(true);
      const response: any = await adminService.getTagDetail(hook.selectedTag.id, {
        page: currentPage,
        limit: 10,
      });
      setNotes(response.notes || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalNotes(response.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching tag detail:', error);
      toast.error(t('tags.toasts.detailLoadError'));
    } finally {
      setLoading(false);
    }
  };

  if (!hook.showDetailModal || !hook.selectedTag) return null;

  const tag = hook.selectedTag;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 xl-down:p-3">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-xl max-w-4xl xl-down:max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xl-down:p-3 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: tag.color }}
            />
            <h3 className="text-lg xl-down:text-base font-semibold text-gray-900 dark:text-white">
              {tag.name}
            </h3>
          </div>
          <button
            onClick={hook.closeDetailModal}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg xl-down:rounded-md transition-colors"
          >
            <X className="w-5 h-5 xl-down:w-4 xl-down:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 xl-down:p-3 space-y-4 xl-down:space-y-3 overflow-y-auto flex-1">
          {/* Tag Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 xl-down:gap-3 p-4 xl-down:p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md">
            <div>
              <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mb-1">
                {t('tags.detail.user')}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 text-gray-400" />
                <div>
                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-white">
                    {tag.user.name}
                  </div>
                  <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                    {tag.user.email}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mb-1">
                {t('tags.detail.totalNotes')}
              </div>
              <div className="text-2xl xl-down:text-xl font-bold text-blue-600 dark:text-blue-400">
                {totalNotes}
              </div>
            </div>

            <div>
              <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mb-1">
                {t('tags.detail.createdAt')}
              </div>
              <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-white">
                {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>

          {/* Notes List */}
          <div>
            <h4 className="text-sm xl-down:text-xs font-semibold text-gray-900 dark:text-white mb-3 xl-down:mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
              {t('tags.detail.notesList')}
            </h4>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
                  {t('tags.loading')}
                </p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md">
                <TagIcon className="w-12 h-12 xl-down:w-10 xl-down:h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm xl-down:text-xs text-gray-500 dark:text-gray-400">
                  {t('tags.detail.noNotes')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 xl-down:p-2 border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-white truncate">
                          {note.title}
                        </h5>
                        {note.content && (
                          <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                            {note.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs xl-down:text-2xs font-medium ${
                              note.priority === 'high'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : note.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {note.priority}
                          </span>
                          {note.isArchived && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs xl-down:text-2xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {t('tags.detail.archived')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(note.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 xl-down:mt-3">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 xl-down:p-3 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={hook.closeDetailModal}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg xl-down:rounded-md transition-colors text-sm xl-down:text-xs"
          >
            {t('tags.actions.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TagDetailModal;
