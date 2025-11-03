import { useState } from 'react';

export const useBackgroundsFilters = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const handleSearchChange = (value: string, resetPage?: () => void) => {
    setSearchTerm(value);
    if (resetPage) resetPage();
  };

  const handleCategoryChange = (value: string, resetPage?: () => void) => {
    setSelectedCategory(value);
    if (resetPage) resetPage();
  };

  const handleStatusChange = (value: 'all' | 'active' | 'inactive', resetPage?: () => void) => {
    setSelectedStatus(value);
    if (resetPage) resetPage();
  };

  return {
    searchTerm,
    selectedCategory,
    selectedStatus,
    handleSearchChange,
    handleCategoryChange,
    handleStatusChange,
  };
};
