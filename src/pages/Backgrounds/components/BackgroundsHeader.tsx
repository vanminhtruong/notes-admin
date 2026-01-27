import React from 'react';
import { Palette } from 'lucide-react';

const BackgroundsHeader: React.FC = () => {
  return (
    <div className="relative mb-2">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-rose-600/5 dark:from-purple-500/10 dark:via-pink-500/10 dark:to-rose-500/10 rounded-2xl xl-down:rounded-xl -z-10" />
      
      <div className="flex items-center gap-4 xl-down:gap-3 p-6 xl-down:p-4 sm-down:p-3">
        <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 sm-down:w-10 sm-down:h-10 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25 dark:shadow-purple-500/15">
          <Palette className="w-7 h-7 xl-down:w-6 xl-down:h-6 sm-down:w-5 sm-down:h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Backgrounds Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm xl-down:text-xs">
            Quản lý backgrounds cho notes của users
          </p>
        </div>
      </div>
    </div>
  );
};

export default BackgroundsHeader;
