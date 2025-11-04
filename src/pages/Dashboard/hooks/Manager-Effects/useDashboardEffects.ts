import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

interface UseDashboardEffectsProps {
  loadDashboardData: () => void;
}

export const useDashboardEffects = ({
  loadDashboardData,
}: UseDashboardEffectsProps) => {
  // Load dashboard data on mount
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
};
