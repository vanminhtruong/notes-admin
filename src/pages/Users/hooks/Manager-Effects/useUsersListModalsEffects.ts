import { useEffect } from 'react';

interface Filters {
  currentPage: number;
  searchTerm: string;
  activeFilter: string;
}

interface UseUsersListModalsEffectsProps {
  openDetail: boolean;
  filters: Filters;
  setOpenDetail: (open: boolean) => void;
  setDetailUser: (user: any) => void;
}

export const useUsersListModalsEffects = ({
  openDetail,
  filters,
  setOpenDetail,
  setDetailUser
}: UseUsersListModalsEffectsProps) => {
  // Đóng modal khi thay đổi phân trang/bộ lọc để tránh flicker
  useEffect(() => {
    if (openDetail) {
      setOpenDetail(false);
      setDetailUser(null);
    }
  }, [filters.currentPage, filters.searchTerm, filters.activeFilter, openDetail, setOpenDetail, setDetailUser]);
};
