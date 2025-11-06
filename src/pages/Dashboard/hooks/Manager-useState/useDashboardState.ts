import { useState } from 'react';

export interface TopNotesCreator {
  userId: number;
  username: string;
  email: string;
  avatar: string;
  notesCount: number;
}

export interface RecentOnlineUser {
  userId: number;
  username: string;
  email: string;
  avatar: string;
  lastOnline: string;
  isOnline: boolean;
}

export interface TopOfflineUser {
  userId: number;
  username: string;
  email: string;
  avatar: string;
  lastSeenAt: string;
  offlineDays: number;
}

export interface TopCategoriesCreator {
  userId: number;
  username: string;
  email: string;
  avatar: string;
  categoriesCount: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalNotes: number;
  totalFolders: number;
  notesInFolders: number;
}

export const useDashboardState = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalNotes: 0,
    totalFolders: 0,
    notesInFolders: 0
  });
  const [loading, setLoading] = useState(true);
  const [topNotesCreators, setTopNotesCreators] = useState<TopNotesCreator[]>([]);
  const [recentOnlineUsers, setRecentOnlineUsers] = useState<RecentOnlineUser[]>([]);
  const [topOfflineUsers, setTopOfflineUsers] = useState<TopOfflineUser[]>([]);
  const [topCategoriesCreators, setTopCategoriesCreators] = useState<TopCategoriesCreator[]>([]);

  return {
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
  };
};
