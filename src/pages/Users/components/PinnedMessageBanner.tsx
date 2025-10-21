import React, { useState } from 'react';
import { Pin, ChevronDown, ChevronUp, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PinnedMessageBannerProps {
  pinnedMessages: any[];
  messages: any[];
  isGroup: boolean;
  formatDate: (dateString: string) => string;
  resolveAvatar: (url?: string | null) => string;
  onScrollToMessage?: (messageId: number) => void;
}

const PinnedMessageBanner: React.FC<PinnedMessageBannerProps> = ({
  pinnedMessages,
  isGroup,
  onScrollToMessage
}) => {
  const { t } = useTranslation('users');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!pinnedMessages || pinnedMessages.length === 0) return null;

  const currentPinned = pinnedMessages[currentIndex];
  if (!currentPinned) return null;

  const message = currentPinned.message || currentPinned.groupMessage;
  const hasMultiplePinned = pinnedMessages.length > 1;

  // Format display text
  const formatDisplayText = (pm: typeof currentPinned) => {
    const msg = pm.message || pm.groupMessage;
    if (!msg) return '';
    
    const prefix = 'NOTE_SHARE::';
    const isSharedNote = typeof msg.content === 'string' && msg.content.startsWith(prefix);
    let displayText = msg.content || '';
    
    if (isSharedNote && msg.content) {
      try {
        const raw = msg.content.slice(prefix.length);
        const obj = JSON.parse(decodeURIComponent(raw));
        if (obj && obj.title) {
          displayText = obj.title;
        }
      } catch {
        displayText = 'Ghi chú';
      }
    } else if (msg.messageType === 'image') {
      displayText = t('userActivity.noteShare.cardTitle', 'Hình ảnh');
    } else if (msg.messageType === 'file') {
      displayText = t('userActivity.noteShare.cardTitle', 'Tệp đính kèm');
    } else {
      try {
        displayText = decodeURIComponent(msg.content || '');
      } catch {
        displayText = msg.content || '';
      }
    }
    
    return displayText;
  };

  // Get sender name
  const getSenderName = () => {
    if (!isGroup) return '';
    if (message?.sender?.name) return message.sender.name;
    if (currentPinned.sender?.name) return currentPinned.sender.name;
    return t('userActivity.monitor.unknownUser', 'Người dùng');
  };

  const displayText = formatDisplayText(currentPinned);
  const senderName = getSenderName();

  // Handle next/prev navigation
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + pinnedMessages.length) % pinnedMessages.length);
  };

  // Collapsed view
  if (!isExpanded) {
    return (
      <div className="sticky top-0 z-50 w-full backdrop-blur bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-gray-900/95 dark:to-gray-800/95 border-b border-blue-200/60 dark:border-blue-900/40 shadow-sm">
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-blue-100/50 dark:hover:bg-gray-800/50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {hasMultiplePinned && (
                <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {pinnedMessages.length}
                </span>
              )}
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              {t('userActivity.monitor.pinnedMessages', 'Tin nhắn đã ghim')}
            </span>
            {hasMultiplePinned && (
              <span className="text-xs text-blue-700 dark:text-blue-400 bg-blue-200/60 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                {pinnedMessages.length}
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur bg-gradient-to-r from-blue-50/95 to-indigo-50/95 dark:from-gray-900/95 dark:to-gray-800/95 border-b border-blue-200/60 dark:border-blue-900/40 shadow-md">
      <div className="px-3 py-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Pin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              {hasMultiplePinned && (
                <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                  {pinnedMessages.length}
                </span>
              )}
            </div>
            <span className="text-xs font-semibold text-blue-900 dark:text-blue-300">
              {t('userActivity.monitor.pinnedMessages', 'Tin nhắn đã ghim')}
            </span>
            {isGroup && senderName && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                • {senderName}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            {/* Navigation arrows if multiple pinned */}
            {hasMultiplePinned && (
              <div className="flex items-center gap-0.5 text-[11px] text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 rounded px-2 py-1 font-medium">
                <button
                  onClick={handlePrev}
                  className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  aria-label="Previous pinned message"
                >
                  ◀
                </button>
                <span className="mx-1">{currentIndex + 1}/{pinnedMessages.length}</span>
                <button
                  onClick={handleNext}
                  className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                  aria-label="Next pinned message"
                >
                  ▶
                </button>
              </div>
            )}
            
            {/* Collapse button */}
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-full transition-colors group"
              aria-label="Thu gọn"
            >
              <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Message content box */}
        <button
          onClick={() => onScrollToMessage && onScrollToMessage(message?.id)}
          className="w-full text-left group"
          disabled={!onScrollToMessage}
        >
          <div className="relative bg-white dark:bg-gray-800 rounded-xl p-3 hover:shadow-md transition-all border border-blue-200/40 dark:border-blue-900/30 overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400" />
            
            <div className="pl-2">
              {/* File indicator if file type */}
              {message?.messageType === 'file' && (
                <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <File className="w-3.5 h-3.5" />
                  <span>Tệp đính kèm</span>
                </div>
              )}
              
              {/* Message text and timestamp in same row */}
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13px] leading-relaxed text-gray-900 dark:text-gray-100 line-clamp-2 break-words font-medium flex-1">
                  {message?.messageType === 'image' ? (
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">📷</span>
                      <span className="italic text-gray-600 dark:text-gray-400">{displayText}</span>
                    </span>
                  ) : (
                    displayText
                  )}
                </div>
                
                {/* Timestamp */}
                {message?.createdAt && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                    <span className="inline-block w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500" />
                    <span>
                      {new Date(message.createdAt).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PinnedMessageBanner;
