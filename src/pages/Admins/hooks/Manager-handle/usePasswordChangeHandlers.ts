import { toast } from 'react-toastify';
import adminService from '@services/adminService';

interface UsePasswordChangeHandlersProps {
  adminId: number;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  setChanging: (changing: boolean) => void;
  resetPasswordFields: () => void;
  t: (key: string, options?: any) => string;
}

export const usePasswordChangeHandlers = ({
  adminId,
  currentPassword,
  newPassword,
  confirmPassword,
  setChanging,
  resetPasswordFields,
  t,
}: UsePasswordChangeHandlersProps) => {
  const validatePasswordChange = (): boolean => {
    if (!currentPassword.trim()) {
      toast.error(t('password.currentPasswordRequired', { defaultValue: 'Vui lòng nhập mật khẩu hiện tại' }));
      return false;
    }

    if (!newPassword.trim()) {
      toast.error(t('password.newPasswordRequired', { defaultValue: 'Vui lòng nhập mật khẩu mới' }));
      return false;
    }

    if (newPassword.length < 6) {
      toast.error(t('password.newPasswordMinLength', { defaultValue: 'Mật khẩu mới phải có ít nhất 6 ký tự' }));
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('password.passwordMismatch', { defaultValue: 'Mật khẩu xác nhận không khớp' }));
      return false;
    }

    if (currentPassword === newPassword) {
      toast.error(t('password.samePassword', { defaultValue: 'Mật khẩu mới phải khác mật khẩu hiện tại' }));
      return false;
    }

    return true;
  };

  const handlePasswordChange = async (): Promise<boolean> => {
    if (!validatePasswordChange()) {
      return false;
    }

    setChanging(true);
    try {
      await adminService.changeAdminPassword(adminId, {
        currentPassword,
        newPassword,
      });
      toast.success(t('password.changeSuccess', { defaultValue: 'Đổi mật khẩu thành công' }));
      resetPasswordFields();
      return true;
    } catch (error: any) {
      toast.error(error.message || t('password.changeError', { defaultValue: 'Đổi mật khẩu thất bại' }));
      return false;
    } finally {
      setChanging(false);
    }
  };

  return {
    validatePasswordChange,
    handlePasswordChange,
  };
};
