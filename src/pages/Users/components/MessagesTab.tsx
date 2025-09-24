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

  // Helper: render nội dung, hỗ trợ CALL_LOG::<...>
  const renderMessageContent = (
    content: any,
    options?: { isOwn?: boolean; senderName?: string; receiverName?: string }
  ) => {
    const text = typeof content === 'string' ? content : String(content ?? '');
    const isOwn = !!options?.isOwn;
    const senderName = options?.senderName || '';
    const receiverName = options?.receiverName || '';
    const callPrefix = 'CALL_LOG::';
    if (typeof text === 'string' && text.startsWith(callPrefix)) {
      try {
        const raw = text.slice(callPrefix.length);
        const obj = JSON.parse(decodeURIComponent(raw));
        const media: 'audio' | 'video' = obj.media === 'video' ? 'video' : 'audio';
        const direction: 'incoming' | 'outgoing' = obj.direction === 'incoming' ? 'incoming' : 'outgoing';
        const viewDir: 'incoming' | 'outgoing' = isOwn ? direction : (direction === 'incoming' ? 'outgoing' : 'incoming');
        const result: 'answered' | 'missed' | 'cancelled' = (['answered', 'missed', 'cancelled'].includes(obj.result) ? obj.result : 'answered');
        const durationSec: number | undefined = typeof obj.durationSec === 'number' ? obj.durationSec : undefined;

        const fmtDuration = (sec?: number) => {
          if (!sec || sec <= 0) return null;
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return (
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <span>{media === 'video' ? '📹' : '📞'}</span>
              <span>{t('userActivity.callLog.duration', { m, s, defaultValue: `${m} phút ${s} giây` })}</span>
            </div>
          );
        };

        const header = (() => {
          if (result === 'missed') {
            // Outgoing missed -> người nhận không bắt máy; Incoming missed (ít gặp) -> người gửi gọi nhỡ
            return (
              viewDir === 'outgoing'
                ? <span className="font-semibold text-red-600 dark:text-red-400">{t('userActivity.callLog.toUserMissed', { name: receiverName, defaultValue: `Cuộc gọi tới ${receiverName} bị nhỡ` })}</span>
                : <span className="font-semibold text-red-600 dark:text-red-400">{t('userActivity.callLog.missedFromUser', { name: senderName, defaultValue: `Cuộc gọi nhỡ từ ${senderName}` })}</span>
            );
          }
          if (result === 'cancelled') {
            // Người gọi đã hủy (theo log hiện tại là phía caller)
            return (
              <span className="font-semibold text-red-600 dark:text-red-400">
                {t('userActivity.callLog.userCancelled', { name: senderName, defaultValue: `${senderName} đã hủy cuộc gọi` })}
              </span>
            );
          }
          if (viewDir === 'incoming') {
            return (
              <span className="font-semibold">
                {media === 'video'
                  ? t('userActivity.callLog.incomingVideoFrom', { name: senderName, defaultValue: `Cuộc gọi video đến từ ${senderName}` })
                  : t('userActivity.callLog.incomingAudioFrom', { name: senderName, defaultValue: `Cuộc gọi thoại đến từ ${senderName}` })}
              </span>
            );
          }
          return (
            <span className="font-semibold">
              {media === 'video'
                ? t('userActivity.callLog.outgoingVideoTo', { name: receiverName, defaultValue: `Cuộc gọi video đi tới ${receiverName}` })
                : t('userActivity.callLog.outgoingAudioTo', { name: receiverName, defaultValue: `Cuộc gọi thoại đi tới ${receiverName}` })}
            </span>
          );
        })();

        const label = media === 'video' ? t('userActivity.callLog.video', 'Cuộc gọi video') : t('userActivity.callLog.audio', 'Cuộc gọi thoại');

        return (
          <div className={`w-[200px] md:w-[220px] bg-white/80 dark:bg-neutral-800/90 backdrop-blur rounded-xl p-3 border ${result === 'missed' ? 'border-red-200 dark:border-red-900/40' : 'border-white/20 dark:border-neutral-700/30'} shadow-sm`}
               role="group" aria-label="call-log">
            <div className="text-gray-900 dark:text-gray-100 mb-0.5 flex items-center gap-1.5 text-sm">
              <span className={`${result==='missed' ? 'text-red-600 dark:text-red-400' : 'text-blue-600'}`}>{media === 'video' ? '📹' : '📞'}</span>
              {header}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
              <span className="opacity-70">{media === 'video' ? '📹' : '📞'}</span>
              <span>{label}</span>
            </div>
            {fmtDuration(durationSec)}
          </div>
        );
      } catch {
        // fallthrough
      }
    }
    return <span className="whitespace-pre-wrap break-words">{text}</span>;
  };

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
                        <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 break-words overflow-hidden">
                          {renderMessageContent(message.content, { isOwn: isUserMessage, senderName: message?.sender?.name, receiverName: message?.receiver?.name })}
                        </div>
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
