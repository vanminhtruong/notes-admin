import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';

interface NoteTag {
  id: number;
  name: string;
  color: string;
}

interface NoteTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: number;
  userId: number;
  currentTags: NoteTag[];
  noteTitle: string;
  onTagsChange: () => void;
}

const NoteTagsModal: React.FC<NoteTagsModalProps> = ({
  isOpen,
  onClose,
  noteId,
  userId,
  currentTags,
  noteTitle,
  onTagsChange,
}) => {
  const { t } = useTranslation('notes');
  const [availableTags, setAvailableTags] = useState<NoteTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingTagId, setAddingTagId] = useState<number | null>(null);
  const [removingTagId, setRemovingTagId] = useState<number | null>(null);

  const canAssign = hasPermission('manage_notes.tags.assign');

  useEffect(() => {
    if (isOpen && canAssign) {
      fetchUserTags();
    }
  }, [isOpen, userId]);

  const fetchUserTags = async () => {
    try {
      setLoading(true);
      const response: any = await adminService.getAllTags({
        userId,
        limit: 100,
      });
      setAvailableTags(response.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error(t('tags.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (tagId: number) => {
    if (!canAssign) return;

    try {
      setAddingTagId(tagId);
      await adminService.assignTagToNote({ noteId, tagId });
      toast.success(t('tags.toasts.addSuccess'));
      onTagsChange();
      // Đóng modal sau khi thêm tag thành công
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error: any) {
      console.error('Error adding tag:', error);
      toast.error(error.response?.data?.message || t('tags.toasts.addError'));
    } finally {
      setAddingTagId(null);
    }
  };

  const handleRemoveTag = async (tagId: number) => {
    if (!canAssign) return;

    try {
      setRemovingTagId(tagId);
      await adminService.removeTagFromNote(noteId, tagId);
      toast.success(t('tags.toasts.removeSuccess'));
      onTagsChange();
      // Đóng modal sau khi xóa tag thành công
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error: any) {
      console.error('Error removing tag:', error);
      toast.error(error.response?.data?.message || t('tags.toasts.removeError'));
    } finally {
      setRemovingTagId(null);
    }
  };

  // Filter out tags already assigned
  const unassignedTags = availableTags.filter(
    (tag) => !currentTags.find((ct) => ct.id === tag.id)
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('tags.manage.title')}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {noteTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Current Tags */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              {t('tags.manage.currentTags')} ({currentTags.length})
            </h4>
            {currentTags.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                <TagIcon className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('tags.manage.noTags')}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {tag.name}
                      </span>
                    </div>
                    {canAssign && (
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        disabled={removingTagId === tag.id}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
                        title={t('tags.manage.removeTag')}
                      >
                        {removingTagId === tag.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Tags to Add */}
          {canAssign && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                {t('tags.manage.addTag')}
              </h4>
              {loading ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {t('tags.manage.loading')}
                  </p>
                </div>
              ) : unassignedTags.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('tags.manage.noAvailableTags')}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unassignedTags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleAddTag(tag.id)}
                      disabled={addingTagId === tag.id}
                      className="w-full flex items-center justify-between p-3 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {tag.name}
                        </span>
                      </div>
                      {addingTagId === tag.id ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!canAssign && (
            <div className="text-center py-6 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('tags.manage.noPermission')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-sm"
          >
            {t('tags.actions.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteTagsModal;
