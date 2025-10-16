import React from 'react';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@utils/auth';
import type { UserChatSettings } from '../interfaces';

interface UserChatSettingsTableProps {
  users: UserChatSettings[];
  loading: boolean;
  onToggleE2EE: (userId: number, currentValue: boolean) => void;
  onToggleReadStatus: (userId: number, currentValue: boolean) => void;
  onToggleNonFriends: (userId: number, currentValue: boolean) => void;
  onToggleHidePhone: (userId: number, currentValue: boolean) => void;
  onToggleHideBirthDate: (userId: number, currentValue: boolean) => void;
  formatDate: (date: string) => string;
}

const UserChatSettingsTable: React.FC<UserChatSettingsTableProps> = ({
  users,
  loading,
  onToggleE2EE,
  onToggleReadStatus,
  onToggleNonFriends,
  onToggleHidePhone,
  onToggleHideBirthDate,
  formatDate,
}) => {
  const { t } = useTranslation('chatSettings');

  const canEdit = hasPermission('manage_users.chat_settings.edit');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <span className="text-4xl mb-4 block">📭</span>
        <p>{t('noData')}</p>
      </div>
    );
  }

  const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; disabled?: boolean }> = ({ enabled, onChange, disabled }) => (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.user')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.e2ee')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.readStatus')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.allowNonFriends')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.hidePhone')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.hideBirthDate')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.createdAt')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {user.avatar ? (
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    {user.e2eePinHash && (
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        🔐 {t('table.hasPIN')}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center">
                <ToggleSwitch
                  enabled={user.e2eeEnabled}
                  onChange={() => onToggleE2EE(user.id, user.e2eeEnabled)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center">
                <ToggleSwitch
                  enabled={user.readStatusEnabled}
                  onChange={() => onToggleReadStatus(user.id, user.readStatusEnabled)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center">
                <ToggleSwitch
                  enabled={user.allowMessagesFromNonFriends}
                  onChange={() => onToggleNonFriends(user.id, user.allowMessagesFromNonFriends)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center">
                <ToggleSwitch
                  enabled={user.hidePhone}
                  onChange={() => onToggleHidePhone(user.id, user.hidePhone)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center">
                <ToggleSwitch
                  enabled={user.hideBirthDate}
                  onChange={() => onToggleHideBirthDate(user.id, user.hideBirthDate)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserChatSettingsTable;
