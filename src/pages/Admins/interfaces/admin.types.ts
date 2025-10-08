export interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  adminLevel: 'super_admin' | 'sub_admin' | 'dev' | 'mod';
  adminPermissions: string[];
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
    create: boolean;
    edit: boolean;
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
  permissions: string[];
  adminLevel: AdminLevel;
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
        description: 'Xem danh sách và thông tin chi tiết người dùng',
        subPermissions: [
          {
            key: 'manage_users.view_detail',
            label: 'Xem chi tiết người dùng',
            description: 'Cho phép mở modal chi tiết người dùng trong danh sách Users'
          }
        ]
      },
      {
        key: 'manage_users.create',
        label: 'Tạo tài khoản người dùng',
        description: 'Tạo tài khoản mới cho người dùng'
      },
      {
        key: 'manage_users.edit',
        label: 'Chỉnh sửa thông tin người dùng',
        description: 'Chỉnh sửa thông tin cá nhân của người dùng'
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
            description: 'Xem lịch sử tin nhắn của người dùng',
            subPermissions: [
              {
                key: 'manage_users.activity.messages.recall',
                label: 'Thu hồi tin nhắn (DM)',
                description: 'Cho phép thu hồi tin nhắn trong hội thoại 1-1 theo thời gian thực'
              },
              {
                key: 'manage_users.activity.messages.delete',
                label: 'Xóa tin nhắn (DM)',
                description: 'Cho phép xóa tin nhắn ở phía người dùng hoặc cả hai phía theo thời gian thực'
              }
            ]
          },
          {
            key: 'manage_users.activity.groups',
            label: 'Tab nhóm',
            description: 'Xem các nhóm mà người dùng tham gia',
            subPermissions: [
              {
                key: 'manage_users.activity.groups.recall',
                label: 'Thu hồi tin nhắn nhóm',
                description: 'Cho phép thu hồi tin nhắn trong nhóm theo thời gian thực'
              },
              {
                key: 'manage_users.activity.groups.delete',
                label: 'Xóa tin nhắn nhóm',
                description: 'Cho phép xóa tin nhắn trong nhóm theo thời gian thực'
              }
            ]
          },
          {
            key: 'manage_users.activity.friends',
            label: 'Tab bạn bè',
            description: 'Xem danh sách bạn bè của người dùng'
          },
          {
            key: 'manage_users.activity.notifications',
            label: 'Tab thông báo',
            description: 'Xem thông báo của người dùng',
            subPermissions: [
              {
                key: 'manage_users.activity.notifications.delete',
                label: 'Xóa thông báo',
                description: 'Cho phép xóa thông báo của người dùng theo thời gian thực'
              },
              {
                key: 'manage_users.activity.notifications.clear_all',
                label: 'Clear all notifications',
                description: 'Allow clearing all notifications for the user (Super Admin or granted admins only)'
              }
            ]
          },
          {
            key: 'manage_users.activity.monitor',
            label: 'Tab giám sát',
            description: 'Giám sát hoạt động real-time của người dùng',
            subPermissions: [
              {
                key: 'manage_users.activity.monitor.message_status',
                label: 'Theo dõi trạng thái tin nhắn',
                description: 'Xem trạng thái gửi, nhận, đọc tin nhắn real-time',
                subPermissions: [
                  {
                    key: 'manage_users.activity.monitor.message_status.sent',
                    label: 'Trạng thái đã gửi',
                    description: 'Theo dõi khi tin nhắn được gửi đi'
                  },
                  {
                    key: 'manage_users.activity.monitor.message_status.delivered',
                    label: 'Trạng thái đã nhận',
                    description: 'Theo dõi khi tin nhắn được nhận bởi người nhận'
                  },
                  {
                    key: 'manage_users.activity.monitor.message_status.read',
                    label: 'Trạng thái đã xem',
                    description: 'Theo dõi khi tin nhắn được đọc bởi người nhận'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        key: 'manage_users.sessions',
        label: 'Quản lý thiết bị đăng nhập',
        description: 'Quản lý các phiên đăng nhập và thiết bị của người dùng',
        subPermissions: [
          {
            key: 'manage_users.sessions.view',
            label: 'Xem thiết bị đăng nhập',
            description: 'Xem danh sách các thiết bị đang đăng nhập'
          },
          {
            key: 'manage_users.sessions.logout',
            label: 'Đăng xuất thiết bị cụ thể',
            description: 'Đăng xuất người dùng khỏi thiết bị cụ thể'
          },
          {
            key: 'manage_users.sessions.logout_all',
            label: 'Đăng xuất tất cả thiết bị',
            description: 'Đăng xuất người dùng khỏi tất cả thiết bị'
          }
        ]
      }
    ]
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    description: 'Quyền liên quan đến hồ sơ admin',
    subPermissions: [
      {
        key: 'profile.self',
        label: 'Hồ sơ bản thân',
        description: 'Quyền truy cập và chỉnh sửa hồ sơ của chính mình',
        subPermissions: [
          {
            key: 'profile.self.view',
            label: 'Xem hồ sơ bản thân',
            description: 'Cho phép truy cập trang hồ sơ của chính mình'
          },
          {
            key: 'profile.self.edit',
            label: 'Sửa hồ sơ bản thân',
            description: 'Cho phép chỉnh sửa hồ sơ của chính mình'
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
      },
      {
        key: 'manage_notes.view_detail',
        label: 'Xem chi tiết ghi chú',
        description: 'Xem chi tiết đầy đủ ghi chú qua modal khi click vào danh sách'
      },
      {
        key: 'manage_notes.archive',
        label: 'Lưu trữ ghi chú',
        description: 'Lưu trữ và bỏ lưu trữ ghi chú'
      },
      {
        key: 'manage_notes.shared',
        label: 'Quản lý ghi chú chia sẻ',
        description: 'Quản lý các ghi chú được chia sẻ trong hệ thống',
        subPermissions: [
          {
            key: 'manage_notes.shared.view',
            label: 'Xem ghi chú chia sẻ',
            description: 'Xem danh sách và chi tiết ghi chú chia sẻ'
          },
          {
            key: 'manage_notes.shared.edit',
            label: 'Sửa ghi chú chia sẻ',
            description: 'Chỉnh sửa quyền và tin nhắn của ghi chú chia sẻ'
          },
          {
            key: 'manage_notes.shared.delete',
            label: 'Xóa ghi chú chia sẻ',
            description: 'Xóa ghi chú chia sẻ và tin nhắn liên quan'
          }
        ]
      },
      {
        key: 'manage_notes.folders',
        label: 'Quản lý thư mục ghi chú',
        description: 'Quản lý các thư mục ghi chú của người dùng',
        subPermissions: [
          {
            key: 'manage_notes.folders.view',
            label: 'Xem thư mục',
            description: 'Xem danh sách thư mục ghi chú'
          },
          {
            key: 'manage_notes.folders.view_detail',
            label: 'Xem chi tiết thư mục',
            description: 'Xem chi tiết thư mục và ghi chú bên trong khi click vào folder'
          },
          {
            key: 'manage_notes.folders.create',
            label: 'Tạo thư mục',
            description: 'Tạo thư mục mới cho người dùng'
          },
          {
            key: 'manage_notes.folders.edit',
            label: 'Sửa thư mục',
            description: 'Chỉnh sửa tên, màu sắc, icon của thư mục'
          },
          {
            key: 'manage_notes.folders.delete',
            label: 'Xóa thư mục',
            description: 'Xóa thư mục (các ghi chú sẽ được giữ lại)'
          },
          {
            key: 'manage_notes.folders.move',
            label: 'Di chuyển note vào folder',
            description: 'Di chuyển ghi chú vào một thư mục cụ thể của người dùng'
          },
          {
            key: 'manage_notes.folders.notes',
            label: 'Quản lý notes trong folder',
            description: 'Quản lý ghi chú bên trong thư mục',
            subPermissions: [
              {
                key: 'manage_notes.folders.notes.create',
                label: 'Tạo note trong folder',
                description: 'Tạo ghi chú mới trong thư mục'
              },
              {
                key: 'manage_notes.folders.notes.edit',
                label: 'Sửa note trong folder',
                description: 'Chỉnh sửa ghi chú trong thư mục'
              },
              {
                key: 'manage_notes.folders.notes.delete',
                label: 'Xóa note trong folder',
                description: 'Xóa ghi chú trong thư mục'
              },
              {
                key: 'manage_notes.folders.notes.remove',
                label: 'Di chuyển note ra khỏi folder',
                description: 'Di chuyển ghi chú từ folder sang tab Active'
              }
            ]
          }
        ]
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
  
  const addPermissionKeys = (permissions: NestedPermission[]) => {
    permissions.forEach(perm => {
      keys.push(perm.key);
      if (perm.subPermissions && perm.subPermissions.length > 0) {
        addPermissionKeys(perm.subPermissions); // Recursive call để hỗ trợ nested sâu hơn
      }
    });
  };
  
  addPermissionKeys(NESTED_PERMISSIONS);
  return keys;
};

export const getPermissionByKey = (key: string): NestedPermission | undefined => {
  const findPermission = (permissions: NestedPermission[]): NestedPermission | undefined => {
    for (const perm of permissions) {
      if (perm.key === key) return perm;
      if (perm.subPermissions && perm.subPermissions.length > 0) {
        const found = findPermission(perm.subPermissions); // Recursive search
        if (found) return found;
      }
    }
    return undefined;
  };
  
  return findPermission(NESTED_PERMISSIONS);
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
