import { useState } from 'react';
import type { Note } from '../../interface/types';

export const useNotesState = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [archivedFilter, setArchivedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  return {
    notes,
    setNotes,
    loading,
    setLoading,
    searchTerm,
    setSearchTerm,
    selectedUserId,
    setSelectedUserId,
    categoryFilter,
    setCategoryFilter,
    priorityFilter,
    setPriorityFilter,
    archivedFilter,
    setArchivedFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalItems,
    setTotalItems,
  };
};
