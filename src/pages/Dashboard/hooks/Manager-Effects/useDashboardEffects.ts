import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

interface UseDashboardEffectsProps {
  loadDashboardData: () => void;
  refreshDashboardData: () => void;
}

export const useDashboardEffects = ({
  loadDashboardData,
  refreshDashboardData,
}: UseDashboardEffectsProps) => {
  // Load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time dashboard updates
  useEffect(() => {
    const s = getAdminSocket();
    
    const handleStatsUpdate = () => {
      // Refresh dashboard data KHÔNG có loading khi socket emit
      refreshDashboardData();
    };
    
    // Listen to events that affect dashboard stats
    // Notes
    s.on('user_note_created', handleStatsUpdate);
    s.on('user_note_deleted', handleStatsUpdate);
    s.on('user_note_updated', handleStatsUpdate);
    s.on('note_created_by_admin', handleStatsUpdate);
    s.on('note_deleted_by_admin', handleStatsUpdate);
    s.on('note_updated_by_admin', handleStatsUpdate);
    
    // Folders
    s.on('folder_created', handleStatsUpdate);
    s.on('folder_deleted', handleStatsUpdate);
    s.on('folder_updated', handleStatsUpdate);
    s.on('user_folder_created', handleStatsUpdate);
    s.on('user_folder_deleted', handleStatsUpdate);
    s.on('admin_folder_created', handleStatsUpdate);
    s.on('admin_folder_deleted', handleStatsUpdate);
    s.on('admin_folder_updated', handleStatsUpdate);
    s.on('note_moved_to_folder', handleStatsUpdate);
    
    // Categories
    s.on('user_category_created', handleStatsUpdate);
    s.on('user_category_deleted', handleStatsUpdate);
    s.on('user_category_updated', handleStatsUpdate);
    
    // Shared Notes
    s.on('user_shared_note_created', handleStatsUpdate);
    s.on('user_shared_note_deleted', handleStatsUpdate);
    s.on('user_group_shared_note_created', handleStatsUpdate);
    s.on('user_group_shared_note_removed', handleStatsUpdate);
    
    // Messages (for chat stats)
    s.on('admin_dm_created', handleStatsUpdate);
    s.on('admin_group_message_created', handleStatsUpdate);
    
    // Users (online/offline)
    s.on('admin_user_online', handleStatsUpdate);
    s.on('admin_user_offline', handleStatsUpdate);
    
    return () => {
      try {
        // Notes
        s.off('user_note_created', handleStatsUpdate);
        s.off('user_note_deleted', handleStatsUpdate);
        s.off('user_note_updated', handleStatsUpdate);
        s.off('note_created_by_admin', handleStatsUpdate);
        s.off('note_deleted_by_admin', handleStatsUpdate);
        s.off('note_updated_by_admin', handleStatsUpdate);
        
        // Folders
        s.off('folder_created', handleStatsUpdate);
        s.off('folder_deleted', handleStatsUpdate);
        s.off('folder_updated', handleStatsUpdate);
        s.off('user_folder_created', handleStatsUpdate);
        s.off('user_folder_deleted', handleStatsUpdate);
        s.off('admin_folder_created', handleStatsUpdate);
        s.off('admin_folder_deleted', handleStatsUpdate);
        s.off('admin_folder_updated', handleStatsUpdate);
        s.off('note_moved_to_folder', handleStatsUpdate);
        
        // Categories
        s.off('user_category_created', handleStatsUpdate);
        s.off('user_category_deleted', handleStatsUpdate);
        s.off('user_category_updated', handleStatsUpdate);
        
        // Shared Notes
        s.off('user_shared_note_created', handleStatsUpdate);
        s.off('user_shared_note_deleted', handleStatsUpdate);
        s.off('user_group_shared_note_created', handleStatsUpdate);
        s.off('user_group_shared_note_removed', handleStatsUpdate);
        
        // Messages
        s.off('admin_dm_created', handleStatsUpdate);
        s.off('admin_group_message_created', handleStatsUpdate);
        
        // Users
        s.off('admin_user_online', handleStatsUpdate);
        s.off('admin_user_offline', handleStatsUpdate);
      } catch {}
    };
  }, [refreshDashboardData]);
};
