import { useState } from 'react';
import type { Background } from '../interface';

export const useBackgroundsState = () => {
  const [activeTab, setActiveTab] = useState<'colors' | 'images'>('colors');
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  return {
    activeTab,
    setActiveTab,
    backgrounds,
    setBackgrounds,
    isLoading,
    setIsLoading,
    currentPage,
    setCurrentPage,
    total,
    setTotal,
    totalPages,
    setTotalPages,
  };
};
