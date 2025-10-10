import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit, Eye, Tag, User, RefreshCw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { hasPermission } from '@utils/auth';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import Pagination from '@components/common/Pagination';
import CreateCategoryModal from '@pages/Categories/components/CreateCategoryModal';
import EditCategoryModal from '@pages/Categories/components/EditCategoryModal';
import CategoryDetailModal from '@pages/Categories/components/CategoryDetailModal';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
  notesCount?: number;
}

const CategoriesList: React.FC = () => {
  const { t } = useTranslation('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Check permissions
  const canView = hasPermission('manage_notes.categories.view');
  const canCreate = hasPermission('manage_notes.categories.create');
  const canEdit = hasPermission('manage_notes.categories.edit');
  const canDelete = hasPermission('manage_notes.categories.delete');

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    if (!canView) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedUserId) params.userId = selectedUserId;

      const response: any = await adminService.getAllCategories(params);
      setCategories(response.categories);
      setTotal(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || t('loadingCategories'));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedUserId, canView]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Real-time socket updates
  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handleCategoryCreated = (data: any) => {
      console.log('Category created:', data);
      fetchCategories();
    };

    const handleCategoryUpdated = (data: any) => {
      console.log('Category updated:', data);
      fetchCategories();
    };

    const handleCategoryDeleted = (data: any) => {
      console.log('Category deleted:', data);
      fetchCategories();
    };

    // Listen to events from both admin and user actions
    socket.on('admin_category_created', handleCategoryCreated);
    socket.on('admin_category_updated', handleCategoryUpdated);
    socket.on('admin_category_deleted', handleCategoryDeleted);
    
    // Listen to events from user actions
    socket.on('user_category_created', handleCategoryCreated);
    socket.on('user_category_updated', handleCategoryUpdated);
    socket.on('user_category_deleted', handleCategoryDeleted);

    return () => {
      socket.off('admin_category_created', handleCategoryCreated);
      socket.off('admin_category_updated', handleCategoryUpdated);
      socket.off('admin_category_deleted', handleCategoryDeleted);
      
      socket.off('user_category_created', handleCategoryCreated);
      socket.off('user_category_updated', handleCategoryUpdated);
      socket.off('user_category_deleted', handleCategoryDeleted);
    };
  }, [fetchCategories]);

  // Delete category
  const handleDelete = async (category: Category) => {
    if (!canDelete) {
      toast.error(t('noPermissionView'));
      return;
    }

    if (!window.confirm(t('modal.detail.confirmDelete'))) {
      return;
    }

    try {
      await adminService.deleteCategory(category.id);
      toast.success(t('modal.detail.deleteSuccess'));
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || t('modal.detail.deleteError'));
    }
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    if (!canEdit) {
      toast.error(t('noPermissionView'));
      return;
    }
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // Handle view detail
  const handleViewDetail = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('noPermissionView')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {/* Header */}
      <div>
        <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">
          {t('subtitle')}
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl-down:w-4 xl-down:h-4" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 xl-down:py-1.5 sm-down:text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Filter by User ID */}
          <div className="w-full md:w-48">
            <input
              type="number"
              placeholder={t('filterByUser')}
              value={selectedUserId}
              onChange={(e) => {
                setSelectedUserId(e.target.value ? parseInt(e.target.value) : '');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 xl-down:py-1.5 sm-down:text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={fetchCategories}
              disabled={isLoading}
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:text-sm bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
            
            {canCreate && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
                {t('createCategory')}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 xl-down:mt-3 flex items-center gap-4 text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
          <span>Total: <strong>{total}</strong> categories</span>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 xl-down:py-8">
            <Tag className="w-16 h-16 xl-down:w-12 xl-down:h-12 text-gray-400 mx-auto mb-4 xl-down:mb-3" />
            <h3 className="text-lg xl-down:text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('noCategoriesFound')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm xl-down:text-xs">
              {searchTerm || selectedUserId ? t('noCategoriesFound') : t('enterKeywordToSearch')}
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 xl-down:p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl-down:gap-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm hover:shadow-md transition-shadow p-4 xl-down:p-3 border border-gray-200 dark:border-neutral-700"
                  >
                    {/* Category Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {(() => {
                            const Icon = (LucideIcons as any)[category.icon] || LucideIcons.Tag;
                            return <Icon className="w-5 h-5" style={{ color: category.color }} />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-semibold truncate text-sm"
                            style={{ color: category.color }}
                          >
                            {category.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {category.notesCount || 0} notes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
                      <User className="w-3 h-3" />
                      <span className="truncate">{category.user.name}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewDetail(category)}
                        className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        {t('view')}
                      </button>
                      
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(category)}
                          className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          {t('edit')}
                        </button>
                      )}
                      
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(category)}
                          className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          {t('delete')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchCategories}
        />
      )}

      {isEditModalOpen && selectedCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          category={selectedCategory}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={fetchCategories}
        />
      )}

      {isDetailModalOpen && selectedCategory && (
        <CategoryDetailModal
          isOpen={isDetailModalOpen}
          category={selectedCategory}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default CategoriesList;
