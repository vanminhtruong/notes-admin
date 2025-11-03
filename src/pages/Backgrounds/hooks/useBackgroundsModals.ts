import { useState } from 'react';
import type { Background } from '../interface';

export const useBackgroundsModals = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openEditModal = (background: Background) => {
    setSelectedBackground(background);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedBackground(null);
  };

  const openDetailModal = (background: Background) => {
    setSelectedBackground(background);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBackground(null);
  };

  return {
    isCreateModalOpen,
    isEditModalOpen,
    isDetailModalOpen,
    selectedBackground,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDetailModal,
    closeDetailModal,
  };
};
