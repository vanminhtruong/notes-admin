import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

interface UseBackgroundsEffectsProps {
  fetchBackgrounds: () => void;
}

export const useBackgroundsEffects = ({ fetchBackgrounds }: UseBackgroundsEffectsProps) => {
  // Fetch backgrounds on mount and when dependencies change
  useEffect(() => {
    fetchBackgrounds();
  }, [fetchBackgrounds]);

  // Socket listeners for real-time updates
  useEffect(() => {
    const socket = getAdminSocket();

    const handleBackgroundCreated = () => {
      fetchBackgrounds();
    };

    const handleBackgroundUpdated = () => {
      fetchBackgrounds();
    };

    const handleBackgroundDeleted = () => {
      fetchBackgrounds();
    };

    socket.on('background_created', handleBackgroundCreated);
    socket.on('background_updated', handleBackgroundUpdated);
    socket.on('background_deleted', handleBackgroundDeleted);

    return () => {
      socket.off('background_created', handleBackgroundCreated);
      socket.off('background_updated', handleBackgroundUpdated);
      socket.off('background_deleted', handleBackgroundDeleted);
    };
  }, [fetchBackgrounds]);
};
