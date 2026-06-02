import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Plus, 
  X, 
  ChevronRight, 
  Play, 
  Pause,
  ArrowUp
} from 'lucide-react';
import BookingModal from './BookingModal';
import WineCardModal from './WineCardModal';
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

const AboutImage = ({ src, alt, className, label }) => {
  const [hasError, setHasError] = useState(false);
  const isPlaceholder = !src || src.includes('placeholder') || src.includes('vladimir_path') || src.includes('crew_photo');

  if (isPlaceholder || hasError) {
    return (
      <div className={`about-image-placeholder-frame ${className || ''}`}>
        <div className="about-placeholder-inner">
          <span className="about-placeholder-label">{label || alt}</span>
          <span className="about-placeholder-sub">Ожидание фотоматериала</span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)} 
    />
  );
};

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [wineCardOpen, setWineCardOpen] = useState(false);
  const [breakfastOpen, setBreakfastOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStory, setActiveStory] = useState(null); // null | 0 | 1 | 2
  const [storyPlaying, setStoryPlaying] = useState(true);
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
      if (!showPreloader) {
        ref.current.play().catch(err => console.log(`${slot} video play on canplay failed`, err));
      }
    }
  };

  const spaghettiRingRef = useRef(null);
  const isRingHovered = useRef(false);

  // Smooth continuous rotation loop for Spaghetti Ring visual with speed transitions
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || (currentPath !== '/' && currentPath !== '/about')) {
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
    } else if (currentPath === '/about') {
      document.title = "О Cafe Sisi и Владимире Бектемирове | Итальянское cafe в Ростове-на-Дону";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'История Cafe Sisi - семейного cafe, вдохновленного итальянской кухней. Авторский проект ресторатора и шеф-повара Владимира Бектемирова в центре Ростова-на-Дону.');
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
    const duration = prefersReducedMotion ? 800 : 2100;
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [showPreloader]);

  // 2. Watchdog safety timer (6000ms)
  useEffect(() => {
    if (showPreloader) {
      const timer = setTimeout(() => {
        setWatchdogTriggered(true);
      }, 6000);
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
    if (currentPath === '/' && !showPreloader) {
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
  }, [currentPath, showPreloader]);

  useEffect(() => {
    if (showPreloader || isTransitioning || wineCardOpen || breakfastOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPreloader, isTransitioning, wineCardOpen, breakfastOpen, mobileMenuOpen]);

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
        const categories = ['snacks', 'salads', 'soups', 'pasta', 'pizza', 'main-dishes', 'desserts', 'ice-cream'];
        let currentCat = 'snacks';
        for (const catId of categories) {
          const el = document.getElementById(catId);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            // category bar is sticky, scroll offset can be ~180px
            if (window.scrollY >= top - 190 && window.scrollY < top + height - 190) {
              currentCat = catId;
              break;
            }
          }
        }
        setActiveMenuCategory(currentCat);
      } else {
        // ScrollSpy logic to highlight active navbar section
        const sections = ['menu', 'breakfast', 'wine', 'about', 'contacts'];
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

  // Auto-scroll horizontal categories bar to center the active category pill on mobile
  useEffect(() => {
    if (currentPath === '/menu') {
      const activePill = document.querySelector('.menu-categories-bar .category-pill.active');
      if (activePill) {
        activePill.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
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

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0,
      y: '-100%' 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.45, 
        ease: [0.16, 1, 0.3, 1],
        when: "beforeChildren",
        staggerChildren: 0.07
      }
    },
    exit: { 
      opacity: 0, 
      y: '-100%',
      transition: { 
        duration: 0.4, 
        ease: [0.16, 1, 0.3, 1],
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const mobileMenuItemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 24 
      }
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      transition: { 
        duration: 0.22, 
        ease: 'easeIn' 
      }
    }
  };

  // Arch Data (mock vertical videos for lightbox)
  const archesData = [
    {
      title: 'Свежая Паста',
      desc: 'Наш шеф-повар натирает свежий летний трюфель на домашнюю пасту тальятелле, приготовленную вручную этим утром.',
      img: '/pasta_truffle.webp',
      time: '9:16',
      videoUrl: '#'
    },
    {
      title: 'Винная Культура',
      desc: 'Идеальный бокал тосканского Кьянти Классико раскрывает свой букет в лучах вечернего солнца.',
      img: '/wine_pour.webp',
      time: '9:16',
      videoUrl: '#'
    },
    {
      title: 'Интерьер & Уют',
      desc: 'Свет свечей, мягкие тени и аромат свежевыпеченной фокаччи — атмосфера настоящего итальянского дома.',
      img: '/cozy_interior.webp',
      time: '9:16',
      videoUrl: '#'
    }
  ];

  // Auto-scroll timeline simulator for story viewer
  useEffect(() => {
    let interval;
    if (activeStory !== null && storyPlaying) {
      interval = setInterval(() => {
        setActiveStory((prev) => {
          if (prev === archesData.length - 1) {
            return null; // Close stories after the last one
          }
          return prev + 1;
        });
      }, 5000); // 5 seconds per story
    }
    return () => clearInterval(interval);
  }, [activeStory, storyPlaying, archesData.length]);

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
                <a href="/about" onClick={(e) => handleNavClick(e, '/about')} className={`nav-link ${currentPath === '/about' ? 'active' : ''}`}>
                  <span className="nav-link-num">04</span>
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="О нас">О нас</span>
                  </span>
                </a>
                <a href="#contacts" onClick={(e) => handleNavClick(e, '/#contacts')} className={`nav-link ${activeSection === 'contacts' && currentPath !== '/menu' && currentPath !== '/about' ? 'active' : ''}`}>
                  <span className="nav-link-num">05</span>
                  <span className="nav-link-text-wrapper">
                    <span className="nav-link-text" data-text="Контакты">Контакты</span>
                  </span>
                </a>
                <a 
                  href="https://eda.yandex.ru/r/sisi_bistr?placeSlug=sisi_bistr" 
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
                
                {/* Mobile Menu Toggle */}
                <button 
                  className="mobile-toggle"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Plus size={24} />}
                </button>
              </div>
            </div>
          </motion.nav>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu-drawer"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="mobile-nav-links">
              {[
                { id: 'menu', num: '01', text: 'Меню', target: '/menu' },
                { id: 'breakfast', num: '02', text: 'Завтраки', target: '/#breakfast' },
                { id: 'wine', num: '03', text: 'Винная карта', target: '/#wine' },
                { id: 'about', num: '04', text: 'О нас', target: '/about' },
                { id: 'contacts', num: '05', text: 'Контакты', target: '/#contacts' }
              ].map((item) => {
                const isActive = item.id === 'menu' 
                  ? currentPath === '/menu' 
                  : (item.id === 'about' ? currentPath === '/about' : (activeSection === item.id && currentPath !== '/menu' && currentPath !== '/about'));
                
                return (
                  <motion.a 
                    key={item.id}
                    href={item.target}
                    onClick={(e) => {
                      if (item.id === 'wine') {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setTimeout(() => {
                          setWineCardOpen(true);
                        }, 450);
                      } else if (item.id === 'breakfast') {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        setTimeout(() => {
                          setBreakfastOpen(true);
                        }, 450);
                      } else {
                        handleNavClick(e, item.target);
                      }
                    }}
                    className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    variants={mobileMenuItemVariants}
                  >
                    <span className="mobile-nav-link-num">{item.num}</span>
                    <span>{item.text}</span>
                  </motion.a>
                );
              })}
            </div>

            <div className="mobile-drawer-footer">
              <motion.button 
                className="btn btn-dark mobile-drawer-cta" 
                onClick={() => { 
                  setMobileMenuOpen(false); 
                  setTimeout(() => {
                    setBookingOpen(true);
                  }, 450); 
                }}
                variants={mobileMenuItemVariants}
              >
                Забронировать стол
              </motion.button>
              
              <motion.div className="mobile-drawer-logo-wrap" variants={mobileMenuItemVariants}>
                <img src="/cafe_sisi_logo_transparent.svg" className="mobile-drawer-logo" alt="Cafe Sisi Italy Logo" />
              </motion.div>
              
              <motion.div className="mobile-drawer-contacts" variants={mobileMenuItemVariants}>
                <p className="mobile-contact-address">Темерницкая ул., 55</p>
                <p className="mobile-contact-phone">+7 (961) 436-56-80</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {currentPath === '/menu' ? (
        <div className="main-content-layout">
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

            {/* Sticky categories filter bar */}
            <div className="menu-categories-bar-wrapper">
              <div className="menu-categories-bar">
                {MENU_DATA.map((category) => (
                  <button
                    key={category.id}
                    className={`category-pill ${activeMenuCategory === category.id ? 'active' : ''}`}
                    onClick={() => {
                      const el = document.getElementById(category.id);
                      if (el) {
                        const topOffset = el.offsetTop - 170; // account for sticky categories bar
                        window.scrollTo({ top: topOffset, behavior: 'smooth' });
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
              {MENU_DATA.map((category) => (
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
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="menu-card-image"
                                loading="lazy" 
                              />
                            ) : (
                              <div className="menu-card-placeholder">
                                <div className="placeholder-decor">
                                  {category.id === 'pasta' && <FarfallePasta width={32} height={25} />}
                                  {category.id === 'pizza' && <RotellePasta width={32} height={32} />}
                                  {category.id === 'desserts' && <TerracottaHeart width={28} height={28} />}
                                  {category.id === 'salads' && <OliveBranch width={30} height={30} />}
                                  {category.id === 'snacks' && <OliveBranch width={30} height={30} />}
                                  {category.id === 'soups' && <RavioliPasta width={32} height={32} />}
                                  {category.id === 'main-dishes' && <PennePasta width={36} height={16} />}
                                  {category.id === 'ice-cream' && <RotellePasta width={30} height={30} />}
                                </div>
                                <span className="placeholder-text">Фото блюда</span>
                              </div>
                            )}
                            
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
                            <span className="menu-card-weight">{item.weight}</span>
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

            {/* CTA Booking card */}
            <section className="menu-cta-booking">
              <div className="menu-cta-card">
                <span className="section-label">Резерв столов</span>
                <h3 className="font-display menu-cta-title">Выбрали любимое блюдо?</h3>
                <p className="menu-cta-body">
                  Забронируйте стол и проведите вечер в атмосфере настоящей Италии.
                </p>
                <button className="btn btn-dark" onClick={() => setBookingOpen(true)}>
                  Забронировать стол
                </button>
              </div>
            </section>
          </div>
        </div>
      ) : currentPath === '/about' ? (
        <div className="main-content-layout">
          <div className="about-page-container">
            {/* Section 1: Intro / Vladimir Bektemirov */}
            <section className="about-intro-section">
              <div className="about-intro-grid">
                <div className="about-intro-left">
                  <div className="vladimir-img-wrapper">
                    <AboutImage 
                      src={RESTAURANT_INFO.images.vladimirHero} 
                      alt="Портрет Владимира Бектемирова" 
                      label="Владимир Бектемиров"
                      className="vladimir-hero-img"
                    />
                  </div>
                </div>
                <div className="about-intro-right">
                  <span className="section-label">Шеф-повар и ресторатор</span>
                  <h1 className="font-display about-chef-name">Владимир<br />Бектемиров</h1>
                  <p className="font-serif about-chef-quote">
                    «Для меня еда — это способ выразить заботу, поделиться теплом и рассказать историю о традициях, которые мы бережно храним и переосмысляем с любовью».
                  </p>
                  <div className="about-chef-signature">
                    <span className="font-cursive">con amore, Vladimir</span>
                  </div>
                </div>
              </div>
            </section>


            {/* Section 3: Typographical Quote */}
            <section className="about-quote-section">
              <div className="about-quote-container">
                <span className="quote-mark">“</span>
                <p className="about-quote-text font-serif">
                  Sisi — это маленькая Италия в самом сердце Ростова. Место, где время замедляет свой ход, а простые вещи — свежая паста, бокал вина и улыбка близкого человека — обретают истинную ценность.
                </p>
                <span className="font-cursive about-quote-sig">Da Sisi con amore</span>
              </div>
            </section>

            {/* Section 4: Concept Block */}
            <section className="about-concept-section">
              <div className="about-concept-grid">
                <div className="about-concept-left">
                  <span className="section-label">Концепция</span>
                  <h2 className="section-title">Теплый итальянский минимализм</h2>
                  <p className="section-body">
                    Интерьер Cafe Sisi задуман как продолжение нашей философии: ничего лишнего, только естественная красота и уют. Мы использовали натуральные материалы — дерево, глину, терракоту и лен. Мягкий свет, теплые песочные оттенки и обилие живых растений создают ощущение загородного дома на холмах Тосканы.
                  </p>
                  <span className="font-cursive about-concept-sig">Benvenuti a casa</span>
                </div>
                <div className="about-concept-right">
                  <div className="about-concept-img-wrapper">
                    <AboutImage 
                      src={RESTAURANT_INFO.images.interiorMain} 
                      alt="Интерьер Cafe Sisi" 
                      label="Интерьер траттории"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5: Kitchen Principles (Rotating Spaghetti Ring) */}
            <section className="about-principles-section">
              <div className="about-principles-grid">
                <div className="about-principles-left">
                  <span className="section-label">Принципы</span>
                  <h2 className="section-title">Три столпа нашей кухни</h2>
                  
                  <div className="about-principles-list">
                    <div className="about-principle-item">
                      <h3 className="about-principle-title">01 / Свежая паста</h3>
                      <p className="about-principle-desc">
                        Мы лепим и катаем пасту вручную каждое утро, используя исключительно итальянскую муку из твердых сортов пшеницы Semola и свежие фермерские желтки. Это сердце нашего меню.
                      </p>
                    </div>
                    <div className="about-principle-item">
                      <h3 className="about-principle-title">02 / Сезонные продукты</h3>
                      <p className="about-principle-desc">
                        Меню Cafe Sisi меняется вслед за сезонами. Мы работаем напрямую с местными фермерами и поставщиками, чтобы отбирать только самые спелые томаты, свежую зелень и фермерские сыры.
                      </p>
                    </div>
                    <div className="about-principle-item">
                      <h3 className="about-principle-title">03 / Авторский взгляд</h3>
                      <p className="about-principle-desc">
                        Сохраняя традиционные итальянские рецепты, наш шеф Владимир Бектемиров добавляет в них тонкие авторские акценты, создавая современную классику с ярким вкусом.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="about-principles-right">
                  <div className="about-ring-wrapper">
                    <div 
                      className="spaghetti-ring-container"
                      onMouseEnter={() => { isRingHovered.current = true; }}
                      onMouseLeave={() => { isRingHovered.current = false; }}
                    >
                      <div className="spaghetti-ring-wrapper-inner">
                        <img 
                          ref={spaghettiRingRef}
                          src="/cafe_sisi_spaghetti_ring.svg" 
                          className="spaghetti-ring-image" 
                          alt="Cafe Sisi Spaghetti Ring" 
                        />
                      </div>
                      <div className="spaghetti-ring-center">
                        <a 
                          href="/menu" 
                          onClick={(e) => handleNavClick(e, '/menu')} 
                          className="spaghetti-ring-btn"
                        >
                          СМОТРЕТЬ МЕНЮ
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 6: Location & Cathedral View */}
            <section className="about-location-section">
              <div className="about-location-grid">
                <div className="about-location-left">
                  <span className="section-label">Локация</span>
                  <h2 className="section-title">Вид на собор</h2>
                  <p className="section-body">
                    Наше кафе расположено в историческом сердце Ростова-на-Дону. Из больших арочных окон открывается величественный вид на золотые купола Кафедрального собора Рождества Пресвятой Богородицы. Вечером, когда собор подсвечивается мягким теплым светом, а на столах зажигаются свечи, атмосфера становится по-настоящему волшебной.
                  </p>
                  <span className="font-cursive about-location-sig">La dolce vita, un po' più vicina</span>
                </div>
                <div className="about-location-right">
                  <div className="about-cathedral-gallery">
                    <div className="cathedral-img-main">
                      <AboutImage 
                        src={RESTAURANT_INFO.images.cathedralView} 
                        alt="Вид на собор из окон Cafe Sisi" 
                        label="Вид на Кафедральный собор"
                      />
                    </div>
                    <div className="cathedral-img-sub-grid">
                      <div className="cathedral-img-sub">
                        <AboutImage 
                          src={RESTAURANT_INFO.images.cathedralDetail1} 
                          alt="Детали интерьера" 
                          label="Утренний свет"
                        />
                      </div>
                      <div className="cathedral-img-sub">
                        <AboutImage 
                          src={RESTAURANT_INFO.images.cathedralDetail2} 
                          alt="Собор вечером" 
                          label="Вечерняя подсветка"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 7: Team & Guests */}
            <section className="about-team-section">
              <div className="about-team-container">
                <span className="section-label">Семья Sisi</span>
                <h2 className="section-title text-center">Люди, которые создают магию</h2>
                <p className="section-body text-center max-w-720">
                  Команда Cafe Sisi — это большая семья единомышленников. От поваров на открытой кухне до официантов в зале, каждый из нас влюблен в итальянскую культуру гостеприимства. Мы верим, что вкусная еда раскрывается по-настоящему только тогда, когда она подана с искренней заботой.
                </p>
                <div className="about-team-img-wrapper">
                  <AboutImage 
                    src={RESTAURANT_INFO.images.crewPhoto} 
                    alt="Команда Cafe Sisi" 
                    label="Наша большая семья"
                  />
                </div>
              </div>
            </section>

            {/* Section 8: Other Projects List */}
            <section className="about-projects-section">
              <div className="about-projects-container">
                <span className="section-label">Ресторанная группа</span>
                <h2 className="section-title">Другие проекты Владимира Бектемирова</h2>
                <p className="section-body">
                  Cafe Sisi является частью яркой экосистемы авторских ресторанных проектов, развивающих гастрономическую культуру юга России.
                </p>
                
                <div className="about-projects-grid">
                  <div className="project-card">
                    <h3 className="project-card-title">Лариса жарит</h3>
                    <p className="project-card-desc">Мясной гриль-ресторан с сильным характером, сочными стейками и атмосферой настоящего гастрономического рок-н-ролла.</p>
                  </div>
                  <div className="project-card">
                    <h3 className="project-card-title">Лариса пьет</h3>
                    <p className="project-card-desc">Концептуальный бар с отличным выбором крафтового пива, авторских коктейлей и легкой непринужденной атмосферой.</p>
                  </div>
                  <div className="project-card">
                    <h3 className="project-card-title">Казак</h3>
                    <p className="project-card-desc">Ресторан современной казачьей кухни. Переосмысление локальных донских рецептов в авторском прочтении нашего шеф-повара.</p>
                  </div>
                  <div className="project-card">
                    <h3 className="project-card-title">Яга</h3>
                    <p className="project-card-desc">Сказочное пространство современной русской кухни, вдохновленное фольклором, традиционными техниками печи и локальными продуктами.</p>
                  </div>
                  <div className="project-card">
                    <h3 className="project-card-title">Макарошки</h3>
                    <p className="project-card-desc">Уютный и демократичный формат семейного кафе, где паста и пицца объединяют за одним столом несколько поколений.</p>
                  </div>
                  <div className="project-card">
                    <h3 className="project-card-title">Сорока</h3>
                    <p className="project-card-desc">Локальная спешелти-кофейня с безупречным кофе, свежей ремесленной выпечкой и идеальной атмосферой для начала дня.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 9: Final CTA */}
            <section className="about-cta-booking">
              <div className="about-cta-card">
                <span className="section-label">Benvenuti</span>
                <h2 className="font-display about-cta-title">Ждем вас в гости</h2>
                <p className="about-cta-body">
                  Проведите время с теми, кто вам дорог, в уютной атмосфере Cafe Sisi. Забронируйте столик заранее или ознакомьтесь с меню.
                </p>
                <div className="about-cta-actions">
                  <button className="btn btn-dark" onClick={() => setBookingOpen(true)}>
                    Забронировать стол
                  </button>
                  <a href="/menu" onClick={(e) => handleNavClick(e, '/menu')} className="btn btn-outline">
                    Смотреть меню
                  </a>
                </div>
                <span className="font-cursive about-cta-sig">A presto</span>
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
                    onClick={() => setActiveStory(idx)}
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
              <h1 className="hero-mobile-title">Маленькая Италия<br />в центре города</h1>
              
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
                
                {/* Parallax Floating Pasta Shapes */}
                <motion.div style={{ y: yPasta1, position: 'absolute', top: '10%', left: '42%' }} className="animate-float-1">
                  <FarfallePasta width={48} height={38} />
                </motion.div>
                <motion.div style={{ y: yPasta2, position: 'absolute', bottom: '15%', left: '38%' }} className="animate-float-3">
                  <RavioliPasta width={45} height={45} />
                </motion.div>
                <motion.div style={{ y: yPasta3, position: 'absolute', top: '15%', right: '40%' }} className="animate-float-2">
                  <RotellePasta width={44} height={44} />
                </motion.div>
                <motion.div style={{ y: yPasta4, position: 'absolute', bottom: '25%', right: '45%' }} className="animate-float-4">
                  <PennePasta width={55} height={24} />
                </motion.div>
                
                {/* Info Side */}
                <motion.div 
                  className="kitchen-info"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  variants={fadeInUp}
                >
                  <span className="section-label">Наша кухня</span>
                  <h2 className="section-title">Италия<br />в каждом блюде</h2>
                  <p className="section-body">
                    Мы используем лучшие ингредиенты и готовим с любовью — как в маленьких семейных тратториях на солнечном юге Италии.
                  </p>
                </motion.div>

                {/* Center Space for floating elements (Responsive visual spacer) */}
                {/* Center Space: Rotating Spaghetti Ring Link to Menu */}
                <div className="kitchen-visuals">
                  <div 
                    className="spaghetti-ring-container"
                    onMouseEnter={() => { isRingHovered.current = true; }}
                    onMouseLeave={() => { isRingHovered.current = false; }}
                  >
                    {/* Rotating Ring */}
                    <div className="spaghetti-ring-wrapper">
                      <img 
                        ref={spaghettiRingRef}
                        src="/cafe_sisi_spaghetti_ring.svg" 
                        className="spaghetti-ring-image" 
                        alt="Cafe Sisi Spaghetti Ring" 
                      />
                    </div>
                    
                    {/* Static Center Button */}
                    <div className="spaghetti-ring-center">
                      <a 
                        href="/menu" 
                        onClick={(e) => handleNavClick(e, '/menu')} 
                        className="spaghetti-ring-btn"
                      >
                        СМОТРЕТЬ МЕНЮ
                      </a>
                    </div>
                  </div>
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
                    <span className="bullet-desc">Ручная работа каждый день по старинным рецептам</span>
                  </motion.div>
                  
                  <motion.div className="bullet-item" variants={fadeInUp}>
                    <span className="bullet-title">Сезонные продукты</span>
                    <span className="bullet-desc">Только лучшее от природы, фермерские сыры и томаты</span>
                  </motion.div>
                  
                  <motion.div className="bullet-item" variants={fadeInUp}>
                    <span className="bullet-title">Традиционные рецепты</span>
                    <span className="bullet-desc">Сохраняем истинный, неискаженный вкус юга Италии</span>
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
                      Ароматный свежесваренный эспрессо, хрустящие круассаны и воздушная фриттата, которые подарят вам энергию и солнце Италии.
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
                      Мы собрали коллекцию вин со всех регионов Италии — от легких венецианских пино гриджо до насыщенных пьемонтских бароло.
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
                    Хорошая еда — это честность. Простые качественные ингредиенты, настоящие влюбленные в свое дело люди и время, которое хочется растянуть.
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
                  <h2 className="section-title">Место,<br />где хорошо как дома</h2>
                  <p className="section-body">
                    Каждое утро мы открываем двери Cafe Sisi, чтобы поделиться с вами частичкой нашей любви к Италии. У нас вы найдете теплые улыбки, заботу в каждой детали и гастрономические шедевры. Наша открытая кухня позволяет наблюдать за таинством раскатки пасты и выпекания пиццы.
                  </p>
                  <a href="/about" onClick={(e) => handleNavClick(e, '/about')} className="link-action">
                    Узнать больше о нас <ChevronRight size={14} />
                  </a>
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
                  <h2 className="section-title">Мы ждем вас в гости</h2>
                  
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
            <a href="/about" onClick={(e) => handleNavClick(e, '/about')} className="footer-link">О нас</a>
            <a href="#contacts" onClick={(e) => handleNavClick(e, '/#contacts')} className="footer-link">Контакты</a>
          </div>

          <div className="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              Instagram
            </a>
            <a href="https://t.me" target="_blank" rel="noreferrer" className="social-link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              Telegram
            </a>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px', opacity: 0.4, fontSize: '10px', fontFamily: 'var(--font-body)', letterSpacing: '0.05em' }}>
          &copy; {new Date().getFullYear()} Cafe Sisi Italy. Все права защищены.
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

      {/* 9. Cinematic Story Viewer Lightbox */}
      <AnimatePresence>
        {activeStory !== null && (
          <motion.div 
            className="modal-backdrop"
            style={{ zIndex: 300, backgroundColor: 'rgba(15, 12, 10, 0.95)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveStory(null)}
          >
            <motion.div 
              className="story-container"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setActiveStory(null)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  zIndex: 20
                }}
              >
                <X size={18} />
              </button>

              {/* Progress Bar Header */}
              <div style={{
                position: 'absolute',
                top: '15px',
                left: '20px',
                right: '20px',
                display: 'flex',
                gap: '6px',
                zIndex: 20
              }}>
                {archesData.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '2px', overflow: 'hidden' }}>
                    <motion.div 
                      style={{ 
                        height: '100%', 
                        backgroundColor: '#fff',
                        transformOrigin: 'left'
                      }}
                      initial={{ scaleX: i < activeStory ? 1 : 0 }}
                      animate={{ 
                        scaleX: i === activeStory 
                          ? (storyPlaying ? 1 : 0) 
                          : (i < activeStory ? 1 : 0) 
                      }}
                      transition={{ 
                        duration: i === activeStory ? 5 : 0.2, 
                        ease: 'linear'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Image background (Simulating cinemagraph) */}
              <img 
                src={archesData[activeStory].img} 
                alt={archesData[activeStory].title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Dark overlay gradients */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.85) 100%)',
                zIndex: 10
              }} />

              {/* Video Player Controls & Info (Bottom) */}
              <div className="story-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span className="font-display" style={{ fontSize: '24px', letterSpacing: '0.05em' }}>
                    {archesData[activeStory].title}
                  </span>
                  
                  {/* Play/Pause control toggle */}
                  <button 
                    onClick={() => setStoryPlaying(!storyPlaying)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    {storyPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                </div>
                
                <p className="font-body" style={{ fontSize: '13px', lineHeight: '1.6', opacity: 0.85, fontWeight: '400' }}>
                  {archesData[activeStory].desc}
                </p>
                
                <button 
                  className="btn btn-dark"
                  onClick={() => { setActiveStory(null); setBookingOpen(true); }}
                  style={{ 
                    marginTop: '24px', 
                    width: '100%', 
                    backgroundColor: '#fff', 
                    color: 'var(--text-dark)',
                    border: 'none',
                    fontWeight: '700'
                  }}
                >
                  Забронировать стол
                </button>
              </div>

              {/* Swipe/Click Area for next/prev */}
              <div 
                style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '80%', zIndex: 12, cursor: 'w-resize' }} 
                onClick={() => setActiveStory((prev) => prev > 0 ? prev - 1 : null)}
              />
              <div 
                style={{ position: 'absolute', top: 0, right: 0, width: '70%', height: '80%', zIndex: 12, cursor: 'e-resize' }} 
                onClick={() => setActiveStory((prev) => prev < archesData.length - 1 ? prev + 1 : null)}
              />
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
