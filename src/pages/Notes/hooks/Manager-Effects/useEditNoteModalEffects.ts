import { useEffect, useCallback } from 'react';
import adminService from '@services/adminService';
import type { NoteCategory, Note } from '../../interface/types';

interface UseEditNoteModalEffectsProps {
  show: boolean;
  editingNote: Note | null;
  setCategories: (categories: NoteCategory[]) => void;
  setLoadingCategories: (loading: boolean) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (show: boolean) => void;
  categorySearchTerm: string;
  setCategorySearchResults: (results: NoteCategory[]) => void;
  setIsSearchingCategories: (loading: boolean) => void;
  categorySearchInputRef: React.RefObject<HTMLInputElement | null>;
  categoryDebounceTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const useEditNoteModalEffects = ({
  show,
  editingNote,
  setCategories,
  setLoadingCategories,
  showCategoryDropdown,
  setShowCategoryDropdown,
  categorySearchTerm,
  setCategorySearchResults,
  setIsSearchingCategories,
  categorySearchInputRef,
  categoryDebounceTimerRef,
}: UseEditNoteModalEffectsProps) => {
  // Fetch categories for the user
  useEffect(() => {
    const fetchCategories = async () => {
      if (!editingNote?.user?.id) return;
      try {
        setLoadingCategories(true);
        const response: any = await adminService.getAllCategories({ userId: editingNote.user.id, limit: 100 });
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    if (show) {
      fetchCategories();
    }
  }, [show, editingNote?.user?.id, setCategories, setLoadingCategories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };
    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown, setShowCategoryDropdown]);

  // Search categories function
  const searchCategories = useCallback(async (query: string) => {
    if (!query.trim() || !editingNote?.user?.id) {
      setCategorySearchResults([]);
      setIsSearchingCategories(false);
      return;
    }

    setIsSearchingCategories(true);
    try {
      const response: any = await adminService.searchCategories(query, editingNote.user.id, 4);
      setCategorySearchResults(response.categories || []);
    } catch (error) {
      console.error('Search categories error:', error);
      setCategorySearchResults([]);
    } finally {
      setIsSearchingCategories(false);
    }
  }, [editingNote?.user?.id, setCategorySearchResults, setIsSearchingCategories]);

  // Debounce search effect
  useEffect(() => {
    if (categoryDebounceTimerRef.current) {
      clearTimeout(categoryDebounceTimerRef.current);
    }

    categoryDebounceTimerRef.current = setTimeout(() => {
      searchCategories(categorySearchTerm);
    }, 300);

    return () => {
      if (categoryDebounceTimerRef.current) {
        clearTimeout(categoryDebounceTimerRef.current);
      }
    };
  }, [categorySearchTerm, searchCategories, categoryDebounceTimerRef]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showCategoryDropdown && categorySearchInputRef.current) {
      setTimeout(() => {
        categorySearchInputRef.current?.focus();
      }, 100);
    }
  }, [showCategoryDropdown, categorySearchInputRef]);
};
