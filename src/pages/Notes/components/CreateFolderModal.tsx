import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import Pagination from '@components/common/Pagination';
import { usePagination } from '@hooks/usePagination';
import {
  Folder, DollarSign, Book, GraduationCap, Pencil, Leaf,
  Code, Smile, Music, Popcorn, Wrench, Palette,
  Sprout, Flower, Camera, BarChart, Star, Dumbbell,
  ClipboardList, Scale, Search, Plane, Globe, Settings,
  Footprints, FlaskConical, Trophy, Heart, Coffee, Target
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface CreateFolderModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  { value: 'blue', label: 'Xanh dương', class: 'text-blue-500 border-blue-500' },
  { value: 'green', label: 'Xanh lá', class: 'text-green-500 border-green-500' },
  { value: 'orange', label: 'Cam', class: 'text-orange-500 border-orange-500' },
  { value: 'red', label: 'Đỏ', class: 'text-red-500 border-red-500' },
  { value: 'purple', label: 'Tím', class: 'text-purple-500 border-purple-500' },
  { value: 'pink', label: 'Hồng', class: 'text-pink-500 border-pink-500' },
  { value: 'gray', label: 'Xám', class: 'text-gray-500 border-gray-500' },
  { value: 'yellow', label: 'Vàng', class: 'text-yellow-500 border-yellow-500' }
];

const ICONS = [
  { name: 'folder', icon: Folder },
  { name: 'dollar', icon: DollarSign },
  { name: 'book', icon: Book },
  { name: 'graduation', icon: GraduationCap },
  { name: 'pencil', icon: Pencil },
  { name: 'leaf', icon: Leaf },
  { name: 'code', icon: Code },
  { name: 'smile', icon: Smile },
  { name: 'music', icon: Music },
  { name: 'popcorn', icon: Popcorn },
  { name: 'wrench', icon: Wrench },
  { name: 'palette', icon: Palette },
  { name: 'sprout', icon: Sprout },
  { name: 'flower', icon: Flower },
  { name: 'camera', icon: Camera },
  { name: 'chart', icon: BarChart },
  { name: 'star', icon: Star },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'clipboard', icon: ClipboardList },
  { name: 'scale', icon: Scale },
  { name: 'search', icon: Search },
  { name: 'plane', icon: Plane },
  { name: 'globe', icon: Globe },
  { name: 'settings', icon: Settings },
  { name: 'footprints', icon: Footprints },
  { name: 'flask', icon: FlaskConical },
  { name: 'trophy', icon: Trophy },
  { name: 'heart', icon: Heart },
  { name: 'coffee', icon: Coffee },
  { name: 'target', icon: Target },
];

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ show, onClose, onSuccess }) => {
  const { t } = useTranslation('notes');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedIcon, setSelectedIcon] = useState('folder');

  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
      loadAllUsers();
    } else {
      document.body.style.overflow = 'unset';
      // Reset form
      setSelectedUser(null);
      setSearchUserTerm('');
      setFolderName('');
      setSelectedColor(COLORS[0].value);
      setSelectedIcon('folder');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const response: any = await adminService.getAllUsers({
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      setAllUsers(response?.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
    user.id.toString().includes(searchUserTerm)
  );

  // Pagination for users (3 per page)
  const {
    currentItems: pagedUsers,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    resetPage
  } = usePagination<User>({ data: filteredUsers, itemsPerPage: 3 });

  // Reset to page 1 when search term changes
  useEffect(() => {
    resetPage();
  }, [searchUserTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error(t('create.selectUserLabel'));
      return;
    }

    if (!folderName.trim()) {
      toast.error(t('folders.form.name.label'));
      return;
    }

    try {
      setLoading(true);
      await adminService.createFolderForUser({
        userId: selectedUser.id,
        name: folderName.trim(),
        color: selectedColor,
        icon: selectedIcon || 'folder'
      });

      toast.success(t('folders.toasts.createSuccess'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast.error(error.message || t('folders.toasts.createError'));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 xl-down:p-3.5 md-down:p-3 sm-down:p-2.5 xs-down:p-2 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md md-down:rounded-md max-w-lg md-down:max-w-md xs-down:max-w-[95%] w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md-down:text-base sm-down:text-base font-medium text-gray-900 dark:text-gray-100">
              {t('folders.modal.create')}
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
            {/* User Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('folders.form.selectUserRequired')}
              </label>

              {selectedUser ? (
                <div className="flex items-center justify-between p-3 md-down:p-2.5 sm-down:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 md-down:h-9 md-down:w-9 sm-down:h-8 sm-down:w-8">
                      {selectedUser.avatar ? (
                        <img
                          className="h-10 w-10 md-down:h-9 md-down:w-9 sm-down:h-8 sm-down:w-8 rounded-full object-cover"
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm md-down:text-xs font-medium">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                        {selectedUser.name}
                      </div>
                      <div className="text-xs md-down:text-[11px] sm-down:text-[10px] text-gray-500 dark:text-gray-400">
                        {selectedUser.email} (ID: {selectedUser.id})
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-sm md-down:text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    {t('folders.form.changeUser')}
                  </button>
                </div>
              ) : (
                <div>
                  {/* Search box */}
                  <input
                    type="text"
                    placeholder={t('folders.form.searchUser')}
                    value={searchUserTerm}
                    onChange={(e) => setSearchUserTerm(e.target.value)}
                    className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 mb-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm md-down:text-sm sm-down:text-xs"
                  />
                  
                  {/* Users list - inline with pagination (3 items/page) */}
                  {loadingUsers ? (
                    <div className="flex items-center justify-center p-8">
                      <div className="animate-spin rounded-full h-6 w-6 md-down:h-5 md-down:w-5 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center p-4 text-gray-500 text-sm md-down:text-sm sm-down:text-xs">
                      {searchUserTerm ? t('folders.form.noUsersFound') : t('folders.form.noUsers')}
                    </div>
                  ) : (
                    <>
                      <div className="divide-y divide-gray-200 dark:divide-neutral-700 rounded-md border border-gray-200 dark:border-neutral-700 overflow-hidden">
                        {pagedUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchUserTerm('');
                            }}
                            className="w-full flex items-center p-3 md-down:p-2.5 sm-down:p-2 hover:bg-gray-50 dark:hover:bg-neutral-700 text-left transition-colors"
                          >
                            <div className="flex-shrink-0 h-10 w-10 md-down:h-9 md-down:w-9 sm-down:h-8 sm-down:w-8">
                              {user.avatar ? (
                                <img
                                  className="h-10 w-10 md-down:h-9 md-down:w-9 sm-down:h-8 sm-down:w-8 rounded-full object-cover"
                                  src={user.avatar}
                                  alt={user.name}
                                />
                              ) : (
                                <div className="h-10 w-10 md-down:h-9 md-down:w-9 sm-down:h-8 sm-down:w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm md-down:text-xs font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="text-sm md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                                {user.name}
                              </div>
                              <div className="text-xs md-down:text-[11px] sm-down:text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                {user.email}
                              </div>
                              <div className="text-xs md-down:text-[11px] sm-down:text-[10px] text-gray-400 dark:text-gray-500">
                                ID: {user.id}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-3">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages || 1}
                          onPageChange={goToPage}
                          totalItems={totalItems}
                          itemsPerPage={itemsPerPage}
                          showInfo={true}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Folder Name */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('folders.form.name.label')} *
              </label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder={t('folders.form.name.placeholder')}
                required
                className="w-full px-4 py-2 md-down:px-3.5 md-down:py-2 sm-down:px-3 sm-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm md-down:text-sm sm-down:text-xs"
              />
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('folders.form.color.label')}
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 md-down:w-9 md-down:h-9 sm-down:w-8 sm-down:h-8 rounded-full border-4 ${color.class} transition-all bg-white dark:bg-neutral-800 ${
                      selectedColor === color.value
                        ? 'ring-4 ring-blue-300 dark:ring-blue-600 ring-offset-2 dark:ring-offset-neutral-900 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm md-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('folders.form.icon.label')}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map((iconOption) => {
                  const IconComponent = iconOption.icon;
                  const selectedColorObj = COLORS.find(c => c.value === selectedColor);
                  return (
                    <button
                      key={iconOption.name}
                      type="button"
                      onClick={() => setSelectedIcon(iconOption.name)}
                      className={`w-12 h-12 md-down:w-11 md-down:h-11 sm-down:w-10 sm-down:h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                        selectedIcon === iconOption.name
                          ? `${selectedColorObj?.class} bg-gray-50 dark:bg-neutral-700/50 scale-110`
                          : 'border-gray-300 dark:border-neutral-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 hover:scale-105'
                      }`}
                    >
                      <IconComponent className="w-6 h-6 md-down:w-5 md-down:h-5 sm-down:w-4.5 sm-down:h-4.5" strokeWidth={2} />
                    </button>
                  );
                })}
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
              {loading ? t('folders.modal.creating') : t('folders.actions.create')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateFolderModal;
