import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { User } from '../interfaces';

interface UserDetailModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  formatDate: (date: string) => string;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ open, user, onClose, formatDate, getStatusBadge, getRoleBadge }) => {
  const { t } = useTranslation('users');

  // Close with ESC (chỉ khi modal mở)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !user) return null;

  const modal = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center pointer-events-auto" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('detail.title', { defaultValue: 'User details' })}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label={t('detail.close', { defaultValue: 'Close' }) as string}
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Top: Avatar + Basic info */}
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{user.name}</h4>
                {getRoleBadge(user.role)}
                {getStatusBadge(!!user.isActive)}
                {user.isOnline ? (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">{t('online')}</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">{t('offline')}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Grid details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('createdAt')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(user.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('lastActivity')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.lastSeenAt ? formatDate(user.lastSeenAt) : t('neverLoggedIn')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('filters.role')}</p>
              <div className="text-sm">{getRoleBadge(user.role)}</div>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('filters.status')}</p>
              <div className="text-sm">{getStatusBadge(!!user.isActive)}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
          >
            {t('detail.close', { defaultValue: 'Close' })}
          </button>
        </div>
      </div>
    </div>
  );
  return createPortal(modal, document.body);
};

export default UserDetailModal;
