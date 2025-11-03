import React from 'react';
import { Palette } from 'lucide-react';

const BackgroundsHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3 xl-down:gap-2">
      <div className="flex items-center justify-center w-12 h-12 xl-down:w-10 xl-down:h-10 sm-down:w-8 sm-down:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl xl-down:rounded-lg sm-down:rounded-md shadow-lg">
        <Palette className="w-6 h-6 xl-down:w-5 xl-down:h-5 sm-down:w-4 sm-down:h-4 text-white" />
      </div>
      <div>
        <h1 className="text-2xl xl-down:text-xl sm-down:text-lg font-bold text-gray-900 dark:text-white">
          Backgrounds Management
        </h1>
        <p className="text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Quản lý backgrounds cho notes của users
        </p>
      </div>
    </div>
  );
};

export default BackgroundsHeader;
