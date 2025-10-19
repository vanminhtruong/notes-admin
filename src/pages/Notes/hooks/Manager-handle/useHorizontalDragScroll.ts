import { useRef } from 'react';

export const useHorizontalDragScroll = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPointerDown = useRef(false);
  const isDragging = useRef(false);
  const lastDragTime = useRef(0);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const DRAG_THRESHOLD = 5; // px

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    isPointerDown.current = true;
    isDragging.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = containerRef.current.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDown.current || !containerRef.current) return;
    const dx = e.clientX - startX.current;
    if (!isDragging.current && Math.abs(dx) > DRAG_THRESHOLD) {
      isDragging.current = true;
    }
    if (isDragging.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = startScrollLeft.current - dx;
    }
  };

  const endDrag = () => {
    if (!containerRef.current) return;
    isPointerDown.current = false;
    if (isDragging.current) {
      lastDragTime.current = Date.now();
    }
    isDragging.current = false;
  };

  const onClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (Date.now() - lastDragTime.current < 150) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return { containerRef, onPointerDown, onPointerMove, endDrag, onClickCapture };
};
