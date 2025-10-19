import { useState } from 'react';
import type { Note } from '../../interface/types';

export const useModalState = () => {
  // Editing states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Detail modal states
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Move to folder modal states
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [noteToMove, setNoteToMove] = useState<Note | null>(null);
  
  // Create note modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Tags modal states
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [noteForTags, setNoteForTags] = useState<Note | null>(null);

  return {
    editingNote,
    setEditingNote,
    showEditModal,
    setShowEditModal,
    selectedNote,
    setSelectedNote,
    showDetailModal,
    setShowDetailModal,
    showMoveToFolderModal,
    setShowMoveToFolderModal,
    noteToMove,
    setNoteToMove,
    showCreateModal,
    setShowCreateModal,
    showTagsModal,
    setShowTagsModal,
    noteForTags,
    setNoteForTags,
  };
};
