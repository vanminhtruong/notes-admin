import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';
import { getAdminSocket } from '@services/socket';

interface User {
  id: number;
  name: string;
  email: string;
}

interface TagItem {
  id: number;
  name: string;
  color: string;
  userId: number;
  user: User;
  notesCount: number;
  createdAt: string;
  updatedAt: string;
}

interface TagFormData {
  userId: string;
  name: string;
  color: string;
}

export const useTagsManagement = () => {
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagItem | null>(null);
  const [formData, setFormData] = useState<TagFormData>({
    userId: '',
    name: '',
    color: '#3B82F6',
  });

  // Users list
  const [users, setUsers] = useState<User[]>([]);

  // Permissions
  const canView = hasPermission('manage_notes.tags.view');
  const canCreate = hasPermission('manage_notes.tags.create');
  const canEdit = hasPermission('manage_notes.tags.edit');
  const canDelete = hasPermission('manage_notes.tags.delete');

  // Fetch tags
  const fetchTags = async () => {
    if (!canView) return;
    
    try {
      setLoading(true);
      const response: any = await adminService.getAllTags({
        page: currentPage,
        limit: 5,
        search: searchTerm,
        userId: selectedUserId,
      });
      setTags(response.tags || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tải danh sách tags');
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response: any = await adminService.getAllUsers({ limit: 1000 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Create tag
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    try {
      await adminService.createTagForUser(formData);
      toast.success('Tạo tag thành công');
      setShowCreateModal(false);
      setFormData({ userId: '', name: '', color: '#3B82F6' });
      fetchTags();
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi tạo tag');
    }
  };

  // Update tag
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !editingTag) return;

    try {
      await adminService.updateTag(editingTag.id, {
        name: editingTag.name,
        color: editingTag.color,
      });
      toast.success('Cập nhật tag thành công');
      setShowEditModal(false);
      setEditingTag(null);
      fetchTags();
    } catch (error: any) {
      console.error('Error updating tag:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật tag');
    }
  };

  // Delete tag
  const handleDelete = async (tagId: number) => {
    if (!canDelete) return;
    if (!confirm('Bạn có chắc muốn xóa tag này? Tag sẽ bị xóa khỏi tất cả ghi chú.')) return;

    try {
      await adminService.deleteTag(tagId);
      toast.success('Xóa tag thành công');
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa tag');
    }
  };

  // Open modals
  const openCreateModal = () => setShowCreateModal(true);
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData({ userId: '', name: '', color: '#3B82F6' });
  };

  const openEditModal = (tag: TagItem) => {
    setEditingTag({ ...tag });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTag(null);
  };

  const openDetailModal = (tag: TagItem) => {
    setSelectedTag(tag);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedTag(null);
  };

  // Real-time updates
  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handleTagCreated = (data: { tag: TagItem }) => {
      setTags((prev) => [data.tag, ...prev]);
      setTotal((prev) => prev + 1);
    };

    const handleTagUpdated = (data: { tag: TagItem }) => {
      setTags((prev) => prev.map((tag) => (tag.id === data.tag.id ? data.tag : tag)));
    };

    const handleTagDeleted = (data: { id: number }) => {
      setTags((prev) => prev.filter((tag) => tag.id !== data.id));
      setTotal((prev) => prev - 1);
    };

    socket.on('admin_tag_created', handleTagCreated);
    socket.on('admin_tag_updated', handleTagUpdated);
    socket.on('admin_tag_deleted', handleTagDeleted);

    return () => {
      socket.off('admin_tag_created', handleTagCreated);
      socket.off('admin_tag_updated', handleTagUpdated);
      socket.off('admin_tag_deleted', handleTagDeleted);
    };
  }, []);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchTags();
  }, [currentPage, searchTerm, selectedUserId, canView]);

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    // Data
    tags,
    loading,
    searchTerm,
    selectedUserId,
    currentPage,
    totalPages,
    total,
    users,
    
    // Modal states
    showCreateModal,
    showEditModal,
    showDetailModal,
    editingTag,
    selectedTag,
    formData,
    
    // Setters
    setSearchTerm,
    setSelectedUserId,
    setCurrentPage,
    setFormData,
    setEditingTag,
    
    // Actions
    handleCreate,
    handleUpdate,
    handleDelete,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDetailModal,
    closeDetailModal,
    
    // Permissions
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};
