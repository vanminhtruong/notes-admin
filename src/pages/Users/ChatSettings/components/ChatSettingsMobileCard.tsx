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

interface ChatSettingsMobileCardProps {
  users: UserChatSettings[];
  canEdit: boolean;
  canViewPin: boolean;
  formatDate: (date: string) => string;
  onToggleE2EE: (userId: number, currentValue: boolean) => void;
  onToggleReadStatus: (userId: number, currentValue: boolean) => void;
  onToggleNonFriends: (userId: number, currentValue: boolean) => void;
  onToggleHidePhone: (userId: number, currentValue: boolean) => void;
  onToggleHideBirthDate: (userId: number, currentValue: boolean) => void;
  onViewPin: (user: UserChatSettings) => void;
}

const ChatSettingsMobileCard: React.FC<ChatSettingsMobileCardProps> = ({
  users,
  canEdit,
  canViewPin,
  formatDate,
  onToggleE2EE,
  onToggleReadStatus,
  onToggleNonFriends,
  onToggleHidePhone,
  onToggleHideBirthDate,
  onViewPin,
}) => {
  const { t } = useTranslation('chatSettings');

  return (
    <div className="hidden lg-down:block p-4 xl-down:p-3 sm-down:p-2 space-y-3 sm-down:space-y-2">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2 border border-gray-200 dark:border-neutral-700"
        >
          {/* User Header */}
          <div className="flex items-start justify-between mb-3 xl-down:mb-2">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0 h-10 w-10 xl-down:h-8 xl-down:w-8">
                {user.avatar ? (
                  <img className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full" src={user.avatar} alt="" />
                ) : (
                  <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">👤</span>
                  </div>
                )}
              </div>
              <div className="ml-3 xl-down:ml-2 flex-1">
                <div className="text-sm xl-down:text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {user.name}
                </div>
                <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
                {user.e2eePinHash && (
                  <div className="text-xs xl-down:text-2xs text-blue-600 dark:text-blue-400 mt-0.5">
                    🔐 {t('table.hasPIN')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-3 xl-down:gap-2 mb-3 xl-down:mb-2">
            <div className="flex items-center justify-between p-2 xl-down:p-1.5 bg-white dark:bg-neutral-900 rounded">
              <span className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400">
                {t('table.e2ee')}
              </span>
              <ToggleSwitch
                enabled={user.e2eeEnabled}
                onChange={() => onToggleE2EE(user.id, user.e2eeEnabled)}
                disabled={!canEdit}
              />
            </div>
            <div className="flex items-center justify-between p-2 xl-down:p-1.5 bg-white dark:bg-neutral-900 rounded">
              <span className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400">
                {t('table.readStatus')}
              </span>
              <ToggleSwitch
                enabled={user.readStatusEnabled}
                onChange={() => onToggleReadStatus(user.id, user.readStatusEnabled)}
                disabled={!canEdit}
              />
            </div>
            <div className="flex items-center justify-between p-2 xl-down:p-1.5 bg-white dark:bg-neutral-900 rounded">
              <span className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400">
                {t('table.allowNonFriends')}
              </span>
              <ToggleSwitch
                enabled={user.allowMessagesFromNonFriends}
                onChange={() => onToggleNonFriends(user.id, user.allowMessagesFromNonFriends)}
                disabled={!canEdit}
              />
            </div>
            <div className="flex items-center justify-between p-2 xl-down:p-1.5 bg-white dark:bg-neutral-900 rounded">
              <span className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400">
                {t('table.hidePhone')}
              </span>
              <ToggleSwitch
                enabled={user.hidePhone}
                onChange={() => onToggleHidePhone(user.id, user.hidePhone)}
                disabled={!canEdit}
              />
            </div>
            <div className="flex items-center justify-between p-2 xl-down:p-1.5 bg-white dark:bg-neutral-900 rounded">
              <span className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400">
                {t('table.hideBirthDate')}
              </span>
              <ToggleSwitch
                enabled={user.hideBirthDate}
                onChange={() => onToggleHideBirthDate(user.id, user.hideBirthDate)}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
            <span>{formatDate(user.createdAt)}</span>
            {user.e2eePinHash && canViewPin && (
              <button
                onClick={() => onViewPin(user)}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                🔐 {t('table.viewPin', 'Xem PIN')}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatSettingsMobileCard;
