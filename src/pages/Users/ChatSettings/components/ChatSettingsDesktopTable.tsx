import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserChatSettings } from '../interfaces';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange, disabled }) => (
  <button
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 xl-down:h-5 xl-down:w-9 sm-down:h-4 sm-down:w-7 items-center rounded-full transition-colors ${
      enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 xl-down:h-3 xl-down:w-3 sm-down:h-2.5 sm-down:w-2.5 transform rounded-full bg-white transition-transform ${
        enabled ? 'translate-x-6 xl-down:translate-x-5 sm-down:translate-x-4' : 'translate-x-1 xl-down:translate-x-0.5 sm-down:translate-x-0.5'
      }`}
    />
  </button>
);

interface ChatSettingsDesktopTableProps {
  users: UserChatSettings[];
  canEdit: boolean;
  formatDate: (date: string) => string;
  onToggleReadStatus: (userId: number, currentValue: boolean) => void;
  onToggleNonFriends: (userId: number, currentValue: boolean) => void;
  onToggleHidePhone: (userId: number, currentValue: boolean) => void;
  onToggleHideBirthDate: (userId: number, currentValue: boolean) => void;
}

const ChatSettingsDesktopTable: React.FC<ChatSettingsDesktopTableProps> = ({
  users,
  canEdit,
  formatDate,
  onToggleReadStatus,
  onToggleNonFriends,
  onToggleHidePhone,
  onToggleHideBirthDate,
}) => {
  const { t } = useTranslation('chatSettings');

  return (
    <div className="overflow-x-auto lg-down:hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
        <thead className="bg-gray-50 dark:bg-neutral-800">
          <tr>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.user')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('table.readStatus')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
              {t('table.allowNonFriends')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
              {t('table.hidePhone')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-center text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
              {t('table.hideBirthDate')}
            </th>
            <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
              {t('table.createdAt')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 xl-down:h-9 xl-down:w-9 md-down:h-8 md-down:w-8 sm-down:h-7 sm-down:w-7">
                    {user.avatar ? (
                      <img className="h-10 w-10 xl-down:h-9 xl-down:w-9 md-down:h-8 md-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full" src={user.avatar} alt="" />
                    ) : (
                      <div className="h-10 w-10 xl-down:h-9 xl-down:w-9 md-down:h-8 md-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 text-base xl-down:text-sm sm-down:text-xs">👤</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 xl-down:ml-3">
                    <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                    <div className="text-sm xl-down:text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center">
                <ToggleSwitch
                  enabled={user.readStatusEnabled}
                  onChange={() => onToggleReadStatus(user.id, user.readStatusEnabled)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center md-down:hidden">
                <ToggleSwitch
                  enabled={user.allowMessagesFromNonFriends}
                  onChange={() => onToggleNonFriends(user.id, user.allowMessagesFromNonFriends)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center md-down:hidden">
                <ToggleSwitch
                  enabled={user.hidePhone}
                  onChange={() => onToggleHidePhone(user.id, user.hidePhone)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-center md-down:hidden">
                <ToggleSwitch
                  enabled={user.hideBirthDate}
                  onChange={() => onToggleHideBirthDate(user.id, user.hideBirthDate)}
                  disabled={!canEdit}
                />
              </td>
              <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 md-down:hidden">
                {formatDate(user.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChatSettingsDesktopTable;
