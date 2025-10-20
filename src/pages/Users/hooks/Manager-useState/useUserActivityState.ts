import { useState, useRef } from 'react';
import type { UserActivityData, TypingInfo, User } from '../../interfaces';

export const useUserActivityState = () => {
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'groups' | 'friends' | 'notifications' | 'monitor'>('messages');
  const [typingInfo, setTypingInfo] = useState<TypingInfo | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return {
    activityData,
    setActivityData,
    loading,
    setLoading,
    selectedUserId,
    setSelectedUserId,
    activeTab,
    setActiveTab,
    typingInfo,
    setTypingInfo,
    typingTimerRef,
    users,
    setUsers,
    searchTerm,
    setSearchTerm,
    loadingUsers,
    setLoadingUsers,
    error,
    setError
  };
};
