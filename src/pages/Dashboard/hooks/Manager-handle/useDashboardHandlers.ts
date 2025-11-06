import { useCallback } from 'react';
import adminService from '@services/adminService';
import type { DashboardStats, TopNotesCreator, RecentOnlineUser, TopOfflineUser, TopCategoriesCreator } from '../Manager-useState/useDashboardState';

interface UseDashboardHandlersProps {
  setLoading: (loading: boolean) => void;
  setStats: (stats: DashboardStats) => void;
  setTopNotesCreators: (data: TopNotesCreator[]) => void;
  setRecentOnlineUsers: (data: RecentOnlineUser[]) => void;
  setTopOfflineUsers: (data: TopOfflineUser[]) => void;
  setTopCategoriesCreators: (data: TopCategoriesCreator[]) => void;
}

export const useDashboardHandlers = ({
  setLoading,
  setStats,
  setTopNotesCreators,
  setRecentOnlineUsers,
  setTopOfflineUsers,
  setTopCategoriesCreators,
}: UseDashboardHandlersProps) => {
  // Hàm fetch data chung (không set loading)
  const fetchDashboardData = useCallback(async () => {
    // Tải dữ liệu thống kê gốc và biểu đồ mới
    const [usersResponse, notesResponse, allActiveUsersResponse, topNotesResponse, recentOnlineResponse, topOfflineResponse, topCategoriesResponse] = await Promise.all([
      adminService.getAllUsers({ limit: 1 }),
      adminService.getAllUsersNotes({ limit: 1 }),
      adminService.getAllUsers({ limit: 1000, isActive: true }),
      adminService.getTopNotesCreators({ limit: 10 }),
      adminService.getRecentOnlineUsers({ limit: 10 }),
      adminService.getTopOfflineUsers({ limit: 10 }),
      adminService.getTopCategoriesCreators({ limit: 10 }),
    ]);

    // Chuẩn hóa tổng số người dùng từ cấu trúc response backend (giữ logic gốc)
    const resolvedTotalUsers =
      (typeof (usersResponse as any)?.totalUsers === 'number' ? (usersResponse as any).totalUsers : undefined) ??
      (typeof (usersResponse as any)?.pagination?.total === 'number' ? (usersResponse as any).pagination.total : undefined) ?? 0;

    // Đếm số users đang online từ danh sách active users (giữ logic gốc)
    const activeUsersCount = (allActiveUsersResponse as any)?.users?.filter((user: any) => user.isOnline)?.length || 0;

    setStats({
      totalUsers: resolvedTotalUsers,
      activeUsers: activeUsersCount,
      totalNotes: (notesResponse as any).pagination?.total || 0,
      totalFolders: (notesResponse as any)?.stats?.totalFolders || 0,
      notesInFolders: (notesResponse as any)?.stats?.notesInFolders || 0
    });

    setTopNotesCreators((topNotesResponse as any)?.data || []);
    setRecentOnlineUsers((recentOnlineResponse as any)?.data || []);
    setTopOfflineUsers((topOfflineResponse as any)?.data || []);
    setTopCategoriesCreators((topCategoriesResponse as any)?.data || []);
  }, [setStats, setTopNotesCreators, setRecentOnlineUsers, setTopOfflineUsers, setTopCategoriesCreators]);

  // Load data lần đầu với loading
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await fetchDashboardData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, fetchDashboardData]);

  // Refresh data từ socket KHÔNG có loading
  const refreshDashboardData = useCallback(async () => {
    try {
      await fetchDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  }, [fetchDashboardData]);

  return {
    loadDashboardData,
    refreshDashboardData,
  };
};
