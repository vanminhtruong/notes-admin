import React from 'react';
import { Palette, Image } from 'lucide-react';

interface BackgroundsTabsProps {
  activeTab: 'colors' | 'images';
  onTabChange: (tab: 'colors' | 'images') => void;
}

const BackgroundsTabs: React.FC<BackgroundsTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex items-center gap-2 xl-down:gap-1.5 border-b border-gray-200 dark:border-neutral-700">
      <button
        onClick={() => onTabChange('colors')}
        className={`flex items-center gap-2 xl-down:gap-1.5 px-4 xl-down:px-3 sm-down:px-2 py-3 xl-down:py-2.5 sm-down:py-2 text-sm xl-down:text-xs font-medium transition-colors border-b-2 ${
          activeTab === 'colors'
            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Palette className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
        <span>Colors</span>
      </button>

      <button
        onClick={() => onTabChange('images')}
        className={`flex items-center gap-2 xl-down:gap-1.5 px-4 xl-down:px-3 sm-down:px-2 py-3 xl-down:py-2.5 sm-down:py-2 text-sm xl-down:text-xs font-medium transition-colors border-b-2 ${
          activeTab === 'images'
            ? 'border-purple-500 text-purple-600 dark:text-purple-400'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Image className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
        <span>Images</span>
      </button>
    </div>
  );
};

export default BackgroundsTabs;
