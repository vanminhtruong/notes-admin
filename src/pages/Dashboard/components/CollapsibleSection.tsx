import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  defaultOpen = true,
  children
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl xl-down:rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
      {/* Header - Clickable to toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 xl-down:p-3 sm-down:p-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
      >
        <div className="flex items-center gap-3 xl-down:gap-2.5 sm-down:gap-2">
          {icon && (
            <div className="flex-shrink-0 w-10 h-10 xl-down:w-9 xl-down:h-9 sm-down:w-8 sm-down:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white shadow-md">
              {icon}
            </div>
          )}
          <h2 className="text-xl xl-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
        </div>
        <svg
          className={`w-5 h-5 xl-down:w-4 xl-down:h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="border-t border-gray-200 dark:border-neutral-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
