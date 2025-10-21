import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminsList } from './hooks/useAdminsList';
import { useAdminActions } from './hooks/useAdminActions';
import { useAdminSocket } from './hooks/useAdminSocket';
import { useAdminsListState } from './hooks/Manager-useState/useAdminsListState';
import { useBodyScrollLock } from './hooks/Manager-Effects/useBodyScrollLock';
import { useAdminsListHandlers } from './hooks/Manager-handle/useAdminsListHandlers';
import { isSuperAdmin } from '@utils/auth';
import FilterBar from './components/FilterBar';
import CreateAdminModal from './components/CreateAdminModal';
import EditAdminModal from './components/EditAdminModal';
import AdminProfileModal from './components/AdminProfileModal';
import AdminsListHeader from './components/AdminsListHeader';
import AdminsContent from './components/AdminsContent';
import ConfirmationDialog from './components/ConfirmationDialog';

const AdminsList: React.FC = () => {
  const { t } = useTranslation('admins');

  // State management
  const adminState = useAdminsListState();

  // Disable body scroll when any modal or confirmation dialog is open
  const hasOpenModal = adminState.createModalOpen || adminState.editModalOpen || adminState.profileModalOpen || adminState.confirmAction !== null;
  useBodyScrollLock({ isLocked: hasOpenModal });

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

  const adminActions = useAdminActions();

  // Handlers
  const handlers = useAdminsListHandlers({
    setSelectedAdmin: adminState.setSelectedAdmin,
    setEditModalOpen: adminState.setEditModalOpen,
    setProfileAdmin: adminState.setProfileAdmin,
    setProfileModalOpen: adminState.setProfileModalOpen,
    setConfirmAction: adminState.setConfirmAction,
    setCreateModalOpen: adminState.setCreateModalOpen,
    createAdmin: adminActions.createAdmin,
    updateAdminPermissions: adminActions.updateAdminPermissions,
    toggleAdminStatus: adminActions.toggleAdminStatus,
    deleteAdmin: adminActions.deleteAdmin,
    revokeAdminPermission: adminActions.revokeAdminPermission,
    refreshList,
    fetchAdmins,
    confirmAction: adminState.confirmAction,
  });

  return (
    <div className="p-6 xl-down:p-4 md-down:p-3 sm-down:p-2 min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl xl-down:max-w-full mx-auto">
        <AdminsListHeader
          t={t}
          isSuperAdmin={isSuperAdmin()}
          onAddAdmin={() => adminState.setCreateModalOpen(true)}
        />

        <FilterBar
          searchText={searchText}
          adminLevelFilter={adminLevelFilter}
          onSearchChange={setSearchText}
          onLevelFilterChange={setAdminLevelFilter}
          onRefresh={refreshList}
          loading={loading}
        />

        <AdminsContent
          loading={loading}
          admins={admins}
          t={t}
          currentAdmin={currentAdmin}
          pagination={pagination}
          handlers={handlers}
        />

        <CreateAdminModal
          isOpen={adminState.createModalOpen}
          onClose={() => adminState.setCreateModalOpen(false)}
          onSubmit={handlers.handleCreateAdmin}
          availablePermissions={availablePermissions}
          loading={adminActions.creating}
        />

        <EditAdminModal
          isOpen={adminState.editModalOpen}
          admin={adminState.selectedAdmin}
          onClose={() => {
            adminState.setEditModalOpen(false);
            adminState.setSelectedAdmin(null);
          }}
          onSubmit={handlers.handleUpdateAdmin}
          availablePermissions={availablePermissions}
          loading={adminActions.updating}
        />

        <ConfirmationDialog
          t={t}
          confirmAction={adminState.confirmAction}
          onConfirm={handlers.handleConfirm}
          onCancel={() => adminState.setConfirmAction(null)}
        />

        <AdminProfileModal
          isOpen={adminState.profileModalOpen}
          admin={adminState.profileAdmin}
          onClose={() => {
            adminState.setProfileModalOpen(false);
            adminState.setProfileAdmin(null);
          }}
          onUpdate={handlers.handleProfileUpdate}
        />
      </div>
    </div>
  );
};

export default AdminsList;
