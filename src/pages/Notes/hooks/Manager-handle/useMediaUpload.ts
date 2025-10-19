import { toast } from 'react-toastify';
import type { Note } from '../../interface/types';

interface UseMediaUploadProps {
  editingNote: Note;
  setEditingNote: React.Dispatch<React.SetStateAction<Note | null>>;
  t: (key: string, options?: any) => string;
}

export const useMediaUpload = ({ editingNote, setEditingNote, t }: UseMediaUploadProps) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { uploadService } = await import('@services/uploadService');
      const { url } = await uploadService.uploadImage(file);
      setEditingNote({ ...editingNote, imageUrl: url, videoUrl: '', youtubeUrl: '' });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('toasts.uploadImageError', { defaultValue: 'Không thể tải lên ảnh' }));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { uploadService } = await import('@services/uploadService');
      const { url } = await uploadService.uploadFile(file);
      setEditingNote({ ...editingNote, videoUrl: url, imageUrl: '', youtubeUrl: '' });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error(t('toasts.uploadVideoError', { defaultValue: 'Không thể tải lên video' }));
    }
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingNote({ ...editingNote, youtubeUrl: e.target.value, imageUrl: '', videoUrl: '' });
  };

  return {
    handleImageUpload,
    handleVideoUpload,
    handleYoutubeUrlChange,
  };
};
