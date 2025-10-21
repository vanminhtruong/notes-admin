import type { Admin } from '../../interfaces/admin.types';
import type { ConfirmAction } from '../Manager-useState/useAdminsListState';

interface UseAdminsListHandlersProps {
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
  refreshList: () => void;
  fetchAdmins: (page: number, size?: number) => void;
  confirmAction: ConfirmAction | null;
}

export const useAdminsListHandlers = ({
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
  refreshList,
  fetchAdmins,
  confirmAction,
}: UseAdminsListHandlersProps) => {
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
