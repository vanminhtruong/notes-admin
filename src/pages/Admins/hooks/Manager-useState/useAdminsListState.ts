import { useState } from 'react';
import type { Admin } from '../../interfaces/admin.types';

export interface ConfirmAction {
  type: 'toggle' | 'delete' | 'revoke';
  adminId: number;
  adminName: string;
  permission?: string;
}

export const useAdminsListState = () => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [adminLevelFilter, setAdminLevelFilter] = useState<string>('');
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [profileAdmin, setProfileAdmin] = useState<Admin | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  return {
    loading,
    setLoading,
    admins,
    setAdmins,
    currentAdmin,
    setCurrentAdmin,
    pagination,
    setPagination,
    searchText,
    setSearchText,
    adminLevelFilter,
    setAdminLevelFilter,
    availablePermissions,
    setAvailablePermissions,
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
