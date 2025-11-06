import React from 'react';
import { Tag, Users, Edit, Trash2, Pin, PinOff } from 'lucide-react';
import Pagination from '@components/common/Pagination';
import { useTranslation } from 'react-i18next';
import MobileCard from '@components/common/MobileCard';

interface TagsTableProps {
  hook: any;
}

const TagsTable: React.FC<TagsTableProps> = ({ hook }) => {
  const { t } = useTranslation('notes');
  const { tags, loading, totalPages, currentPage, setCurrentPage, canEdit, canDelete, openEditModal, openDetailModal, handleDelete, handleTogglePin } = hook;

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm xl-down:text-xs">{t('tags.loading')}</p>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-12 xl-down:p-8 text-center">
        <Tag className="w-16 h-16 xl-down:w-12 xl-down:h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">
          {hook.searchTerm || hook.selectedUserId ? t('tags.empty.noResults') : t('tags.empty.noTags')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700">
      {/* Desktop/Tablet Table View */}
      <div className="overflow-x-auto md-down:hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('tags.table.tag')}
              </th>
              <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('tags.table.user')}
              </th>
              <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('tags.table.notesCount')}
              </th>
              <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('tags.table.pinned')}
              </th>
              <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider lg-down:hidden">
                {t('tags.table.createdAt')}
              </th>
              {(canEdit || canDelete) && (
                <th className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-right text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('tags.table.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
            {tags.map((tag: any) => (
              <tr key={tag.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                <td className="px-4 py-3 xl-down:px-3 xl-down:py-2">
                  <button
                    onClick={() => openDetailModal(tag)}
                    className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 py-1 rounded-md transition-colors"
                  >
                    <div
                      className="w-3 h-3 xl-down:w-2.5 xl-down:h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm xl-down:text-xs underline decoration-dotted">
                      {tag.name}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 xl-down:px-3 xl-down:py-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 text-gray-400" />
                    <div>
                      <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-white">
                        {tag.user.name}
                      </div>
                      <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">{tag.user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 xl-down:px-3 xl-down:py-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 xl-down:px-2 xl-down:py-0.5 rounded-full text-xs xl-down:text-2xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {tag.notesCount} {t('tags.notesCount.label')}
                  </span>
                </td>
                <td className="px-4 py-3 xl-down:px-3 xl-down:py-2">
                  {canEdit ? (
                    <button
                      onClick={() => handleTogglePin(tag)}
                      className={`p-2 xl-down:p-1.5 rounded-lg xl-down:rounded-md transition-colors ${tag.isPinned ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                      title={tag.isPinned ? t('tags.actions.unpinTooltip') : t('tags.actions.pinTooltip')}
                    >
                      {tag.isPinned ? (
                        <Pin className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
                      ) : (
                        <PinOff className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 text-xs xl-down:text-2xs">
                      {tag.isPinned ? (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Pin className="w-3.5 h-3.5" /> {t('tags.status.pinned') || 'Pinned'}
                        </span>
                      ) : (
                        <span className="text-gray-400">{t('tags.status.unpinned') || 'Not pinned'}</span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 lg-down:hidden">
                  {new Date(tag.createdAt).toLocaleDateString('vi-VN')}
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-4 py-3 xl-down:px-3 xl-down:py-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canEdit && (
                        <button
                          onClick={() => openEditModal(tag)}
                          className="p-2 xl-down:p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg xl-down:rounded-md transition-colors"
                          title={t('tags.actions.editTooltip')}
                        >
                          <Edit className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="p-2 xl-down:p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg xl-down:rounded-md transition-colors"
                          title={t('tags.actions.deleteTooltip')}
                        >
                          <Trash2 className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop/Tablet Pagination */}
      {totalPages > 1 && (
        <div className="-mx-4 xl-down:-mx-3 px-4 xl-down:px-3 md-down:hidden">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Mobile Card View */}
      <div className="hidden md-down:block">
        <div className="space-y-3 p-3">
          {tags.map((tag: any) => (
          <MobileCard
            key={tag.id}
            title={tag.name}
            subtitle={`${tag.user.name} (${tag.user.email})`}
            icon={
              <div className="w-10 h-10 xl-down:w-8 xl-down:h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${tag.color}20` }}>
                <div
                  className="w-6 h-6 xl-down:w-5 xl-down:h-5 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
              </div>
            }
            badges={
              <span className="inline-flex items-center px-2.5 py-0.5 xl-down:px-2 xl-down:py-0.5 rounded-full text-xs xl-down:text-2xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {tag.notesCount} {t('tags.notesCount.label')}
              </span>
            }
            metadata={[
              { 
                label: t('tags.table.createdAt'), 
                value: new Date(tag.createdAt).toLocaleDateString('vi-VN') 
              }
            ]}
            actions={
              (canEdit || canDelete) && (
                <>
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePin(tag);
                      }}
                      className={`p-2 xl-down:p-1.5 rounded-lg xl-down:rounded-md transition-colors ${tag.isPinned ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
                      title={tag.isPinned ? t('tags.actions.unpinTooltip') : t('tags.actions.pinTooltip')}
                    >
                      {tag.isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(tag);
                      }}
                      className="p-2 xl-down:p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg xl-down:rounded-md transition-colors"
                      title={t('tags.actions.editTooltip')}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tag.id);
                      }}
                      className="p-2 xl-down:p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg xl-down:rounded-md transition-colors"
                      title={t('tags.actions.deleteTooltip')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )
            }
            onClick={() => openDetailModal(tag)}
          />
          ))}
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="-mx-4 xl-down:-mx-3 px-4 xl-down:px-3">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsTable;
