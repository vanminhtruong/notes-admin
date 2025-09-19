import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@hooks/usePagination';
import Pagination from '@components/common/Pagination';
import type { UserActivityData, TypingInfo } from '../interfaces';

interface MessagesTabProps {
  activityData: UserActivityData | null;
  typingInfo: TypingInfo | null;
  formatDate: (dateString: string) => string;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ activityData, typingInfo, formatDate }) => {
  const { t } = useTranslation('users');
  
  const messages = activityData?.activity.messages || [];
  const {
    currentItems: currentMessages,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination<any>({ data: messages, itemsPerPage: 10 });

  return (
    <div className="space-y-4">
      {typingInfo && (
        <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
          <span className="mr-2">⌨️</span>
          <span>{t('userActivity.typing.typingWith', { name: typingInfo.withUserName })}</span>
        </div>
      )}
      
      {messages.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">💬</span>
          <p>{t('userActivity.messages.noMessages')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {currentMessages.map((message) => (
              <div key={message.id} className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="text-lg">
                        {message.sender.id === activityData?.user.id ? '📤' : '📥'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {message.sender.id === activityData?.user.id 
                          ? `${t('userActivity.messages.sentTo')} ${message.receiver.name}` 
                          : `${t('userActivity.messages.receivedFrom')} ${message.sender.name}`}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-words line-clamp-2 overflow-hidden">{message.content}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(message.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
              showInfo={true}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MessagesTab;
