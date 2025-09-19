import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

const CreateNote: React.FC = () => {
  const { t } = useTranslation('notes');
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    content: '',
    imageUrl: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    reminderAt: ''
  });
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

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
        limit: 50,
        role: 'user' // Chỉ load user, không load admin
      });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

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
        category: formData.category || undefined,
        priority: formData.priority,
        reminderAt: formData.reminderAt || undefined,
      });

      toast.success(t('alerts.createSuccess'));
      navigate('/notes');
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('create.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('create.subtitle')}</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('create.selectUserLabel')}
            </label>
            <div className="space-y-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('create.searchUserPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
              
              {selectedUser && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedUser.avatar ? (
                        <img
                          src={selectedUser.avatar}
                          alt={selectedUser.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {selectedUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{selectedUser.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInputChange('userId', '')}
                      className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      Thay đổi
                    </button>
                  </div>
                </div>
              )}

              <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800">
                {loadingUsers ? (
                  <div className="flex items-center justify-center h-20">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {users.length > 0 ? (
                      users.map((user: User) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                            formData.userId === user.id.toString()
                              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                              : 'hover:bg-gray-50 dark:hover:bg-neutral-700'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {user.avatar ? (
                              <img
                                className="h-8 w-8 rounded-full object-cover"
                                src={user.avatar}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-3 text-left">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {t('create.noUsers')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Note Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('form.title.label')}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              placeholder={t('form.placeholders.title')}
            />
          </div>

          {/* Note Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('form.content.label')}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              placeholder={t('form.placeholders.content')}
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.category.label')}
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                placeholder={t('form.placeholders.category')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.priority.label')}
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              >
                <option value="low">{t('constants.priority.low')}</option>
                <option value="medium">{t('constants.priority.medium')}</option>
                <option value="high">{t('constants.priority.high')}</option>
              </select>
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('form.imageUrl.label')}
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              placeholder={t('form.placeholders.imageUrl')}
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="max-w-xs h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('form.reminder.label')}
            </label>
            <input
              type="datetime-local"
              value={formData.reminderAt}
              onChange={(e) => handleInputChange('reminderAt', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/notes')}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.userId || !formData.title}
              className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('actions.creating')}
                </div>
              ) : (
                t('actions.createNew')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNote;
