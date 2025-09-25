import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminsList } from './hooks/useAdminsList';
import { useAdminActions } from './hooks/useAdminActions';
import { useAdminSocket } from './hooks/useAdminSocket';
import { isSuperAdmin } from '@utils/auth';
import type { Admin } from './interfaces/admin.types';
import AdminCard from './components/AdminCard';
import FilterBar from './components/FilterBar';
import CreateAdminModal from './components/CreateAdminModal';
import EditAdminModal from './components/EditAdminModal';
import AdminProfileModal from './components/AdminProfileModal';
import Pagination from './components/Pagination';

const AdminsList: React.FC = () => {
  const { t } = useTranslation('admins');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [profileAdmin, setProfileAdmin] = useState<Admin | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'toggle' | 'delete' | 'revoke';
    adminId: number;
    adminName: string;
    permission?: string;
  } | null>(null);

  const {
    admins,
    loading,
    currentAdmin,
    pagination,
    availablePermissions,
    searchText,
    adminLevelFilter,
    setSearchText,
    setAdminLevelFilter,
    fetchAdmins,
    refreshList,
  } = useAdminsList();

  // Sử dụng socket để listen real-time events
  useAdminSocket({
    onAdminListChange: refreshList,
    currentAdminId: currentAdmin?.id,
  });

  const {
    creating,
    updating,
    createAdmin,
    updateAdminPermissions,
    revokeAdminPermission,
    toggleAdminStatus,
    deleteAdmin,
  } = useAdminActions();

  const handleCreateAdmin = async (data: any) => {
    const success = await createAdmin(data);
    if (success) {
      setCreateModalOpen(false);
      refreshList();
    }
    return success;
  };

  const handleEditAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setEditModalOpen(true);
  };

  const handleUpdateAdmin = async (adminId: number, data: any) => {
    const success = await updateAdminPermissions(adminId, data);
    if (success) {
      setEditModalOpen(false);
      setSelectedAdmin(null);
      refreshList();
    }
    return success;
  };

  const handleToggleStatus = async (adminId: number) => {
    const success = await toggleAdminStatus(adminId);
    if (success) {
      refreshList();
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    const success = await deleteAdmin(adminId);
    if (success) {
      refreshList();
    }
  };

  const handleRevokePermission = async (adminId: number, permission: string) => {
    const success = await revokeAdminPermission(adminId, permission);
    if (success) {
      refreshList();
    }
  };

  const handleViewProfile = (admin: Admin) => {
    setProfileAdmin(admin);
    setProfileModalOpen(true);
  };

  const handleProfileUpdate = () => {
    refreshList();
  };

  const showConfirmDialog = (type: 'toggle' | 'delete', adminId: number, adminName: string) => {
    setConfirmAction({ type, adminId, adminName });
  };

  const showRevokeConfirmDialog = (adminId: number, adminName: string, permission: string) => {
    setConfirmAction({ type: 'revoke', adminId, adminName, permission });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    
    if (confirmAction.type === 'toggle') {
      await handleToggleStatus(confirmAction.adminId);
    } else if (confirmAction.type === 'delete') {
      await handleDeleteAdmin(confirmAction.adminId);
    } else if (confirmAction.type === 'revoke' && confirmAction.permission) {
      await handleRevokePermission(confirmAction.adminId, confirmAction.permission);
    }
    
    setConfirmAction(null);
  };

  const handlePageChange = (page: number, size?: number) => {
    fetchAdmins(page, size);
  };

  return (
    <div className="p-6 xl-down:p-4 md-down:p-3 sm-down:p-2 min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl xl-down:max-w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 xl-down:mb-4 sm-down:mb-3 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
            <p className="text-sm xl-down:text-sm sm-down:text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('subtitle')}
            </p>
          </div>
          {isSuperAdmin() && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm-down:text-xs"
            >
              <svg className="w-5 h-5 sm-down:w-4 sm-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="sm-down:hidden">{t('addAdmin')}</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchText={searchText}
          adminLevelFilter={adminLevelFilter}
          onSearchChange={setSearchText}
          onLevelFilterChange={setAdminLevelFilter}
          onRefresh={refreshList}
          loading={loading}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loading')}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && admins.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-3-3v0a3 3 0 00-3 3v2zM9 12a4 4 0 100-8 4 4 0 000 8zM11 14a6 6 0 016 6H5a6 6 0 016-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('noAdminsFound')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('createNewAdmin')}
            </p>
          </div>
        )}

        {/* Admins Grid */}
        {!loading && admins.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl-down:gap-3 sm-down:gap-2 p-4 xl-down:p-3 sm-down:p-2">
              {admins.map((admin) => (
                <AdminCard
                  key={admin.id}
                  admin={admin}
                  currentAdmin={currentAdmin}
                  onEdit={handleEditAdmin}
                  onToggleStatus={(adminId) => showConfirmDialog('toggle', adminId, admin.name)}
                  onDelete={(adminId) => showConfirmDialog('delete', adminId, admin.name)}
                  onRevokePermission={(adminId, permission) => showRevokeConfirmDialog(adminId, admin.name, permission)}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Create Admin Modal */}
        <CreateAdminModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateAdmin}
          availablePermissions={availablePermissions}
          loading={creating}
        />

        {/* Edit Admin Modal */}
        <EditAdminModal
          isOpen={editModalOpen}
          admin={selectedAdmin}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedAdmin(null);
          }}
          onSubmit={handleUpdateAdmin}
          availablePermissions={availablePermissions}
          loading={updating}
        />

        {/* Confirmation Dialog */}
        {confirmAction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-200 dark:border-neutral-700">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {confirmAction.type === 'toggle' ? t('confirmDialog.changeStatus') : 
                       confirmAction.type === 'delete' ? t('confirmDialog.confirmDelete') :
                       t('confirmRevokePermission')}
                    </h3>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {confirmAction.type === 'toggle'
                      ? t('confirmDialog.changeStatusMessage', { name: confirmAction.adminName })
                      : confirmAction.type === 'delete'
                      ? t('confirmDialog.deleteMessage', { name: confirmAction.adminName })
                      : t('revokePermissionMessage', { 
                          name: confirmAction.adminName, 
                          permission: t(`permissions.${confirmAction.permission}.label`, { defaultValue: confirmAction.permission }) 
                        })
                    }
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700"
                  >
                    {t('confirmDialog.cancel')}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                      confirmAction.type === 'delete'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {t('confirmDialog.confirm')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Profile Modal */}
        <AdminProfileModal
          isOpen={profileModalOpen}
          admin={profileAdmin}
          onClose={() => {
            setProfileModalOpen(false);
            setProfileAdmin(null);
          }}
          onUpdate={handleProfileUpdate}
        />
      </div>
    </div>
  );
};

export default AdminsList;
