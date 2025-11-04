import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminActions } from './hooks/useAdminActions';
import { useAdminSocket } from './hooks/Manager-Effects/useAdminSocket';
import { useAdminsListState } from './hooks/Manager-useState/useAdminsListState';
import { useBodyScrollLock } from './hooks/Manager-Effects/useBodyScrollLock';
import { useAdminsListHandlers } from './hooks/Manager-handle/useAdminsListHandlers';
import { useAdminsListEffects } from './hooks/Manager-Effects/useAdminsListEffects';
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

  // State management từ useAdminsListState
  const adminState = useAdminsListState();

  // Disable body scroll when any modal or confirmation dialog is open
  const hasOpenModal = adminState.createModalOpen || adminState.editModalOpen || adminState.profileModalOpen || adminState.confirmAction !== null;
  useBodyScrollLock({ isLocked: hasOpenModal });

  // Admin actions
  const adminActions = useAdminActions();

  // Handlers từ useAdminsListHandlers
  const handlers = useAdminsListHandlers({
    setLoading: adminState.setLoading,
    setAdmins: adminState.setAdmins,
    setPagination: adminState.setPagination,
    setAvailablePermissions: adminState.setAvailablePermissions,
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
    confirmAction: adminState.confirmAction,
    pagination: adminState.pagination,
    searchText: adminState.searchText,
    adminLevelFilter: adminState.adminLevelFilter,
  });

  // Effects để fetch data
  useAdminsListEffects({
    setCurrentAdmin: adminState.setCurrentAdmin,
    fetchAdmins: handlers.fetchAdmins,
    searchText: adminState.searchText,
    adminLevelFilter: adminState.adminLevelFilter,
  });

  // Sử dụng socket để listen real-time events
  useAdminSocket({
    onAdminListChange: handlers.refreshList,
    currentAdminId: adminState.currentAdmin?.id,
  });

  return (
    <div>
      <div className="max-w-7xl xl-down:max-w-full mx-auto">
        <AdminsListHeader
          t={t}
          isSuperAdmin={isSuperAdmin()}
          onAddAdmin={() => adminState.setCreateModalOpen(true)}
        />

        <FilterBar
          searchText={adminState.searchText}
          adminLevelFilter={adminState.adminLevelFilter}
          onSearchChange={adminState.setSearchText}
          onLevelFilterChange={adminState.setAdminLevelFilter}
          onRefresh={handlers.refreshList}
          loading={adminState.loading}
        />

        <AdminsContent
          loading={adminState.loading}
          admins={adminState.admins}
          t={t}
          currentAdmin={adminState.currentAdmin}
          pagination={adminState.pagination}
          handlers={handlers}
        />

        <CreateAdminModal
          isOpen={adminState.createModalOpen}
          onClose={() => adminState.setCreateModalOpen(false)}
          onSubmit={handlers.handleCreateAdmin}
          availablePermissions={adminState.availablePermissions}
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
          availablePermissions={adminState.availablePermissions}
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
