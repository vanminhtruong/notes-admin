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
  const {
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    total,
    setTotal,
  } = useCategoriesState();

  const {
    searchTerm,
    selectedUserId,
    handleSearchChange,
    handleUserIdChange,
  } = useCategoriesFilters();

  const {
    isCreateModalOpen,
    isEditModalOpen,
    isDetailModalOpen,
    selectedCategory,
    openCreateModal,
    openEditModal,
    openDetailModal,
    closeCreateModal,
    closeEditModal,
    closeDetailModal,
  } = useCategoriesModals();

  const {
    fetchCategories,
    handleDelete,
    canView,
    canCreate,
    canEdit,
    canDelete,
  } = useCategoriesHandlers({
    setIsLoading,
    setCategories,
    setTotal,
    setTotalPages,
    currentPage,
    searchTerm,
    selectedUserId,
  });

  // Handle effects (fetch and socket)
  useCategoriesEffects({ fetchCategories });

  // Handle edit with permission check
  const handleEdit = (category: Category) => {
    if (!canEdit) {
      toast.error('No permission to edit');
      return;
    }
    openEditModal(category);
  };

  if (!canView) {
    return <NoPermissionView />;
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {/* Header */}
      <CategoriesHeader />

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2">
        <CategoriesFilters
          searchTerm={searchTerm}
          selectedUserId={selectedUserId}
          isLoading={isLoading}
          canCreate={canCreate}
          onSearchChange={(value) => handleSearchChange(value, () => setCurrentPage(1))}
          onUserIdChange={(value) => handleUserIdChange(value, () => setCurrentPage(1))}
          onRefresh={fetchCategories}
          onCreateClick={openCreateModal}
        />
        <CategoriesStats total={total} />
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner />
        ) : categories.length === 0 ? (
          <EmptyState hasFilters={!!(searchTerm || selectedUserId)} />
        ) : (
          <>
            <CategoriesGrid
              categories={categories}
              canEdit={canEdit}
              canDelete={canDelete}
              onView={openDetailModal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages >= 2 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showInfo={true}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onSuccess={fetchCategories}
        />
      )}

      {isEditModalOpen && selectedCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          category={selectedCategory}
          onClose={closeEditModal}
          onSuccess={fetchCategories}
        />
      )}

      {isDetailModalOpen && selectedCategory && (
        <CategoryDetailModal
          isOpen={isDetailModalOpen}
          category={selectedCategory}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
};

export default CategoriesList;
