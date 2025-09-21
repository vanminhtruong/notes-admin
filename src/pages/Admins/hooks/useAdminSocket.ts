import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { getAdminSocket } from '@services/socket';
import type { Socket } from 'socket.io-client';

interface AdminSocketHookProps {
  onAdminListChange?: () => void;
  currentAdminId?: number;
}

export const useAdminSocket = ({ onAdminListChange, currentAdminId }: AdminSocketHookProps) => {
  const { t } = useTranslation('admins');

  useEffect(() => {
    const socket: Socket = getAdminSocket();
    
    if (!socket) return;

    // Admin được tạo mới
    const handleAdminCreated = (data: any) => {
      // Tránh double toast: nếu do chính current admin tạo thì bỏ toast ở socket
      if (data?.createdBy !== currentAdminId) {
        toast.success(t('messages.createSuccess'));
      }
      onAdminListChange?.();
    };

    // Quyền admin được cập nhật
    const handleAdminPermissionsUpdated = (data: any) => {
      // Tránh double toast: nếu do chính current admin cập nhật thì bỏ toast success chung
      if (data?.updatedBy !== currentAdminId) {
        toast.success(t('messages.updateSuccess'));
      }
      onAdminListChange?.();
      
      // Nếu là admin hiện tại bị cập nhật quyền vẫn thông báo riêng
      if (data.admin?.id === currentAdminId) {
        toast.info(`Quyền của bạn đã được cập nhật`);
      }
    };

    // Quyền cụ thể bị thu hồi
    const handleAdminPermissionRevoked = (data: any) => {
      toast.success(t('messages.revokeSuccess'));
      onAdminListChange?.();
      
      // Nếu là admin hiện tại bị thu hồi quyền
      if (data.admin?.id === currentAdminId) {
        const permissionLabel = t(`permissions.${data.revokedPermission}.label`, { defaultValue: data.revokedPermission });
        toast.warning(`Quyền "${permissionLabel}" của bạn đã bị thu hồi`);
      }
    };

    // Trạng thái admin thay đổi
    const handleAdminStatusChanged = (data: any) => {
      // Tránh double toast nếu do chính current admin thực hiện
      if (data?.changedBy !== currentAdminId) {
        toast.success(t('messages.toggleStatusSuccess'));
      }
      onAdminListChange?.();
      
      // Nếu là admin hiện tại bị thay đổi trạng thái
      if (data.adminId === currentAdminId) {
        const statusMessage = data.isActive 
          ? 'Tài khoản của bạn đã được kích hoạt lại'
          : 'Tài khoản của bạn đã bị vô hiệu hóa';
        toast.warning(statusMessage);
        
        // Nếu bị vô hiệu hóa, có thể cần logout
        if (!data.isActive) {
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 3000);
        }
      }
    };

    // Admin bị xóa
    const handleAdminRemoved = (data: any) => {
      // Tránh double toast nếu do chính current admin thực hiện
      if (data?.removedBy !== currentAdminId) {
        toast.success(t('messages.deleteSuccess'));
      }
      onAdminListChange?.();
    };

    // Events cho admin hiện tại
    const handlePermissionsChanged = (_data: any) => {
      toast.info('Quyền hạn của bạn đã được cập nhật');
      // Có thể cần reload trang để cập nhật UI
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    const handlePermissionRevoked = (data: any) => {
      toast.warning(data.message || 'Một quyền của bạn đã bị thu hồi');
    };

    const handleAdminAccessRevoked = (data: any) => {
      toast.error(data.message || 'Quyền truy cập admin của bạn đã bị thu hồi');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 3000);
    };

    const handleAdminAccountDeactivated = (data: any) => {
      toast.error(data.message || 'Tài khoản admin của bạn đã bị vô hiệu hóa');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 3000);
    };

    // Register event listeners
    socket.on('admin_created', handleAdminCreated);
    socket.on('admin_permissions_updated', handleAdminPermissionsUpdated);
    socket.on('admin_permission_revoked', handleAdminPermissionRevoked);
    socket.on('admin_status_changed', handleAdminStatusChanged);
    socket.on('admin_removed', handleAdminRemoved);
    socket.on('permissions_changed', handlePermissionsChanged);
    socket.on('permission_revoked', handlePermissionRevoked);
    socket.on('admin_access_revoked', handleAdminAccessRevoked);
    socket.on('admin_account_deactivated', handleAdminAccountDeactivated);

    // Cleanup function
    return () => {
      socket.off('admin_created', handleAdminCreated);
      socket.off('admin_permissions_updated', handleAdminPermissionsUpdated);
      socket.off('admin_permission_revoked', handleAdminPermissionRevoked);
      socket.off('admin_status_changed', handleAdminStatusChanged);
      socket.off('admin_removed', handleAdminRemoved);
      socket.off('permissions_changed', handlePermissionsChanged);
      socket.off('permission_revoked', handlePermissionRevoked);
      socket.off('admin_access_revoked', handleAdminAccessRevoked);
      socket.off('admin_account_deactivated', handleAdminAccountDeactivated);
    };
  }, [t, onAdminListChange, currentAdminId]);
};
