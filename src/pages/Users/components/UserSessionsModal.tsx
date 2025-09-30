import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';
import ConfirmDialog from './ConfirmDialog';
import type { ConfirmState } from '../interfaces';

interface UserSession {
  id: number;
  deviceType: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActivityAt: string;
  createdAt: string;
}

interface UserSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
}

const UserSessionsModal: React.FC<UserSessionsModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const { t } = useTranslation('users');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    lines: [],
    onConfirm: null,
    confirming: false,
  });

  const canView = hasPermission('manage_users.sessions.view');
  const canLogout = hasPermission('manage_users.sessions.logout');
  const canLogoutAll = hasPermission('manage_users.sessions.logout_all');

  useEffect(() => {
    if (isOpen && canView) {
      fetchSessions();
    }
  }, [isOpen, userId, canView]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current overflow value
      const originalOverflow = document.body.style.overflow;
      // Disable scroll
      document.body.style.overflow = 'hidden';
      
      // Cleanup: restore scroll when modal closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response: any = await adminService.getUserSessions(userId);
      setSessions(response.sessions || []);
    } catch (error: any) {
      toast.error(error.message || t('sessions.errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutSession = async (sessionId: number) => {
    setConfirmState({
      open: true,
      title: t('sessions.confirm.logoutTitle'),
      lines: [t('sessions.confirm.logoutMessage')],
      onConfirm: async () => {
        await adminService.logoutUserSession(userId, sessionId);
        toast.success(t('sessions.messages.logoutSuccess'));
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      },
      confirming: false,
    });
  };

  const handleLogoutAll = async () => {
    setConfirmState({
      open: true,
      title: t('sessions.confirm.logoutAllTitle'),
      lines: [t('sessions.confirm.logoutAllMessage')],
      onConfirm: async () => {
        await adminService.logoutAllUserSessions(userId);
        toast.success(t('sessions.messages.logoutAllSuccess'));
        setSessions([]);
      },
      confirming: false,
    });
  };

  const closeConfirm = () => {
    setConfirmState({
      open: false,
      title: '',
      lines: [],
      onConfirm: null,
      confirming: false,
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'tablet':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'desktop':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('sessions.time.justNow');
    if (diffMins < 60) return t('sessions.time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('sessions.time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('sessions.time.daysAgo', { count: diffDays });
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <>
      {!canView ? (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('sessions.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('sessions.errors.noPermission')}
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {t('sessions.title')}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('sessions.subtitle', { userName })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('sessions.noSessions')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="border border-gray-200 dark:border-neutral-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="text-blue-600 dark:text-blue-400 mt-1">
                          {getDeviceIcon(session.deviceType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {session.deviceName || session.browser || t('sessions.unknownDevice')}
                          </h3>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{t('sessions.browser')}:</span> {session.browser || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{t('sessions.os')}:</span> {session.os || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-medium">{t('sessions.ip')}:</span> {session.ipAddress || 'N/A'}
                            </p>
                            {session.location && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                <span className="font-medium">{t('sessions.location')}:</span> {session.location}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              <span className="font-medium">{t('sessions.lastActivity')}:</span> {formatDate(session.lastActivityAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      {canLogout && (
                        <button
                          onClick={() => handleLogoutSession(session.id)}
                          disabled={confirmState.confirming}
                          className="ml-3 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                        >
                          {t('sessions.actions.logout')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-neutral-700 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('sessions.activeSessions', { count: sessions.length })}
            </div>
            <div className="flex items-center space-x-3">
              {canLogoutAll && sessions.length > 0 && (
                <button
                  onClick={handleLogoutAll}
                  disabled={confirmState.confirming}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50"
                >
                  {t('sessions.actions.logoutAll')}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-md transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>

        {/* Confirm dialog */}
        <ConfirmDialog
          state={confirmState}
          onClose={closeConfirm}
          setState={setConfirmState}
        />
      </div>
      )}
    </>
  );

  // Render modal using portal to ensure it's at root level
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default UserSessionsModal;