import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { hasPermission } from '@utils/auth';
import SharedNoteDetailModal from './SharedNoteDetailModal';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Note {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface SharedNote {
  id: number;
  noteId: number;
  canEdit?: boolean;
  canDelete?: boolean;
  canCreate?: boolean;
  message?: string;
  sharedAt: string;
  isActive: boolean;
  note: Note;
  sharedWithUser?: User; // Optional for group shares
  sharedByUser: User;
  group?: Group; // For group shares
  shareType: 'individual' | 'group';
}

interface Group {
  id: number;
  name: string;
  avatar?: string;
}

interface SharedNotesListProps {
  embedded?: boolean;
}

const SharedNotesList: React.FC<SharedNotesListProps> = ({ embedded }) => {
  const { t } = useTranslation('notes');
  
  // States
  const [loading, setLoading] = useState(false);
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [sharedByUserId, setSharedByUserId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Detail modal states
  const [selectedSharedNote, setSelectedSharedNote] = useState<SharedNote | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Check if user has any action permissions
  const canDelete = hasPermission('manage_notes.shared.delete');
  const hasAnyActionPermission = canDelete;

  useEffect(() => {
    loadSharedNotes();
  }, [currentPage, searchTerm, selectedUserId, sharedByUserId]);

  const loadSharedNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await adminService.getAllSharedNotes({
        page: currentPage,
        limit: 20,
        userId: selectedUserId ? parseInt(selectedUserId) : undefined,
        sharedByUserId: sharedByUserId ? parseInt(sharedByUserId) : undefined,
        search: searchTerm || undefined,
        sortBy: 'sharedAt',
        sortOrder: 'DESC'
      });

      setSharedNotes(response?.sharedNotes || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading shared notes:', error);
      toast.error(t('alerts.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedUserId, sharedByUserId, searchTerm]);

  // Realtime listeners for shared note changes
  useEffect(() => {
    const s = getAdminSocket();
    const handleSharedNoteEvent = () => {
      loadSharedNotes();
    };
    
    s.on('admin_shared_note_deleted', handleSharedNoteEvent);
    s.on('admin_shared_note_updated', handleSharedNoteEvent);
    s.on('shared_note_updated_by_admin', handleSharedNoteEvent);
    s.on('group_shared_note_updated_by_admin', handleSharedNoteEvent);
    s.on('user_shared_note_created', handleSharedNoteEvent);
    s.on('user_shared_note_deleted', handleSharedNoteEvent);
    s.on('user_shared_note_permissions_updated', handleSharedNoteEvent);
    s.on('user_group_shared_note_created', handleSharedNoteEvent);
    s.on('user_group_shared_note_permissions_updated', handleSharedNoteEvent);

    return () => {
      try {
        s.off('admin_shared_note_deleted', handleSharedNoteEvent);
        s.off('admin_shared_note_updated', handleSharedNoteEvent);
        s.off('shared_note_updated_by_admin', handleSharedNoteEvent);
        s.off('group_shared_note_updated_by_admin', handleSharedNoteEvent);
        s.off('user_shared_note_created', handleSharedNoteEvent);
        s.off('user_shared_note_deleted', handleSharedNoteEvent);
        s.off('user_shared_note_permissions_updated', handleSharedNoteEvent);
        s.off('user_group_shared_note_created', handleSharedNoteEvent);
        s.off('user_group_shared_note_permissions_updated', handleSharedNoteEvent);
      } catch {}
    };
  }, [loadSharedNotes]);

  const handleDeleteSharedNote = async (sharedNoteId: number) => {
    toast.warn(
      <div className="flex flex-col items-center p-2">
        <div className="mb-3 flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('sharedNotes.delete.confirm.title')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('sharedNotes.delete.confirm.message')}
          </p>
        </div>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            {t('actions.cancel')}
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                const response: any = await adminService.deleteSharedNote(sharedNoteId);
                await loadSharedNotes();
                
                // Show enhanced success message
                if (response?.deletedMessageAlso) {
                  const shareType = response.shareType === 'group' ? 'nhóm' : '1-1';
                  const messageId = response.deletedMessageId;
                  toast.success(
                    `Đã xóa ghi chú chia sẻ ${shareType} và tin nhắn ${messageId ? `(ID: ${messageId})` : ''} thành công`, 
                    { autoClose: 5000 }
                  );
                } else {
                  toast.success(t('alerts.deleteSuccess'));
                }
              } catch (error) {
                console.error('Error deleting shared note:', error);
                toast.error(t('alerts.deleteFailed'));
              }
            }}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors font-medium text-sm"
          >
            {t('actions.delete')}
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {!embedded && (
        <div>
          <h2 className="text-xl xl-down:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {t('sharedNotes.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm xl-down:text-xs">
            {t('sharedNotes.subtitle')}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl-down:gap-3">
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filters.search.label')}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('sharedNotes.searchFilters.search.placeholder')}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 text-sm xl-down:text-xs border border-gray-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedNotes.searchFilters.sharedWith')}
            </label>
            <input
              type="text"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              placeholder="User ID..."
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 text-sm xl-down:text-xs border border-gray-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('sharedNotes.searchFilters.sharedBy')}
            </label>
            <input
              type="text"
              value={sharedByUserId}
              onChange={(e) => setSharedByUserId(e.target.value)}
              placeholder="User ID..."
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 text-sm xl-down:text-xs border border-gray-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="mt-4 xl-down:mt-3">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedUserId('');
              setSharedByUserId('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
          >
            {t('filters.clear')}
          </button>
        </div>
      </div>

      {/* Shared Notes List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {sharedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 xl-down:py-12 sm-down:py-8">
                <div className="mb-3 text-gray-400 dark:text-gray-500">
                  <svg className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-6 sm-down:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <p className="text-sm xl-down:text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {t('sharedNotes.empty.title')}
                </p>
                <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('sharedNotes.empty.hint')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sharedNotes.table.note')}
                      </th>
                      <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sharedNotes.table.sharedBy')}
                      </th>
                      <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sharedNotes.table.sharedWith')}
                      </th>
                      <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sharedNotes.table.permissions')}
                      </th>
                      <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('sharedNotes.table.sharedAt')}
                      </th>
                      {hasAnyActionPermission && (
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.actions')}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                    {sharedNotes.map((sharedNote) => (
                      <tr 
                        key={sharedNote.id} 
                        className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                        onClick={() => {
                          setSelectedSharedNote(sharedNote);
                          setShowDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4 xl-down:px-4 xl-down:py-3">
                          <div>
                            <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                              {sharedNote.note.title}
                            </h4>
                            <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {sharedNote.note.content}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 xl-down:h-6 xl-down:w-6">
                              {sharedNote.sharedByUser.avatar ? (
                                <img
                                  className="h-8 w-8 xl-down:h-6 xl-down:w-6 rounded-full object-cover"
                                  src={sharedNote.sharedByUser.avatar}
                                  alt={sharedNote.sharedByUser.name}
                                />
                              ) : (
                                <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs xl-down:text-2xs font-medium">
                                    {sharedNote.sharedByUser.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3 xl-down:ml-2">
                              <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                                {sharedNote.sharedByUser.name}
                              </div>
                              <div className="text-sm xl-down:text-2xs text-gray-600 dark:text-gray-400">
                                ID: {sharedNote.sharedByUser.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 xl-down:h-6 xl-down:w-6">
                              {sharedNote.shareType === 'group' && sharedNote.group ? (
                                <>
                                  {sharedNote.group.avatar ? (
                                    <img
                                      className="h-8 w-8 xl-down:h-6 xl-down:w-6 rounded-full object-cover"
                                      src={sharedNote.group.avatar}
                                      alt={sharedNote.group.name}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs xl-down:text-2xs font-medium">
                                        {sharedNote.group.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : sharedNote.sharedWithUser ? (
                                <>
                                  {sharedNote.sharedWithUser.avatar ? (
                                    <img
                                      className="h-8 w-8 xl-down:h-6 xl-down:w-6 rounded-full object-cover"
                                      src={sharedNote.sharedWithUser.avatar}
                                      alt={sharedNote.sharedWithUser.name}
                                    />
                                  ) : (
                                    <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs xl-down:text-2xs font-medium">
                                        {sharedNote.sharedWithUser.name.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-xs">?</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3 xl-down:ml-2">
                              {sharedNote.shareType === 'group' && sharedNote.group ? (
                                <>
                                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1">
                                    <span className="text-purple-600 dark:text-purple-400">[Group]</span>
                                    {sharedNote.group.name}
                                  </div>
                                  <div className="text-sm xl-down:text-2xs text-gray-600 dark:text-gray-400">
                                    ID: {sharedNote.group.id}
                                  </div>
                                </>
                              ) : sharedNote.sharedWithUser ? (
                                <>
                                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                                    {sharedNote.sharedWithUser.name}
                                  </div>
                                  <div className="text-sm xl-down:text-2xs text-gray-600 dark:text-gray-400">
                                    ID: {sharedNote.sharedWithUser.id}
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm xl-down:text-xs text-gray-500">
                                  Unknown
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                          <div className="flex flex-nowrap gap-1 overflow-x-auto">
                            {sharedNote.canCreate && (
                              <span className="px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 whitespace-nowrap">
                                {t('sharedNotes.permissions.create', { defaultValue: 'Create' })}
                              </span>
                            )}
                            {sharedNote.canEdit && (
                              <span className="px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 whitespace-nowrap">
                                {t('sharedNotes.permissions.edit')}
                              </span>
                            )}
                            {sharedNote.canDelete && (
                              <span className="px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 whitespace-nowrap">
                                {t('sharedNotes.permissions.delete')}
                              </span>
                            )}
                            {!sharedNote.canEdit && !sharedNote.canDelete && !sharedNote.canCreate && (
                              <span className="px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                                {t('sharedNotes.permissions.view')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm xl-down:text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(sharedNote.sharedAt)}
                        </td>
                        {hasAnyActionPermission && (
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm font-medium">
                            {canDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSharedNote(sharedNote.id);
                                }}
                                title={String(t('actions.delete'))}
                                aria-label={String(t('actions.delete'))}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">{t('actions.delete')}</span>
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('pagination.prev', { defaultValue: 'Trước' })}
          </button>
          
          <span className="text-sm xl-down:text-xs text-gray-700 dark:text-gray-300">
            {t('pagination.title', { currentPage, totalPages, defaultValue: `Trang ${currentPage} / ${totalPages}` })}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('pagination.next', { defaultValue: 'Sau' })}
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <SharedNoteDetailModal
        sharedNote={selectedSharedNote}
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedSharedNote(null);
        }}
        onDelete={(id: number) => {
          handleDeleteSharedNote(id);
          setShowDetailModal(false);
          setSelectedSharedNote(null);
        }}
        onUpdate={loadSharedNotes}
      />
    </div>
  );
};

export default SharedNotesList;
