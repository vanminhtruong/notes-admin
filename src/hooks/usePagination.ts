import { useState, useMemo } from 'react';

interface UsePaginationProps {
  data: any[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  currentItems: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetPage: () => void;
}

export const usePagination = <T>({ 
  data, 
  itemsPerPage = 10 
}: UsePaginationProps): UsePaginationReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex) as T[];
  }, [data, currentPage, itemsPerPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const resetPage = () => {
    setCurrentPage(1);
  };

  // Reset về trang 1 nếu currentPage vượt quá totalPages sau khi data thay đổi
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    currentItems,
    goToPage,
    nextPage,
    prevPage,
    resetPage
  };
};
