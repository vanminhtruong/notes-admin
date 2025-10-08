import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNotes: number;
  totalFolders: number;
  notesInFolders: number;
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNotes: 0,
    totalFolders: 0,
    notesInFolders: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

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
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time dashboard updates
  useEffect(() => {
    const s = getAdminSocket();
    
    const handleStatsUpdate = () => {
      // Reload dashboard data when any relevant changes occur
      loadDashboardData();
    };
    
    // Listen to events that affect dashboard stats
    s.on('user_note_created', handleStatsUpdate);
    s.on('user_note_deleted', handleStatsUpdate);
    s.on('user_note_updated', handleStatsUpdate);
    s.on('note_created_by_admin', handleStatsUpdate);
    s.on('note_deleted_by_admin', handleStatsUpdate);
    s.on('note_updated_by_admin', handleStatsUpdate);
    s.on('folder_created', handleStatsUpdate);
    s.on('folder_deleted', handleStatsUpdate);
    s.on('folder_updated', handleStatsUpdate);
    s.on('admin_folder_created', handleStatsUpdate);
    s.on('admin_folder_deleted', handleStatsUpdate);
    s.on('admin_folder_updated', handleStatsUpdate);
    s.on('note_moved_to_folder', handleStatsUpdate);
    s.on('admin_user_online', handleStatsUpdate);
    s.on('admin_user_offline', handleStatsUpdate);
    
    return () => {
      try {
        s.off('user_note_created', handleStatsUpdate);
        s.off('user_note_deleted', handleStatsUpdate);
        s.off('user_note_updated', handleStatsUpdate);
        s.off('note_created_by_admin', handleStatsUpdate);
        s.off('note_deleted_by_admin', handleStatsUpdate);
        s.off('note_updated_by_admin', handleStatsUpdate);
        s.off('folder_created', handleStatsUpdate);
        s.off('folder_deleted', handleStatsUpdate);
        s.off('folder_updated', handleStatsUpdate);
        s.off('admin_folder_created', handleStatsUpdate);
        s.off('admin_folder_deleted', handleStatsUpdate);
        s.off('admin_folder_updated', handleStatsUpdate);
        s.off('note_moved_to_folder', handleStatsUpdate);
        s.off('admin_user_online', handleStatsUpdate);
        s.off('admin_user_offline', handleStatsUpdate);
      } catch {}
    };
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div className="mb-8 xl-down:mb-6 sm-down:mb-4">
        <h1 className="text-3xl xl-down:text-2xl md-down:text-xl sm-down:text-lg font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 xl-down:mt-1 text-sm xl-down:text-xs sm-down:text-xs">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3.5 sm-down:gap-3 xs-down:gap-2.5 mb-6 xl-down:mb-5 lg-down:mb-4 md-down:mb-3.5 sm-down:mb-3 xs-down:mb-2.5">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md shadow-lg border border-blue-200 dark:border-blue-700/30 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3 xl-down:pr-2.5 sm-down:pr-2">
              <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1 sm-down:mb-0.5 truncate">{t('cards.totalUsers')}</p>
              <p className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</p>
            </div>
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 lg-down:w-11 lg-down:h-11 md-down:w-10 md-down:h-10 sm-down:w-9 sm-down:h-9 xs-down:w-8 xs-down:h-8 bg-blue-500 dark:bg-blue-600 rounded-xl xl-down:rounded-lg md-down:rounded-md flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base xs-down:text-sm">👥</span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md shadow-lg border border-green-200 dark:border-green-700/30 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3 xl-down:pr-2.5 sm-down:pr-2">
              <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-semibold text-green-600 dark:text-green-400 mb-1 sm-down:mb-0.5 truncate">{t('cards.activeUsers')}</p>
              <p className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base font-bold text-green-900 dark:text-green-100">{stats.activeUsers}</p>
            </div>
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 lg-down:w-11 lg-down:h-11 md-down:w-10 md-down:h-10 sm-down:w-9 sm-down:h-9 xs-down:w-8 xs-down:h-8 bg-green-500 dark:bg-green-600 rounded-xl xl-down:rounded-lg md-down:rounded-md flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base xs-down:text-sm">✅</span>
            </div>
          </div>
        </div>

        {/* Total Notes */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md shadow-lg border border-purple-200 dark:border-purple-700/30 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3 xl-down:pr-2.5 sm-down:pr-2">
              <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1 sm-down:mb-0.5 truncate">{t('cards.totalNotes')}</p>
              <p className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base font-bold text-purple-900 dark:text-purple-100">{stats.totalNotes}</p>
            </div>
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 lg-down:w-11 lg-down:h-11 md-down:w-10 md-down:h-10 sm-down:w-9 sm-down:h-9 xs-down:w-8 xs-down:h-8 bg-purple-500 dark:bg-purple-600 rounded-xl xl-down:rounded-lg md-down:rounded-md flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base xs-down:text-sm">📝</span>
            </div>
          </div>
        </div>

        {/* Total Folders */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md shadow-lg border border-orange-200 dark:border-orange-700/30 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3 xl-down:pr-2.5 sm-down:pr-2">
              <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-semibold text-orange-600 dark:text-orange-400 mb-1 sm-down:mb-0.5 truncate">{t('cards.totalFolders')}</p>
              <p className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base font-bold text-orange-900 dark:text-orange-100">{stats.totalFolders}</p>
            </div>
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 lg-down:w-11 lg-down:h-11 md-down:w-10 md-down:h-10 sm-down:w-9 sm-down:h-9 xs-down:w-8 xs-down:h-8 bg-orange-500 dark:bg-orange-600 rounded-xl xl-down:rounded-lg md-down:rounded-md flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base xs-down:text-sm">📁</span>
            </div>
          </div>
        </div>

        {/* Notes in Folders */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-2xl xl-down:rounded-xl lg-down:rounded-lg md-down:rounded-lg sm-down:rounded-md shadow-lg border border-cyan-200 dark:border-cyan-700/30 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-3 xl-down:pr-2.5 sm-down:pr-2">
              <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 mb-1 sm-down:mb-0.5 truncate">{t('cards.notesInFolders')}</p>
              <p className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base font-bold text-cyan-900 dark:text-cyan-100">{stats.notesInFolders}</p>
            </div>
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 lg-down:w-11 lg-down:h-11 md-down:w-10 md-down:h-10 sm-down:w-9 sm-down:h-9 xs-down:w-8 xs-down:h-8 bg-cyan-500 dark:bg-cyan-600 rounded-xl xl-down:rounded-lg md-down:rounded-md flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-3xl xl-down:text-2xl lg-down:text-xl md-down:text-lg sm-down:text-base xs-down:text-sm">📄</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl xl-down:rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6 xl-down:p-4 sm-down:p-3">
        <h2 className="text-xl xl-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 xl-down:mb-3 sm-down:mb-2">{t('actions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl-down:grid-cols-2 md-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
          <button 
            onClick={() => window.location.href = '/users'}
            className="p-4 xl-down:p-3 sm-down:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <div className="text-2xl xl-down:text-xl sm-down:text-lg mb-2 xl-down:mb-1">👥</div>
            <h3 className="font-medium xl-down:text-sm sm-down:text-xs text-gray-900 dark:text-gray-100 truncate">{t('actions.users.title')}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{t('actions.users.desc')}</p>
          </button>

          <button 
            onClick={() => window.location.href = '/notes'}
            className="p-4 xl-down:p-3 sm-down:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
          >
            <div className="text-2xl xl-down:text-xl sm-down:text-lg mb-2 xl-down:mb-1">📝</div>
            <h3 className="font-medium xl-down:text-sm sm-down:text-xs text-gray-900 dark:text-gray-100 truncate">{t('actions.notes.title')}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{t('actions.notes.desc')}</p>
          </button>

          <button 
            onClick={() => window.location.href = '/users/activity'}
            className="p-4 xl-down:p-3 sm-down:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <div className="text-2xl xl-down:text-xl sm-down:text-lg mb-2 xl-down:mb-1">📈</div>
            <h3 className="font-medium xl-down:text-sm sm-down:text-xs text-gray-900 dark:text-gray-100 truncate">{t('actions.activity.title')}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{t('actions.activity.desc')}</p>
          </button>

          <button 
            onClick={() => window.location.href = '/notes/create'}
            className="p-4 xl-down:p-3 sm-down:p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
          >
            <div className="text-2xl xl-down:text-xl sm-down:text-lg mb-2 xl-down:mb-1">✨</div>
            <h3 className="font-medium xl-down:text-sm sm-down:text-xs text-gray-900 dark:text-gray-100 truncate">{t('actions.createNote.title')}</h3>
            <p className="text-sm xl-down:text-xs sm-down:text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{t('actions.createNote.desc')}</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl xl-down:rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6 xl-down:p-4 sm-down:p-3">
        <h2 className="text-xl xl-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 xl-down:mb-3 sm-down:mb-2">{t('recent.title')}</h2>
        <div className="text-center py-8 xl-down:py-6 sm-down:py-4 text-gray-500 dark:text-gray-400">
          <span className="text-4xl xl-down:text-3xl sm-down:text-2xl mb-4 xl-down:mb-3 sm-down:mb-2 block">📊</span>
          <p className="text-sm xl-down:text-xs">{t('recent.empty')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
