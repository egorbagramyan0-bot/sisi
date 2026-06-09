import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Clock, 
  X, 
  ChevronRight, 
  Play, 
  Pause,
  ArrowUp
} from 'lucide-react';
import BookingModal from './BookingModal';
import WineCardModal from './WineCardModal';
import MobileMenu from './MobileMenu';
import { LOGO_PATHS } from './LogoPaths';
import { MENU_DATA } from './MenuData';
import { RESTAURANT_INFO } from './RestaurantInfo';
import { 
  GreenRibbon, 
  TerracottaHeart, 
  OliveBranch, 
  FarfallePasta, 
  RavioliPasta, 
  PennePasta, 
  RotellePasta 
} from './SvgIcons';

import { fetchMenuData, getCachedMenu } from './menuService';

const HERO_VIDEOS = [
  {
    id: 'left',
    videoUrl: '/s1.mp4',
    slotClass: 'left-slot'
  },
  {
    id: 'middle',
    videoUrl: '/s2.mp4',
    slotClass: 'middle-slot'
  },
  {
    id: 'right',
    videoUrl: '/s3.mp4',
    slotClass: 'right-slot'
  }
];

const FacadeWindow = ({ videoUrl, slotClass, onClick, videoRef, onCanPlay }) => {
  return (
    <div 
      className={`facade-video-slot ${slotClass}`} 
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <video 
        ref={videoRef}
        src={videoUrl} 
        loop 
        muted 
        playsInline 
        onCanPlay={onCanPlay}
      />
      <div className="window-glass-overlay" />
    </div>
  );
};



const MenuCardImage = ({ src, alt, categoryId }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="menu-card-placeholder">
        <div className="placeholder-decor">
          {(categoryId === 'pasta') && <FarfallePasta width={32} height={25} />}
          {(categoryId === 'pizza' || categoryId === 'roman-pizza') && <RotellePasta width={32} height={32} />}
          {(categoryId === 'desserts') && <TerracottaHeart width={28} height={28} />}
          {(categoryId === 'salads') && <OliveBranch width={30} height={30} />}
          {(categoryId === 'snacks' || categoryId === 'appetizers') && <OliveBranch width={30} height={30} />}
          {(categoryId === 'soups') && <RavioliPasta width={32} height={32} />}
          {(categoryId === 'main-dishes' || categoryId === 'main-courses') && <PennePasta width={36} height={16} />}
          {(categoryId === 'ice-cream') && <RotellePasta width={30} height={30} />}
        </div>
        <span className="placeholder-text">Фото блюда</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className="menu-card-image"
      loading="lazy" 
      onError={() => setHasError(true)}
    />
  );
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const pastaItems = [
  {
    id: "farfalle",
    Component: FarfallePasta,
    size: 54,
    startX: 110,
    startY: 40,
    initialVX: 0.16,
    initialVY: 0.11,
    rotationSpeed: 0.035,
  },
  {
    id: "wheel",
    Component: RotellePasta,
    size: 56,
    startX: 320,
    startY: 70,
    initialVX: -0.12,
    initialVY: 0.14,
    rotationSpeed: -0.03,
  },
  {
    id: "ravioli",
    Component: RavioliPasta,
    size: 58,
    startX: 95,
    startY: 330,
    initialVX: 0.14,
    initialVY: -0.1,
    rotationSpeed: 0.025,
  },
  {
    id: "rigatoni",
    Component: PennePasta,
    size: 62,
    startX: 330,
    startY: 290,
    initialVX: -0.13,
    initialVY: -0.12,
    rotationSpeed: -0.028,
  },
];

export function InteractivePastaField({ onNavigate }) {
  const fieldRef = useRef(null);
  const itemRefs = useRef(new Map());
  const stateRef = useRef(new Map());
  const frameRef = useRef(null);
  const lastFrameRef = useRef(performance.now());
  
  const ringRef = useRef(null);
  const ringRotationRef = useRef(0);
  const ringSpeedRef = useRef(13.846); // initial speed (26s per rotation)
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      ringSpeedRef.current = 0;
    }

    pastaItems.forEach((item) => {
      stateRef.current.set(item.id, {
        x: item.startX,
        y: item.startY,
        vx: prefersReducedMotion ? 0 : item.initialVX,
        vy: prefersReducedMotion ? 0 : item.initialVY,
        rotation: 0,
        rotationSpeed: prefersReducedMotion ? 0 : item.rotationSpeed,
        dragging: false,
        pointerId: null,
        previousPointerX: 0,
        previousPointerY: 0,
        previousPointerTime: 0,
        dragVX: 0,
        dragVY: 0,
      });
    });

    const animate = (time) => {
      const field = fieldRef.current;
      if (!field) return;

      const rect = field.getBoundingClientRect();
      const delta = Math.min((time - lastFrameRef.current) / 16.67, 2);
      lastFrameRef.current = time;

      // Update ring rotation smoothly without keyframe jumps
      const targetSpeed = prefersReducedMotion ? 0 : (isHoveredRef.current ? 21.176 : 13.846); // hover is 17s per rotation
      const lerpFactor = Math.min(0.08 * delta, 1);
      ringSpeedRef.current += (targetSpeed - ringSpeedRef.current) * lerpFactor;

      const elapsedSeconds = (delta * 16.67) / 1000;
      ringRotationRef.current = (ringRotationRef.current + ringSpeedRef.current * elapsedSeconds) % 360;

      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${ringRotationRef.current}deg)`;
      }

      pastaItems.forEach((item) => {
        const state = stateRef.current.get(item.id);
        const el = itemRefs.current.get(item.id);

        if (!state || !el) return;

        if (!state.dragging) {
          if (prefersReducedMotion) {
            state.vx = 0;
            state.vy = 0;
            state.rotationSpeed = 0;
          } else {
            const ambientStrength = 0.0025;

            state.vx += Math.sin(time * 0.0007 + item.startX) * ambientStrength;
            state.vy += Math.cos(time * 0.0008 + item.startY) * ambientStrength;

            state.x += state.vx * delta;
            state.y += state.vy * delta;

            state.rotation += state.rotationSpeed * delta;

            const maxX = rect.width - item.size;
            const maxY = rect.height - item.size;

            if (state.x <= 0) {
              state.x = 0;
              state.vx = Math.abs(state.vx) * 0.78;
            }

            if (state.x >= maxX) {
              state.x = maxX;
              state.vx = -Math.abs(state.vx) * 0.78;
            }

            if (state.y <= 0) {
              state.y = 0;
              state.vy = Math.abs(state.vy) * 0.78;
            }

            if (state.y >= maxY) {
              state.y = maxY;
              state.vy = -Math.abs(state.vy) * 0.78;
            }

            const friction = 0.994;
            state.vx *= friction;
            state.vy *= friction;

            const minAmbientSpeed = 0.055;

            if (Math.abs(state.vx) < minAmbientSpeed) {
              state.vx += item.initialVX * 0.006;
            }

            if (Math.abs(state.vy) < minAmbientSpeed) {
              state.vy += item.initialVY * 0.006;
            }

            const maxVelocity = 8;
            state.vx = clamp(state.vx, -maxVelocity, maxVelocity);
            state.vy = clamp(state.vy, -maxVelocity, maxVelocity);
          }
        }

        el.style.transform = `
          translate3d(${state.x}px, ${state.y}px, 0)
          rotate(${state.rotation}deg)
        `;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handlePointerDown = (event, item) => {
    const field = fieldRef.current;
    const el = itemRefs.current.get(item.id);
    const state = stateRef.current.get(item.id);

    if (!field || !el || !state) return;

    event.preventDefault();
    event.stopPropagation();

    el.setPointerCapture(event.pointerId);

    state.dragging = true;
    state.pointerId = event.pointerId;
    state.previousPointerX = event.clientX;
    state.previousPointerY = event.clientY;
    state.previousPointerTime = performance.now();
    state.dragVX = 0;
    state.dragVY = 0;
  };

  const handlePointerMove = (event, item) => {
    const field = fieldRef.current;
    const state = stateRef.current.get(item.id);

    if (!field || !state || !state.dragging) return;

    const now = performance.now();
    const deltaTime = Math.max(now - state.previousPointerTime, 1);
    const dx = event.clientX - state.previousPointerX;
    const dy = event.clientY - state.previousPointerY;

    const rect = field.getBoundingClientRect();
    const maxX = rect.width - item.size;
    const maxY = rect.height - item.size;

    state.x = clamp(state.x + dx, 0, maxX);
    state.y = clamp(state.y + dy, 0, maxY);

    const velocityMultiplier = 16.67 / deltaTime;

    state.dragVX = dx * velocityMultiplier;
    state.dragVY = dy * velocityMultiplier;

    state.previousPointerX = event.clientX;
    state.previousPointerY = event.clientY;
    state.previousPointerTime = now;
  };

  const handlePointerUp = (event, item) => {
    const el = itemRefs.current.get(item.id);
    const state = stateRef.current.get(item.id);

    if (!el || !state) return;

    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }

    state.dragging = false;
    state.pointerId = null;

    const maxThrowVelocity = 7;

    state.vx = clamp(state.dragVX, -maxThrowVelocity, maxThrowVelocity);
    state.vy = clamp(state.dragVY, -maxThrowVelocity, maxThrowVelocity);
  };

  return (
    <div ref={fieldRef} className="interactive-pasta-field">
      {pastaItems.map((item) => {
        const PastaComponent = item.Component;
        return (
          <div
            key={item.id}
            ref={(node) => {
              if (node) itemRefs.current.set(item.id, node);
            }}
            draggable="false"
            className="interactive-pasta-item"
            style={{
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
            onPointerDown={(event) => handlePointerDown(event, item)}
            onPointerMove={(event) => handlePointerMove(event, item)}
            onPointerUp={(event) => handlePointerUp(event, item)}
            onPointerCancel={(event) => handlePointerUp(event, item)}
          >
            <PastaComponent width={item.size} height={item.size} />
          </div>
        );
      })}

      <a 
        href="/menu" 
        onClick={(e) => onNavigate(e, '/menu')} 
        className="interactive-pasta-menu-link"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
        <span className="interactive-pasta-ring">
          <img
            ref={ringRef}
            src="/cafe_sisi_spaghetti_ring.svg"
            alt=""
            aria-hidden="true"
            draggable="false"
            className="interactive-pasta-ring-image"
          />
          <span className="interactive-pasta-ring-label">СМОТРЕТЬ МЕНЮ</span>
        </span>
      </a>
    </div>
  );
}

function App() {
  const [showPreloader, setShowPreloader] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('sisi-preloader-shown');
    }
    return false;
  });
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });
  const [activeMenuCategory, setActiveMenuCategory] = useState('snacks');
  const [menuData, setMenuData] = useState(() => {
    const cached = getCachedMenu();
    if (cached) {
      return cached;
    }
    return MENU_DATA;
  });
  const [isFetching, setIsFetching] = useState(false);
  const [navbarHeight, setNavbarHeight] = useState(58);
  const [categoriesBarHeight, setCategoriesBarHeight] = useState(65);
  const [indicatorStyle, setIndicatorStyle] = useState({ transform: 'translate3d(0px, 0px, 0)', width: '0px', height: '0px', opacity: 0 });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [wineCardOpen, setWineCardOpen] = useState(false);
  const [breakfastOpen, setBreakfastOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(null); // null | 0 | 1 | 2
  const [videoModalError, setVideoModalError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [videoLoadedStates, setVideoLoadedStates] = useState({ left: false, middle: false, right: false });
  const [minTimePassed, setMinTimePassed] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('sisi-preloader-shown');
    }
    return true;
  });
  const [watchdogTriggered, setWatchdogTriggered] = useState(false);

  const leftVideoRef = useRef(null);
  const middleVideoRef = useRef(null);
  const rightVideoRef = useRef(null);

  const handleVideoCanPlay = (slot) => {
    setVideoLoadedStates((prev) => ({ ...prev, [slot]: true }));
    const ref = slot === 'left' ? leftVideoRef : slot === 'middle' ? middleVideoRef : rightVideoRef;
    if (ref.current) {
      ref.current.playbackRate = 0.9;
      if (!showPreloader && activeVideoIndex === null) {
        ref.current.play().catch(err => console.log(`${slot} video play on canplay failed`, err));
      }
    }
  };

  const spaghettiRingRef = useRef(null);
  const isRingHovered = useRef(false);
  const categoriesBarRef = useRef(null);
  const categoriesBarWrapperRef = useRef(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const navbarHeightRef = useRef(58);
  const categoriesBarHeightRef = useRef(65);
  const isFirstRef = useRef(true);

  useEffect(() => {
    if (currentPath === '/menu') {
      isFirstRef.current = true;
    }
  }, [currentPath]);

  // Smooth continuous rotation loop for Spaghetti Ring visual with speed transitions
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || currentPath !== '/') {
      return;
    }

    let animationFrameId;
    let lastTime = performance.now();
    let rotationAngle = 0;
    let currentSpeed = 13.846; // Initial speed: 26s per turn => 13.846 deg/s

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // target speed: 26s per turn => 13.846 deg/s, 12s per turn => 30 deg/s
      const targetSpeed = isRingHovered.current ? 30.0 : 13.846;

      // Interpolate speed smoothly (lerp)
      const speedDiff = targetSpeed - currentSpeed;
      currentSpeed += speedDiff * Math.min(1, 3.0 * delta);

      // Increment angle
      rotationAngle = (rotationAngle + currentSpeed * delta) % 360;

      if (spaghettiRingRef.current) {
        spaghettiRingRef.current.style.transform = `rotate(${rotationAngle}deg)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentPath]);

  // Sync route title & meta
  useEffect(() => {
    if (currentPath === '/menu') {
      document.title = "Меню | Cafe Sisi Italy";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Изысканное цифровое меню ресторана Cafe Sisi. Попробуйте нашу домашнюю пасту ручной работы, традиционную римскую пиццу и фирменные итальянские десерты.');
      }

    } else {
      document.title = "Cafe Sisi | Итальянский ресторан в Ростове-на-Дону";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Ресторан итальянской кухни Cafe Sisi. Традиционные рецепты, свежая домашняя паста и уютная атмосфера Тосканы.');
      }
    }
  }, [currentPath]);

  // popstate navigation listener
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch Directus menu data with fallback to local MENU_DATA using menuService
  useEffect(() => {
    if (currentPath !== '/menu') return;

    let isMounted = true;
    setIsFetching(true);

    const loadMenu = async () => {
      try {
        const data = await fetchMenuData();
        if (isMounted) {
          setMenuData(data);
        }
      } catch (err) {
        console.error('[Directus Connection Diagnostics] Unexpected loading error:', err);
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    loadMenu();

    return () => {
      isMounted = false;
    };
  }, [currentPath]);


  // Sync activeMenuCategory if current is not in menuData (e.g. snacks -> appetizers)
  useEffect(() => {
    if (menuData.length > 0) {
      const hasActive = menuData.some(cat => cat.id === activeMenuCategory);
      if (!hasActive) {
        setActiveMenuCategory(menuData[0].id);
      }
    }
  }, [menuData, activeMenuCategory]);

  // Lock mobile hero height to prevent layout jumps/zoom on scroll
  useEffect(() => {
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const adjustHeroHeight = () => {
      if (typeof window === 'undefined' || window.innerWidth > 768) return;
      const hero = document.querySelector('.hero-mobile-section');
      if (hero) {
        hero.style.height = `${window.innerHeight}px`;
      }
    };

    adjustHeroHeight();

    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        adjustHeroHeight();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentPath]);

  const handleNavClick = (e, target) => {
    if (e) e.preventDefault();
    
    const wasMenuOpen = mobileMenuOpen;
    setMobileMenuOpen(false);
    
    const action = () => {
      // Parse target path and hash
      const targetPath = target.startsWith('/#') ? '/' : target;
      const hash = target.startsWith('/#') ? target.split('#')[1] : null;

      if (targetPath === currentPath) {
        if (hash) {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }

      // Trigger page transition loading overlay
      setIsTransitioning(true);
      
      // Wait for the overlay to fully fade in (500ms)
      setTimeout(() => {
        window.history.pushState({}, '', targetPath);
        setCurrentPath(targetPath);
        
        if (hash) {
          // scroll instantly to section under the cover
          setTimeout(() => {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: 'auto' });
          }, 50);
        } else {
          window.scrollTo(0, 0);
        }
      }, 500);

      // Fade out overlay after transition finishes (1200ms)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1200);
    };

    if (wasMenuOpen) {
      setTimeout(action, 450);
    } else {
      action();
    }
  };

  // 1. Minimum preloader typewriter display threshold
  useEffect(() => {
    if (!showPreloader) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 500 : 1600;
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [showPreloader]);

  // 2. Watchdog safety timer (4000ms)
  useEffect(() => {
    if (showPreloader) {
      const timer = setTimeout(() => {
        setWatchdogTriggered(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showPreloader]);

  // 3. Coordination effect to start playback and hide preloader
  useEffect(() => {
    const allLoaded = videoLoadedStates.left && videoLoadedStates.middle && videoLoadedStates.right;
    if (showPreloader && minTimePassed && (allLoaded || watchdogTriggered)) {
      const playPromises = [];
      if (leftVideoRef.current) {
        leftVideoRef.current.playbackRate = 0.9;
        playPromises.push(leftVideoRef.current.play());
      }
      if (middleVideoRef.current) {
        middleVideoRef.current.playbackRate = 0.9;
        playPromises.push(middleVideoRef.current.play());
      }
      if (rightVideoRef.current) {
        rightVideoRef.current.playbackRate = 0.9;
        playPromises.push(rightVideoRef.current.play());
      }

      Promise.all(playPromises.map(p => p.catch(err => console.log('video play error during sync', err))))
        .finally(() => {
          sessionStorage.setItem('sisi-preloader-shown', 'true');
          setShowPreloader(false);
        });
    }
  }, [showPreloader, minTimePassed, videoLoadedStates, watchdogTriggered]);

  // 4. Fallback autostart when returning to homepage without preloader
  useEffect(() => {
    if (currentPath === '/' && !showPreloader && activeVideoIndex === null) {
      if (leftVideoRef.current) {
        leftVideoRef.current.playbackRate = 0.9;
        leftVideoRef.current.play().catch(err => console.log('left video autostart failed', err));
      }
      if (middleVideoRef.current) {
        middleVideoRef.current.playbackRate = 0.9;
        middleVideoRef.current.play().catch(err => console.log('middle video autostart failed', err));
      }
      if (rightVideoRef.current) {
        rightVideoRef.current.playbackRate = 0.9;
        rightVideoRef.current.play().catch(err => console.log('right video autostart failed', err));
      }
    }
  }, [currentPath, showPreloader, activeVideoIndex]);

  useEffect(() => {
    if (showPreloader || isTransitioning || wineCardOpen || breakfastOpen || mobileMenuOpen || activeVideoIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreloader, isTransitioning, wineCardOpen, breakfastOpen, mobileMenuOpen, activeVideoIndex]);

  // Measure heights on mount, resize, and isScrolled change
  useEffect(() => {
    if (currentPath !== '/menu') return;

    const measureHeights = () => {
      const navbar = document.querySelector('.navbar');
      let currentNavbarHeight = 0;
      if (window.innerWidth <= 950 && navbar) {
        currentNavbarHeight = navbar.getBoundingClientRect().bottom;
      }
      setNavbarHeight(currentNavbarHeight);
      navbarHeightRef.current = currentNavbarHeight;

      let currentBarHeight = 65;
      if (categoriesBarWrapperRef.current) {
        currentBarHeight = categoriesBarWrapperRef.current.offsetHeight;
        setCategoriesBarHeight(currentBarHeight);
        categoriesBarHeightRef.current = currentBarHeight;
      }
    };

    measureHeights();
    const timer = setTimeout(measureHeights, 150);

    window.addEventListener('resize', measureHeights);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureHeights);
    };
  }, [currentPath, isScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }

      if (currentPath === '/menu') {
        if (isScrollingRef.current) return;
        const categories = menuData.map(cat => cat.id);
        if (categories.length === 0) return;
        let currentCat = categories[0];
        const offset = navbarHeightRef.current + categoriesBarHeightRef.current;
        const threshold = window.scrollY + offset + 15; // 15px buffer to activate earlier
        
        for (const catId of categories) {
          const el = document.getElementById(catId);
          if (el) {
            if (threshold >= el.offsetTop) {
              currentCat = catId;
            }
          }
        }

        // Highlight the last section if scrolled to the absolute bottom of the page
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 15;
        if (isAtBottom) {
          currentCat = categories[categories.length - 1];
        }

        setActiveMenuCategory((prev) => {
          if (prev !== currentCat) {
            return currentCat;
          }
          return prev;
        });
      } else {
        // ScrollSpy logic to highlight active navbar section
        const sections = ['menu', 'breakfast', 'wine', 'contacts'];
        let currentSection = '';

        for (const sectionId of sections) {
          const el = document.getElementById(sectionId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (window.scrollY >= top - 150 && window.scrollY < top + height - 150) {
              currentSection = sectionId;
              break;
            }
          }
        }
        setActiveSection(currentSection);
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // init on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath]);

  const updateIndicator = useCallback(() => {
    if (currentPath !== '/menu') return;

    const container = categoriesBarRef.current;
    if (!container) return;

    const activePill = container.querySelector('.category-pill.active');
    if (activePill) {
      const left = Math.round(activePill.offsetLeft);
      const width = Math.round(activePill.offsetWidth);
      const height = Math.round(activePill.offsetHeight);
      const top = Math.round(activePill.offsetTop);

      setIndicatorStyle((prev) => {
        const isFirst = isFirstRef.current || !prev.width || prev.width === '0px';
        if (isFirstRef.current) {
          isFirstRef.current = false;
        }
        return {
          transform: `translate3d(${left}px, ${top}px, 0)`,
          width: `${width}px`,
          height: `${height}px`,
          opacity: 1,
          transition: isFirst 
            ? 'none' 
            : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), width 0.4s cubic-bezier(0.16, 1, 0.3, 1), height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        };
      });
    }
  }, [currentPath]);

  const updateIndicatorRef = useRef(updateIndicator);
  useEffect(() => {
    updateIndicatorRef.current = updateIndicator;
  }, [updateIndicator]);

  // Track active indicator position and size dynamically via ResizeObserver (only registered once)
  useEffect(() => {
    if (currentPath !== '/menu') return;

    const container = categoriesBarRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      if (updateIndicatorRef.current) {
        updateIndicatorRef.current();
      }
    });
    resizeObserver.observe(container);

    if (updateIndicatorRef.current) {
      updateIndicatorRef.current();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [currentPath]);

  // Run updateIndicator synchronously on active category change
  useLayoutEffect(() => {
    if (currentPath === '/menu') {
      updateIndicator();
    }
  }, [activeMenuCategory, currentPath, updateIndicator]);

  // Auto-scroll horizontal categories bar to center the active category pill on mobile
  useEffect(() => {
    if (currentPath === '/menu') {
      if (window.innerWidth > 950) return;
      const container = categoriesBarRef.current;
      const activePill = container?.querySelector('.category-pill.active');
      if (container && activePill) {
        const containerWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;
        const pillLeft = activePill.offsetLeft;
        const pillWidth = activePill.clientWidth;
        
        const isVisible = (pillLeft >= scrollLeft + 20) && ((pillLeft + pillWidth) <= scrollLeft + containerWidth - 20);
        
        if (!isVisible) {
          const targetScrollLeft = pillLeft - (containerWidth / 2) + (pillWidth / 2);
          container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [activeMenuCategory, currentPath]);

  // Parallax scroll effect for floating elements
  const { scrollY } = useScroll();
  const yPasta1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const yPasta2 = useTransform(scrollY, [0, 1000], [0, -80]);
  const yPasta3 = useTransform(scrollY, [0, 1000], [0, -220]);
  const yPasta4 = useTransform(scrollY, [0, 1000], [0, -110]);
  // Framer Motion Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };



  const modalVideoRef = useRef(null);

  const handleCloseVideoModal = useCallback(() => {
    if (activeVideoIndex === null) return;

    const modalVideo = modalVideoRef.current;
    const finalTime = modalVideo ? modalVideo.currentTime : 0;

    console.log(`[Video Modal] Closing modal. Window index: ${activeVideoIndex}, source: ${HERO_VIDEOS[activeVideoIndex].videoUrl}, final timestamp: ${finalTime.toFixed(2)}s`);

    if (modalVideo) {
      modalVideo.pause();
    }

    // Sync the background video's currentTime
    const bgRefs = [leftVideoRef, middleVideoRef, rightVideoRef];
    const activeBgRef = bgRefs[activeVideoIndex];
    if (activeBgRef.current) {
      activeBgRef.current.currentTime = finalTime;
    }

    // Resume background videos (ensuring they remain muted)
    const playPromises = [
      leftVideoRef.current?.play(),
      middleVideoRef.current?.play(),
      rightVideoRef.current?.play()
    ];

    Promise.all(playPromises.map(p => p ? p.catch(() => {}) : null)).then(() => {
      console.log('[Video Modal] Background videos resumed successfully.');
    });

    setActiveVideoIndex(null);
  }, [activeVideoIndex]);

  // Sync background video to modal video on open
  useEffect(() => {
    if (activeVideoIndex !== null) {
      setVideoModalError(false);
      const bgRefs = [leftVideoRef, middleVideoRef, rightVideoRef];
      const activeBgRef = bgRefs[activeVideoIndex];
      const bgVideo = activeBgRef.current;
      const initialTime = bgVideo ? bgVideo.currentTime : 0;

      console.log(`[Video Modal] Opened window index: ${activeVideoIndex}, source: ${HERO_VIDEOS[activeVideoIndex].videoUrl}, syncing timestamp: ${initialTime.toFixed(2)}s`);

      // Pause the background videos
      leftVideoRef.current?.pause();
      middleVideoRef.current?.pause();
      rightVideoRef.current?.pause();

      let activeListener = null;
      let activeVideoEl = null;

      const setupModalVideo = (videoEl) => {
        activeVideoEl = videoEl;
        const applyTimeAndPlay = () => {
          try {
            videoEl.currentTime = initialTime;
          } catch (e) {
            console.warn('[Video Modal] Error setting currentTime:', e);
          }
          videoEl.muted = false; // Turn sound on
          videoEl.play()
            .then(() => {
              console.log(`[Video Modal] Video started with sound successfully. Timestamp: ${initialTime.toFixed(2)}s, sound: enabled`);
            })
            .catch(err => {
              console.warn('[Video Modal] Auto-play with sound blocked by browser policy, attempting muted fallback:', err);
              // Fallback to muted autoplay if browser blocks audio
              videoEl.muted = true;
              videoEl.play().catch(playErr => {
                console.error('[Video Modal] Error: Failed to play video even in muted fallback:', playErr);
              });
            });
        };

        if (videoEl.readyState >= 1) {
          applyTimeAndPlay();
        } else {
          activeListener = () => {
            applyTimeAndPlay();
            videoEl.removeEventListener('canplay', activeListener);
            activeListener = null;
          };
          videoEl.addEventListener('canplay', activeListener);
        }
      };

      const modalVideo = modalVideoRef.current;
      let checkRefInterval = null;
      if (modalVideo) {
        setupModalVideo(modalVideo);
      } else {
        checkRefInterval = setInterval(() => {
          if (modalVideoRef.current) {
            clearInterval(checkRefInterval);
            checkRefInterval = null;
            setupModalVideo(modalVideoRef.current);
          }
        }, 30);
      }

      return () => {
        if (checkRefInterval) {
          clearInterval(checkRefInterval);
        }
        if (activeVideoEl && activeListener) {
          activeVideoEl.removeEventListener('canplay', activeListener);
        }
      };
    }
  }, [activeVideoIndex]);

  // Listen for Esc key to close video modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseVideoModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCloseVideoModal]);

  return (
    <>
      <AnimatePresence>
        {(showPreloader || isTransitioning) && (
          <motion.div 
            className={`preloader-overlay ${isTransitioning ? 'transition-loader' : ''}`}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="preloader-logo-wrapper">
              <svg 
                viewBox="0 0 1610 362" 
                className="preloader-logo-svg"
                role="img" 
                aria-label="Cafe Sisi Italy logo"
              >
                <path d={LOGO_PATHS.c} className="preloader-char char-c" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.a} className="preloader-char char-a" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.f} className="preloader-char char-f" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.e} className="preloader-char char-e" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.S} className="preloader-char char-S" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.i1} className="preloader-char char-i1" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.s} className="preloader-char char-s" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.i2} className="preloader-char char-i2" fill="var(--text-dark)" fillRule="evenodd" clipRule="evenodd" />
                <path d={LOGO_PATHS.italy} className="preloader-italy" fill="var(--accent-gold)" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header / Navigation */}
      <div className="sidebar-wrapper">
        <div className="sidebar-sticky-container">
          <motion.nav 
            className={`navbar ${isScrolled || mobileMenuOpen ? 'navbar-scrolled' : 'navbar-transparent'} ${mobileMenuOpen ? 'mobile-menu-active' : ''}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="navbar-container">
              <a href="/" onClick={(e) => handleNavClick(e, '/')} className="logo-container">
                <img src="/cafe_sisi_logo_transparent.svg" className="logo-svg" alt="Cafe Sisi Italy" />
              </a>

              {/* Desktop Links */}
              <div className="nav-links">
                <a href="/menu" onClick={(e) => handleNavClick(e, '/menu')} className={`nav-link ${currentPath === '/menu' ? 'active' : ''}`}>
                  <span className="nav-link-num">01</span>
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="Меню">Меню</span>
                  </span>
                </a>
                <a href="#breakfast" onClick={(e) => { e.preventDefault(); setBreakfastOpen(true); }} className={`nav-link ${activeSection === 'breakfast' && currentPath !== '/menu' ? 'active' : ''}`}>
                  <span className="nav-link-num">02</span>
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="Завтраки">Завтраки</span>
                  </span>
                </a>
                 <a href="#wine" onClick={(e) => { e.preventDefault(); setWineCardOpen(true); }} className={`nav-link ${activeSection === 'wine' && currentPath !== '/menu' ? 'active' : ''}`}>
                  <span className="nav-link-num">03</span>
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="Винная карта">Винная карта</span>
                  </span>
                </a>
                <a href="#contacts" onClick={(e) => handleNavClick(e, '/#contacts')} className={`nav-link ${activeSection === 'contacts' && currentPath !== '/menu' ? 'active' : ''}`}>
                  <span className="nav-link-num">04</span>
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="Контакты">Контакты</span>
                  </span>
                </a>
                <a 
                  href="#" 
                  onClick={(e) => e.preventDefault()}
                  target="_blank" 
                  rel="noreferrer" 
                  className="nav-link nav-link-delivery"
                >
                  <img src="/yandex_food_logo_transparent.webp" className="nav-link-yandex-logo" alt="Yandex.Eda" />
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="Доставка">Доставка</span>
                  </span>
                </a>
              </div>

              <div className="nav-action-wrapper">
                <button 
                  className="btn btn-dark btn-nav" 
                  onClick={() => setBookingOpen(true)}
                >
                  Забронировать стол
                </button>
                
                {/* Mobile Menu Toggle (Staggered Menu) */}
                <MobileMenu
                  currentPath={currentPath}
                  activeSection={activeSection}
                  onNavigate={handleNavClick}
                  onOpenModal={(modalName) => {
                    if (modalName === 'breakfast') setBreakfastOpen(true);
                    if (modalName === 'wine') setWineCardOpen(true);
                    if (modalName === 'booking') setBookingOpen(true);
                  }}
                  onMenuOpen={() => setMobileMenuOpen(true)}
                  onMenuClose={() => setMobileMenuOpen(false)}
                />
              </div>
            </div>
          </motion.nav>
        </div>
      </div>


      {currentPath === '/menu' ? (
        <div className="main-content-layout">
          {isFetching && <div className="menu-sync-indicator" />}
          <div className="menu-page-container">
            {/* Header intro block */}
            <header className="menu-page-header">
              <img src="/cafe_sisi_logo_transparent.svg" className="menu-header-logo-svg" alt="Cafe Sisi Italy Logo" />
              <h1 className="font-display menu-h1">Меню</h1>
              <p className="font-cursive menu-cursive">Cucinare con l’anima</p>
              
              {/* Subtle floating vector pasta items in header */}
              <div className="menu-header-decorations">
                <div className="decor-farfalle animate-float-1"><FarfallePasta width={36} height={28} /></div>
                <div className="decor-ravioli animate-float-3"><RavioliPasta width={32} height={32} /></div>
              </div>
            </header>

            {/* Wrapper container to restrict sticky behavior on mobile/tablet */}
            <div className="menu-sections-wrapper">
              {/* Sticky categories filter bar */}
              <div 
                ref={categoriesBarWrapperRef}
                className="menu-categories-bar-wrapper"
                style={{ top: `${navbarHeight}px` }}
              >
                <div ref={categoriesBarRef} className="menu-categories-bar">
                  {/* Single active indicator for mobile */}
                  <div className="category-active-indicator" style={indicatorStyle} />

                  {menuData.map((category) => (
                    <button
                      key={category.id}
                      className={`category-pill ${activeMenuCategory === category.id ? 'active' : ''}`}
                      onClick={() => {
                        const el = document.getElementById(category.id);
                        if (el) {
                          const offset = navbarHeight + categoriesBarHeight;
                          const topOffset = el.offsetTop - offset;
                          
                          isScrollingRef.current = true;
                          setActiveMenuCategory(category.id);
                          
                          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                          
                          window.scrollTo({ top: topOffset, behavior: 'smooth' });
                          
                          scrollTimeoutRef.current = setTimeout(() => {
                            isScrollingRef.current = false;
                          }, 800);
                        }
                      }}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu List of items */}
              <div className="menu-list-container">
                {menuData.map((category) => (
                  <section key={category.id} id={category.id} className="menu-category-section">
                    <div className="menu-category-header">
                      <h2 className="font-display menu-category-title">
                        <span className="category-marker" style={{ backgroundColor: category.color }} />
                        {category.title}
                      </h2>
                      <div className="category-line" />
                    </div>

                    <div className="menu-items-grid">
                      {category.items.map((item) => {
                        if (item.visible === false) return null;
                        return (
                          <div key={item.id} className="menu-card">
                            {/* Image Wrapper */}
                            <div className="menu-card-image-wrapper">
                              <MenuCardImage 
                                src={item.image} 
                                alt={item.name} 
                                categoryId={category.id} 
                              />
                              
                              {/* Status Tag */}
                              {item.status && (
                                <span className={`menu-card-status status-${item.status}`}>
                                  {item.status === 'hit' && 'Хит'}
                                  {item.status === 'new' && 'Новинка'}
                                  {item.status === 'unavailable' && 'Недоступно'}
                                </span>
                              )}
                            </div>

                            {/* Content Details */}
                            <div className="menu-card-content">
                              <div className="menu-card-title-row">
                                <h4 className="menu-card-name">{item.name}</h4>
                              </div>
                              {item.weight && (
                                <span className="menu-card-weight">{item.weight}</span>
                              )}
                              {item.description && (
                                <p className="menu-card-desc">{item.description}</p>
                              )}
                              <div className="menu-card-price-row">
                                <span className="menu-card-price">{item.price} ₽</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            {/* CTA Booking card */}
            <section className="menu-cta-booking">
              <div className="menu-cta-card">
                <span className="section-label">Резерв столов</span>
                <h3 className="font-display menu-cta-title">Выбрали любимое блюдо?</h3>
                <p className="menu-cta-body">
                  Забронируйте стол и&nbsp;проведите вечер в&nbsp;атмосфере настоящей Италии.
                </p>
                <button className="btn btn-dark" onClick={() => setBookingOpen(true)}>
                  Забронировать стол
                </button>
              </div>
            </section>
          </div>
        </div>
) : (
        <>
          {/* 2. Hero Section - Facade with Live Video Windows */}
          <section className="hero-facade-section">
            <h1 className="sr-only">Cafe Sisi — Итальянский ресторан в Ростове-на-Дону</h1>
            {/* Soft left gradient fade-out for improved readability on desktop */}
            <div className="hero-left-fade-overlay" />

            {/* Facade Image & Overlaid Videos */}
            <div className="facade-image-wrapper">
              <div className="facade-container">
                {/* Embedded Live Video Windows */}
                {HERO_VIDEOS.map((video, idx) => (
                  <FacadeWindow
                    key={video.id}
                    videoUrl={video.videoUrl}
                    slotClass={video.slotClass}
                    onClick={() => setActiveVideoIndex(idx)}
                    videoRef={video.id === 'left' ? leftVideoRef : video.id === 'middle' ? middleVideoRef : rightVideoRef}
                    onCanPlay={() => handleVideoCanPlay(video.id)}
                  />
                ))}

                {/* The main Cafe Sisi facade image */}
                <img src="/hero3.webp" className="facade-bg" alt="Cafe Sisi building facade" />

                {/* View Menu Button aligned under the wall text */}
                <div className="facade-button-slot">
                  <a href="/menu" onClick={(e) => handleNavClick(e, '/menu')} className="btn btn-outline btn-hero-menu">
                    Смотреть меню
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* 2b. Hero Section - Mobile Atmosphere */}
          <section className="hero-mobile-section">
            <motion.div 
              className="hero-mobile-bg"
              initial={{ scale: 1.05, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
            
            <div className="hero-mobile-overlay" />
            
            {/* Centered Logo */}
            <div className="hero-mobile-logo-container">
              <motion.img 
                src="/cafe_sisi_logo_transparent.svg" 
                className="hero-mobile-logo" 
                alt="Cafe Sisi Italy Logo"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {/* Bottom Content Wrapper */}
            <motion.div 
              className="hero-mobile-content"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="hero-mobile-cursive">Da Sisi con amore</span>
              <h1 className="hero-mobile-title">Маленькая Италия<br />в&nbsp;центре города</h1>
              
              <button className="btn hero-mobile-cta" onClick={() => setBookingOpen(true)}>
                ЗАБРОНИРОВАТЬ СТОЛ
              </button>
            </motion.div>
          </section>

          {/* Main Content Layout below Hero */}
          <div className="main-content-layout">
            {/* 3. Our Kitchen Section */}
            <section id="menu" style={{ backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
              <div className="section kitchen-grid" style={{ position: 'relative' }}>
                
                {/* Info Side */}
                <motion.div 
                  className="kitchen-info"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <span className="section-label">Наша кухня</span>
                  <h2 className="section-title">Италия<br />в&nbsp;каждом блюде</h2>
                  <p className="section-body">
                    Мы&nbsp;используем лучшие ингредиенты и&nbsp;готовим с&nbsp;любовью&nbsp;— как&nbsp;в&nbsp;маленьких семейных тратториях на&nbsp;солнечном юге&nbsp;Италии.
                  </p>
                </motion.div>

                {/* Center Space for floating elements (Responsive visual spacer) */}
                {/* Center Space: Rotating Spaghetti Ring Link to Menu */}
                <div className="kitchen-visuals">
                  <InteractivePastaField onNavigate={handleNavClick} />
                </div>

                {/* Bullets Side */}
                <motion.div 
                  className="kitchen-bullets"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={staggerContainer}
                >
                  <motion.div className="bullet-item" variants={fadeInUp}>
                    <span className="bullet-title">Свежая паста</span>
                    <span className="bullet-desc">Ручная работа каждый день по&nbsp;старинным рецептам</span>
                  </motion.div>
                  
                  <motion.div className="bullet-item" variants={fadeInUp}>
                    <span className="bullet-title">Сезонные продукты</span>
                    <span className="bullet-desc">Только лучшее от&nbsp;природы, фермерские сыры и&nbsp;томаты</span>
                  </motion.div>
                  
                  <motion.div className="bullet-item" variants={fadeInUp}>
                    <span className="bullet-title">Традиционные рецепты</span>
                    <span className="bullet-desc">Сохраняем истинный, неискаженный вкус юга&nbsp;Италии</span>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* 4. Highlights Section */}
            <section id="breakfast" style={{ padding: 0 }}>
              <div className="highlights-grid">
                {/* Box 1: Breakfast */}
                <motion.div 
                  className="highlight-box"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                  onClick={() => setBreakfastOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="highlight-content">
                    <span className="section-label">Завтраки</span>
                    <h3 className="section-title" style={{ fontSize: '26px', margin: '8px 0 16px' }}>Начните день<br />по-итальянски</h3>
                    <p className="section-body" style={{ fontSize: '13px', margin: 0 }}>
                      Ароматный свежесваренный эспрессо, хрустящие круассаны и&nbsp;воздушная фриттата, которые подарят вам&nbsp;энергию и&nbsp;солнце Италии.
                    </p>
                  </div>
                  
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
                    <a href="#breakfast" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBreakfastOpen(true); }} className="link-action">
                      Смотреть завтраки <ChevronRight size={14} />
                    </a>
                    <motion.div 
                      whileHover={{ rotate: 5, scale: 1.08 }} 
                      className="highlight-illus"
                    >
                      <GreenRibbon width={95} height={70} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Box 2: Wine List */}
                <motion.div 
                  className="highlight-box"
                  id="wine"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                  onClick={() => setWineCardOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="highlight-content">
                    <span className="section-label">Винная карта</span>
                    <h3 className="section-title" style={{ fontSize: '26px', margin: '8px 0 16px' }}>Подборка<br />лучших вин</h3>
                    <p className="section-body" style={{ fontSize: '13px', margin: 0 }}>
                      Мы&nbsp;собрали коллекцию вин со&nbsp;всех регионов Италии&nbsp;— от&nbsp;легких венецианских пино гриджо до&nbsp;насыщенных пьемонтских бароло.
                    </p>
                  </div>
                  
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '24px' }}>
                    <a href="#wine" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWineCardOpen(true); }} className="link-action">
                      Смотреть карту вин <ChevronRight size={14} />
                    </a>
                    <motion.div 
                      whileHover={{ scale: 1.12, rotate: -5 }} 
                      className="highlight-illus"
                    >
                      <TerracottaHeart width={75} height={75} />
                    </motion.div>
                  </div>
                </motion.div>

                {/* Box 3: Testimonial/Quote */}
                <motion.div 
                  className="quote-box"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={fadeInUp}
                >
                  <span className="quote-mark">“</span>
                  <p className="quote-text">
                    Хорошая еда&nbsp;— это&nbsp;честность. Простые качественные ингредиенты, настоящие влюбленные в&nbsp;свое дело люди и&nbsp;время, которое хочется растянуть.
                  </p>
                  <span className="quote-author">— Команда Cafe Sisi</span>
                </motion.div>
              </div>
            </section>

            {/* 5. About Us Section */}
            <section id="about">
              <div className="section about-grid">
                <motion.div 
                  className="about-info"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <span className="section-label">О нас</span>
                  <h2 className="section-title">Место,<br />где&nbsp;хорошо как&nbsp;дома</h2>
                  <p className="section-body">
                    Каждое утро мы&nbsp;открываем двери Cafe Sisi, чтобы поделиться с&nbsp;вами частичкой нашей любви к&nbsp;Италии. У&nbsp;нас вы&nbsp;найдете теплые улыбки, заботу в&nbsp;каждой детали и&nbsp;гастрономические шедевры. Наша открытая кухня позволяет наблюдать за&nbsp;таинством раскатки пасты и&nbsp;выпекания пиццы.
                  </p>

                </motion.div>

                <motion.div 
                  className="about-photo-wrapper"
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1 }}
                >
                  <img src="/landing_background_x2.webp" className="about-photo" alt="Интерьер траттории" />
                </motion.div>
              </div>
            </section>

            {/* 6. Contact and Booking Section */}
            <section id="contacts" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div className="section booking-section">
                {/* Left Details */}
                <motion.div 
                  className="booking-info"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <span className="section-label">Забронируйте свой стол</span>
                  <h2 className="section-title">Мы&nbsp;ждем вас в&nbsp;гости</h2>
                  
                  <div className="contact-details">
                    <div className="contact-item">
                      <Phone size={18} className="contact-icon" />
                      <span>{RESTAURANT_INFO.phone}</span>
                    </div>
                    
                    <div className="contact-item">
                      <MapPin size={18} className="contact-icon" />
                      <span>{RESTAURANT_INFO.address}</span>
                    </div>
                    
                    <div className="contact-item">
                      <Clock size={18} className="contact-icon" />
                      <span>{RESTAURANT_INFO.hours}</span>
                    </div>
                  </div>

                  <button className="btn btn-dark" onClick={() => setBookingOpen(true)}>
                    Забронировать стол
                  </button>
                </motion.div>

                {/* Right Yandex Map */}
                <motion.div 
                  className="booking-map-wrapper"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="yandex-map-container">
                    <iframe 
                      title="Cafe Sisi Yandex Map"
                      src="https://yandex.ru/map-widget/v1/?ll=39.711635%2C47.218749&z=16&mode=search&text=%D0%A0%D0%BE%D1%81%D1%82%D0%BE%D0%B2-%D0%BD%D0%B0-%D0%94%D0%BE%D0%BD%D1%83%2C%20%D0%A2%D0%B5%D0%BC%D0%B5%D1%80%D0%BD%D0%B8%D1%86%D0%BA%D0%B0%D1%8F%20%D1%83%D0%BB.%2C%2055"
                      className="yandex-map-iframe"
                      allowFullScreen
                    ></iframe>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        </>
      )}

      {/* 7. Footer Bottom Navigation */}
      <footer className="footer-bottom">
        <div className="footer-bottom-container">
          <a href="/" onClick={(e) => handleNavClick(e, '/')} className="logo-container">
            <img src="/cafe_sisi_logo_transparent.svg" className="logo-svg footer-logo-svg" alt="Cafe Sisi Italy" />
          </a>

          <div className="footer-links">
            <a href="/menu" onClick={(e) => handleNavClick(e, '/menu')} className="footer-link">Меню</a>
            <a href="#breakfast" onClick={(e) => { e.preventDefault(); setBreakfastOpen(true); }} className="footer-link">Завтраки</a>
            <a href="#wine" onClick={(e) => { e.preventDefault(); setWineCardOpen(true); }} className="footer-link">Винная карта</a>
            <a href="#contacts" onClick={(e) => handleNavClick(e, '/#contacts')} className="footer-link">Контакты</a>
          </div>

          <div className="footer-socials-wrapper">
            <div className="footer-socials">
              <a href={RESTAURANT_INFO.socials.instagram} onClick={(e) => e.preventDefault()} target="_blank" rel="noreferrer" className="social-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                Instagram
              </a>
              <a href={RESTAURANT_INFO.socials.whatsapp} onClick={(e) => e.preventDefault()} target="_blank" rel="noreferrer" className="social-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                WhatsApp
              </a>
            </div>
            <div className="footer-meta-disclaimer">
              * Instagram и WhatsApp — продукты компании Meta (запрещена в Российской Федерации).
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.4, fontSize: '10px', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
          Сайт создан исключительно в демонстрационных целях.
        </div>
      </footer>

      {/* 8. Booking Form Modal Dialog */}
      <BookingModal 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
      />

      <WineCardModal 
        isOpen={wineCardOpen} 
        onClose={() => setWineCardOpen(false)} 
        imageSrc="/vinecard.webp"
        altText="Винная карта Cafe Sisi"
      />

      <WineCardModal 
        isOpen={breakfastOpen} 
        onClose={() => setBreakfastOpen(false)} 
        imageSrc="/break.webp"
        altText="Меню завтраков Cafe Sisi"
      />

      {/* 9. Enlarged Video Lightbox */}
      <AnimatePresence>
        {activeVideoIndex !== null && (
          <motion.div 
            className="modal-backdrop"
            style={{ zIndex: 300, backgroundColor: 'rgba(15, 12, 10, 0.95)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseVideoModal}
          >
            <motion.div 
              className="video-modal-container"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={handleCloseVideoModal}
                className="video-modal-close-btn"
                aria-label="Закрыть видео"
              >
                <X size={20} />
              </button>

              {videoModalError ? (
                <div className="video-modal-error-state">
                  <span className="error-title">Не удалось загрузить видео</span>
                  <span className="error-desc">Пожалуйста, попробуйте позже или выберите другое окно.</span>
                  <button 
                    onClick={handleCloseVideoModal} 
                    className="btn btn-outline" 
                    style={{ marginTop: '20px', color: '#fff', borderColor: '#fff' }}
                  >
                    Закрыть
                  </button>
                </div>
              ) : (
                <video
                  ref={modalVideoRef}
                  src={HERO_VIDEOS[activeVideoIndex].videoUrl}
                  loop
                  playsInline
                  controls
                  onError={() => {
                    console.error(`[Video Modal] Error loading video: ${HERO_VIDEOS[activeVideoIndex].videoUrl}`);
                    setVideoModalError(true);
                  }}
                  className="video-modal-player"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="scroll-to-top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            aria-label="Наверх"
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
