import React from 'react';
import { Pin, PinOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PinButtonProps {
  isPinned: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md';
}

const PinButton: React.FC<PinButtonProps> = ({ isPinned, onClick, size = 'md' }) => {
  const { t } = useTranslation('notes');

  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5 xl-down:w-4 xl-down:h-4';
  const paddingClass = size === 'sm' ? 'p-1.5' : 'p-2 xl-down:p-1.5';

  return (
    <button
      onClick={onClick}
      className={`${paddingClass} rounded-md xl-down:rounded transition-colors ${
        isPinned 
          ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-900/20' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-neutral-800'
      }`}
      title={isPinned ? t('actions.unpin') : t('actions.pin')}
    >
      {isPinned ? (
        <Pin className={iconSizeClass} />
      ) : (
        <PinOff className={iconSizeClass} />
      )}
    </button>
  );
};

export default PinButton;
