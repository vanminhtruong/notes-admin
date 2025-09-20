import { useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
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
  const { t } = useTranslation('admins');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const createAdmin = async (data: CreateAdminForm): Promise<boolean> => {
    try {
      setCreating(true);
      await adminService.createSubAdmin({
        ...data,
        permissions: data.permissions || []
      });
      
      toast.success(t('messages.createSuccess'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('messages.createError'));
      return false;
    } finally {
      setCreating(false);
    }
  };

  const updateAdminPermissions = async (adminId: number, data: UpdateAdminForm): Promise<boolean> => {
    try {
      setUpdating(true);
      await adminService.updateAdminPermissions(adminId, {
        permissions: data.permissions || [],
        adminLevel: data.adminLevel
      });
      
      toast.success(t('messages.updateSuccess'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('messages.updateError'));
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const toggleAdminStatus = async (adminId: number): Promise<boolean> => {
    try {
      await adminService.toggleAdminStatus(adminId);
      toast.success(t('messages.toggleStatusSuccess'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('messages.toggleStatusError'));
      return false;
    }
  };

  const revokeAdminPermission = async (adminId: number, permission: string): Promise<boolean> => {
    try {
      setRevoking(true);
      await adminService.revokeAdminPermission(adminId, permission);
      toast.success(t('messages.revokeSuccess'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('messages.revokeError'));
      return false;
    } finally {
      setRevoking(false);
    }
  };

  const deleteAdmin = async (adminId: number): Promise<boolean> => {
    try {
      setDeleting(true);
      await adminService.deleteAdmin(adminId);
      toast.success(t('messages.deleteSuccess'));
      return true;
    } catch (error: any) {
      toast.error(error.message || t('messages.deleteError'));
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {
    creating,
    updating,
    deleting,
    revoking,
    createAdmin,
    updateAdminPermissions,
    revokeAdminPermission,
    toggleAdminStatus,
    deleteAdmin,
  };
};
