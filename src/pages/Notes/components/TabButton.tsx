import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  ariaLabel: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, ariaLabel }) => {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={`flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 rounded-md text-sm xl-down:text-xs font-medium transition-all ${
        active
          ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
      }`}
    >
      {icon}
      {label}
    </button>
  );
};

export default TabButton;
