import { useCallback } from 'react';
import adminService from '@services/adminService';
import type { DashboardStats, TopNotesCreator, RecentOnlineUser, TopOfflineUser, TopCategoriesCreator, TopChatUser, TopNoteSharer } from '../Manager-useState/useDashboardState';

interface UseDashboardHandlersProps {
  setLoading: (loading: boolean) => void;
  setStats: (stats: DashboardStats) => void;
  setTopNotesCreators: (data: TopNotesCreator[]) => void;
  setRecentOnlineUsers: (data: RecentOnlineUser[]) => void;
  setTopOfflineUsers: (data: TopOfflineUser[]) => void;
  setTopCategoriesCreators: (data: TopCategoriesCreator[]) => void;
  setTopChatUsers: (data: TopChatUser[]) => void;
  setTopNoteSharers: (data: TopNoteSharer[]) => void;
}

export const useDashboardHandlers = ({
  setLoading,
  setStats,
  setTopNotesCreators,
  setRecentOnlineUsers,
  setTopOfflineUsers,
  setTopCategoriesCreators,
  setTopChatUsers,
  setTopNoteSharers,
}: UseDashboardHandlersProps) => {
  // Hàm fetch data chung (không set loading)
  const fetchDashboardData = useCallback(async () => {
    // Tải dữ liệu thống kê gốc và biểu đồ mới
    const [statsResponse, topNotesResponse, recentOnlineResponse, topOfflineResponse, topCategoriesResponse, topChatResponse, topSharersResponse] = await Promise.all([
      adminService.getDashboardStats(),
      adminService.getTopNotesCreators({ limit: 10 }),
      adminService.getRecentOnlineUsers({ limit: 10 }),
      adminService.getTopOfflineUsers({ limit: 10 }),
      adminService.getTopCategoriesCreators({ limit: 10 }),
      adminService.getTopChatUsers({ limit: 10 }),
      adminService.getTopNoteSharers({ limit: 10 }),
    ]);

    // Use aggregate statistics, independent of list filters, tags and pagination.
    const stats = (statsResponse as any)?.data;
    setStats({
      totalUsers: stats?.totalUsers ?? 0,
      activeUsers: stats?.activeUsers ?? 0,
      totalNotes: stats?.totalNotes ?? 0,
      totalFolders: stats?.totalFolders ?? 0,
      notesInFolders: stats?.notesInFolders ?? 0
    });

    setTopNotesCreators((topNotesResponse as any)?.data || []);
    setRecentOnlineUsers((recentOnlineResponse as any)?.data || []);
    setTopOfflineUsers((topOfflineResponse as any)?.data || []);
    setTopCategoriesCreators((topCategoriesResponse as any)?.data || []);
    setTopChatUsers((topChatResponse as any)?.data || []);
    setTopNoteSharers((topSharersResponse as any)?.data || []);
  }, [setStats, setTopNotesCreators, setRecentOnlineUsers, setTopOfflineUsers, setTopCategoriesCreators, setTopChatUsers, setTopNoteSharers]);

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
