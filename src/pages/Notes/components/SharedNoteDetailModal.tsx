import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';
import { getYouTubeEmbedUrl } from '@utils/youtube';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
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
  createdAt: string;
  updatedAt: string;
  user: User;
}

interface SharedNote {
  id: number;
  noteId: number;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  message?: string;
  sharedAt: string;
  isActive: boolean;
  note: Note;
  sharedWithUser?: User; // Optional for group shares
  sharedByUser: User;
  group?: Group; // For group shares
  shareType: 'individual' | 'group';
}

interface Group {
  id: number;
  name: string;
  avatar?: string;
}

interface SharedNoteDetailModalProps {
  sharedNote: SharedNote | null;
  show: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
  onUpdate?: () => void;
}

const SharedNoteDetailModal: React.FC<SharedNoteDetailModalProps> = ({
  sharedNote,
  show,
  onClose,
  onDelete,
  onUpdate
}) => {
  const { t } = useTranslation('notes');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'low': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t('constants.priority.high');
      case 'medium': return t('constants.priority.medium');
      case 'low': return t('constants.priority.low');
      default: return priority;
    }
  };

  // Local editable state (init with safe defaults; sync by effect below)
  const [form, setForm] = useState<{ canCreate?: boolean; canEdit?: boolean; canDelete?: boolean; message?: string }>(() => ({
    canCreate: false,
    canEdit: false,
    canDelete: false,
    message: '',
  }));

  // Permission check is static per admin session
  const canEditShare = useMemo(() => hasPermission('manage_notes.shared.edit'), []);
  const canDeleteShare = useMemo(() => hasPermission('manage_notes.shared.delete'), []);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Sync form when a new sharedNote is opened
  React.useEffect(() => {
    if (sharedNote) {
      setForm({
        canCreate: sharedNote.canCreate ?? false,
        canEdit: sharedNote.canEdit ?? false,
        canDelete: sharedNote.canDelete ?? false,
        message: sharedNote.message ?? '',
      });
      setEditing(false);
    }
  }, [sharedNote]);

  // Guard render AFTER hooks to keep hook order consistent
  if (!show || !sharedNote) return null;

  const handleSave = async () => {
    if (!sharedNote) return;
    
    try {
      setSaving(true);
      const payload: any = { message: form.message };
      if (sharedNote.shareType === 'individual') {
        payload.canCreate = !!form.canCreate;
        payload.canEdit = !!form.canEdit;
        payload.canDelete = !!form.canDelete;
      }
      await adminService.updateSharedNote(sharedNote.id, payload);
      
      // Update the sharedNote prop locally to reflect changes immediately
      Object.assign(sharedNote, {
        canCreate: form.canCreate,
        canEdit: form.canEdit,
        canDelete: form.canDelete,
        message: form.message,
      });
      
      toast.success(t('toasts.updateSuccess'));
      setEditing(false);
      // Trigger refresh in parent component
      if (onUpdate) {
        onUpdate();
      }
    } catch (e: any) {
      toast.error(t('toasts.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditing = () => {
    // revert form to current sharedNote values
    setForm({
      canCreate: sharedNote.canCreate ?? false,
      canEdit: sharedNote.canEdit ?? false,
      canDelete: sharedNote.canDelete ?? false,
      message: sharedNote.message ?? '',
    });
    setEditing(false);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 xl-down:p-3 sm-down:p-2 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md max-w-4xl xl-down:max-w-3xl md-down:max-w-2xl sm-down:max-w-sm w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="p-6 xl-down:p-4 sm-down:p-3">
          <style>
            {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
          </style>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 xl-down:mb-4">
            <h3 className="text-xl xl-down:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('sharedNotes.detail.title')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl-down:gap-4">
            {/* Note Information */}
            <div className="space-y-4 xl-down:space-y-3">
              <div>
                <h4 className="text-lg xl-down:text-base font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2">
                  {t('sharedNotes.detail.noteInfo', { defaultValue: 'Thông tin ghi chú' })}
                </h4>
                
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 space-y-3 xl-down:space-y-2">
                  <div>
                    <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('form.title.label', { defaultValue: 'Tiêu đề' })}
                    </label>
                    <p className="text-sm xl-down:text-xs text-gray-900 dark:text-gray-100">
                      {sharedNote.note.title}
                    </p>
                  </div>

                  {sharedNote.note.content && (
                    <div>
                      <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('form.content.label', { defaultValue: 'Nội dung' })}
                      </label>
                      <div className="text-sm xl-down:text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {sharedNote.note.content}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 xl-down:gap-2">
                    {sharedNote.note.category && (
                      <div>
                        <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('form.category.label', { defaultValue: 'Danh mục' })}
                        </label>
                        <p className="text-sm xl-down:text-xs text-gray-900 dark:text-gray-100">
                          {sharedNote.note.category}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('form.priority.label', { defaultValue: 'Mức độ ưu tiên' })}
                      </label>
                      <span className={`inline-flex px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full ${getPriorityColor(sharedNote.note.priority)}`}>
                        {getPriorityText(sharedNote.note.priority)}
                      </span>
                    </div>
                  </div>

                  {sharedNote.note.videoUrl && (
                    <div>
                      <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
                        {t('form.videoUrl.label', { defaultValue: 'Video' })}
                      </label>
                      <video
                        controls
                        preload="metadata"
                        src={sharedNote.note.videoUrl}
                        className="max-w-full h-48 xl-down:h-40 rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {sharedNote.note.imageUrl && !sharedNote.note.videoUrl && (
                    <div>
                      <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
                        {t('form.imageUrl.label', { defaultValue: 'Hình ảnh' })}
                      </label>
                      <img
                        src={sharedNote.note.imageUrl}
                        alt="Note attachment"
                        className="max-w-full h-48 xl-down:h-40 object-cover rounded-md border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {sharedNote.note.youtubeUrl && (() => {
                    const embed = getYouTubeEmbedUrl(String(sharedNote.note.youtubeUrl));
                    return embed ? (
                      <div>
                        <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
                          {t('form.youtubeUrl.label', { defaultValue: 'YouTube' })}
                        </label>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            src={embed}
                            title={sharedNote.note.title}
                            className="absolute top-0 left-0 w-full h-full rounded-md border"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
                          {t('form.youtubeUrl.label', { defaultValue: 'YouTube' })}
                        </label>
                        <a href={String(sharedNote.note.youtubeUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {t('actions.open', { defaultValue: 'Mở trên YouTube' })}
                        </a>
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-2 gap-3 xl-down:gap-2 text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="font-medium">
                        {t('table.createdAt', { defaultValue: 'Ngày tạo' })}:
                      </span>
                      <br />
                      {formatDate(sharedNote.note.createdAt)}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t('sharedNotes.table.sharedAt', { defaultValue: 'Ngày chia sẻ' })}:
                      </span>
                      <br />
                      {formatDate(sharedNote.sharedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Owner */}
              <div>
                <h5 className="text-base xl-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">
                  {t('sharedNotes.detail.noteOwner', { defaultValue: 'Chủ sở hữu ghi chú' })}
                </h5>
                <div className="flex items-center p-3 xl-down:p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md">
                  <div className="flex-shrink-0 h-10 w-10 xl-down:h-8 xl-down:w-8">
                    {sharedNote.note.user.avatar ? (
                      <img
                        className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                        src={sharedNote.note.user.avatar}
                        alt={sharedNote.note.user.name}
                      />
                    ) : (
                      <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm xl-down:text-xs font-medium">
                          {sharedNote.note.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-3 xl-down:ml-2">
                    <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                      {sharedNote.note.user.name}
                    </div>
                    <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
                      {sharedNote.note.user.email}
                    </div>
                    <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-500">
                      ID: {sharedNote.note.user.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sharing Information */}
            <div className="space-y-4 xl-down:space-y-3">
              <div>
                <h4 className="text-lg xl-down:text-base font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2">
                  {t('sharedNotes.detail.sharingInfo', { defaultValue: 'Thông tin chia sẻ' })}
                </h4>

                {/* Shared By */}
                <div className="mb-4 xl-down:mb-3">
                  <h5 className="text-base xl-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">
                    {t('sharedNotes.table.sharedBy', { defaultValue: 'Chia sẻ bởi' })}
                  </h5>
                  <div className="flex items-center p-3 xl-down:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg xl-down:rounded-md">
                    <div className="flex-shrink-0 h-10 w-10 xl-down:h-8 xl-down:w-8">
                      {sharedNote.sharedByUser.avatar ? (
                        <img
                          className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                          src={sharedNote.sharedByUser.avatar}
                          alt={sharedNote.sharedByUser.name}
                        />
                      ) : (
                        <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm xl-down:text-xs font-medium">
                            {sharedNote.sharedByUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3 xl-down:ml-2">
                      <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                        {sharedNote.sharedByUser.name}
                      </div>
                      <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
                        {sharedNote.sharedByUser.email}
                      </div>
                      <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-500">
                        ID: {sharedNote.sharedByUser.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shared With */}
                <div className="mb-4 xl-down:mb-3">
                  <h5 className="text-base xl-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">
                    {t('sharedNotes.table.sharedWith', { defaultValue: 'Chia sẻ cho' })}
                  </h5>
                  {sharedNote.shareType === 'group' && sharedNote.group ? (
                    <div className="flex items-center p-3 xl-down:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg xl-down:rounded-md">
                      <div className="flex-shrink-0 h-10 w-10 xl-down:h-8 xl-down:w-8">
                        {sharedNote.group.avatar ? (
                          <img
                            className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                            src={sharedNote.group.avatar}
                            alt={sharedNote.group.name}
                          />
                        ) : (
                          <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm xl-down:text-xs font-medium">
                              {sharedNote.group.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 xl-down:ml-2">
                        <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">[Group]</span>
                          {sharedNote.group.name}
                        </div>
                        <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-500">
                          Group ID: {sharedNote.group.id}
                        </div>
                      </div>
                    </div>
                  ) : sharedNote.sharedWithUser ? (
                    <div className="flex items-center p-3 xl-down:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg xl-down:rounded-md">
                      <div className="flex-shrink-0 h-10 w-10 xl-down:h-8 xl-down:w-8">
                        {sharedNote.sharedWithUser.avatar ? (
                          <img
                            className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                            src={sharedNote.sharedWithUser.avatar}
                            alt={sharedNote.sharedWithUser.name}
                          />
                        ) : (
                          <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm xl-down:text-xs font-medium">
                              {sharedNote.sharedWithUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3 xl-down:ml-2">
                        <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
                          {sharedNote.sharedWithUser.name}
                        </div>
                        <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
                          {sharedNote.sharedWithUser.email}
                        </div>
                        <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-500">
                          ID: {sharedNote.sharedWithUser.id}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 xl-down:p-2 bg-gray-50 dark:bg-gray-800 rounded-lg xl-down:rounded-md">
                      <p className="text-sm text-gray-500">Unknown recipient</p>
                    </div>
                  )}
                </div>

                {/* Permissions */}
                <div className="mb-4 xl-down:mb-3">
                  <h5 className="text-base xl-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">
                    {t('sharedNotes.table.permissions', { defaultValue: 'Quyền hạn' })}
                  </h5>
                  {canEditShare && sharedNote.shareType === 'individual' && editing ? (
                    <div className="flex flex-wrap items-center gap-4 xl-down:gap-3">
                      <label className="inline-flex items-center gap-2 text-sm xl-down:text-xs text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={!!form.canCreate}
                          onChange={(e) => setForm((s) => ({ ...s, canCreate: e.target.checked }))}
                          className="rounded border-gray-300 dark:border-neutral-600"
                        />
                        {t('sharedNotes.permissions.create', { defaultValue: 'Tạo' })}
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm xl-down:text-xs text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={!!form.canEdit}
                          onChange={(e) => setForm((s) => ({ ...s, canEdit: e.target.checked }))}
                          className="rounded border-gray-300 dark:border-neutral-600"
                        />
                        {t('sharedNotes.permissions.edit', { defaultValue: 'Sửa' })}
                      </label>
                      <label className="inline-flex items-center gap-2 text-sm xl-down:text-xs text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={!!form.canDelete}
                          onChange={(e) => setForm((s) => ({ ...s, canDelete: e.target.checked }))}
                          className="rounded border-gray-300 dark:border-neutral-600"
                        />
                        {t('sharedNotes.permissions.delete', { defaultValue: 'Xóa' })}
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 xl-down:gap-1">
                      {sharedNote.shareType === 'group' ? (
                        <span className="px-3 py-1 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {t('sharedNotes.permissions.groupShare', { defaultValue: 'Group Share' })}
                        </span>
                      ) : (
                        <>
                          <span className="px-3 py-1 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                            {t('sharedNotes.permissions.view', { defaultValue: 'Xem' })}
                          </span>
                          {sharedNote.canCreate && (
                            <span className="px-3 py-1 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {t('sharedNotes.permissions.create', { defaultValue: 'Tạo' })}
                            </span>
                          )}
                          {sharedNote.canEdit && (
                            <span className="px-3 py-1 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              {t('sharedNotes.permissions.edit', { defaultValue: 'Sửa' })}
                            </span>
                          )}
                          {sharedNote.canDelete && (
                            <span className="px-3 py-1 xl-down:px-2 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                              {t('sharedNotes.permissions.delete', { defaultValue: 'Xóa' })}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Sharing Message */}
                <div>
                  <h5 className="text-base xl-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">
                    {t('sharedNotes.detail.message', { defaultValue: 'Tin nhắn chia sẻ' })}
                  </h5>
                  {canEditShare && editing ? (
                    <textarea
                      value={form.message || ''}
                      onChange={(e) => setForm((s) => ({ ...s, message: e.target.value }))}
                      placeholder={t('sharedNotes.detail.message', { defaultValue: 'Tin nhắn chia sẻ' }) as string}
                      className="w-full p-3 xl-down:p-2 text-sm xl-down:text-xs bg-gray-50 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md text-gray-900 dark:text-gray-100"
                      rows={4}
                    />
                  ) : (
                    sharedNote.message ? (
                      <div className="p-3 xl-down:p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md">
                        <p className="text-sm xl-down:text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {sharedNote.message}
                        </p>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">—</div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 xl-down:gap-2 pt-6 xl-down:pt-4 mt-6 xl-down:mt-4 border-t border-gray-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm xl-down:text-xs"
            >
              {t('actions.close', { defaultValue: 'Đóng' })}
            </button>
            {canEditShare && (
              editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-60 text-sm xl-down:text-xs"
                  >
                    {saving ? t('actions.updating', { defaultValue: 'Đang cập nhật...' }) : t('actions.update', { defaultValue: 'Cập nhật' })}
                  </button>
                  <button
                    onClick={handleCancelEditing}
                    disabled={saving}
                    className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm xl-down:text-xs"
                  >
                    {t('actions.cancel', { defaultValue: 'Hủy' })}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-sm xl-down:text-xs"
                >
                  {t('actions.edit', { defaultValue: 'Chỉnh sửa' })}
                </button>
              )
            )}
            {canDeleteShare && (
              <button
                onClick={() => onDelete(sharedNote.id)}
                className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-red-600 dark:bg-red-500 text-white rounded-md xl-down:rounded hover:bg-red-700 dark:hover:bg-red-600 text-sm xl-down:text-xs"
              >
                {t('actions.delete', { defaultValue: 'Xóa chia sẻ' })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SharedNoteDetailModal;
