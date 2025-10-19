import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getFolderIcon, getFolderColorClass } from '@utils/folderIcons';

interface Folder {
  id: number;
  name: string;
  color: string;
  icon: string;
  notesCount: number;
}

interface MoveToFolderModalProps {
  show: boolean;
  noteId: number | null;
  noteTitle: string;
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
  show,
  noteId,
  noteTitle,
  userId,
  onClose,
  onSuccess
}) => {
  const { t } = useTranslation('notes');
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  useEffect(() => {
    if (show && userId) {
      loadFolders();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm('');
      setSelectedFolderId(null);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show, userId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response: any = await adminService.getAllFolders({
        userId,
        limit: 100,
        sortBy: 'name',
        sortOrder: 'ASC'
      });
      setFolders(response?.folders || []);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error(t('moveToFolder.errors.loadFolders', { defaultValue: 'Không thể tải danh sách thư mục' }));
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = async () => {
    if (!noteId || !selectedFolderId) return;

    try {
      setLoading(true);
      await adminService.moveNoteToFolder(noteId, selectedFolderId);
      toast.success(t('moveToFolder.success', { defaultValue: 'Đã di chuyển ghi chú vào thư mục' }));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error moving note:', error);
      toast.error(error.message || t('moveToFolder.errors.move', { defaultValue: 'Không thể di chuyển ghi chú' }));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-lg w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {t('moveToFolder.title', { defaultValue: 'Di chuyển vào thư mục' })}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {noteTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('moveToFolder.searchPlaceholder', { defaultValue: 'Tìm thư mục...' })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        {/* Folders List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? t('moveToFolder.noResults', { defaultValue: 'Không tìm thấy thư mục' }) : t('moveToFolder.empty', { defaultValue: 'Người dùng chưa có thư mục nào' })}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedFolderId === folder.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400'
                      : 'bg-gray-50 dark:bg-neutral-800 border-2 border-transparent hover:border-gray-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {(() => {
                      const IconComponent = getFolderIcon(folder.icon || 'folder');
                      const colorClass = getFolderColorClass(folder.color);
                      return <IconComponent className={`w-6 h-6 ${colorClass}`} strokeWidth={2} />;
                    })()}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`font-medium truncate ${
                      selectedFolderId === folder.id
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {folder.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {folder.notesCount || 0} {t('title', { defaultValue: 'ghi chú' })}
                    </p>
                  </div>
                  {selectedFolderId === folder.id && (
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors font-medium"
          >
            {t('actions.cancel', { defaultValue: 'Hủy' })}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedFolderId || loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? t('moveToFolder.moving', { defaultValue: 'Đang di chuyển...' }) : t('moveToFolder.move', { defaultValue: 'Di chuyển' })}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MoveToFolderModal;
