import { useState } from 'react';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNotes: number;
  totalFolders: number;
  notesInFolders: number;
  recentActivity: any[];
}

export const useDashboardState = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNotes: 0,
    totalFolders: 0,
    notesInFolders: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  return {
    stats,
    setStats,
    loading,
    setLoading,
  };
};
