import { useEffect } from 'react';
import adminService from '@services/adminService';
import type { NoteCategory, Note } from '../../interface/types';

interface UseEditNoteModalEffectsProps {
  show: boolean;
  editingNote: Note | null;
  setCategories: (categories: NoteCategory[]) => void;
  setLoadingCategories: (loading: boolean) => void;
  showCategoryDropdown: boolean;
  setShowCategoryDropdown: (show: boolean) => void;
}

export const useEditNoteModalEffects = ({
  show,
  editingNote,
  setCategories,
  setLoadingCategories,
  showCategoryDropdown,
  setShowCategoryDropdown,
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
};
