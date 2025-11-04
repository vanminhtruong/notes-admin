import { useAdminActionsState } from './Manager-useState/useAdminActionsState';
import { useAdminActionsHandlers } from './Manager-handle/useAdminActionsHandlers';
import type { CreateAdminForm, UpdateAdminForm } from '../interfaces/admin.types';

export interface UseAdminActionsReturn {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  revoking: boolean;
  createAdmin: (data: CreateAdminForm) => Promise<boolean>;
  updateAdminPermissions: (adminId: number, data: UpdateAdminForm) => Promise<boolean>;
  revokeAdminPermission: (adminId: number, permission: string) => Promise<boolean>;
  toggleAdminStatus: (adminId: number) => Promise<boolean>;
  deleteAdmin: (adminId: number) => Promise<boolean>;
}

export const useAdminActions = (): UseAdminActionsReturn => {
  const state = useAdminActionsState();
  const handlers = useAdminActionsHandlers({
    setCreating: state.setCreating,
    setUpdating: state.setUpdating,
    setDeleting: state.setDeleting,
    setRevoking: state.setRevoking,
  });

  return {
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    revoking: state.revoking,
    ...handlers,
  };
};
