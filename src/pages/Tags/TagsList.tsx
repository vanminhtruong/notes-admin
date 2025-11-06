import React from 'react';
import { toast } from 'react-toastify';
import Pagination from '@components/common/Pagination';
import CreateTagModal from './components/CreateTagsModal';
import EditTagModal from './components/EditTagsModal';
import TagDetailModal from './components/TagsDetailModal';

// Import UI components
import TagsHeader from './components/TagsHeader';
import TagsFilters from './components/TagsFilters';
import TagsStats from './components/TagsStats';
import LoadingSpinner from './components/LoadingSpinner';
import EmptyState from './components/EmptyState';
import TagsGrid from './components/TagsGrid';
import NoPermissionView from './components/NoPermissionView';

// Import hooks
import {
  useTagsState,
  useTagsFilters,
  useTagsModals,
  useTagsHandlers,
  useTagsEffects,
} from './hooks';

// Import types
import type { Tag } from './interface/Tags.types';

const TagsList: React.FC = () => {
  // Use hooks
  const state = useTagsState();
  const filters = useTagsFilters();
  const modals = useTagsModals();
  const handlers = useTagsHandlers({
    setIsLoading: state.setIsLoading,
    setTags: state.setTags,
    setTotal: state.setTotal,
    setTotalPages: state.setTotalPages,
    currentPage: state.currentPage,
    searchTerm: filters.searchTerm,
    selectedUserId: filters.selectedUserId,
  });

  // Handle effects (fetch and socket)
  useTagsEffects({ fetchTags: handlers.fetchTags });

  // Handle edit with permission check
  const handleEdit = (tag: Tag) => {
    if (!handlers.canEdit) {
      toast.error('No permission to edit');
      return;
    }
    modals.openEditModal(tag);
  };

  if (!handlers.canView) {
    return <NoPermissionView />;
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {/* Header */}
      <TagsHeader />

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2">
        <TagsFilters
          searchTerm={filters.searchTerm}
          selectedUserId={filters.selectedUserId}
          isLoading={state.isLoading}
          canCreate={handlers.canCreate}
          onSearchChange={(value) => filters.handleSearchChange(value, () => state.setCurrentPage(1))}
          onUserIdChange={(value) => filters.handleUserIdChange(value, () => state.setCurrentPage(1))}
          onRefresh={handlers.fetchTags}
          onCreateClick={modals.openCreateModal}
        />
        <TagsStats total={state.total} />
      </div>

      {/* Tags List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {state.isLoading ? (
          <LoadingSpinner />
        ) : state.tags.length === 0 ? (
          <EmptyState hasFilters={!!(filters.searchTerm || filters.selectedUserId)} />
        ) : (
          <>
            <TagsGrid
              tags={state.tags}
              canEdit={handlers.canEdit}
              canDelete={handlers.canDelete}
              onView={modals.openDetailModal}
              onEdit={handleEdit}
              onDelete={handlers.handleDelete}
              onPin={handlers.handlePin}
              onUnpin={handlers.handleUnpin}
            />

            {/* Pagination */}
            {state.totalPages >= 2 && (
              <Pagination
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                onPageChange={state.setCurrentPage}
                showInfo={true}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {modals.isCreateModalOpen && (
        <CreateTagModal
          isOpen={modals.isCreateModalOpen}
          onClose={modals.closeCreateModal}
          onSuccess={handlers.fetchTags}
        />
      )}

      {modals.isEditModalOpen && modals.selectedTag && (
        <EditTagModal
          isOpen={modals.isEditModalOpen}
          tag={modals.selectedTag}
          onClose={modals.closeEditModal}
          onSuccess={handlers.fetchTags}
        />
      )}

      {modals.isDetailModalOpen && modals.selectedTag && (
        <TagDetailModal
          isOpen={modals.isDetailModalOpen}
          tag={modals.selectedTag}
          onClose={modals.closeDetailModal}
        />
      )}
    </div>
  );
};

export default TagsList;
