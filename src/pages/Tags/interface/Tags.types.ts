export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  isPinned: boolean;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
  notesCount?: number;
}

export interface TagFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface TagListResponse {
  tags: Tag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
