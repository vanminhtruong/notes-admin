import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');
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
    <div className="flex items-center justify-between px-4 xl-down:px-3 sm-down:px-2 py-3 xl-down:py-2.5 sm-down:py-2 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
      <div className="flex justify-between items-center w-full gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm sm-down:text-xs text-gray-700 dark:text-gray-300">
            {t('pagination.showing')} <span className="font-medium">{startItem}</span> {t('pagination.to')}{' '}
            <span className="font-medium">{endItem}</span> {t('pagination.of')}{' '}
            <span className="font-medium">{total}</span> {t('pagination.results')}
          </p>

          {showSizeChanger && (
            <div className="flex items-center gap-2 ml-2 sm-down:ml-0 sm-down:w-full sm-down:justify-between">
              <span className="text-sm sm-down:text-xs text-gray-700 dark:text-gray-300 hidden sm-down:inline">
                {t('pagination.showing')}
              </span>
              <select
                value={pageSize}
                onChange={(e) => onPageChange(1, Number(e.target.value))}
                className="px-2 py-1 sm-down:py-0.5 text-sm sm-down:text-xs border border-gray-300 dark:border-neutral-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
                aria-label={t('pagination.showing')}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 sm-down:space-x-0.5">
          {/* Previous button */}
          <button
            onClick={() => onPageChange(current - 1)}
            disabled={current === 1}
            aria-label={t('pagination.previous')}
            className="px-2 py-1 sm-down:px-1.5 sm-down:py-0.5 text-sm sm-down:text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('pagination.previous')}
          </button>

          {/* Page numbers */}
          {getPageNumbers().map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 sm-down:px-2 sm-down:py-0.5 text-sm sm-down:text-xs font-medium border ${
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
            aria-label={t('pagination.next')}
            className="px-2 py-1 sm-down:px-1.5 sm-down:py-0.5 text-sm sm-down:text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('pagination.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
;

export default Pagination;
