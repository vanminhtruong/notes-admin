import { useState, useRef } from 'react';
import type { NoteCategory } from '../../interface/types';

export const useEditNoteModalState = () => {
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video' | 'youtube'>('image');
  const [categories, setCategories] = useState<NoteCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Category search states
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categorySearchResults, setCategorySearchResults] = useState<NoteCategory[]>([]);
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const categorySearchInputRef = useRef<HTMLInputElement>(null);
  const categoryDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  return {
    activeMediaTab,
    setActiveMediaTab,
    categories,
    setCategories,
    loadingCategories,
    setLoadingCategories,
    showCategoryDropdown,
    setShowCategoryDropdown,
    categorySearchTerm,
    setCategorySearchTerm,
    categorySearchResults,
    setCategorySearchResults,
    isSearchingCategories,
    setIsSearchingCategories,
    categorySearchInputRef,
    categoryDebounceTimerRef,
  };
};
