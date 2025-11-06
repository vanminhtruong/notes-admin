import { useState } from 'react';
import type { Tag } from '../../interface/Tags.types';

export interface UseTagsModalsReturn {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  selectedTag: Tag | null;
  setSelectedTag: (tag: Tag | null) => void;
  openCreateModal: () => void;
  openEditModal: (tag: Tag) => void;
  openDetailModal: (tag: Tag) => void;
  closeCreateModal: () => void;
  closeEditModal: () => void;
  closeDetailModal: () => void;
}

export const useTagsModals = (): UseTagsModalsReturn => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const openCreateModal = () => setIsCreateModalOpen(true);
  
  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };
  
  const openDetailModal = (tag: Tag) => {
    setSelectedTag(tag);
    setIsDetailModalOpen(true);
  };
  
  const closeCreateModal = () => setIsCreateModalOpen(false);
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTag(null);
  };
  
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTag(null);
  };

  return {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedTag,
    setSelectedTag,
    openCreateModal,
    openEditModal,
    openDetailModal,
    closeCreateModal,
    closeEditModal,
    closeDetailModal,
  };
};
