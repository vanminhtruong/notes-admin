import React from 'react';
import { Pin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PinnedMessagesPanelProps {
  pinnedMessages: any[];
  loading: boolean;
  type: 'dm' | 'group';
  formatDate: (dateString: string) => string;
  resolveAvatar: (url?: string | null) => string;
  renderMessageContent: (content: any, options?: any) => React.ReactNode;
}

const PinnedMessagesPanel: React.FC<PinnedMessagesPanelProps> = ({
  pinnedMessages,
  loading,
  type,
  formatDate,
  resolveAvatar,
  renderMessageContent
}) => {
  const { t } = useTranslation('users');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">
        {t('common:loading')}
      </div>
    );
  }

  if (!pinnedMessages || pinnedMessages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <Pin className="w-12 h-12 xl-down:w-10 xl-down:h-10 mb-2 opacity-30" />
        <p className="text-sm xl-down:text-xs">
          {type === 'dm' 
            ? t('userActivity.monitor.noPinnedDM', 'Chưa có tin nhắn ghim') 
            : t('userActivity.monitor.noPinnedGroup', 'Chưa có tin nhắn ghim')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 xl-down:space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg xl-down:rounded-md border border-blue-200 dark:border-blue-800">
        <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm xl-down:text-xs font-medium text-blue-900 dark:text-blue-100">
          {t('userActivity.monitor.pinnedMessages', 'Tin nhắn đã ghim')} ({pinnedMessages.length})
        </span>
      </div>

      <div className="space-y-2 xl-down:space-y-1.5 max-h-[300px] xl-down:max-h-[200px] overflow-y-auto pr-2">
        {pinnedMessages.map((pm) => {
          const msg = type === 'dm' ? pm.message : pm.message;
          if (!msg) return null;

          const sender = msg.sender;
          const senderName = sender?.name || 'Unknown';
          const senderAvatar = sender?.avatar;

          return (
            <div
              key={pm.id}
              className="bg-white dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 p-3 xl-down:p-2 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2 xl-down:mb-1">
                <div className="flex items-center gap-2 xl-down:gap-1.5 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {senderAvatar ? (
                      <img
                        src={resolveAvatar(senderAvatar)}
                        alt={senderName}
                        className="h-7 w-7 xl-down:h-6 xl-down:w-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 xl-down:h-6 xl-down:w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs xl-down:text-2xs font-medium">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Sender info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-white truncate">
                      {senderName}
                    </p>
                    <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                      {formatDate(pm.pinnedAt || msg.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Pin icon */}
                <Pin className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              </div>

              {/* Message content */}
              <div className="text-sm xl-down:text-xs text-gray-700 dark:text-gray-300 break-words line-clamp-3">
                {renderMessageContent(msg.content)}
              </div>

              {/* Pinned by (for groups) */}
              {type === 'group' && pm.pinnedBy && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-neutral-700 flex items-center gap-1.5 text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                  <span>📌</span>
                  <span>
                    {t('userActivity.monitor.pinnedBy', { name: pm.pinnedBy.name, defaultValue: `Đã ghim bởi ${pm.pinnedBy.name}` })}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PinnedMessagesPanel;
