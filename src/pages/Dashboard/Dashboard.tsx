import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardState } from './hooks/Manager-useState/useDashboardState';
import { useDashboardHandlers } from './hooks/Manager-handle/useDashboardHandlers';
import { useDashboardEffects } from './hooks/Manager-Effects/useDashboardEffects';
import TopNotesCreatorsChart from './components/TopNotesCreatorsChart';
import RecentOnlineUsersChart from './components/RecentOnlineUsersChart';
import TopOfflineUsersChart from './components/TopOfflineUsersChart';
import TopCategoriesCreatorsChart from './components/TopCategoriesCreatorsChart';

const Dashboard: React.FC = () => {
  const { t } = useTranslation('dashboard');
  
  // State
  const { 
    stats, 
    setStats, 
    loading, 
    setLoading,
    topNotesCreators,
    setTopNotesCreators,
    recentOnlineUsers,
    setRecentOnlineUsers,
    topOfflineUsers,
    setTopOfflineUsers,
    topCategoriesCreators,
    setTopCategoriesCreators,
  } = useDashboardState();
  
  // Handlers
  const { loadDashboardData, refreshDashboardData } = useDashboardHandlers({
    setLoading,
    setStats,
    setTopNotesCreators,
    setRecentOnlineUsers,
    setTopOfflineUsers,
    setTopCategoriesCreators,
  });
  
  // Effects
  useDashboardEffects({
    loadDashboardData,
    refreshDashboardData,
  });

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3.5 sm-down:gap-3">
        <TopNotesCreatorsChart data={topNotesCreators} />
        <RecentOnlineUsersChart data={recentOnlineUsers} />
        <TopCategoriesCreatorsChart data={topCategoriesCreators} />
        <TopOfflineUsersChart data={topOfflineUsers} />
      </div>
    </div>
  );
};

export default Dashboard;
