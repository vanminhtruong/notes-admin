import React from 'react';
import type { TFunction } from 'i18next';
import type { Admin } from '../interfaces/admin.types';
import AdminCard from './AdminCard';
import Pagination from './Pagination';

interface AdminsContentProps {
  loading: boolean;
  admins: Admin[];
  t: TFunction;
  currentAdmin: Admin | null;
  pagination: { current: number; pageSize: number; total: number };
  handlers: {
    handleEditAdmin: (admin: Admin) => void;
    showConfirmDialog: (type: 'toggle' | 'delete', adminId: number, adminName: string) => void;
    showRevokeConfirmDialog: (adminId: number, adminName: string, permission: string) => void;
    handleViewProfile: (admin: Admin) => void;
    handlePageChange: (page: number, size?: number) => void;
  };
}

const AdminsContent: React.FC<AdminsContentProps> = ({ loading, admins, t, currentAdmin, pagination, handlers }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">{t('loading')}</span>
      </div>
    );
  }

  if (admins.length === 0) {
    return (
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
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl-down:gap-3 sm-down:gap-2 p-4 xl-down:p-3 sm-down:p-2">
        {admins.map((admin) => (
          <AdminCard
            key={admin.id}
            admin={admin}
            currentAdmin={currentAdmin}
            onEdit={handlers.handleEditAdmin}
            onToggleStatus={(adminId) => handlers.showConfirmDialog('toggle', adminId, admin.name)}
            onDelete={(adminId) => handlers.showConfirmDialog('delete', adminId, admin.name)}
            onRevokePermission={(adminId, permission) => handlers.showRevokeConfirmDialog(adminId, admin.name, permission)}
            onViewProfile={handlers.handleViewProfile}
          />
        ))}
      </div>

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={handlers.handlePageChange}
      />
    </div>
  );
};

export default AdminsContent;
