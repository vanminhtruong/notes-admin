import { useState } from 'react';

export interface UseTagsFiltersReturn {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedUserId: number | '';
  setSelectedUserId: (userId: number | '') => void;
  handleSearchChange: (value: string, resetPage: () => void) => void;
  handleUserIdChange: (value: string, resetPage: () => void) => void;
}

export const useTagsFilters = (): UseTagsFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');

  const handleSearchChange = (value: string, resetPage: () => void) => {
    setSearchTerm(value);
    resetPage();
  };

  const handleUserIdChange = (value: string, resetPage: () => void) => {
    setSelectedUserId(value ? parseInt(value) : '');
    resetPage();
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedUserId,
    setSelectedUserId,
    handleSearchChange,
    handleUserIdChange,
  };
};
