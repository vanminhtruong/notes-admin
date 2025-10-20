import React, { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Tag, X, Search, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '@components/RichTextEditor/RichTextEditor';
import { useRichTextEditor } from '@components/RichTextEditor/useRichTextEditor';
import { useEditNoteModalState } from '../hooks/Manager-useState/useEditNoteModalState';
import { useEditNoteModalEffects } from '../hooks/Manager-Effects/useEditNoteModalEffects';
import { useMediaUpload } from '../hooks/Manager-handle/useMediaUpload';
import type { EditNoteModalProps } from '../interface/types';

const EditNoteModal: React.FC<EditNoteModalProps> = ({ show, editingNote, setEditingNote, onClose, onSubmit }) => {
  if (!show || !editingNote) return null;

  const { t } = useTranslation('notes');
  
  // Use custom hooks for state
  const {
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
  } = useEditNoteModalState();
  
  // Use effects hook
  useEditNoteModalEffects({
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
  });

  // Close category dropdown and reset search
  const handleCloseCategoryDropdown = useCallback(() => {
    setShowCategoryDropdown(false);
    setCategorySearchTerm('');
    setCategorySearchResults([]);
  }, [setShowCategoryDropdown, setCategorySearchTerm, setCategorySearchResults]);

  const { handleImageUpload, handleVideoUpload, handleYoutubeUrlChange } = useMediaUpload({
    editingNote,
    setEditingNote,
    t,
  });

  // RichTextEditor instance
  const editor = useRichTextEditor({
    content: editingNote.content || '',
    placeholder: t('form.placeholders.content'),
    onUpdate: (html) => {
      setEditingNote({ ...editingNote, content: html });
    },
  });

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 xl-down:p-3 sm-down:p-2 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md max-w-2xl xl-down:max-w-xl md-down:max-w-lg sm-down:max-w-sm w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 xl-down:p-3 sm-down:p-2 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg xl-down:text-base sm-down:text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('modal.editTitle')}
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 xl-down:p-4 sm-down:p-3 overflow-y-auto flex-1">
          <style>
            {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
          </style>

          <form onSubmit={onSubmit} className="space-y-3 xl-down:space-y-2 sm-down:space-y-2">
            <div>
              <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
                {t('form.title.label')}
              </label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.content.label')}
              </label>
              <RichTextEditor 
                editor={editor}
                placeholder={t('form.placeholders.content')}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative category-dropdown-container">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.category.label')}
                </label>
                <button
                  type="button"
                  onClick={() => !loadingCategories && setShowCategoryDropdown(!showCategoryDropdown)}
                  disabled={loadingCategories}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-left flex items-center justify-between"
                >
                  {loadingCategories ? (
                    <span>Loading...</span>
                  ) : editingNote.category ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${editingNote.category.color}20` }}
                      >
                        {(() => {
                          const Icon = (LucideIcons as any)[editingNote.category.icon] || Tag;
                          return <Icon className="w-3 h-3" style={{ color: editingNote.category.color }} />;
                        })()}
                      </div>
                      <span style={{ color: editingNote.category.color }}>{editingNote.category.name}</span>
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
                          setEditingNote({ ...editingNote, categoryId: undefined, category: undefined });
                          handleCloseCategoryDropdown();
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-500 transition-colors"
                      >
                        No category
                      </button>
                      {(categorySearchTerm ? categorySearchResults : categories).length > 0 ? (
                        (categorySearchTerm ? categorySearchResults : categories).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setEditingNote({ ...editingNote, categoryId: cat.id, category: cat });
                              handleCloseCategoryDropdown();
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-neutral-700 flex items-center gap-2 transition-colors"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.priority.label')}
                </label>
                <select
                  value={editingNote.priority}
                  onChange={(e) => setEditingNote({ ...editingNote, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">{t('constants.priority.low')}</option>
                  <option value="medium">{t('constants.priority.medium')}</option>
                  <option value="high">{t('constants.priority.high')}</option>
                </select>
              </div>
            </div>

            {/* Media Upload - Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.media.label', { defaultValue: 'Media' })}
              </label>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-neutral-600 mb-3">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('image')}
                  className={`px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs font-medium transition-colors ${
                    activeMediaTab === 'image'
                      ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  📷 {t('form.imageUrl.label')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs font-medium transition-colors ${
                    activeMediaTab === 'video'
                      ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  🎬 {t('form.videoUrl.label', { defaultValue: 'Video' })}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('youtube')}
                  className={`px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-sm xl-down:text-xs font-medium transition-colors ${
                    activeMediaTab === 'youtube'
                      ? 'border-b-2 border-red-600 text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  📺 {t('form.youtubeUrl.label', { defaultValue: 'YouTube' })}
                </button>
              </div>

              {/* Tab Content */}
              <div>
                {activeMediaTab === 'image' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="flex-1 block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {editingNote.imageUrl && (
                      <img src={editingNote.imageUrl} alt="preview" className="w-12 h-12 rounded-md object-cover border" />
                    )}
                  </div>
                )}

                {activeMediaTab === 'video' && (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="flex-1 block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {editingNote.videoUrl && (
                      <video src={editingNote.videoUrl} preload="metadata" className="w-12 h-12 rounded-md object-cover border" />
                    )}
                  </div>
                )}

                {activeMediaTab === 'youtube' && (
                  <input
                    type="url"
                    value={editingNote.youtubeUrl || ''}
                    onChange={handleYoutubeUrlChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                )}
              </div>
            </div>

            {/* Reminder DateTime */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.reminder.label')}
              </label>
              <input
                type="datetime-local"
                value={editingNote.reminderAt ? new Date(editingNote.reminderAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingNote({ ...editingNote, reminderAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isArchived"
                checked={editingNote.isArchived}
                onChange={(e) => setEditingNote({ ...editingNote, isArchived: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 rounded"
              />
              <label htmlFor="isArchived" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('form.archive.label')}
              </label>
            </div>

          </form>
        </div>

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
            onClick={onSubmit}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-sm xl-down:text-xs"
          >
            {t('actions.update')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditNoteModal;
