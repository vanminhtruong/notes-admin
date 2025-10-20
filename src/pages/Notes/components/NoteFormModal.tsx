import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import RichTextEditor from '@components/RichTextEditor/RichTextEditor';
import { useRichTextEditor } from '@components/RichTextEditor/useRichTextEditor';
import * as LucideIcons from 'lucide-react';
import { Tag, Search, Loader2 } from 'lucide-react';

// MediaTabs Component
const MediaTabs = memo(({ imageUrl, videoUrl, youtubeUrl, onImageChange, onVideoChange, onYoutubeChange }: {
  imageUrl: string;
  videoUrl: string;
  youtubeUrl: string;
  onImageChange: (url: string) => void;
  onVideoChange: (url: string) => void;
  onYoutubeChange: (url: string) => void;
}) => {
  const { t } = useTranslation('notes');
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'youtube'>('image');
  const [uploading, setUploading] = useState(false);

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-neutral-600 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 text-sm md-down:text-xs font-medium transition-colors ${
            activeTab === 'image'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📷 {t('form.media.tabs.image')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 text-sm md-down:text-xs font-medium transition-colors ${
            activeTab === 'video'
              ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🎬 {t('form.media.tabs.video')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 text-sm md-down:text-xs font-medium transition-colors ${
            activeTab === 'youtube'
              ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📺 {t('form.media.tabs.youtube')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[50px]">
        {activeTab === 'image' && (
          <div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploading(true);
                    const response = await adminService.uploadImage(file);
                    const url = response?.url || response?.data?.url;
                    if (url) {
                      onImageChange(url);
                      onVideoChange('');
                      onYoutubeChange('');
                      toast.success(t('form.media.uploadSuccess.image'));
                    }
                  } catch (err: any) {
                    toast.error(err.message || t('form.media.uploadError'));
                  } finally {
                    setUploading(false);
                  }
                }}
                className="block w-full text-sm md-down:text-xs text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 md-down:file:py-1.5 file:px-4 md-down:file:px-3.5 file:rounded-md file:border-0 file:text-sm md-down:file:text-xs file:font-semibold file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800 disabled:opacity-50"
              />
              {imageUrl && (
                <img src={imageUrl} alt="preview" className="w-16 h-16 md-down:w-14 md-down:h-14 sm-down:w-12 sm-down:h-12 rounded-md object-cover border" />
              )}
            </div>
            {uploading && <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">{t('form.media.uploading')}</p>}
          </div>
        )}

        {activeTab === 'video' && (
          <div>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="video/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setUploading(true);
                    const response = await adminService.uploadImage(file); // Admin uses same endpoint
                    const url = response?.url || response?.data?.url;
                    if (url) {
                      onVideoChange(url);
                      onImageChange('');
                      onYoutubeChange('');
                      toast.success(t('form.media.uploadSuccess.video'));
                    }
                  } catch (err: any) {
                    toast.error(err.message || t('form.media.uploadError'));
                  } finally {
                    setUploading(false);
                  }
                }}
                className="block w-full text-sm md-down:text-xs text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 md-down:file:py-1.5 file:px-4 md-down:file:px-3.5 file:rounded-md file:border-0 file:text-sm md-down:file:text-xs file:font-semibold file:bg-green-50 dark:file:bg-green-900 file:text-green-700 dark:file:text-green-300 hover:file:bg-green-100 dark:hover:file:bg-green-800 disabled:opacity-50"
              />
              {videoUrl && (
                <video src={videoUrl} className="w-16 h-16 md-down:w-14 md-down:h-14 sm-down:w-12 sm-down:h-12 rounded-md object-cover border" />
              )}
            </div>
            {uploading && <p className="text-sm text-green-600 dark:text-green-400 mt-2">{t('form.media.uploading')}</p>}
          </div>
        )}

        {activeTab === 'youtube' && (
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => {
              onYoutubeChange(e.target.value);
              onImageChange('');
              onVideoChange('');
            }}
            className="w-full px-3 py-2 md-down:px-2.5 md-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 text-sm md-down:text-xs"
            placeholder={t('form.media.youtubePlaceholder')}
          />
        )}
      </div>
    </div>
  );
});

MediaTabs.displayName = 'MediaTabs';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Note {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  reminderAt?: string;
  folderId?: number | null;
  user: User;
}

interface NoteFormModalProps {
  show: boolean;
  note: Note | null;
  userId?: number;
  folderId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const NoteFormModal: React.FC<NoteFormModalProps> = ({ show, note, userId, folderId, onClose, onSuccess }) => {
  const { t } = useTranslation('notes');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [reminderAt, setReminderAt] = useState('');
  
  // Category states
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categorySearchResults, setCategorySearchResults] = useState<any[]>([]);
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const categorySearchInputRef = useRef<HTMLInputElement>(null);
  const categoryDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // RichTextEditor instance
  const editor = useRichTextEditor({
    content,
    placeholder: t('form.placeholders.content'),
    onUpdate: (html) => setContent(html),
  });

  // Load categories when userId is available
  useEffect(() => {
    const loadCategories = async () => {
      const targetUserId = userId || (note?.user as any)?.id;
      if (!targetUserId) return;
      
      try {
        setLoadingCategories(true);
        const response: any = await adminService.getAllCategories({ userId: targetUserId, limit: 100 });
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    if (show) {
      loadCategories();
    }
  }, [show, userId, note]);

  useEffect(() => {
    if (show) {
      if (note) {
        setTitle(note.title);
        setContent(note.content || '');
        setCategoryId((note as any).categoryId);
        setSelectedCategory((note as any).category || null);
        setPriority(note.priority);
        setImageUrl((note as any).imageUrl || '');
        setVideoUrl((note as any).videoUrl || '');
        setYoutubeUrl((note as any).youtubeUrl || '');
        setReminderAt((note as any).reminderAt ? new Date((note as any).reminderAt).toISOString().slice(0, 16) : '');
      } else {
        setTitle('');
        setContent('');
        setCategoryId(undefined);
        setSelectedCategory(null);
        setPriority('medium');
        setImageUrl('');
        setVideoUrl('');
        setYoutubeUrl('');
        setReminderAt('');
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show, note]);

  // Search categories function
  const searchCategoriesFunc = useCallback(async (query: string) => {
    const targetUserId = userId || (note?.user as any)?.id;
    if (!query.trim() || !targetUserId) {
      setCategorySearchResults([]);
      setIsSearchingCategories(false);
      return;
    }

    setIsSearchingCategories(true);
    try {
      const response: any = await adminService.searchCategories(query, targetUserId, 4);
      setCategorySearchResults(response.categories || []);
    } catch (error) {
      console.error('Search categories error:', error);
      setCategorySearchResults([]);
    } finally {
      setIsSearchingCategories(false);
    }
  }, [userId, note]);

  // Debounce search effect
  useEffect(() => {
    if (categoryDebounceTimerRef.current) {
      clearTimeout(categoryDebounceTimerRef.current);
    }

    categoryDebounceTimerRef.current = setTimeout(() => {
      searchCategoriesFunc(categorySearchTerm);
    }, 300);

    return () => {
      if (categoryDebounceTimerRef.current) {
        clearTimeout(categoryDebounceTimerRef.current);
      }
    };
  }, [categorySearchTerm, searchCategoriesFunc]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (showCategoryDropdown && categorySearchInputRef.current) {
      setTimeout(() => {
        categorySearchInputRef.current?.focus();
      }, 100);
    }
  }, [showCategoryDropdown]);

  // Close category dropdown and reset search
  const handleCloseCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(false);
    setCategorySearchTerm('');
    setCategorySearchResults([]);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-dropdown-container')) {
        handleCloseCategoryDropdown();
      }
    };
    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCategoryDropdown, handleCloseCategoryDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t('form.title.label'));
      return;
    }

    try {
      setLoading(true);
      
      const data: any = {
        title: title.trim(),
        content: content.trim() || undefined,
        categoryId: categoryId || undefined,
        priority,
        imageUrl: imageUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : undefined,
      };

      if (note) {
        // Update existing note - giữ nguyên folderId hiện tại của note
        // hoặc sử dụng folderId prop nếu được truyền vào
        const noteFolderId = (note as any).folderId;
        data.folderId = folderId !== undefined ? folderId : (noteFolderId !== undefined ? noteFolderId : null);
        
        await adminService.updateUserNote(note.id, data);
        toast.success(t('toasts.updateSuccess'));
      } else {
        // Create new note - sử dụng folderId được truyền vào
        if (!userId) {
          toast.error(t('alerts.missingUserOrTitle'));
          return;
        }
        data.folderId = folderId !== undefined ? folderId : null;
        await adminService.createUserNote({ ...data, userId });
        toast.success(t('alerts.createSuccess'));
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(error.message || t('alerts.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 xl-down:p-3.5 md-down:p-3 sm-down:p-2.5 xs-down:p-2 z-[99999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md md-down:rounded-md max-w-2xl md-down:max-w-md xs-down:max-w-[95%] w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md-down:text-base sm-down:text-base font-medium text-gray-900 dark:text-gray-100">
              {note ? t('modal.editTitle') : t('create.title')}
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 md-down:p-0.5 disabled:opacity-50"
            >
              <svg className="w-6 h-6 md-down:w-5 md-down:h-5 sm-down:w-4 sm-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          <form onSubmit={handleSubmit} className="space-y-4 md-down:space-y-3.5 sm-down:space-y-3">
            {/* Title */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.title.label')} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('form.placeholders.title')}
                required
                className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm md-down:text-sm sm-down:text-xs"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.content.label')}
              </label>
              <RichTextEditor 
                editor={editor}
                placeholder={t('form.placeholders.content')}
                className="text-sm md-down:text-xs"
              />
            </div>

            {/* Category */}
            <div className="relative category-dropdown-container">
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.category.label')}
              </label>
              <button
                type="button"
                onClick={() => !loadingCategories && setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={loadingCategories}
                className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm md-down:text-sm sm-down:text-xs text-left flex items-center justify-between"
              >
                {loadingCategories ? (
                  <span>Loading...</span>
                ) : selectedCategory ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${selectedCategory.color}20` }}
                    >
                      {(() => {
                        const Icon = (LucideIcons as any)[selectedCategory.icon] || Tag;
                        return <Icon className="w-3 h-3" style={{ color: selectedCategory.color }} />;
                      })()}
                    </div>
                    <span style={{ color: selectedCategory.color }}>{selectedCategory.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-500">No category</span>
                )}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md shadow-lg overflow-hidden">
                  {/* Search Input */}
                  <div className="p-2 border-b border-gray-200 dark:border-neutral-600">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        ref={categorySearchInputRef}
                        type="text"
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        placeholder="Tìm kiếm danh mục..."
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-md text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {isSearchingCategories && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                      )}
                    </div>
                  </div>

                  {/* Categories List */}
                  <div className="max-h-[200px] overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId(undefined);
                        setSelectedCategory(null);
                        handleCloseCategoryDropdown();
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 text-sm transition-colors"
                    >
                      No category
                    </button>
                    {(categorySearchTerm ? categorySearchResults : categories).length > 0 ? (
                      (categorySearchTerm ? categorySearchResults : categories).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setCategoryId(cat.id);
                            setSelectedCategory(cat);
                            handleCloseCategoryDropdown();
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2 text-sm transition-colors"
                        >
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${cat.color}20` }}
                          >
                            {(() => {
                              const Icon = (LucideIcons as any)[cat.icon] || Tag;
                              return <Icon className="w-3 h-3" style={{ color: cat.color }} />;
                            })()}
                          </div>
                          <span style={{ color: cat.color }}>{cat.name}</span>
                        </button>
                      ))
                    ) : categorySearchTerm && !isSearchingCategories ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        Không tìm thấy danh mục
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* Media Section */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.media.fullLabel')}
              </label>
              <MediaTabs
                imageUrl={imageUrl}
                videoUrl={videoUrl}
                youtubeUrl={youtubeUrl}
                onImageChange={setImageUrl}
                onVideoChange={setVideoUrl}
                onYoutubeChange={setYoutubeUrl}
              />
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.reminder.label')}
              </label>
              <input
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm md-down:text-sm sm-down:text-xs"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.priority.label')}
              </label>
              <div className="flex gap-3 md-down:gap-2.5 sm-down:gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className={`flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 rounded-md transition-colors ${
                    priority === 'low'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-2 border-green-500'
                      : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border-2 border-transparent'
                  }`}
                >
                  {t('form.priority.low')}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('medium')}
                  className={`flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 rounded-md transition-colors ${
                    priority === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 border-2 border-yellow-500'
                      : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border-2 border-transparent'
                  }`}
                >
                  {t('form.priority.medium')}
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className={`flex-1 px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2.5 sm-down:py-1.5 rounded-md transition-colors ${
                    priority === 'high'
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border-2 border-red-500'
                      : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border-2 border-transparent'
                  }`}
                >
                  {t('form.priority.high')}
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex justify-end gap-3 sm-down:flex-col sm-down:gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 md-down:px-3 md-down:py-1.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm md-down:text-sm sm-down:text-xs"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 md-down:px-3 md-down:py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md-down:text-sm sm-down:text-xs"
            >
              {loading ? t('actions.updating') : note ? t('actions.update') : t('actions.createNew')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteFormModal;
