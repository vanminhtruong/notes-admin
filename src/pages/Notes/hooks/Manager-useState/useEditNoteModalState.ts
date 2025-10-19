import { useState } from 'react';
import type { NoteCategory } from '../../interface/types';

export const useEditNoteModalState = () => {
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video' | 'youtube'>('image');
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  return {
    activeMediaTab,
    setActiveMediaTab,
    categories,
    setCategories,
    loadingCategories,
    setLoadingCategories,
    showCategoryDropdown,
    setShowCategoryDropdown,
  };
};
