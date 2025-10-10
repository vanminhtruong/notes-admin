import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, User } from 'lucide-react';
import adminService from '@services/adminService';
import { toast } from 'react-toastify';
import * as LucideIcons from 'lucide-react';
import Pagination from '@components/common/Pagination';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Popular icon names
const ICON_OPTIONS = [
  'Tag', 'Briefcase', 'Home', 'Heart', 'Star', 'Book', 'Coffee', 'Music',
  'ShoppingCart', 'Camera', 'Plane', 'Car', 'Bike', 'Utensils', 'Gamepad2',
  'Palette', 'Code', 'Database', 'Cpu', 'Zap', 'Shield', 'Award', 'Gift'
];

// Popular colors
const COLOR_OPTIONS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#F43F5E', '#8B5CF6', '#14B8A6', '#F59E0B'
];

interface UserItem {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation('common');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // User list state
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const response: any = await adminService.getAllUsers({
        page: currentPage,
        limit: 3,
        search: searchTerm
      });
      
      // API trả về response.data với totalPages trực tiếp
      const data = response.data || response;
      
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('categories.modal.create.errorLoadUsers'));
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentPage, searchTerm, t]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !name) {
      toast.error(t('categories.modal.create.errorNoUser'));
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createCategoryForUser({
        userId: selectedUser.id,
        name,
        color,
        icon
      });
      toast.success(t('categories.modal.create.success'));
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || t('categories.modal.create.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setName('');
    setColor(COLOR_OPTIONS[0]);
    setIcon(ICON_OPTIONS[0]);
    setSearchTerm('');
    setCurrentPage(1);
    setShowUserList(true);
    onClose();
  };

  if (!isOpen) return null;

  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Tag;

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t('categories.modal.create.title')}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Selected User Display */}
          {selectedUser && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.avatar ? (
                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    selectedUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUser(null);
                  setShowUserList(true);
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t('categories.modal.create.changeUser')}
              </button>
            </div>
          )}

          {/* User Selection */}
          {!selectedUser && showUserList && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('categories.modal.create.selectUser')} <span className="text-red-500">{t('categories.modal.create.required')}</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm"
                    placeholder={t('categories.modal.create.searchUser')}
                  />
                </div>
              </div>

              {isLoadingUsers ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 rounded-lg">
                  <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('categories.modal.create.noUsers')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowUserList(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isLoadingUsers && users.length > 0 && totalPages >= 2 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  showInfo={true}
                />
              )}
            </div>
          )}

          {/* Name */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('categories.modal.create.categoryName')} <span className="text-red-500">{t('categories.modal.create.required')}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                placeholder={t('categories.modal.create.categoryNamePlaceholder')}
              />
            </div>
          )}

          {/* Icon Selector */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categories.modal.create.icon')}
              </label>
              <div className="grid grid-cols-8 gap-2">
                {ICON_OPTIONS.map((iconName) => {
                  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Tag;
                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`p-2 rounded border-2 transition-colors ${
                        icon === iconName
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto" style={{ color }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {selectedUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('categories.modal.create.color')}
              </label>
              <div className="grid grid-cols-8 gap-2">
                {COLOR_OPTIONS.map((colorOption) => (
                  <button
                    key={colorOption}
                    type="button"
                    onClick={() => setColor(colorOption)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === colorOption
                        ? 'border-gray-900 dark:border-white scale-110'
                        : 'border-gray-300 dark:border-neutral-600'
                    }`}
                    style={{ backgroundColor: colorOption }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedUser && (
            <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t('categories.modal.create.preview')}</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <IconComponent className="w-5 h-5" style={{ color }} />
                </div>
                <span className="font-semibold" style={{ color }}>
                  {name || t('categories.modal.create.previewName')}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {t('categories.modal.create.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedUser}
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('categories.modal.create.submitting') : t('categories.modal.create.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateCategoryModal;
