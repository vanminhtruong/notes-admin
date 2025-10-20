import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

interface UseUsersListEffectsProps {
  loadUsers: () => void;
}

export const useUsersListEffects = ({
  loadUsers
}: UseUsersListEffectsProps) => {
  // Load users when filters change
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Realtime updates via socket
  useEffect(() => {
    const socket = getAdminSocket();

    const handleUserUpdated = () => {
      loadUsers();
    };

    const handleUserCreated = () => {
      loadUsers();
    };

    const handleUserDeleted = () => {
      loadUsers();
    };

    socket.on('admin_user_updated', handleUserUpdated);
    socket.on('admin_user_created', handleUserCreated);
    socket.on('admin_user_deleted', handleUserDeleted);

    return () => {
      socket.off('admin_user_updated', handleUserUpdated);
      socket.off('admin_user_created', handleUserCreated);
      socket.off('admin_user_deleted', handleUserDeleted);
    };
  }, [loadUsers]);
};
