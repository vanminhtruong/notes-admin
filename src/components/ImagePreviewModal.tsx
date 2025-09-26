import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ImagePreviewModalProps {
  open: boolean;
  src: string | null | undefined;
  alt?: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ open, src, alt = 'Preview', onClose }) => {
  // Use 'profile' first (for reset/enhance/showOriginal), fallback to 'common' (for close)
  const { t } = useTranslation(['profile', 'common']);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imgWrapperRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragState = useRef<{ dragging: boolean; startX: number; startY: number; originX: number; originY: number }>({ dragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
  const [useEnhanced, setUseEnhanced] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Reset zoom when modal reopened or source changes
  useEffect(() => {
    if (open) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setUseEnhanced(false);
    }
  }, [open, src]);

  const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Prevent page scroll while zooming image
    e.preventDefault();
    const zoomStep = 0.12;
    const direction = e.deltaY > 0 ? -1 : 1; // up to zoom in, down to zoom out (natural feel)
    setScale((prev) => clamp(Number((prev + direction * zoomStep).toFixed(2)), 0.5, 5));
  }, []);

  const handleDoubleClick = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Header controls
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 5;
  const ZOOM_STEP_BTN = 0.2;
  const onZoomIn = useCallback(() => {
    setScale((prev) => clamp(Number((prev + ZOOM_STEP_BTN).toFixed(2)), ZOOM_MIN, ZOOM_MAX));
  }, []);
  const onZoomOut = useCallback(() => {
    setScale((prev) => clamp(Number((prev - ZOOM_STEP_BTN).toFixed(2)), ZOOM_MIN, ZOOM_MAX));
  }, []);
  const onReset = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Simple CSS-based enhancement toggle 
  const onEnhance = useCallback(() => {
    if (!src) return;
    setUseEnhanced(prev => !prev);
  }, [src]);

  // Start dragging
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only allow panning when image is zoomed in slightly (>1)
    if (scale <= 1) return;
    e.preventDefault();
    dragState.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
  }, [scale, offset.x, offset.y]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  }, []);

  const endDrag = useCallback(() => {
    if (dragState.current.dragging) {
      dragState.current.dragging = false;
      setIsDragging(false);
    }
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (scale <= 1) return;
    const t = e.touches[0];
    dragState.current = {
      dragging: true,
      startX: t.clientX,
      startY: t.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setIsDragging(true);
  }, [scale, offset.x, offset.y]);

  const onTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragState.current.dragging) return;
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - dragState.current.startX;
    const dy = t.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.originX + dx, y: dragState.current.originY + dy });
  }, []);

  const onTouchEnd = endDrag;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Content */}
      <div className="relative max-w-5xl w-[92vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw]">
        <div
          ref={imgWrapperRef}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/10 dark:ring-white/10 bg-black select-none ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
          style={{ touchAction: 'pan-y' }}
        >
          {/* Header controls (mobile-friendly) */}
          <div className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/70 to-transparent">
            <div className="flex items-center gap-2">
              <button
                onClick={onZoomOut}
                aria-label={t('actions.zoomOut', { defaultValue: 'Thu nhỏ' })}
                title={t('actions.zoomOut', { defaultValue: 'Thu nhỏ' })}
                className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button
                onClick={onZoomIn}
                aria-label={t('actions.zoomIn', { defaultValue: 'Phóng to' })}
                title={t('actions.zoomIn', { defaultValue: 'Phóng to' })}
                className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </button>
              <button
                onClick={onReset}
                aria-label={t('actions.reset', { defaultValue: 'Mặc định' })}
                title={t('actions.reset', { defaultValue: 'Mặc định' })}
                className="inline-flex items-center justify-center h-10 px-3 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-sm"
              >
                {t('actions.reset', { defaultValue: 'Mặc định' })}
              </button>
              <button
                onClick={onEnhance}
                aria-label={useEnhanced ? t('actions.showOriginal', { defaultValue: 'Ảnh gốc' }) : t('actions.enhance', { defaultValue: 'Siêu nét' })}
                title={useEnhanced ? t('actions.showOriginal', { defaultValue: 'Ảnh gốc' }) : t('actions.enhance', { defaultValue: 'Siêu nét' })}
                disabled={!src}
                className="inline-flex items-center justify-center h-10 px-3 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium backdrop-blur-sm"
              >
                {useEnhanced ? t('actions.showOriginal', { defaultValue: 'Ảnh gốc' }) : t('actions.enhance', { defaultValue: 'Siêu nét' })}
              </button>
            </div>
            {/* Close button inside header */}
            <button
              onClick={onClose}
              aria-label={t('actions.close', { defaultValue: 'Đóng' })}
              title={t('actions.close', { defaultValue: 'Đóng' })}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt={alt}
              className="relative z-0 max-h-[80vh] w-full h-auto object-contain bg-black transition-transform duration-100 ease-out select-none"
              style={{ 
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                filter: useEnhanced ? 'contrast(1.15) saturate(1.1) brightness(1.05)' : 'none'
              }}
              draggable={false}
            />
          ) : (
            <div className="flex items-center justify-center h-[60vh] bg-neutral-900 text-white">
              <span className="opacity-70">No image</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
