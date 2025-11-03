export interface Background {
  id: number;
  uniqueId: string;
  type: 'color' | 'image';
  value: string | null;
  label: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundsResponse {
  backgrounds: Background[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBackgroundData {
  uniqueId: string;
  type: 'color' | 'image';
  value: string | null;
  label: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateBackgroundData {
  uniqueId?: string;
  type?: 'color' | 'image';
  value?: string | null;
  label?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}
