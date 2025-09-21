import React, { useState } from 'react';
import { hasPermission } from '@utils/auth';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@hooks/usePagination';
import Pagination from '@components/common/Pagination';
import type { UserActivityData, TypingInfo } from '../interfaces';

interface MessagesTabProps {
  activityData: UserActivityData | null;
  typingInfo: TypingInfo | null;
  formatDate: (dateString: string) => string;
  onRecallMessage?: (messageId: number) => void;
  onDeleteMessage?: (messageId: number) => void;
}

const MessagesTab: React.FC<MessagesTabProps> = ({ 
  activityData, 
  typingInfo, 
  formatDate, 
  onRecallMessage, 
  onDeleteMessage 
}) => {
  const { t } = useTranslation('users');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
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
    <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2">
      {typingInfo && (
        <div className="flex items-center text-sm xl-down:text-xs text-blue-600 dark:text-blue-400">
          <span className="mr-2 xl-down:mr-1">⌨️</span>
          <span>{t('userActivity.typing.typingWith', { name: typingInfo.withUserName })}</span>
        </div>
      )}
      
      {messages.length === 0 ? (
        <div className="text-center py-8 xl-down:py-6 sm-down:py-4 text-gray-500 dark:text-gray-400">
          <span className="text-4xl xl-down:text-3xl sm-down:text-2xl mb-4 xl-down:mb-3 sm-down:mb-2 block">💬</span>
          <p className="text-sm xl-down:text-xs">{t('userActivity.messages.noMessages')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 xl-down:space-y-2">
            {currentMessages.map((message) => {
              const isUserMessage = message.sender.id === activityData?.user.id;
              console.log('MessagesTab - Debug:', {
                messageId: message.id,
                senderId: message.sender.id,
                userId: activityData?.user.id,
                isUserMessage,
                hasRecallCallback: !!onRecallMessage,
                hasDeleteCallback: !!onDeleteMessage
              });
              return (
                <div key={message.id} className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2 relative">
                  <div className="flex items-start justify-between xl-down:flex-col xl-down:space-y-2">
                    <div className="flex items-center space-x-3 xl-down:space-x-2 flex-1">
                      <div className="flex-shrink-0">
                        <span className="text-lg xl-down:text-base sm-down:text-sm">
                          {isUserMessage ? '📤' : '📥'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                          {isUserMessage 
                            ? `${t('userActivity.messages.sentTo')} ${message.receiver.name}` 
                            : `${t('userActivity.messages.receivedFrom')} ${message.sender.name}`}
                        </p>
                        <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 break-words line-clamp-2 overflow-hidden">
                          {message.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 xl-down:space-x-1 flex-shrink-0">
                      <span className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">{formatDate(message.createdAt)}</span>
                      {((onRecallMessage && hasPermission('manage_users.activity.messages.recall')) || (onDeleteMessage && hasPermission('manage_users.activity.messages.delete'))) && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === message.id ? null : message.id);
                            }}
                            className="p-1.5 xl-down:p-1 rounded-md xl-down:rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            aria-label={t('userActivity.messages.actions.menu', 'Menu')}
                          >
                            <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          {openMenuId === message.id && (
                            <div
                              className="absolute right-0 top-8 xl-down:top-6 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md shadow-lg py-1 min-w-[160px] xl-down:min-w-[140px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {onRecallMessage && hasPermission('manage_users.activity.messages.recall') && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    onRecallMessage(message.id);
                                  }}
                                  className="w-full text-left px-3 py-2 xl-down:px-2 xl-down:py-1.5 text-sm xl-down:text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2"
                                >
                                  <span>🔄</span>
                                  <span>{t('userActivity.messages.actions.recall', 'Thu hồi tin nhắn')}</span>
                                </button>
                              )}
                              {onDeleteMessage && hasPermission('manage_users.activity.messages.delete') && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    onDeleteMessage(message.id);
                                  }}
                                  className="w-full text-left px-3 py-2 xl-down:px-2 xl-down:py-1.5 text-sm xl-down:text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                >
                                  <span>🗑️</span>
                                  <span>{t('userActivity.messages.actions.delete', 'Xóa tin nhắn')}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
