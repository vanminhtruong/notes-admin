import { useCallback } from 'react';
import type { User } from '../../interfaces';

interface UseUsersListModalsHandlersProps {
  setDetailUser: (user: User | null) => void;
  setOpenDetail: (open: boolean) => void;
  setSessionUser: (user: User | null) => void;
  setSessionsModalOpen: (open: boolean) => void;
  setUsers: (users: User[] | ((prev: User[]) => User[])) => void;
  detailUser: User | null;
}

export const useUsersListModalsHandlers = ({
  setDetailUser,
  setOpenDetail,
  setSessionUser,
  setSessionsModalOpen,
  setUsers,
  detailUser
}: UseUsersListModalsHandlersProps) => {
  const openUserModal = useCallback((user: User) => {
    setDetailUser(user);
    setOpenDetail(true);
  }, [setDetailUser, setOpenDetail]);

  const closeUserModal = useCallback(() => {
    setOpenDetail(false);
    setDetailUser(null);
  }, [setOpenDetail, setDetailUser]);

  const handleCreateSuccess = useCallback(() => {
    // Reload users list after successful creation
    window.location.reload();
  }, []);

  const handleViewSessions = useCallback((user: User) => {
    setSessionUser(user);
    setSessionsModalOpen(true);
  }, [setSessionUser, setSessionsModalOpen]);

  const closeSessionsModal = useCallback(() => {
    setSessionsModalOpen(false);
    setSessionUser(null);
  }, [setSessionsModalOpen, setSessionUser]);

  const handleUserUpdated = useCallback((updatedUser: User) => {
    // Update user in the current list
    setUsers((prevUsers: User[]) => 
      prevUsers.map((u: User) => u.id === updatedUser.id ? updatedUser : u)
    );
    // Update detail user if it's the same user
    if (detailUser?.id === updatedUser.id) {
      setDetailUser(updatedUser);
    }
  }, [setUsers, detailUser, setDetailUser]);

  return {
    openUserModal,
    closeUserModal,
    handleCreateSuccess,
    handleViewSessions,
    closeSessionsModal,
    handleUserUpdated
  };
};
