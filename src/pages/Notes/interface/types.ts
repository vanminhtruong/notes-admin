export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface NoteCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
}

export interface NoteTag {
  id: number;
  name: string;
  color: string;
}

export interface Note {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  categoryId?: number;
  category?: NoteCategory;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  isPinned?: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  tags?: NoteTag[];
}

export interface NotesListProps {
  forcedArchived?: 'all' | 'active' | 'archived';
  embedded?: boolean;
}

export type EditNoteModalProps = {
  show: boolean;
  editingNote: Note | null;
  setEditingNote: React.Dispatch<React.SetStateAction<Note | null>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};
