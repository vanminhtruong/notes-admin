import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import type { Admin, AdminFilters } from '../../interfaces/admin.types';
import type { ConfirmAction } from '../Manager-useState/useAdminsListState';

interface UseAdminsListHandlersProps {
  setLoading: (loading: boolean) => void;
  setAdmins: (admins: Admin[]) => void;
  setPagination: (pagination: any) => void;
  setAvailablePermissions: (permissions: string[]) => void;
  setSelectedAdmin: (admin: Admin | null) => void;
  setEditModalOpen: (open: boolean) => void;
  setProfileAdmin: (admin: Admin | null) => void;
  setProfileModalOpen: (open: boolean) => void;
  setConfirmAction: (action: ConfirmAction | null) => void;
  setCreateModalOpen: (open: boolean) => void;
  createAdmin: (data: any) => Promise<boolean>;
  updateAdminPermissions: (adminId: number, data: any) => Promise<boolean>;
  toggleAdminStatus: (adminId: number) => Promise<boolean>;
  deleteAdmin: (adminId: number) => Promise<boolean>;
  revokeAdminPermission: (adminId: number, permission: string) => Promise<boolean>;
  confirmAction: ConfirmAction | null;
  pagination: any;
  searchText: string;
  adminLevelFilter: string;
}

export const useAdminsListHandlers = ({
  setLoading,
  setAdmins,
  setPagination,
  setAvailablePermissions,
  setSelectedAdmin,
  setEditModalOpen,
  setProfileAdmin,
  setProfileModalOpen,
  setConfirmAction,
  setCreateModalOpen,
  createAdmin,
  updateAdminPermissions,
  toggleAdminStatus,
  deleteAdmin,
  revokeAdminPermission,
  confirmAction,
  pagination,
  searchText,
  adminLevelFilter,
}: UseAdminsListHandlersProps) => {
  const fetchAdmins = async (page = pagination.current, limit = pagination.pageSize) => {
    try {
      setLoading(true);
      const filters: AdminFilters = {
        page,
        limit,
        search: searchText || undefined,
        adminLevel: adminLevelFilter || undefined,
      };

      const res = await adminService.getAllAdmins(filters);
      const data: any = res || {};
      
      setAdmins(data?.admins ?? []);
      setAvailablePermissions(data?.availablePermissions ?? []);
      setPagination({
        current: data?.pagination?.page ?? 1,
        pageSize: data?.pagination?.limit ?? 20,
        total: data?.pagination?.total ?? 0,
      });
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách admin');
    } finally {
      setLoading(false);
    }
  };

  const refreshList = async () => {
    await fetchAdmins(pagination.current, pagination.pageSize);
  };

  const handleCreateAdmin = async (data: any) => {
    const success = await createAdmin(data);
    if (success) {
      setCreateModalOpen(false);
      refreshList();
    }
    return success;
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditModalOpen(true);
  };

  const handleUpdateAdmin = async (adminId: number, data: any) => {
    const success = await updateAdminPermissions(adminId, data);
    if (success) {
      setEditModalOpen(false);
      setSelectedAdmin(null);
      refreshList();
    }
    return success;
  };

  const handleToggleStatus = async (adminId: number) => {
    const success = await toggleAdminStatus(adminId);
    if (success) {
      refreshList();
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    const success = await deleteAdmin(adminId);
    if (success) {
      refreshList();
    }
  };

  const handleRevokePermission = async (adminId: number, permission: string) => {
    const success = await revokeAdminPermission(adminId, permission);
    if (success) {
      refreshList();
    }
  };

  const handleViewProfile = (admin: Admin) => {
    setProfileAdmin(admin);
    setProfileModalOpen(true);
  };

  const handleProfileUpdate = () => {
    refreshList();
  };

  const showConfirmDialog = (type: 'toggle' | 'delete', adminId: number, adminName: string) => {
    setConfirmAction({ type, adminId, adminName });
  };

  const showRevokeConfirmDialog = (adminId: number, adminName: string, permission: string) => {
    setConfirmAction({ type: 'revoke', adminId, adminName, permission });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'toggle') {
      await handleToggleStatus(confirmAction.adminId);
    } else if (confirmAction.type === 'delete') {
      await handleDeleteAdmin(confirmAction.adminId);
    } else if (confirmAction.type === 'revoke' && confirmAction.permission) {
      await handleRevokePermission(confirmAction.adminId, confirmAction.permission);
    }
    
    setConfirmAction(null);
  };

  const handlePageChange = (page: number, size?: number) => {
    fetchAdmins(page, size);
  };

  return {
    fetchAdmins,
    refreshList,
    handleCreateAdmin,
    handleEditAdmin,
    handleUpdateAdmin,
    handleToggleStatus,
    handleDeleteAdmin,
    handleRevokePermission,
    handleViewProfile,
    handleProfileUpdate,
    showConfirmDialog,
    showRevokeConfirmDialog,
    handleConfirm,
    handlePageChange,
  };
};
