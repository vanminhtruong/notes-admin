import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Pagination from '@components/common/Pagination';
import CreateBackgroundModal from '@pages/Backgrounds/components/CreateBackgroundModal';
import EditBackgroundModal from '@pages/Backgrounds/components/EditBackgroundModal';
import BackgroundDetailModal from '@pages/Backgrounds/components/BackgroundDetailModal';
import DeleteBackgroundModal from '@pages/Backgrounds/components/DeleteBackgroundModal';

// Import UI components
import BackgroundsHeader from '@pages/Backgrounds/components/BackgroundsHeader';
import BackgroundsTabs from '@pages/Backgrounds/components/BackgroundsTabs';
import BackgroundsFilters from '@pages/Backgrounds/components/BackgroundsFilters';
import BackgroundsStats from '@pages/Backgrounds/components/BackgroundsStats';
import LoadingSpinner from '@pages/Backgrounds/components/LoadingSpinner';
import EmptyState from '@pages/Backgrounds/components/EmptyState';
import BackgroundsGrid from '@pages/Backgrounds/components/BackgroundsGrid';
import NoPermissionView from '@pages/Backgrounds/components/NoPermissionView';

// Import hooks
import {
  useBackgroundsState,
  useBackgroundsFilters,
  useBackgroundsModals,
  useBackgroundsHandlers,
  useBackgroundsEffects,
} from './hooks';

// Import types
import type { Background } from './interface';

const BackgroundsList: React.FC = () => {
  // Use hooks
  const state = useBackgroundsState();
  const filters = useBackgroundsFilters();
  const modals = useBackgroundsModals();
  const handlers = useBackgroundsHandlers({
    setIsLoading: state.setIsLoading,
    setBackgrounds: state.setBackgrounds,
    setTotal: state.setTotal,
    setTotalPages: state.setTotalPages,
    currentPage: state.currentPage,
    activeTab: state.activeTab,
    searchTerm: filters.searchTerm,
    selectedCategory: filters.selectedCategory,
    selectedStatus: filters.selectedStatus,
  });

  // Handle effects (fetch and socket)
  useBackgroundsEffects({ fetchBackgrounds: handlers.fetchBackgrounds });

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; background: Background | null; isDeleting: boolean }>({
    isOpen: false,
    background: null,
    isDeleting: false,
  });

  // Handle edit with permission check
  const handleEdit = (background: Background) => {
    if (!handlers.canEdit) {
      toast.error('No permission to edit');
      return;
    }
    modals.openEditModal(background);
  };

  // Handle delete - open modal
  const handleDelete = (id: number) => {
    const background = state.backgrounds.find(bg => bg.id === id);
    if (background) {
      setDeleteModal({ isOpen: true, background, isDeleting: false });
    }
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteModal.background) return;
    
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    await handlers.confirmDelete(deleteModal.background.id);
    setDeleteModal({ isOpen: false, background: null, isDeleting: false });
  };

  // Close delete modal
  const handleCloseDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({ isOpen: false, background: null, isDeleting: false });
    }
  };

  if (!handlers.canView) {
    return <NoPermissionView />;
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {/* Header */}
      <BackgroundsHeader />

      {/* Tabs and Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {/* Tabs */}
        <BackgroundsTabs
          activeTab={state.activeTab}
          onTabChange={(tab) => {
            state.setActiveTab(tab);
            state.setCurrentPage(1);
          }}
        />

        {/* Filters */}
        <div className="p-4 xl-down:p-3 sm-down:p-2">
          <BackgroundsFilters
            searchTerm={filters.searchTerm}
            selectedCategory={filters.selectedCategory}
            selectedStatus={filters.selectedStatus}
            isLoading={state.isLoading}
            canCreate={handlers.canCreate}
            onSearchChange={(value) => filters.handleSearchChange(value, () => state.setCurrentPage(1))}
            onCategoryChange={(value) => filters.handleCategoryChange(value, () => state.setCurrentPage(1))}
            onStatusChange={(value) => filters.handleStatusChange(value, () => state.setCurrentPage(1))}
            onRefresh={handlers.fetchBackgrounds}
            onCreateClick={modals.openCreateModal}
          />
          <BackgroundsStats total={state.total} />
        </div>
      </div>

      {/* Backgrounds List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {state.isLoading ? (
          <LoadingSpinner />
        ) : state.backgrounds.length === 0 ? (
          <EmptyState
            hasFilters={!!(
              filters.searchTerm ||
              filters.selectedCategory ||
              filters.selectedStatus !== 'all'
            )}
          />
        ) : (
          <>
            <BackgroundsGrid
              backgrounds={state.backgrounds}
              canEdit={handlers.canEdit}
              canDelete={handlers.canDelete}
              onView={modals.openDetailModal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handlers.handleToggleActive}
            />

            {/* Pagination */}
            {state.totalPages >= 2 && (
              <Pagination
                currentPage={state.currentPage}
                totalPages={state.totalPages}
                onPageChange={state.setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateBackgroundModal
        isOpen={modals.isCreateModalOpen}
        onClose={modals.closeCreateModal}
        onSuccess={handlers.fetchBackgrounds}
      />

      <EditBackgroundModal
        isOpen={modals.isEditModalOpen}
        background={modals.selectedBackground}
        onClose={modals.closeEditModal}
        onSuccess={handlers.fetchBackgrounds}
      />

      <BackgroundDetailModal
        isOpen={modals.isDetailModalOpen}
        background={modals.selectedBackground}
        onClose={modals.closeDetailModal}
      />

      <DeleteBackgroundModal
        isOpen={deleteModal.isOpen}
        backgroundLabel={deleteModal.background?.label || ''}
        isDeleting={deleteModal.isDeleting}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default BackgroundsList;
