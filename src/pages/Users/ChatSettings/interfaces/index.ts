export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  phone?: string;
  birthDate?: string;
  gender?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserChatSettings {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  isActive: boolean;
  // Chat Settings
  e2eeEnabled: boolean;
  readStatusEnabled: boolean;
  allowMessagesFromNonFriends: boolean;
  hidePhone: boolean;
  hideBirthDate: boolean;
  e2eePinHash?: string | null;
  // Additional info
  phone?: string;
  birthDate?: string;
  createdAt: string;
  updatedAt: string;
  // Blocked users count
  blockedUsersCount?: number;
}

export interface ChatSettingsFilters {
  searchTerm: string;
  currentPage: number;
  e2eeFilter?: string; // 'enabled' | 'disabled' | ''
  readStatusFilter?: string; // 'enabled' | 'disabled' | ''
}

export interface BlockedUserItem {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  blockedAt: string;
}

export interface UserChatSettingsDetail extends UserChatSettings {
  blockedUsers: BlockedUserItem[];
}
