import { useState } from 'react';
import type { Admin } from '../../interfaces/admin.types';

export interface ConfirmAction {
  type: 'toggle' | 'delete' | 'revoke';
  adminId: number;
  adminName: string;
  permission?: string;
}

export const useAdminsListState = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [profileAdmin, setProfileAdmin] = useState<Admin | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  return {
    createModalOpen,
    setCreateModalOpen,
    editModalOpen,
    setEditModalOpen,
    profileModalOpen,
    setProfileModalOpen,
    selectedAdmin,
    setSelectedAdmin,
    profileAdmin,
    setProfileAdmin,
    confirmAction,
    setConfirmAction,
  };
};
