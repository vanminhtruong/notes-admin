import React from 'react';
import { Tag } from 'lucide-react';
import { hasPermission, hasAnyNotesPermission } from '@utils/auth';
import { useTranslation } from 'react-i18next';
import NotesFilters from '@pages/Notes/components/NotesFilters';
import NoteDetailModal from '@pages/Notes/components/NoteDetailModal';
import SharedNotesList from '@pages/Notes/components/SharedNotesList';
import FoldersList from '@pages/Notes/components/FoldersList';
import TagsList from '@pages/Notes/components/TagsList';
import MoveToFolderModal from '@pages/Notes/components/MoveToFolderModal';
import CreateNoteModal from '@pages/Notes/components/CreateNoteModal';
import NoteTagsModal from '@pages/Notes/components/NoteTagsModal';
import EditNoteModal from '@pages/Notes/components/EditNoteModal';
import Pagination from '@components/common/Pagination';
import TabButton from '@pages/Notes/components/TabButton';
import LoadingSpinner from '@pages/Notes/components/LoadingSpinner';
import EmptyState from '@pages/Notes/components/EmptyState';
import NoteTableRow from '@pages/Notes/components/NoteTableRow';
import NoteMobileCard from '@pages/Notes/components/NoteMobileCard';

// Import custom hooks and types
import {
  useNotesState,
  useModalState,
  useNotesHandlers,
  useUtilityHandlers,
  useNotesEffects,
  useTabEffects,
  useHorizontalDragScroll,
  type NotesListProps,
} from './hooks';


const NotesList: React.FC<NotesListProps> = ({ forcedArchived, embedded }) => {
  const { t } = useTranslation('notes');
  
  // Use custom hooks for state management
  const notesState = useNotesState();
  const modalState = useModalState();
  const utilityHandlers = useUtilityHandlers();

  // Check if user has any notes permission (flexible check)
  if (!hasAnyNotesPermission()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t('noPermission.title', { defaultValue: 'Không có quyền truy cập' })}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('noPermission.description', { defaultValue: 'Bạn không có quyền xem danh sách ghi chú' })}
          </p>
        </div>
      </div>
    );
  }

  // Tab and URL effects
  const tabEffects = useTabEffects({
    forcedArchived,
    setArchivedFilter: notesState.setArchivedFilter,
    setCurrentPage: notesState.setCurrentPage,
    setSelectedUserId: notesState.setSelectedUserId,
  });

  // Use handlers hook
  const handlers = useNotesHandlers({
    setLoading: notesState.setLoading,
    setNotes: notesState.setNotes,
    setTotalPages: notesState.setTotalPages,
    setTotalItems: notesState.setTotalItems,
    currentPage: notesState.currentPage,
    selectedUserId: notesState.selectedUserId,
    searchTerm: notesState.searchTerm,
    categoryFilter: notesState.categoryFilter,
    priorityFilter: notesState.priorityFilter,
    archivedFilter: notesState.archivedFilter,
    setShowEditModal: modalState.setShowEditModal,
    setEditingNote: modalState.setEditingNote,
    t,
  });
  
  // Use effects hook
  useNotesEffects({
    loadNotes: handlers.loadNotes,
    currentPage: notesState.currentPage,
    searchTerm: notesState.searchTerm,
    selectedUserId: notesState.selectedUserId,
    categoryFilter: notesState.categoryFilter,
    priorityFilter: notesState.priorityFilter,
    archivedFilter: notesState.archivedFilter,
  });


  // Enable drag-to-scroll for tabs scroller
  const dragScroll = useHorizontalDragScroll();

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {!embedded && (
        <div className="relative mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-violet-600/5 to-purple-600/5 dark:from-indigo-500/10 dark:via-violet-500/10 dark:to-purple-500/10 rounded-2xl xl-down:rounded-xl -z-10" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 xl-down:p-4 sm-down:p-3">
            <div className="flex items-center gap-4 xl-down:gap-3">
              <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 sm-down:w-10 sm-down:h-10 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 dark:shadow-indigo-500/15">
                <svg className="w-7 h-7 xl-down:w-6 xl-down:h-6 sm-down:w-5 sm-down:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{t('title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
              </div>
            </div>
            {hasPermission('manage_notes.create') && tabEffects.tab !== 'archived' && (
              <button
                onClick={() => modalState.setShowCreateModal(true)}
                className="group mt-4 sm:mt-0 px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl xl-down:rounded-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 flex items-center gap-2.5 text-sm xl-down:text-xs font-medium"
              >
                <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="sm-down:hidden">{t('createNote')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs All / Active / Archived (segmented control) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-x-hidden hover:shadow-md transition-shadow duration-300">
        <div
          ref={dragScroll.containerRef}
          onPointerDown={dragScroll.onPointerDown}
          onPointerMove={dragScroll.onPointerMove}
          onPointerUp={dragScroll.endDrag}
          onPointerLeave={dragScroll.endDrag}
          onClickCapture={dragScroll.onClickCapture}
          className="px-4 xl-down:px-3 sm-down:px-2 py-3 xl-down:py-2 overflow-x-auto overflow-y-hidden scrollbar-hide md-down:cursor-grab"
          style={{ touchAction: 'pan-y' }}
        >
          {/* Fallback to ensure scrollbar hidden across all engines */}
          <style>
            {`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}
          </style>
          <div className="inline-flex items-center whitespace-nowrap p-1 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            {hasPermission('manage_notes.view') && (
              <TabButton
                active={tabEffects.tab === 'all'}
                onClick={() => tabEffects.setTab('all')}
                icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h12v2H4v-2z"/></svg>}
                label={t('filters.all')}
                ariaLabel={t('filters.all') as string}
              />
            )}
            {hasPermission('manage_notes.view') && (
              <TabButton
                active={tabEffects.tab === 'active'}
                onClick={() => tabEffects.setTab('active')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4 1.5 1.5-5.5 5.5L7.5 13.5 9 12z"/></svg>}
                label={t('filters.active')}
                ariaLabel={t('filters.active') as string}
              />
            )}
            {hasPermission('manage_notes.archive') && (
              <TabButton
                active={tabEffects.tab === 'archived'}
                onClick={() => tabEffects.setTab('archived')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v4H3V3zm1 6h16v12H4V9zm4 2v2h8v-2H8z"/></svg>}
                label={t('filters.archived')}
                ariaLabel={t('filters.archived') as string}
              />
            )}
            {(hasPermission('manage_notes.shared.view') || hasPermission('manage_notes.shared.delete')) && (
              <TabButton
                active={tabEffects.tab === 'shared'}
                onClick={() => tabEffects.setTab('shared')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/></svg>}
                label={t('filters.shared', { defaultValue: 'Chia sẻ' })}
                ariaLabel={t('filters.shared', { defaultValue: 'Ghi chú chia sẻ' }) as string}
              />
            )}
            {hasPermission('manage_notes.folders.view') && (
              <TabButton
                active={tabEffects.tab === 'folders'}
                onClick={() => tabEffects.setTab('folders')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l1.414 1.414a1 1 0 0 0 .707.293H19a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z"/></svg>}
                label={t('filters.folders')}
                ariaLabel={t('filters.folders') as string}
              />
            )}
            {hasPermission('manage_notes.tags.view') && (
              <TabButton
                active={tabEffects.tab === 'tags'}
                onClick={() => tabEffects.setTab('tags')}
                icon={<Tag className="w-4 h-4" />}
                label={t('filters.tags')}
                ariaLabel={t('filters.tags') as string}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filters - only show for notes tabs, not shared/folders/tags tabs */}
      {tabEffects.tab !== 'shared' && tabEffects.tab !== 'folders' && tabEffects.tab !== 'tags' && (
        <NotesFilters
          searchTerm={notesState.searchTerm}
          setSearchTerm={notesState.setSearchTerm}
          selectedUserId={notesState.selectedUserId}
          setSelectedUserId={notesState.setSelectedUserId}
          categoryFilter={notesState.categoryFilter}
          setCategoryFilter={notesState.setCategoryFilter}
          priorityFilter={notesState.priorityFilter}
          setPriorityFilter={notesState.setPriorityFilter}
          archivedFilter={notesState.archivedFilter}
          setArchivedFilter={notesState.setArchivedFilter}
          onClear={() => {
            notesState.setSearchTerm('');
            notesState.setSelectedUserId('');
            notesState.setCategoryFilter('');
            notesState.setPriorityFilter('');
            const next = forcedArchived
              ? (forcedArchived === 'all' ? '' : forcedArchived === 'active' ? 'false' : 'true')
              : (tabEffects.tab === 'all' ? '' : tabEffects.tab === 'active' ? 'false' : 'true');
            notesState.setArchivedFilter(next);
            notesState.setCurrentPage(1);
          }}
          showStatusSelect={false}
        />
      )}

      {/* Render SharedNotesList for shared tab, FoldersList for folders tab, TagsList for tags tab */}
      {tabEffects.tab === 'shared' ? (
        <SharedNotesList embedded />
      ) : tabEffects.tab === 'folders' ? (
        <FoldersList embedded />
      ) : tabEffects.tab === 'tags' ? (
        <TagsList embedded />
      ) : (
        /* Notes List */
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-shadow duration-300">
        {notesState.loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {notesState.notes.length === 0 ? (
              <EmptyState tab={tabEffects.tab} onCreateClick={() => modalState.setShowCreateModal(true)} />
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto lg-down:hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                    <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.note')}
                        </th>
                        <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.user')}
                        </th>
                        <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider lg-down:hidden">
                          {t('table.category')}
                        </th>
                        <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.priority')}
                        </th>
                        {hasPermission('manage_notes.tags.assign') && (
                          <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider xl-down:hidden" style={{maxWidth: '180px'}}>
                            {t('table.tags')}
                          </th>
                        )}
                        <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider lg-down:hidden">
                          {t('table.status')}
                        </th>
                        <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider lg-down:hidden">
                          {t('table.createdAt')}
                        </th>
                        {hasPermission('manage_notes.edit') && (
                          <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-center text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.pin')}
                          </th>
                        )}
                        {(hasPermission('manage_notes.edit') || hasPermission('manage_notes.delete') || hasPermission('manage_notes.archive') || hasPermission('manage_notes.folders.move')) && (
                          <th className="px-3 py-3 xl-down:px-2 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.actions')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                      {notesState.notes.map((note) => (
                        <NoteTableRow
                          key={note.id}
                          note={note}
                          onNoteClick={() => {
                            if (hasPermission('manage_notes.view_detail')) {
                              modalState.setSelectedNote(note);
                              modalState.setShowDetailModal(true);
                            }
                          }}
                          onEdit={() => {
                            modalState.setEditingNote(note);
                            modalState.setShowEditModal(true);
                          }}
                          onArchive={() => handlers.handleToggleArchive(note)}
                          onMove={() => {
                            modalState.setNoteToMove(note);
                            modalState.setShowMoveToFolderModal(true);
                          }}
                          onDelete={() => handlers.createHandleDeleteNote(note.id)()}
                          onPin={() => handlers.handleTogglePin(note)}
                          onTagsClick={() => {
                            modalState.setNoteForTags(note);
                            modalState.setShowTagsModal(true);
                          }}
                          truncateWords={utilityHandlers.truncateWords}
                          getPlainText={utilityHandlers.getPlainText}
                          formatDate={utilityHandlers.formatDate}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="hidden lg-down:block space-y-3 sm-down:space-y-2 p-4 xl-down:p-3 sm-down:p-2">
                  {notesState.notes.map((note) => (
                    <NoteMobileCard
                      key={note.id}
                      note={note}
                      onNoteClick={() => {
                        if (hasPermission('manage_notes.view_detail')) {
                          modalState.setSelectedNote(note);
                          modalState.setShowDetailModal(true);
                        }
                      }}
                      onEdit={() => {
                        modalState.setEditingNote(note);
                        modalState.setShowEditModal(true);
                      }}
                      onArchive={() => handlers.handleToggleArchive(note)}
                      onMove={() => {
                        modalState.setNoteToMove(note);
                        modalState.setShowMoveToFolderModal(true);
                      }}
                      onDelete={() => handlers.createHandleDeleteNote(note.id)()}
                      onPin={() => handlers.handleTogglePin(note)}
                      truncateWords={utilityHandlers.truncateWords}
                      getPlainText={utilityHandlers.getPlainText}
                      formatDate={utilityHandlers.formatDate}
                    />
                  ))}
                </div>

                {notesState.totalPages > 1 && (
                  <Pagination
                    currentPage={notesState.currentPage}
                    totalPages={notesState.totalPages}
                    onPageChange={notesState.setCurrentPage}
                    totalItems={notesState.totalItems}
                    itemsPerPage={5}
                    showInfo={true}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
      )}

      {/* Edit Modal */}
      <EditNoteModal
        show={modalState.showEditModal}
        editingNote={modalState.editingNote}
        setEditingNote={modalState.setEditingNote}
        onClose={() => {
          modalState.setShowEditModal(false);
          modalState.setEditingNote(null);
        }}
        onSubmit={handlers.createHandleUpdateNote(modalState.editingNote)}
      />

      {/* Detail Modal */}
      <NoteDetailModal
        show={modalState.showDetailModal}
        note={modalState.selectedNote}
        onClose={() => {
          modalState.setShowDetailModal(false);
          modalState.setSelectedNote(null);
        }}
      />

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        show={modalState.showMoveToFolderModal}
        noteId={modalState.noteToMove?.id || null}
        noteTitle={modalState.noteToMove?.title || ''}
        userId={modalState.noteToMove?.user?.id || 0}
        onClose={() => {
          modalState.setShowMoveToFolderModal(false);
          modalState.setNoteToMove(null);
        }}
        onSuccess={() => {
          handlers.loadNotes();
        }}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        show={modalState.showCreateModal}
        onClose={() => modalState.setShowCreateModal(false)}
        onSuccess={() => {
          handlers.loadNotes();
        }}
      />

      {/* Tags Management Modal */}
      {modalState.noteForTags && hasPermission('manage_notes.tags.assign') && (
        <NoteTagsModal
          isOpen={modalState.showTagsModal}
          onClose={() => {
            modalState.setShowTagsModal(false);
            modalState.setNoteForTags(null);
          }}
          noteId={modalState.noteForTags.id}
          userId={modalState.noteForTags.user.id}
          currentTags={modalState.noteForTags.tags || []}
          noteTitle={modalState.noteForTags.title}
          onTagsChange={() => {
            handlers.loadNotes();
          }}
        />
      )}
    </div>
  );
};

export default NotesList;
