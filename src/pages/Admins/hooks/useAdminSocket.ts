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
      // Tránh double toast:
      // - Nếu do chính current admin cập nhật thì đã toast ở useAdminActions rồi
      // - Nếu admin bị cập nhật là current admin thì để service socket xử lý (permissions_changed)
      // - Chỉ toast khi có admin khác (không phải current admin) cập nhật admin khác
      const isActorIsMe = data?.updatedBy === currentAdminId;
      const isTargetIsMe = data?.admin?.id === currentAdminId;
      
      // Không toast nếu actor là current admin (đã toast ở useAdminActions)
      // Không toast nếu target là current admin (sẽ toast ở permissions_changed)
      if (!isActorIsMe && !isTargetIsMe) {
        toast.success(t('messages.updateSuccess'));
      }
      
      onAdminListChange?.();
    };

    // Quyền cụ thể bị thu hồi
    const handleAdminPermissionRevoked = (data: any) => {
      const isActorIsMe = data?.revokedBy === currentAdminId;
      const isTargetIsMe = data?.admin?.id === currentAdminId;
      
      // Không toast nếu actor là current admin (đã toast ở useAdminActions)
      // Chỉ toast cho admin khác đang xem danh sách
      if (!isActorIsMe && !isTargetIsMe) {
        toast.success(t('messages.revokeSuccess'));
      }
      
      onAdminListChange?.();
      
      // Nếu là admin hiện tại bị thu hồi quyền, hiển thị warning riêng
      if (isTargetIsMe) {
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
    // Gỡ bỏ listener 'permissions_changed' vì đã được xử lý tại services/socket.ts để tránh toast lặp
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
      // Không cần off 'permissions_changed' do không đăng ký ở hook này
      socket.off('permission_revoked', handlePermissionRevoked);
      socket.off('admin_access_revoked', handleAdminAccessRevoked);
      socket.off('admin_account_deactivated', handleAdminAccountDeactivated);
    };
  }, [t, onAdminListChange, currentAdminId]);
};
