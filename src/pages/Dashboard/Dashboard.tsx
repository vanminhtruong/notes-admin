import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNotes: number;
  recentActivity: any[];
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNotes: 0,
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
        adminService.getAllUsers({ limit: 1000, isActive: true }) // Lấy tất cả active users để đếm online users
      ]);

      // Chuẩn hóa tổng số người dùng từ cấu trúc response backend
      const resolvedTotalUsers =
        (typeof usersResponse?.totalUsers === 'number' ? usersResponse.totalUsers : undefined) ??
        (typeof usersResponse?.pagination?.total === 'number' ? usersResponse.pagination.total : undefined) ?? 0;

      // Đếm số users đang online từ danh sách active users
      const activeUsersCount = allActiveUsersResponse?.users?.filter((user: any) => user.isOnline)?.length || 0;

      setStats({
        totalUsers: resolvedTotalUsers,
        activeUsers: activeUsersCount,
        totalNotes: notesResponse.pagination?.total || 0,
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
    s.on('note_created_by_admin', handleStatsUpdate);
    s.on('note_deleted_by_admin', handleStatsUpdate);
    s.on('admin_user_online', handleStatsUpdate);
    s.on('admin_user_offline', handleStatsUpdate);
    
    return () => {
      try {
        s.off('user_note_created', handleStatsUpdate);
        s.off('user_note_deleted', handleStatsUpdate);
        s.off('note_created_by_admin', handleStatsUpdate);
        s.off('note_deleted_by_admin', handleStatsUpdate);
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
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cards.totalUsers')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cards.activeUsers')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cards.totalNotes')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalNotes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('cards.todayActivity')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('actions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/users'}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('actions.users.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('actions.users.desc')}</p>
          </button>

          <button 
            onClick={() => window.location.href = '/notes'}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('actions.notes.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('actions.notes.desc')}</p>
          </button>

          <button 
            onClick={() => window.location.href = '/users/activity'}
            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('actions.activity.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('actions.activity.desc')}</p>
          </button>

          <button 
            onClick={() => window.location.href = '/notes/create'}
            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-left"
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{t('actions.createNote.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('actions.createNote.desc')}</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('recent.title')}</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">📊</span>
          <p>{t('recent.empty')}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
