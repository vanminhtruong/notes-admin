import React from 'react';

interface PaginationProps {
  current: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number, size?: number) => void;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  current,
  pageSize,
  total,
  onPageChange,
  showSizeChanger = true,
  pageSizeOptions = [10, 20, 50]
}) => {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = (current - 1) * pageSize + 1;
  const endItem = Math.min(current * pageSize, total);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, current - 2);
      let end = Math.min(totalPages, current + 2);
      
      if (current <= 3) {
        end = Math.min(maxVisible, totalPages);
      }
      
      if (current >= totalPages - 2) {
        start = Math.max(totalPages - maxVisible + 1, 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 sm:px-6">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
            <span className="font-medium">{endItem}</span> trong tổng số{' '}
            <span className="font-medium">{total}</span> kết quả
          </p>
          
          {showSizeChanger && (
            <div className="flex items-center space-x-2 ml-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">Hiển thị:</span>
              <select
                value={pageSize}
                onChange={(e) => onPageChange(1, Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-700 dark:text-gray-300">/ trang</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(current - 1)}
            disabled={current === 1}
            className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Trước
          </button>

          {/* Page numbers */}
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm font-medium border ${
                page === current
                  ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                  : 'bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => onPageChange(current + 1)}
            disabled={current === totalPages}
            className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
