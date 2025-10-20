import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Pagination from '@components/common/Pagination';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { hasPermission } from '@utils/auth';
import * as LucideIcons from 'lucide-react';
import { Tag } from 'lucide-react';
import RichTextEditor from '@components/RichTextEditor/RichTextEditor';
import { useRichTextEditor } from '@components/RichTextEditor/useRichTextEditor';

// MediaTabs Component
const MediaTabs = ({ formData, setFormData, t }: { formData: any; setFormData: (data: any) => void; t: any }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'youtube'>('image');

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-neutral-600 mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('image')}
          className={`px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs font-medium transition-colors ${
            activeTab === 'image'
              ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📷 {t('form.imageUrl.label')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs font-medium transition-colors ${
            activeTab === 'video'
              ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          🎬 {t('form.videoUrl.label') || 'Video'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('youtube')}
          className={`px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs font-medium transition-colors ${
            activeTab === 'youtube'
              ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          📺 {t('form.youtubeUrl.label') || 'YouTube'}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'image' && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const { uploadService } = await import('@services/uploadService');
                  const { url } = await uploadService.uploadImage(file);
                  setFormData({ ...formData, imageUrl: url, videoUrl: '', youtubeUrl: '' });
                } catch (error) {
                  console.error('Error uploading image:', error);
                  toast.error(t('alerts.uploadImageError'));
                }
              }}
              className="block w-full text-sm xl-down:text-xs text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.imageUrl && (
              <img src={formData.imageUrl} alt="preview" className="w-16 h-16 xl-down:w-12 xl-down:h-12 rounded-md object-cover border" />
            )}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const { uploadService } = await import('@services/uploadService');
                  const { url } = await uploadService.uploadFile(file);
                  setFormData({ ...formData, videoUrl: url, imageUrl: '', youtubeUrl: '' });
                } catch (error) {
                  console.error('Error uploading video:', error);
                  toast.error(t('alerts.uploadVideoError') || 'Tải video thất bại');
                }
              }}
              className="block w-full text-sm xl-down:text-xs text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
            {formData.videoUrl && (
              <video src={formData.videoUrl} className="w-16 h-16 xl-down:w-12 xl-down:h-12 rounded-md object-cover border" />
            )}
          </div>
        )}

        {activeTab === 'youtube' && (
          <input
            type="url"
            value={formData.youtubeUrl}
            onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value, imageUrl: '', videoUrl: '' })}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
            placeholder={t('form.placeholders.youtubeUrl') || 'Nhập URL video YouTube'}
          />
        )}
      </div>
    </div>
  );
};

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface CreateNoteModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateNoteModal: React.FC<CreateNoteModalProps> = ({ show, onClose, onSuccess }) => {
  if (!show) return null;
  const { t } = useTranslation('notes');
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    content: '',
    imageUrl: '',
    videoUrl: '',
    youtubeUrl: '',
    categoryId: null as number | null,
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminderAt: ''
  });

  // RichTextEditor instance
  const editor = useRichTextEditor({
    content: formData.content,
    placeholder: t('form.placeholders.content'),
    onUpdate: (html) => {
      setFormData(prev => ({ ...prev, content: html }));
    },
  });
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categorySearchResults, setCategorySearchResults] = useState<any[]>([]);
  const [isSearchingCategories, setIsSearchingCategories] = useState(false);
  const categorySearchInputRef = useRef<HTMLInputElement>(null);
  const categoryDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Pagination for users
  const [currentUserPage, setCurrentUserPage] = useState(1);
  const [totalUserPages, setTotalUserPages] = useState(1);
  const USERS_PER_PAGE = 3;

  // Check permission
  useEffect(() => {
    if (show && !hasPermission('manage_notes.create')) {
      toast.error('Bạn không có quyền tạo ghi chú');
      onClose();
      return;
    }
  }, [show, onClose]);

  useEffect(() => {
    if (show) {
      loadUsers();
    }
  }, [searchTerm, currentUserPage, show]);

  // Reset page khi search
  useEffect(() => {
    if (searchTerm) {
      setCurrentUserPage(1);
    }
  }, [searchTerm]);

  // Load categories when user is selected
  useEffect(() => {
    if (formData.userId) {
      loadCategories(parseInt(formData.userId));
    } else {
      setCategories([]);
      setSelectedCategory(null);
      setFormData(prev => ({ ...prev, categoryId: null }));
    }
  }, [formData.userId]);

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
  }, [showCategoryDropdown]);

  // Real-time feedback when note is created successfully
  useEffect(() => {
    const s = getAdminSocket();
    const handleNoteCreated = (data: any) => {
      console.log('Note created successfully:', data);
      // Optional: Show toast notification or update UI
    };
    
    s.on('note_created_by_admin', handleNoteCreated);
    
    return () => {
      try {
        s.off('note_created_by_admin', handleNoteCreated);
      } catch {}
    };
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminService.getAllUsers({
        search: searchTerm || undefined,
        page: currentUserPage,
        limit: USERS_PER_PAGE,
        role: 'user' // Chỉ load user, không load admin
      });
      
      console.log('Users response:', response);
      
      setUsers((response as any).users || []);
      
      // Lấy totalPages trực tiếp từ response hoặc tính từ totalUsers
      const totalPages = (response as any).totalPages || 1;
      const totalUsers = (response as any).totalUsers || 0;
      
      setTotalUserPages(totalPages);
      
      console.log('Total users:', totalUsers, 'Total pages:', totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadCategories = async (userId: number) => {
    try {
      setLoadingCategories(true);
      const response: any = await adminService.getAllCategories({ userId, limit: 100 });
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Search categories function
  const searchCategoriesFunc = useCallback(async (query: string) => {
    if (!query.trim() || !formData.userId) {
      setCategorySearchResults([]);
      setIsSearchingCategories(false);
      return;
    }

    setIsSearchingCategories(true);
    try {
      const response: any = await adminService.searchCategories(query, parseInt(formData.userId), 4);
      setCategorySearchResults(response.categories || []);
    } catch (error) {
      console.error('Search categories error:', error);
      setCategorySearchResults([]);
    } finally {
      setIsSearchingCategories(false);
    }
  }, [formData.userId]);

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

  // Reset category search when closing dropdown
  const handleCloseCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(false);
    setCategorySearchTerm('');
    setCategorySearchResults([]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.title) {
      toast.warning(t('alerts.missingUserOrTitle'));
      return;
    }

    try {
      setLoading(true);
      await adminService.createNoteForUser({
        userId: parseInt(formData.userId),
        title: formData.title,
        content: formData.content || undefined,
        imageUrl: formData.imageUrl || undefined,
        videoUrl: formData.videoUrl || undefined,
        youtubeUrl: formData.youtubeUrl || undefined,
        categoryId: formData.categoryId || undefined,
        priority: formData.priority,
        reminderAt: formData.reminderAt || undefined,
      } as any);

      toast.success(t('alerts.createSuccess'));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error(t('alerts.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUserSelect = (user: User) => {
    handleInputChange('userId', user.id.toString());
  };

  const selectedUser = users.find(user => user.id.toString() === formData.userId);

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 xl-down:p-3 sm-down:p-2 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md max-w-2xl xl-down:max-w-xl md-down:max-w-lg sm-down:max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xl-down:p-3 sm-down:p-2 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('create.title')}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 xl-down:p-4 sm-down:p-3 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
          {/* User Selection */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('create.selectUserLabel')}
            </label>
            <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('create.searchUserPlaceholder')}
                className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
              />
              
              {selectedUser && (
                <div className="p-4 xl-down:p-3 sm-down:p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg xl-down:rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 xl-down:space-x-2">
                      {selectedUser.avatar ? (
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-7 sm-down:h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-7 sm-down:h-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm xl-down:text-xs">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs">{selectedUser.name}</p>
                        <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('userId', '')}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm xl-down:text-xs"
                    >
                      {t('create.changeUser')}
                    </button>
                  </div>
                </div>
              )}

              {/* Users List */}
              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : users.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {users.map((user: User) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className={`w-full flex items-center p-3 xl-down:p-2 sm-down:p-2 rounded-lg xl-down:rounded-md transition-colors border ${
                          formData.userId === user.id.toString()
                            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700'
                            : 'border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm xl-down:text-xs font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 xl-down:ml-2 text-left flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs">{user.name}</p>
                          <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  {totalUserPages > 1 && (
                    <div className="mt-4">
                      <Pagination
                        currentPage={currentUserPage}
                        totalPages={totalUserPages}
                        onPageChange={setCurrentUserPage}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">
                  {t('create.noUsers')}
                </p>
              )}
            </div>
          </div>

          {/* Note Title */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('form.title.label')}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
              placeholder={t('form.placeholders.title')}
            />
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('form.content.label')}
            </label>
            <RichTextEditor 
              editor={editor}
              placeholder={t('form.placeholders.content')}
              className="text-sm xl-down:text-xs"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
            <div className="relative category-dropdown-container">
              <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
                {t('form.category.label')}
              </label>
              <button
                type="button"
                onClick={() => formData.userId && !loadingCategories && setShowCategoryDropdown(!showCategoryDropdown)}
                disabled={!formData.userId || loadingCategories}
                className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs text-left flex items-center justify-between"
              >
                {!formData.userId ? (
                  <span className="text-gray-500">Select user first</span>
                ) : loadingCategories ? (
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
                <div className="absolute z-50 w-full bottom-full mb-1 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg shadow-lg overflow-hidden">
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
                        className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        setSelectedCategory(null);
                        setFormData({ ...formData, categoryId: null });
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
                            setSelectedCategory(cat);
                            setFormData({ ...formData, categoryId: cat.id });
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

            <div>
              <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
                {t('form.priority.label')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
              >
                <option value="low">{t('constants.priority.low')}</option>
                <option value="medium">{t('constants.priority.medium')}</option>
                <option value="high">{t('constants.priority.high')}</option>
              </select>
            </div>
          </div>

          {/* Media Section - Tabs */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('form.media.label') || 'Phương tiện'}
            </label>
            <MediaTabs formData={formData} setFormData={setFormData} t={t} />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('form.reminder.label')}
            </label>
            <input
              type="datetime-local"
              value={formData.reminderAt}
              onChange={(e) => handleInputChange('reminderAt', e.target.value)}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
            />
          </div>

          </form>
        </div>

        {/* Footer - Action Buttons */}
        <div className="flex justify-end gap-2 xl-down:gap-1.5 sm-down:gap-1 p-4 xl-down:p-3 sm-down:p-2 border-t border-gray-200 dark:border-neutral-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm xl-down:text-xs"
          >
            {t('actions.cancel')}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !formData.userId || !formData.title}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm xl-down:text-xs"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 xl-down:h-3.5 xl-down:w-3.5 border-b-2 border-white mr-2 xl-down:mr-1.5"></div>
                {t('actions.creating')}
              </div>
            ) : (
              t('actions.createNew')
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateNoteModal;
