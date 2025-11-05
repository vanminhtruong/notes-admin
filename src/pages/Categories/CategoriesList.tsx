import React from 'react';
import { toast } from 'react-toastify';
import Pagination from '@components/common/Pagination';
import CreateCategoryModal from '@pages/Categories/components/CreateCategoryModal';
import EditCategoryModal from '@pages/Categories/components/EditCategoryModal';
import CategoryDetailModal from '@pages/Categories/components/CategoryDetailModal';

// Import UI components
import CategoriesHeader from '@pages/Categories/components/CategoriesHeader';
import CategoriesFilters from '@pages/Categories/components/CategoriesFilters';
import CategoriesStats from '@pages/Categories/components/CategoriesStats';
import LoadingSpinner from '@pages/Categories/components/LoadingSpinner';
import EmptyState from '@pages/Categories/components/EmptyState';
import CategoriesGrid from '@pages/Categories/components/CategoriesGrid';
import NoPermissionView from '@pages/Categories/components/NoPermissionView';

// Import hooks
import {
  useCategoriesState,
  useCategoriesFilters,
  useCategoriesModals,
  useCategoriesHandlers,
  useCategoriesEffects,
} from './hooks';

// Import types
import type { Category } from './interface/category.types';

const CategoriesList: React.FC = () => {
  // Use hooks
  const state = useCategoriesState();
  const filters = useCategoriesFilters();
  const modals = useCategoriesModals();
  const handlers = useCategoriesHandlers({
    setIsLoading: state.setIsLoading,
    setCategories: state.setCategories,
    setTotal: state.setTotal,
    setTotalPages: state.setTotalPages,
    currentPage: state.currentPage,
    searchTerm: filters.searchTerm,
    selectedUserId: filters.selectedUserId,
  });

  // Handle effects (fetch and socket)
  useCategoriesEffects({ fetchCategories: handlers.fetchCategories });

  // Handle edit with permission check
  const handleEdit = (category: Category) => {
    if (!handlers.canEdit) {
      toast.error('No permission to edit');
      return;
    }
    modals.openEditModal(category);
  };

  if (!handlers.canView) {
    return <NoPermissionView />;
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {/* Header */}
      <CategoriesHeader />

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2">
        <CategoriesFilters
          searchTerm={filters.searchTerm}
          selectedUserId={filters.selectedUserId}
          isLoading={state.isLoading}
          canCreate={handlers.canCreate}
          onSearchChange={(value) => filters.handleSearchChange(value, () => state.setCurrentPage(1))}
          onUserIdChange={(value) => filters.handleUserIdChange(value, () => state.setCurrentPage(1))}
          onRefresh={handlers.fetchCategories}
          onCreateClick={modals.openCreateModal}
        />
        <CategoriesStats total={state.total} />
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {state.isLoading ? (
          <LoadingSpinner />
        ) : state.categories.length === 0 ? (
          <EmptyState hasFilters={!!(filters.searchTerm || filters.selectedUserId)} />
        ) : (
          <>
            <CategoriesGrid
              categories={state.categories}
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
        <CreateCategoryModal
          isOpen={modals.isCreateModalOpen}
          onClose={modals.closeCreateModal}
          onSuccess={handlers.fetchCategories}
        />
      )}

      {modals.isEditModalOpen && modals.selectedCategory && (
        <EditCategoryModal
          isOpen={modals.isEditModalOpen}
          category={modals.selectedCategory}
          onClose={modals.closeEditModal}
          onSuccess={handlers.fetchCategories}
        />
      )}

      {modals.isDetailModalOpen && modals.selectedCategory && (
        <CategoryDetailModal
          isOpen={modals.isDetailModalOpen}
          category={modals.selectedCategory}
          onClose={modals.closeDetailModal}
        />
      )}
    </div>
  );
};

export default CategoriesList;
