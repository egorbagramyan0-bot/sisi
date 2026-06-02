import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const WineCardModal = ({ isOpen, onClose, imageSrc = "/vinecard.png", altText = "Винная карта Cafe Sisi" }) => {
  const previousFocusRef = useRef(null);
  const closeButtonRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const imageRef = useRef(null);
  const zoomAnchorRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [baseSize, setBaseSize] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const scrollStartRef = useRef({ left: 0, top: 0 });

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Check for prefers-reduced-motion updates
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const listener = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Update base image size when at scale 1
  const updateBaseSize = useCallback(() => {
    if (imageRef.current && scale === 1) {
      const rect = imageRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setBaseSize({ width: rect.width, height: rect.height });
      }
    }
  }, [scale]);

  const handleImageLoad = useCallback(() => {
    updateBaseSize();
  }, [updateBaseSize]);

  // Update base size when modal opens or resets to 1
  useEffect(() => {
    if (isOpen && scale === 1) {
      const timer = setTimeout(() => {
        updateBaseSize();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scale, updateBaseSize]);

  // Update base size on window resize
  useEffect(() => {
    if (isOpen && scale === 1) {
      window.addEventListener('resize', updateBaseSize);
      return () => window.removeEventListener('resize', updateBaseSize);
    }
  }, [isOpen, scale, updateBaseSize]);

  // Unified scale update handler to store the anchor relative center ratios
  const updateScale = useCallback((newScaleOrFn) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = container;
    
    // Calculate current center point relative to scroll dimensions
    const centerX = scrollLeft + clientWidth / 2;
    const centerY = scrollTop + clientHeight / 2;
    
    const relX = scrollWidth > 0 ? centerX / scrollWidth : 0.5;
    const relY = scrollHeight > 0 ? centerY / scrollHeight : 0.5;

    setScale((prev) => {
      const next = typeof newScaleOrFn === 'function' ? newScaleOrFn(prev) : newScaleOrFn;
      // Clamp between 1 and 2
      const clamped = Math.max(1, Math.min(next, 2));
      if (clamped !== prev) {
        zoomAnchorRef.current = { relX, relY, prevScale: prev };
      }
      return clamped;
    });
  }, []);

  // Zoom handlers (stable callbacks using updateScale)
  const handleZoomIn = useCallback(() => {
    updateScale((prev) => Math.min(prev + 0.25, 2));
  }, [updateScale]);

  const handleZoomOut = useCallback(() => {
    updateScale((prev) => Math.max(prev - 0.25, 1));
  }, [updateScale]);

  const handleReset = useCallback(() => {
    updateScale(1);
  }, [updateScale]);

  const handleDoubleClick = useCallback(() => {
    updateScale((prev) => (prev > 1 ? 1 : 1.5));
  }, [updateScale]);

  // Reset scale when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setScale(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keep the viewport center focused on the anchor point during scale transitions
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (scale === 1) {
      container.scrollLeft = 0;
      container.scrollTop = 0;
      zoomAnchorRef.current = null;
      return;
    }

    if (!zoomAnchorRef.current) return;
    const { relX, relY } = zoomAnchorRef.current;

    const duration = prefersReducedMotion ? 0 : 250;
    const startTime = performance.now();

    let frameId;
    const updateScroll = (now) => {
      const elapsed = now - startTime;
      
      const { scrollWidth, scrollHeight, clientWidth, clientHeight } = container;
      container.scrollLeft = relX * scrollWidth - clientWidth / 2;
      container.scrollTop = relY * scrollHeight - clientHeight / 2;

      if (elapsed < duration) {
        frameId = requestAnimationFrame(updateScroll);
      }
    };

    frameId = requestAnimationFrame(updateScroll);
    
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [scale, prefersReducedMotion]);

  // Drag-to-scroll panning mouse event handlers
  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    if (e.button !== 0) return; // Only allow left-click drag
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    if (scrollContainerRef.current) {
      scrollStartRef.current = {
        left: scrollContainerRef.current.scrollLeft,
        top: scrollContainerRef.current.scrollTop
      };
    }
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollStartRef.current.left - dx;
      scrollContainerRef.current.scrollTop = scrollStartRef.current.top - dy;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Cursor selector
  const getCursorStyle = () => {
    if (scale <= 1) return 'zoom-in';
    return isDragging ? 'grabbing' : 'grab';
  };

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Handle keyboard hotkeys: Escape, +, -, 0
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0') {
        e.preventDefault();
        handleReset();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleZoomIn, handleZoomOut, handleReset]);

  // Ctrl + Mouse Wheel Zoom
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isOpen, handleZoomIn, handleZoomOut]);

  // Track and return focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);

  // Animations configuration
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.25 } }
  };

  const modalVariants = prefersReducedMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.25 } }
      }
    : {
        hidden: { opacity: 0, scale: 0.96, y: 15 },
        visible: { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          transition: { type: 'spring', damping: 28, stiffness: 260 } 
        },
        exit: { 
          opacity: 0, 
          scale: 0.97, 
          y: 10, 
          transition: { duration: 0.2 } 
        }
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="wine-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={altText}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="wine-modal-content"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              ref={closeButtonRef}
              className="wine-modal-close-btn"
              onClick={onClose}
              aria-label={`Закрыть: ${altText}`}
            >
              <X size={20} />
            </button>

            {/* Wine Card Image Container */}
            <div 
              ref={scrollContainerRef}
              className="wine-card-image-scroll-wrapper"
              style={{
                cursor: getCursorStyle(),
                userSelect: scale > 1 ? 'none' : 'auto',
                display: scale > 1 ? 'block' : 'flex'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="wine-card-image-container"
                style={{
                  display: scale > 1 ? 'block' : 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: scale > 1 ? 'auto' : '100%',
                  height: scale > 1 ? 'auto' : '100%',
                  minHeight: '100%',
                  minWidth: scale > 1 ? 'none' : '100%'
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt={altText}
                  className="wine-card-image"
                  draggable="false"
                  onLoad={handleImageLoad}
                  onDoubleClick={handleDoubleClick}
                  style={{ 
                    width: scale > 1 && baseSize ? `${baseSize.width * scale}px` : 'auto',
                    height: scale > 1 && baseSize ? `${baseSize.height * scale}px` : 'auto',
                    maxWidth: scale > 1 ? 'none' : '100%',
                    maxHeight: scale > 1 ? 'none' : '100%',
                    objectFit: 'contain',
                    transition: prefersReducedMotion ? 'none' : 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), height 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
            </div>

            {/* Zoom Control Panel */}
            <div className="wine-modal-zoom-controls" onClick={(e) => e.stopPropagation()}>
              <button
                className="zoom-btn"
                onClick={handleZoomOut}
                disabled={scale <= 1}
                aria-label="Уменьшить масштаб"
                title="Уменьшить (клавиша -)"
              >
                <ZoomOut size={16} />
              </button>
              <span className="zoom-value">{Math.round(scale * 100)}%</span>
              <button
                className="zoom-btn"
                onClick={handleZoomIn}
                disabled={scale >= 2}
                aria-label="Увеличить масштаб"
                title="Увеличить (клавиша +)"
              >
                <ZoomIn size={16} />
              </button>
              <button
                className="zoom-reset-btn"
                onClick={handleReset}
                disabled={scale === 1}
                aria-label="Сбросить масштаб"
                title="Сбросить (клавиша 0)"
              >
                <RotateCcw size={14} style={{ marginRight: '6px' }} />
                Сбросить
              </button>
            </div>

            {/* Legal Notice */}
            <div className="wine-modal-legal-notice">
              Информация представлена для ознакомления с ассортиментом ресторана. Актуальное наличие уточняйте у официанта. 18+
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WineCardModal;
