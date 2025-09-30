export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  isOnline?: boolean;
  avatar?: string;
  // Optional profile fields
  phone?: string | null;
  birthDate?: string | null;
  gender?: 'male' | 'female' | 'other' | 'unspecified';
  lastSeenAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Privacy settings
  hidePhone?: boolean;
  hideBirthDate?: boolean;
  allowMessagesFromNonFriends?: boolean;
  // App settings
  theme?: 'light' | 'dark';
  language?: string;
  rememberLogin?: boolean;
  e2eeEnabled?: boolean;
  readStatusEnabled?: boolean;
  // Admin fields (if applicable)
  adminLevel?: 'super_admin' | 'sub_admin' | 'dev' | 'mod' | null;
  adminPermissions?: string[] | null;
}

export interface Message {
  id: number;
  content: string;
  createdAt: string;
  sender: User;
  receiver: User;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: string;
  owner: User;
}

export interface UserActivityData {
  user: User;
  activity: {
    messages: Message[];
    groups: Group[];
    friends: User[];
  };
}

export interface AdminNotification {
  id: number;
  type: string;
  createdAt: string;
  updatedAt?: string;
  isRead?: boolean;
  fromUser?: User | null;
  group?: { id: number; name: string; avatar?: string } | null;
  metadata?: any;
}

export interface ConfirmState {
  open: boolean;
  title: string;
  lines: string[];
  onConfirm: null | (() => Promise<void> | void);
  confirming: boolean;
}

export interface UsersListFilters {
  searchTerm: string;
  activeFilter: string;
  currentPage: number;
}

export interface MonitorState {
  monitorTab: 'dm' | 'groups';
  selectedFriendId: number | null;
  selectedGroupId: number | null;
  dmMessages: any[];
  groupMessages: any[];
  loadingDm: boolean;
  loadingGroup: boolean;
  // Map trạng thái messageId -> 'sent' | 'delivered' | 'read'
  dmStatusById?: Record<number, string>;
  groupStatusById?: Record<number, string>;
  // Người đã xem: DM: messageId -> readerId; Group: messageId -> danh sách readerIds
  dmReadBy?: Record<number, number>;
  groupReadBy?: Record<number, number[]>;
}

export interface GroupMemberInfo {
  avatar?: string;
  role?: string;
  name?: string;
}

export interface GroupInfo {
  ownerId?: number;
}

export interface TypingInfo {
  withUserId: number;
  withUserName: string;
}
