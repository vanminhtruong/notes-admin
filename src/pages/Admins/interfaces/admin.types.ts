export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  adminLevel: 'super_admin' | 'sub_admin' | 'dev' | 'mod';
  adminPermissions: AdminPermissions;
  isActive: boolean;
  avatar?: string;
  lastSeenAt?: string;
  createdAt: string;
}

export interface AdminPermissions {
  // Analytics permissions
  view_analytics: boolean;
  
  // User management permissions
  manage_users: {
    value: boolean;
    view: boolean;
    activate: boolean;
    view_active_accounts: boolean;
    delete_permanently: boolean;
    activity: {
      value: boolean;
      messages: boolean; // Consolidated: covers view_messages functionality
      groups: boolean;   // Consolidated: covers manage_groups functionality
      friends: boolean;
      notifications: boolean;
      monitor: boolean;
    };
  };
  
  // Note management permissions
  manage_notes: {
    value: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    view: boolean;
  };
  
  // Admin management permissions (Super Admin only)
  manage_admins: {
    value: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  
  // System permissions
  system_settings: boolean;
  delete_content: boolean;
}

export interface Permission {
  key: string;
  label: string;
  description: string;
}

export interface AdminListResponse {
  admins: Admin[];
  availablePermissions: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface AdminFilters {
  page?: number;
  limit?: number;
  search?: string;
  adminLevel?: string;
}

export interface CreateAdminForm {
  email: string;
  name: string;
  password: string;
  permissions: AdminPermissions;
}

export interface UpdateAdminForm {
  permissions: string[];
  adminLevel?: AdminLevel;
}

export type AdminLevel = 'super_admin' | 'sub_admin' | 'dev' | 'mod';

export interface NestedPermission {
  key: string;
  label: string;
  description: string;
  subPermissions?: NestedPermission[];
}

// Cấu trúc permissions với nested sub-permissions
export const NESTED_PERMISSIONS: NestedPermission[] = [
  {
    key: 'manage_users',
    label: 'Quản lý người dùng',
    description: 'Kích hoạt, vô hiệu hóa, xem thông tin người dùng',
    subPermissions: [
      {
        key: 'manage_users.view',
        label: 'Xem thông tin người dùng',
        description: 'Xem danh sách và thông tin chi tiết người dùng'
      },
      {
        key: 'manage_users.activate',
        label: 'Kích hoạt/Vô hiệu hóa',
        description: 'Kích hoạt hoặc vô hiệu hóa tài khoản người dùng'
      },
      {
        key: 'manage_users.view_active_accounts',
        label: 'Xem tài khoản hoạt động',
        description: 'Xem danh sách các tài khoản đang hoạt động'
      },
      {
        key: 'manage_users.delete_permanently',
        label: 'Xóa tài khoản vĩnh viễn',
        description: 'Xóa hoàn toàn tài khoản người dùng khỏi hệ thống'
      },
      {
        key: 'manage_users.activity',
        label: 'Xem hoạt động người dùng',
        description: 'Truy cập trang User Activity để xem hoạt động chi tiết',
        subPermissions: [
          {
            key: 'manage_users.activity.messages',
            label: 'Tab tin nhắn',
            description: 'Xem lịch sử tin nhắn của người dùng'
          },
          {
            key: 'manage_users.activity.groups',
            label: 'Tab nhóm',
            description: 'Xem các nhóm mà người dùng tham gia'
          },
          {
            key: 'manage_users.activity.friends',
            label: 'Tab bạn bè',
            description: 'Xem danh sách bạn bè của người dùng'
          },
          {
            key: 'manage_users.activity.notifications',
            label: 'Tab thông báo',
            description: 'Xem thông báo của người dùng'
          },
          {
            key: 'manage_users.activity.monitor',
            label: 'Tab giám sát',
            description: 'Giám sát hoạt động real-time của người dùng'
          }
        ]
      }
    ]
  },
  {
    key: 'manage_notes',
    label: 'Quản lý ghi chú',
    description: 'Quản lý ghi chú của người dùng',
    subPermissions: [
      {
        key: 'manage_notes.create',
        label: 'Tạo ghi chú',
        description: 'Tạo ghi chú mới cho người dùng'
      },
      {
        key: 'manage_notes.edit',
        label: 'Sửa ghi chú',
        description: 'Chỉnh sửa ghi chú hiện có'
      },
      {
        key: 'manage_notes.delete',
        label: 'Xóa ghi chú',
        description: 'Xóa ghi chú của người dùng'
      },
      {
        key: 'manage_notes.view',
        label: 'Xem ghi chú',
        description: 'Xem tất cả ghi chú của người dùng'
      }
    ]
  },
  {
    key: 'manage_admins',
    label: 'Quản lý admin',
    description: 'Thêm, sửa, xóa admin khác (Chỉ Super Admin)',
    subPermissions: [
      {
        key: 'manage_admins.create',
        label: 'Tạo admin',
        description: 'Tạo tài khoản admin mới'
      },
      {
        key: 'manage_admins.edit',
        label: 'Sửa quyền admin',
        description: 'Chỉnh sửa quyền hạn admin khác'
      },
      {
        key: 'manage_admins.delete',
        label: 'Xóa admin',
        description: 'Xóa tài khoản admin'
      }
    ]
  },
  {
    key: 'view_analytics',
    label: 'Xem thống kê',
    description: 'Truy cập dashboard và thống kê hệ thống'
  },
  {
    key: 'manage_groups',
    label: 'Quản lý nhóm',
    description: 'Quản lý các nhóm chat',
    subPermissions: [
      {
        key: 'manage_groups.view',
        label: 'Xem nhóm',
        description: 'Xem danh sách và thông tin nhóm'
      },
      {
        key: 'manage_groups.moderate',
        label: 'Kiểm duyệt nhóm',
        description: 'Kiểm duyệt nội dung và thành viên nhóm'
      }
    ]
  },
  {
    key: 'view_messages',
    label: 'Xem tin nhắn',
    description: 'Xem tin nhắn và thông báo của người dùng'
  },
  {
    key: 'delete_content',
    label: 'Xóa nội dung',
    description: 'Xóa tin nhắn, nội dung không phù hợp'
  },
  {
    key: 'system_settings',
    label: 'Cài đặt hệ thống',
    description: 'Thay đổi cài đặt và cấu hình hệ thống'
  }
];

// Helper functions
export const getAllPermissionKeys = (): string[] => {
  const keys: string[] = [];
  NESTED_PERMISSIONS.forEach(perm => {
    keys.push(perm.key);
    if (perm.subPermissions) {
      perm.subPermissions.forEach(sub => keys.push(sub.key));
    }
  });
  return keys;
};

export const getPermissionByKey = (key: string): NestedPermission | undefined => {
  for (const perm of NESTED_PERMISSIONS) {
    if (perm.key === key) return perm;
    if (perm.subPermissions) {
      const subPerm = perm.subPermissions.find(sub => sub.key === key);
      if (subPerm) return subPerm;
    }
  }
  return undefined;
};

// Legacy support - keep for backwards compatibility
export const PERMISSION_LABELS: Record<string, Permission> = {
  manage_users: {
    key: 'manage_users',
    label: 'Quản lý người dùng',
    description: 'Kích hoạt, vô hiệu hóa, xem thông tin người dùng'
  },
  manage_notes: {
    key: 'manage_notes', 
    label: 'Quản lý ghi chú',
    description: 'Tạo, sửa, xóa ghi chú cho người dùng'
  },
  manage_admins: {
    key: 'manage_admins',
    label: 'Quản lý admin',
    description: 'Thêm, sửa, xóa admin khác (Chỉ Super Admin)'
  },
  view_analytics: {
    key: 'view_analytics',
    label: 'Xem thống kê',
    description: 'Truy cập dashboard và thống kê hệ thống'
  },
  manage_groups: {
    key: 'manage_groups',
    label: 'Quản lý nhóm',
    description: 'Xem, quản lý các nhóm chat'
  },
  view_messages: {
    key: 'view_messages',
    label: 'Xem tin nhắn',
    description: 'Xem tin nhắn và thông báo của người dùng'
  },
  delete_content: {
    key: 'delete_content',
    label: 'Xóa nội dung',
    description: 'Xóa tin nhắn, nội dung không phù hợp'
  },
  system_settings: {
    key: 'system_settings',
    label: 'Cài đặt hệ thống',
    description: 'Thay đổi cài đặt và cấu hình hệ thống'
  }
};
