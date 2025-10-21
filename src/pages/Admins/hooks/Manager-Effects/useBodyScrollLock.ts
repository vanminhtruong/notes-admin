import { useEffect } from 'react';

interface UseBodyScrollLockProps {
  isLocked: boolean;
}

export const useBodyScrollLock = ({ isLocked }: UseBodyScrollLockProps) => {
  useEffect(() => {
    if (isLocked) {
      // Save original values
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width to avoid layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Disable scroll on both html and body
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
      };
    }
  }, [isLocked]);
};
