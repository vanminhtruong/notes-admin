import React from 'react';
import { Palette } from 'lucide-react';

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 xl-down:py-10 sm-down:py-8 px-4">
      <div className="w-16 h-16 xl-down:w-14 xl-down:h-14 sm-down:w-12 sm-down:h-12 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 xl-down:mb-3">
        <Palette className="w-8 h-8 xl-down:w-7 xl-down:h-7 sm-down:w-6 sm-down:h-6 text-gray-400" />
      </div>
      <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-white mb-2 xl-down:mb-1.5">
        {hasFilters ? 'Không tìm thấy backgrounds' : 'Chưa có backgrounds'}
      </h3>
      <p className="text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
        {hasFilters
          ? 'Thử thay đổi bộ lọc hoặc tìm kiếm để xem kết quả khác'
          : 'Bắt đầu bằng cách tạo background đầu tiên'}
      </p>
    </div>
  );
};

export default EmptyState;
