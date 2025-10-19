import { useState } from 'react';
import type { Category } from '../../interface/category.types';

export interface UseCategoriesModalsReturn {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  openCreateModal: () => void;
  openEditModal: (category: Category) => void;
  openDetailModal: (category: Category) => void;
  closeCreateModal: () => void;
  closeEditModal: () => void;
  closeDetailModal: () => void;
}

export const useCategoriesModals = (): UseCategoriesModalsReturn => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const openCreateModal = () => setIsCreateModalOpen(true);
  
  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };
  
  const openDetailModal = (category: Category) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };
  
  const closeCreateModal = () => setIsCreateModalOpen(false);
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };
  
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCategory(null);
  };

  return {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedCategory,
    setSelectedCategory,
    openCreateModal,
    openEditModal,
    openDetailModal,
    closeCreateModal,
    closeEditModal,
    closeDetailModal,
  };
};
