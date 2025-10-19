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
  
  const {
    notes,
    setNotes,
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    selectedUserId,
    setSelectedUserId,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    archivedFilter,
    setArchivedFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalItems,
    setTotalItems,
  } = notesState;
  
  const {
    editingNote,
    setEditingNote,
    showEditModal,
    setShowEditModal,
    selectedNote,
    setSelectedNote,
    showDetailModal,
    setShowDetailModal,
    showMoveToFolderModal,
    setShowMoveToFolderModal,
    noteToMove,
    setNoteToMove,
    showCreateModal,
    setShowCreateModal,
    showTagsModal,
    setShowTagsModal,
    noteForTags,
    setNoteForTags,
  } = modalState;
  
  const { formatDate, truncateWords, getPlainText } = utilityHandlers;

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
  const { tab, setTab } = useTabEffects({
    forcedArchived,
    setArchivedFilter,
    setCurrentPage,
    setSelectedUserId,
  });

  // Use handlers hook
  const handlers = useNotesHandlers({
    setLoading,
    setNotes,
    setTotalPages,
    setTotalItems,
    currentPage,
    selectedUserId,
    searchTerm,
    categoryFilter,
    priorityFilter,
    archivedFilter,
    setShowEditModal,
    setEditingNote,
    t,
  });
  
  const { loadNotes, createHandleUpdateNote, createHandleDeleteNote, handleTogglePin, handleToggleArchive } = handlers;
  
  // Use effects hook
  useNotesEffects({
    loadNotes,
    currentPage,
    searchTerm,
    selectedUserId,
    categoryFilter,
    priorityFilter,
    archivedFilter,
  });


  // Enable drag-to-scroll for tabs scroller
  const { containerRef, onPointerDown, onPointerMove, endDrag, onClickCapture } = useHorizontalDragScroll();

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl-down:flex-col xl-down:items-start xl-down:space-y-3">
          <div className="xl-down:w-full">
            <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
          </div>
          {hasPermission('manage_notes.create') && tab !== 'archived' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 sm:mt-0 xl-down:mt-0 xl-down:w-full sm-down:w-full px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-3 sm-down:py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm xl-down:text-xs font-medium"
            >
              {t('createNote')}
            </button>
          )}
        </div>
      )}

      {/* Tabs All / Active / Archived (segmented control) */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-x-hidden">
        <div
          ref={containerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={onClickCapture}
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
                active={tab === 'all'}
                onClick={() => setTab('all')}
                icon={<svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h12v2H4v-2z"/></svg>}
                label={t('filters.all')}
                ariaLabel={t('filters.all') as string}
              />
            )}
            {hasPermission('manage_notes.view') && (
              <TabButton
                active={tab === 'active'}
                onClick={() => setTab('active')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4 1.5 1.5-5.5 5.5L7.5 13.5 9 12z"/></svg>}
                label={t('filters.active')}
                ariaLabel={t('filters.active') as string}
              />
            )}
            {hasPermission('manage_notes.archive') && (
              <TabButton
                active={tab === 'archived'}
                onClick={() => setTab('archived')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v4H3V3zm1 6h16v12H4V9zm4 2v2h8v-2H8z"/></svg>}
                label={t('filters.archived')}
                ariaLabel={t('filters.archived') as string}
              />
            )}
            {(hasPermission('manage_notes.shared.view') || hasPermission('manage_notes.shared.delete')) && (
              <TabButton
                active={tab === 'shared'}
                onClick={() => setTab('shared')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/></svg>}
                label={t('filters.shared', { defaultValue: 'Chia sẻ' })}
                ariaLabel={t('filters.shared', { defaultValue: 'Ghi chú chia sẻ' }) as string}
              />
            )}
            {hasPermission('manage_notes.folders.view') && (
              <TabButton
                active={tab === 'folders'}
                onClick={() => setTab('folders')}
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293l1.414 1.414a1 1 0 0 0 .707.293H19a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4z"/></svg>}
                label={t('filters.folders')}
                ariaLabel={t('filters.folders') as string}
              />
            )}
            {hasPermission('manage_notes.tags.view') && (
              <TabButton
                active={tab === 'tags'}
                onClick={() => setTab('tags')}
                icon={<Tag className="w-4 h-4" />}
                label={t('filters.tags')}
                ariaLabel={t('filters.tags') as string}
              />
            )}
          </div>
        </div>
      </div>

      {/* Filters - only show for notes tabs, not shared/folders/tags tabs */}
      {tab !== 'shared' && tab !== 'folders' && tab !== 'tags' && (
        <NotesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          archivedFilter={archivedFilter}
          setArchivedFilter={setArchivedFilter}
          onClear={() => {
            setSearchTerm('');
            setSelectedUserId('');
            setCategoryFilter('');
            setPriorityFilter('');
            const next = forcedArchived
              ? (forcedArchived === 'all' ? '' : forcedArchived === 'active' ? 'false' : 'true')
              : (tab === 'all' ? '' : tab === 'active' ? 'false' : 'true');
            setArchivedFilter(next);
            setCurrentPage(1);
          }}
          showStatusSelect={false}
        />
      )}

      {/* Render SharedNotesList for shared tab, FoldersList for folders tab, TagsList for tags tab */}
      {tab === 'shared' ? (
        <SharedNotesList embedded />
      ) : tab === 'folders' ? (
        <FoldersList embedded />
      ) : tab === 'tags' ? (
        <TagsList embedded />
      ) : (
        /* Notes List */
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {notes.length === 0 ? (
              <EmptyState tab={tab} onCreateClick={() => setShowCreateModal(true)} />
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
                      {notes.map((note) => (
                        <NoteTableRow
                          key={note.id}
                          note={note}
                          onNoteClick={() => {
                            if (hasPermission('manage_notes.view_detail')) {
                              setSelectedNote(note);
                              setShowDetailModal(true);
                            }
                          }}
                          onEdit={() => {
                            setEditingNote(note);
                            setShowEditModal(true);
                          }}
                          onArchive={() => handleToggleArchive(note)}
                          onMove={() => {
                            setNoteToMove(note);
                            setShowMoveToFolderModal(true);
                          }}
                          onDelete={() => createHandleDeleteNote(note.id)()}
                          onPin={() => handleTogglePin(note)}
                          onTagsClick={() => {
                            setNoteForTags(note);
                            setShowTagsModal(true);
                          }}
                          truncateWords={truncateWords}
                          getPlainText={getPlainText}
                          formatDate={formatDate}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="hidden lg-down:block space-y-3 sm-down:space-y-2 p-4 xl-down:p-3 sm-down:p-2">
                  {notes.map((note) => (
                    <NoteMobileCard
                      key={note.id}
                      note={note}
                      onNoteClick={() => {
                        if (hasPermission('manage_notes.view_detail')) {
                          setSelectedNote(note);
                          setShowDetailModal(true);
                        }
                      }}
                      onEdit={() => {
                        setEditingNote(note);
                        setShowEditModal(true);
                      }}
                      onArchive={() => handleToggleArchive(note)}
                      onMove={() => {
                        setNoteToMove(note);
                        setShowMoveToFolderModal(true);
                      }}
                      onDelete={() => createHandleDeleteNote(note.id)()}
                      onPin={() => handleTogglePin(note)}
                      truncateWords={truncateWords}
                      getPlainText={getPlainText}
                      formatDate={formatDate}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={totalItems}
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
        show={showEditModal}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onClose={() => {
          setShowEditModal(false);
          setEditingNote(null);
        }}
        onSubmit={createHandleUpdateNote(editingNote)}
      />

      {/* Detail Modal */}
      <NoteDetailModal
        show={showDetailModal}
        note={selectedNote}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNote(null);
        }}
      />

      {/* Move to Folder Modal */}
      <MoveToFolderModal
        show={showMoveToFolderModal}
        noteId={noteToMove?.id || null}
        noteTitle={noteToMove?.title || ''}
        userId={noteToMove?.user?.id || 0}
        onClose={() => {
          setShowMoveToFolderModal(false);
          setNoteToMove(null);
        }}
        onSuccess={() => {
          loadNotes();
        }}
      />

      {/* Create Note Modal */}
      <CreateNoteModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadNotes();
        }}
      />

      {/* Tags Management Modal */}
      {noteForTags && hasPermission('manage_notes.tags.assign') && (
        <NoteTagsModal
          isOpen={showTagsModal}
          onClose={() => {
            setShowTagsModal(false);
            setNoteForTags(null);
          }}
          noteId={noteForTags.id}
          userId={noteForTags.user.id}
          currentTags={noteForTags.tags || []}
          noteTitle={noteForTags.title}
          onTagsChange={() => {
            loadNotes();
          }}
        />
      )}
    </div>
  );
};

export default NotesList;
