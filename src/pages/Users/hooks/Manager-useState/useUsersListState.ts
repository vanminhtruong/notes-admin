import { useState } from 'react';
import type { User, ConfirmState } from '../../interfaces';

interface Filters {
  currentPage: number;
  searchTerm: string;
  activeFilter: string;
}

export const useUsersListState = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    currentPage: 1,
    searchTerm: '',
    activeFilter: ''
  });
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    lines: [],
    onConfirm: null,
    confirming: false
  });

  return {
    users,
    setUsers,
    loading,
    setLoading,
    totalPages,
    setTotalPages,
    totalItems,
    setTotalItems,
    filters,
    setFilters,
    confirmState,
    setConfirmState
  };
};
