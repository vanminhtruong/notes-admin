import React from 'react';
import { ShieldAlert } from 'lucide-react';

const NoPermissionView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] xl-down:min-h-[350px] sm-down:min-h-[300px] px-4">
      <div className="w-20 h-20 xl-down:w-16 xl-down:h-16 sm-down:w-14 sm-down:h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 xl-down:mb-3">
        <ShieldAlert className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-7 sm-down:h-7 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-2xl xl-down:text-xl sm-down:text-lg font-bold text-gray-900 dark:text-white mb-2 xl-down:mb-1.5">
        Không có quyền truy cập
      </h2>
      <p className="text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
        Bạn không có quyền xem danh sách backgrounds. Vui lòng liên hệ quản trị viên để được cấp quyền.
      </p>
    </div>
  );
};

export default NoPermissionView;
