import { usePasswordChangeState } from './Manager-useState/usePasswordChangeState';
import { usePasswordChangeHandlers } from './Manager-handle/usePasswordChangeHandlers';

interface UsePasswordChangeProps {
  adminId: number;
  t: (key: string, options?: any) => string;
}

export const usePasswordChange = ({ adminId, t }: UsePasswordChangeProps) => {
  const state = usePasswordChangeState();
  const handlers = usePasswordChangeHandlers({
    adminId,
    currentPassword: state.currentPassword,
    newPassword: state.newPassword,
    confirmPassword: state.confirmPassword,
    setChanging: state.setChanging,
    resetPasswordFields: state.resetPasswordFields,
    t,
  });

  return {
    state,
    handlers,
  };
};
