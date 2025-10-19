export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
  notesCount?: number;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface CategoryListResponse {
  categories: Category[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
