import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { hasPermission } from '@utils/auth';
import CreateFolderModal from './CreateFolderModal';
import EditFolderModal from './EditFolderModal';
import FolderDetailModal from './FolderDetailModal';
import { getFolderIcon, getFolderColorClass } from '@utils/folderIcons';
import MobileCard from '@components/common/MobileCard';
import Pagination from '@components/common/Pagination';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Folder {
  id: number;
  name: string;
  color: string;
  icon: string;
  isPinned: boolean;
  notesCount: number;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface FoldersListProps {
  embedded?: boolean;
}

const FoldersList: React.FC<FoldersListProps> = ({ embedded: _embedded }) => {
  const { t } = useTranslation('notes');
  
  // States
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  // Check permissions
  const canCreate = hasPermission('manage_notes.folders.create');
  const canEdit = hasPermission('manage_notes.folders.edit');
  const canDelete = hasPermission('manage_notes.folders.delete');
  const canViewDetail = hasPermission('manage_notes.folders.view_detail');
  const hasAnyActionPermission = canEdit || canDelete;

  useEffect(() => {
    loadFolders();
  }, [currentPage, searchTerm, selectedUserId]);

  const loadFolders = useCallback(async () => {
    try {
      setLoading(true);
      const response: any = await adminService.getAllFolders({
        page: currentPage,
        limit: 5,
        userId: selectedUserId ? parseInt(selectedUserId) : undefined,
        search: searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      setFolders(response?.folders || []);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalItems(response?.pagination?.total || 0);
    } catch (error) {
      console.error('Error loading folders:', error);
      toast.error(t('folders.toasts.updateError'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedUserId, searchTerm]);

  // Real-time listeners for folder changes
  useEffect(() => {
    const s = getAdminSocket();
    const handleFolderEvent = () => {
      loadFolders();
    };
    
    s.on('admin_folder_created', handleFolderEvent);
    s.on('admin_folder_updated', handleFolderEvent);
    s.on('admin_folder_deleted', handleFolderEvent);
    s.on('user_folder_created', handleFolderEvent);
    s.on('user_folder_updated', handleFolderEvent);
    s.on('user_folder_deleted', handleFolderEvent);
    s.on('user_folder_pinned', handleFolderEvent);
    s.on('user_folder_unpinned', handleFolderEvent);

    return () => {
      try {
        s.off('admin_folder_created', handleFolderEvent);
        s.off('admin_folder_updated', handleFolderEvent);
        s.off('admin_folder_deleted', handleFolderEvent);
        s.off('user_folder_created', handleFolderEvent);
        s.off('user_folder_updated', handleFolderEvent);
        s.off('user_folder_deleted', handleFolderEvent);
        s.off('user_folder_pinned', handleFolderEvent);
        s.off('user_folder_unpinned', handleFolderEvent);
      } catch {}
    };
  }, [loadFolders]);

  const handleDeleteFolder = async (folderId: number, userId: number) => {
    toast.warn(
      <div className="flex flex-col items-center p-2">
        <div className="mb-3 flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('folders.delete.confirm.title')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('folders.delete.confirm.message')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('folders.delete.confirm.note')}</p>
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
                await adminService.deleteUserFolder(folderId, userId);
                await loadFolders();
                toast.success(t('folders.toasts.deleteSuccess'));
              } catch (error) {
                console.error('Error deleting folder:', error);
                toast.error(t('folders.toasts.deleteError'));
              }
            }}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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
    <div className="space-y-6 xl-down:space-y-4">
      {/* Header with filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3">
        <div className="flex flex-col sm:flex-row gap-4 xl-down:gap-3">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('folders.searchPlaceholder') as string}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
            />
          </div>
          
          {/* User ID Filter */}
          <div className="w-full sm:w-48">
            <input
              type="text"
              placeholder={t('filters.userId.placeholder') as string}
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
            />
          </div>

          {/* Create button */}
          {canCreate && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg xl-down:rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm xl-down:text-xs"
            >
              <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('folders.actions.create')}
            </button>
          )}
        </div>
      </div>

      {/* Folders List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 xl-down:h-6 xl-down:w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 xl-down:py-8">
            <svg className="w-16 h-16 xl-down:w-12 xl-down:h-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-sm xl-down:text-xs">{t('folders.empty.title')}</p>
          </div>
        ) : (
          <>
            {/* Desktop/Tablet Table View */}
            <div className="overflow-x-auto md-down:hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('folders.table.folder')}
                  </th>
                  <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('folders.table.user')}
                  </th>
                  <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('folders.table.notesCount')}
                  </th>
                  <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider lg-down:hidden">
                    {t('folders.table.pinStatus')}
                  </th>
                  <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider lg-down:hidden">
                    {t('folders.table.createdAt')}
                  </th>
                  {hasAnyActionPermission && (
                    <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('folders.table.actions')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                {folders.map((folder) => (
                  <tr 
                    key={folder.id} 
                    className="hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                    onClick={() => {
                      setSelectedFolder(folder);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-4 py-3 xl-down:px-3 xl-down:py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 xl-down:w-8 xl-down:h-8 rounded-lg flex items-center justify-center">
                          {(() => {
                            const IconComponent = getFolderIcon(folder.icon || 'folder');
                            const colorClass = getFolderColorClass(folder.color);
                            return <IconComponent className={`w-6 h-6 xl-down:w-5 xl-down:h-5 ${colorClass}`} strokeWidth={2} />;
                          })()}
                        </div>
                        <div className="ml-3 xl-down:ml-2">
                          <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                            {folder.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 xl-down:h-6 xl-down:w-6">
                          {folder.user.avatar ? (
                            <img
                              className="h-8 w-8 xl-down:h-6 xl-down:w-6 rounded-full object-cover"
                              src={folder.user.avatar}
                              alt={folder.user.name}
                            />
                          ) : (
                            <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs xl-down:text-2xs font-medium">
                                {folder.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 xl-down:ml-2">
                          <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                            {folder.user.name}
                          </div>
                          <div className="text-sm xl-down:text-2xs text-gray-600 dark:text-gray-400">
                            ID: {folder.user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap">
                      <span className="px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {folder.notesCount} {t('title')}
                      </span>
                    </td>
                    <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap lg-down:hidden">
                      {folder.isPinned ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          <svg className="w-3.5 h-3.5 xl-down:w-3 xl-down:h-3 fill-current" viewBox="0 0 24 24">
                            <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                          </svg>
                          {t('folders.status.pinned')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          {t('folders.status.unpinned')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap lg-down:hidden">
                      {formatDate(folder.createdAt)}
                    </td>
                    {hasAnyActionPermission && (
                      <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {canEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFolder(folder);
                                setShowEditModal(true);
                              }}
                              className="p-2 xl-down:p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg xl-down:rounded-md transition-colors"
                              title={t('folders.actions.edit') as string}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id, folder.userId);
                              }}
                              className="p-2 xl-down:p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg xl-down:rounded-md transition-colors"
                              title={t('actions.delete') as string}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Desktop/Tablet Pagination */}
            {totalPages > 1 && (
              <div className="-mx-4 xl-down:-mx-3 px-4 xl-down:px-3 md-down:hidden">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}

            {/* Mobile Card View */}
            <div className="hidden md-down:block">
              <div className="space-y-3 p-3">
                {folders.map((folder) => {
                const IconComponent = getFolderIcon(folder.icon || 'folder');
                const colorClass = getFolderColorClass(folder.color);
                
                return (
                  <MobileCard
                    key={folder.id}
                    title={folder.name}
                    subtitle={`${folder.user.name} (ID: ${folder.user.id})`}
                    icon={
                      <div className="w-10 h-10 xl-down:w-8 xl-down:h-8 rounded-lg flex items-center justify-center">
                        <IconComponent className={`w-6 h-6 xl-down:w-5 xl-down:h-5 ${colorClass}`} strokeWidth={2} />
                      </div>
                    }
                    badges={
                      <>
                        <span className="px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {folder.notesCount} {t('title')}
                        </span>
                        {folder.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                            <svg className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M16 12V4H17V2H7V4H8V12L6 14V16H11.2V22H12.8V16H18V14L16 12Z" />
                            </svg>
                            {t('folders.status.pinned')}
                          </span>
                        )}
                      </>
                    }
                    metadata={[
                      { label: t('folders.table.createdAt'), value: formatDate(folder.createdAt) }
                    ]}
                    actions={
                      hasAnyActionPermission && (
                        <>
                          {canEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFolder(folder);
                                setShowEditModal(true);
                              }}
                              className="p-2 xl-down:p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg xl-down:rounded-md transition-colors"
                              title={t('folders.actions.edit') as string}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFolder(folder.id, folder.userId);
                              }}
                              className="p-2 xl-down:p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg xl-down:rounded-md transition-colors"
                              title={t('actions.delete') as string}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </>
                      )
                    }
                    onClick={() => {
                      if (canViewDetail) {
                        setSelectedFolder(folder);
                        setShowDetailModal(true);
                      }
                    }}
                  />
                );
                })}
              </div>

              {/* Mobile Pagination */}
              {totalPages > 1 && (
                <div className="-mx-4 xl-down:-mx-3 px-4 xl-down:px-3">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadFolders();
        }}
      />

      {/* Edit Folder Modal */}
      <EditFolderModal
        show={showEditModal}
        folder={selectedFolder}
        onClose={() => {
          setShowEditModal(false);
          setSelectedFolder(null);
        }}
        onSuccess={() => {
          loadFolders();
        }}
      />

      {/* Folder Detail Modal */}
      <FolderDetailModal
        show={canViewDetail && showDetailModal}
        folderId={selectedFolder?.id || null}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedFolder(null);
        }}
      />
      {/* Hidden counters to reference pagination state and avoid unused warnings */}
      <div className="hidden" aria-hidden>{`pages:${totalPages}|total:${totalItems}`}</div>
    </div>
  );
};

export default FoldersList;
