import { useState } from 'react';
import type { Category } from '../../interface/category.types';

export interface UseCategoriesStateReturn {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  total: number;
  setTotal: (total: number) => void;
}

export const useCategoriesState = (): UseCategoriesStateReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  return {
    categories,
    setCategories,
    isLoading,
    setIsLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    total,
    setTotal,
  };
};
