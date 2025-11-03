import React from 'react';
import { Eye, Edit2, Trash2, Power } from 'lucide-react';
import type { Background } from '../interface';

interface BackgroundsGridProps {
  backgrounds: Background[];
  canEdit: boolean;
  canDelete: boolean;
  onView: (background: Background) => void;
  onEdit: (background: Background) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}

const BackgroundsGrid: React.FC<BackgroundsGridProps> = ({
  backgrounds,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const renderBackgroundPreview = (background: Background) => {
    if (background.type === 'color') {
      return (
        <div
          className="w-full h-24 xl-down:h-20 sm-down:h-16 rounded-lg xl-down:rounded-md"
          style={{ backgroundColor: background.value || '#e5e7eb' }}
        />
      );
    } else {
      return (
        <div
          className="w-full h-24 xl-down:h-20 sm-down:h-16 rounded-lg xl-down:rounded-md bg-cover bg-center"
          style={{
            backgroundImage: background.value ? `url(${background.value})` : 'none',
            backgroundColor: background.value ? 'transparent' : '#e5e7eb',
          }}
        />
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl-down:gap-3 sm-down:gap-2 p-4 xl-down:p-3 sm-down:p-2">
      {backgrounds.map((background) => (
        <div
          key={background.id}
          className="bg-white dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-shadow"
        >
          {/* Preview */}
          <div className="p-3 xl-down:p-2">
            {renderBackgroundPreview(background)}
          </div>

          {/* Info */}
          <div className="px-3 xl-down:px-2 pb-3 xl-down:pb-2 space-y-2 xl-down:space-y-1.5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm xl-down:text-xs truncate">
                {background.label}
              </h3>
              <p className="text-xs xl-down:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                ID: {background.uniqueId}
              </p>
            </div>

            <div className="flex items-center gap-2 xl-down:gap-1.5 flex-wrap">
              <span className={`px-2 xl-down:px-1.5 py-0.5 rounded text-[10px] xl-down:text-[9px] font-medium ${
                background.type === 'color'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              }`}>
                {background.type === 'color' ? 'Màu' : 'Ảnh'}
              </span>
              <span className="px-2 xl-down:px-1.5 py-0.5 rounded text-[10px] xl-down:text-[9px] font-medium bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300">
                {background.category}
              </span>
              <span className={`px-2 xl-down:px-1.5 py-0.5 rounded text-[10px] xl-down:text-[9px] font-medium ${
                background.isActive
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {background.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="text-xs xl-down:text-[10px] text-gray-500 dark:text-gray-400">
              Sort: {background.sortOrder}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 xl-down:gap-1 pt-2 xl-down:pt-1.5 border-t border-gray-200 dark:border-neutral-700">
              <button
                onClick={() => onView(background)}
                className="flex-1 px-2 xl-down:px-1.5 py-1.5 xl-down:py-1 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded xl-down:rounded-sm hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors text-xs xl-down:text-[10px] flex items-center justify-center gap-1"
                title="Xem chi tiết"
              >
                <Eye className="w-3.5 h-3.5 xl-down:w-3 xl-down:h-3" />
              </button>

              {canEdit && (
                <>
                  <button
                    onClick={() => onEdit(background)}
                    className="flex-1 px-2 xl-down:px-1.5 py-1.5 xl-down:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded xl-down:rounded-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-xs xl-down:text-[10px] flex items-center justify-center gap-1"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-3.5 h-3.5 xl-down:w-3 xl-down:h-3" />
                  </button>

                  <button
                    onClick={() => onToggleActive(background.id)}
                    className={`flex-1 px-2 xl-down:px-1.5 py-1.5 xl-down:py-1 rounded xl-down:rounded-sm transition-colors text-xs xl-down:text-[10px] flex items-center justify-center gap-1 ${
                      background.isActive
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                    }`}
                    title={background.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  >
                    <Power className="w-3.5 h-3.5 xl-down:w-3 xl-down:h-3" />
                  </button>
                </>
              )}

              {canDelete && (
                <button
                  onClick={() => onDelete(background.id)}
                  className="flex-1 px-2 xl-down:px-1.5 py-1.5 xl-down:py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded xl-down:rounded-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-xs xl-down:text-[10px] flex items-center justify-center gap-1"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5 xl-down:w-3 xl-down:h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BackgroundsGrid;
