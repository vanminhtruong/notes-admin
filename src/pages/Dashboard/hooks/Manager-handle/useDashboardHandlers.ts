import { useCallback } from 'react';
import adminService from '@services/adminService';
import type { DashboardStats } from '../Manager-useState/useDashboardState';

interface UseDashboardHandlersProps {
  setLoading: (loading: boolean) => void;
  setStats: (stats: DashboardStats) => void;
}

export const useDashboardHandlers = ({
  setLoading,
  setStats,
}: UseDashboardHandlersProps) => {
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Tải dữ liệu thống kê
      const [usersResponse, notesResponse, allActiveUsersResponse] = await Promise.all([
        adminService.getAllUsers({ limit: 1 }),
        adminService.getAllUsersNotes({ limit: 1 }),
        adminService.getAllUsers({ limit: 1000, isActive: true }), // Lấy tất cả active users để đếm online users
      ]);

      // Chuẩn hóa tổng số người dùng từ cấu trúc response backend
      const resolvedTotalUsers =
        (typeof (usersResponse as any)?.totalUsers === 'number' ? (usersResponse as any).totalUsers : undefined) ??
        (typeof (usersResponse as any)?.pagination?.total === 'number' ? (usersResponse as any).pagination.total : undefined) ?? 0;

      // Đếm số users đang online từ danh sách active users
      const activeUsersCount = (allActiveUsersResponse as any)?.users?.filter((user: any) => user.isOnline)?.length || 0;

      setStats({
        totalUsers: resolvedTotalUsers,
        activeUsers: activeUsersCount,
        totalNotes: (notesResponse as any).pagination?.total || 0,
        totalFolders: (notesResponse as any)?.stats?.totalFolders || 0,
        notesInFolders: (notesResponse as any)?.stats?.notesInFolders || 0,
        recentActivity: []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setStats]);

  return {
    loadDashboardData,
  };
};
