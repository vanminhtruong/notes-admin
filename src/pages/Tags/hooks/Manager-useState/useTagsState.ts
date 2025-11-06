import { useState } from 'react';
import type { Tag } from '../../interface/Tags.types';

export interface UseTagsStateReturn {
  tags: Tag[];
  setTags: (tags: Tag[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  total: number;
  setTotal: (total: number) => void;
  totalPages: number;
  setTotalPages: (pages: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export const useTagsState = (): UseTagsStateReturn => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  return {
    tags,
    setTags,
    isLoading,
    setIsLoading,
    total,
    setTotal,
    totalPages,
    setTotalPages,
    currentPage,
    setCurrentPage,
  };
};
