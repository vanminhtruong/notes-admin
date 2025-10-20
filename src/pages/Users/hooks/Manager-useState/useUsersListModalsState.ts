import { useState } from 'react';
import type { User } from '../../interfaces';

export const useUsersListModalsState = () => {
  // Modal chi tiết user
  const [openDetail, setOpenDetail] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  // Modal tạo user mới
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Modal quản lý sessions
  const [sessionsModalOpen, setSessionsModalOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | null>(null);

  return {
    openDetail,
    setOpenDetail,
    detailUser,
    setDetailUser,
    openCreateModal,
    setOpenCreateModal,
    sessionsModalOpen,
    setSessionsModalOpen,
    sessionUser,
    setSessionUser
  };
};
