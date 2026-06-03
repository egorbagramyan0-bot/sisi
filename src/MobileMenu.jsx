import { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { RESTAURANT_INFO } from './RestaurantInfo';

export const MobileMenu = ({
  currentPath,
  activeSection,
  onNavigate,
  onOpenModal,
  menuButtonColor = '#211B18', // Warm charcoal text
  openMenuButtonColor = '#211B18',
  changeMenuColorOnOpen = false,
  colors = ['#8C3B20', '#A58B6F'], // Terracotta, Gold layers
  position = 'right',
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const textWrapRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);

  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);

  // Setup initial offscreen positions for GSAP elements
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      if (!panel || !plusH || !plusV || !icon || !textInner) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen, opacity: 1, visibility: 'hidden' });
      if (preContainer) {
        gsap.set(preContainer, { xPercent: 0, opacity: 1 });
      }
      gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
      gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
      gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(textInner, { yPercent: 0 });
      if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position]);

  const closeMenuInstant = useCallback(() => {
    openRef.current = false;
    setOpen(false);
    busyRef.current = false;
    onMenuClose?.();

    // Kill any active tweens
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    spinTweenRef.current?.kill();
    textCycleAnimRef.current?.kill();
    colorTweenRef.current?.kill();

    // Reset styles instantly
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    const plusH = plusHRef.current;
    const plusV = plusVRef.current;
    const icon = iconRef.current;
    const textInner = textInnerRef.current;

    const offscreen = position === 'left' ? -100 : 100;
    if (panel && layers.length) {
      gsap.set([panel, ...layers], { xPercent: offscreen, visibility: 'hidden' });
      const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
      if (itemEls.length) {
        gsap.set(itemEls, { yPercent: 140, rotate: 10 });
      }
      const ctaBtn = panel.querySelector('.sm-panel-cta');
      if (ctaBtn) gsap.set(ctaBtn, { y: 25, opacity: 0 });
      const footerLogo = panel.querySelector('.sm-panel-footer-logo');
      if (footerLogo) gsap.set(footerLogo, { opacity: 0 });
      const contacts = panel.querySelector('.sm-panel-footer-contacts');
      if (contacts) gsap.set(contacts, { y: 20, opacity: 0 });
    }

    if (plusH && plusV && icon && textInner) {
      gsap.set(plusH, { rotate: 0 });
      gsap.set(plusV, { rotate: 90 });
      gsap.set(icon, { rotate: 0 });
      gsap.set(textInner, { yPercent: 0 });
    }

    setTextLines(['Menu', 'Close']);
    if (toggleBtnRef.current) {
      gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    }
    document.body.style.overflow = '';
  }, [menuButtonColor, position, onMenuClose]);

  // Dynamic layout effect to handle window resize and safety close
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && openRef.current) {
        closeMenuInstant();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMenuInstant]);

  // Build the opening animation timeline
  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const ctaBtn = panel.querySelector('.sm-panel-cta');
    const footerLogo = panel.querySelector('.sm-panel-footer-logo');
    const contacts = panel.querySelector('.sm-panel-footer-contacts');

    const offscreen = position === 'left' ? -100 : 100;

    // Reset elements to offscreen before animating
    gsap.set([panel, ...layers], { xPercent: offscreen });
    if (itemEls.length) {
      gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    }
    if (ctaBtn) {
      gsap.set(ctaBtn, { y: 25, opacity: 0 });
    }
    if (footerLogo) {
      gsap.set(footerLogo, { opacity: 0 });
    }
    if (contacts) {
      gsap.set(contacts, { y: 20, opacity: 0 });
    }

    const tl = gsap.timeline({ paused: true });

    // 1. Prelayers animate first
    layers.forEach((layer, i) => {
      tl.fromTo(layer, { xPercent: offscreen }, { xPercent: 0, duration: 0.45, ease: 'power3.out' }, i * 0.06);
    });

    const lastLayerTime = layers.length ? (layers.length - 1) * 0.06 : 0;
    const panelInsertTime = lastLayerTime + (layers.length ? 0.07 : 0);
    const panelDuration = 0.55;

    // 2. Main panel slides in
    tl.fromTo(
      panel,
      { xPercent: offscreen },
      { xPercent: 0, duration: panelDuration, ease: 'power3.out' },
      panelInsertTime
    );

    // 3. Stagger items and details
    if (itemEls.length) {
      const itemsStart = panelInsertTime + 0.12;
      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.07
        },
        itemsStart
      );
    }

    // 4. CTA and footer links fade and lift in
    const footerStart = panelInsertTime + 0.28;
    if (ctaBtn) {
      tl.to(ctaBtn, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, footerStart);
    }
    if (footerLogo) {
      tl.to(footerLogo, { opacity: 0.85, duration: 0.5, ease: 'power2.out' }, footerStart + 0.08);
    }
    if (contacts) {
      tl.to(contacts, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, footerStart + 0.12);
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    
    // Add scroll lock immediately
    document.body.style.overflow = 'hidden';

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (panel && layers) {
      gsap.set([panel, ...layers], { visibility: 'visible' });
    }

    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback((onCompleteCallback) => {
    busyRef.current = true;
    openTlRef.current?.kill();
    openTlRef.current = null;

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) {
      busyRef.current = false;
      if (onCompleteCallback) onCompleteCallback();
      return;
    }

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.3,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => {
        // Reset sub elements to starting frames
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
        if (itemEls.length) {
          gsap.set(itemEls, { yPercent: 140, rotate: 10 });
        }
        const ctaBtn = panel.querySelector('.sm-panel-cta');
        if (ctaBtn) gsap.set(ctaBtn, { y: 25, opacity: 0 });
        const footerLogo = panel.querySelector('.sm-panel-footer-logo');
        if (footerLogo) gsap.set(footerLogo, { opacity: 0 });
        const contacts = panel.querySelector('.sm-panel-footer-contacts');
        if (contacts) gsap.set(contacts, { y: 20, opacity: 0 });

        gsap.set(all, { visibility: 'hidden' });
        // Release scroll lock
        document.body.style.overflow = '';
        busyRef.current = false;
        if (onCompleteCallback) onCompleteCallback();
      }
    });
  }, [position]);

  const animateIcon = useCallback(opening => {
    const icon = iconRef.current;
    if (!icon) return;
    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.to(icon, { rotate: 225, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
    } else {
      spinTweenRef.current = gsap.to(icon, { rotate: 0, duration: 0.3, ease: 'power2.inOut', overwrite: 'auto' });
    }
  }, []);

  const animateColor = useCallback(
    opening => {
      const btn = toggleBtnRef.current;
      if (!btn) return;
      colorTweenRef.current?.kill();
      if (changeMenuColorOnOpen) {
        const targetColor = opening ? openMenuButtonColor : menuButtonColor;
        colorTweenRef.current = gsap.to(btn, {
          color: targetColor,
          delay: 0.1,
          duration: 0.25,
          ease: 'power2.out'
        });
      } else {
        gsap.set(btn, { color: menuButtonColor });
      }
    },
    [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen]
  );

  const animateText = useCallback(opening => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const currentLabel = opening ? 'Menu' : 'Close';
    const targetLabel = opening ? 'Close' : 'Menu';
    const cycles = 3;
    const seq = [currentLabel];
    let last = currentLabel;
    for (let i = 0; i < cycles; i++) {
      last = last === 'Menu' ? 'Close' : 'Menu';
      seq.push(last);
    }
    if (last !== targetLabel) seq.push(targetLabel);
    seq.push(targetLabel);
    setTextLines(seq);

    gsap.set(inner, { yPercent: 0 });
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.45 + lineCount * 0.05,
      ease: 'power3.out'
    });
  }, []);

  const toggleMenu = useCallback(() => {
    if (busyRef.current) return;
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    animateIcon(target);
    animateColor(target);
    animateText(target);
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose]);

  const closeMenu = useCallback((onCompleteCallback) => {
    if (openRef.current) {
      openRef.current = false;
      setOpen(false);
      onMenuClose?.();
      playClose(onCompleteCallback);
      animateIcon(false);
      animateColor(false);
      animateText(false);
    } else {
      if (onCompleteCallback) onCompleteCallback();
    }
  }, [playClose, animateIcon, animateColor, animateText, onMenuClose]);

  // Close when pressing ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && openRef.current) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeMenu]);

  // Click away listener to close menu
  useEffect(() => {
    if (!closeOnClickAway || !open) return;

    const handleClickOutside = event => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closeOnClickAway, open, closeMenu]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Handle action click (close menu first, then execute)
  const handleItemClick = (e, actionType, target) => {
    e.preventDefault();
    if (busyRef.current) return;
    
    closeMenu(() => {
      if (actionType === 'navigate') {
        onNavigate(e, target);
      } else if (actionType === 'modal') {
        onOpenModal(target);
      }
    });
  };

  const navItems = [
    { id: 'menu', num: '01', label: 'Меню', action: 'navigate', target: '/menu' },
    { id: 'breakfast', num: '02', label: 'Завтраки', action: 'modal', target: 'breakfast' },
    { id: 'wine', num: '03', label: 'Винная карта', action: 'modal', target: 'wine' },
    { id: 'about', num: '04', label: 'О нас', action: 'navigate', target: '/about' },
    { id: 'contacts', num: '05', label: 'Контакты', action: 'navigate', target: '/#contacts' }
  ];

  return (
    <div
      className="staggered-menu-wrapper"
      data-position={position}
      data-open={open || undefined}
    >
      <button
        ref={toggleBtnRef}
        className="sm-toggle"
        aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        onClick={toggleMenu}
        type="button"
      >
        <span ref={textWrapRef} className="sm-toggle-textWrap" aria-hidden="true">
          <span ref={textInnerRef} className="sm-toggle-textInner">
            {textLines.map((l, i) => (
              <span className="sm-toggle-line" key={i}>
                {l}
              </span>
            ))}
          </span>
        </span>
        <span ref={iconRef} className="sm-icon" aria-hidden="true">
          <span ref={plusHRef} className="sm-icon-line" />
          <span ref={plusVRef} className="sm-icon-line sm-icon-line-v" />
        </span>
      </button>

      {createPortal(
        <>
          <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
            {colors.map((c, i) => (
              <div key={i} className="sm-prelayer" style={{ background: c }} />
            ))}
          </div>

          <aside id="staggered-menu-panel" ref={panelRef} className="staggered-menu-panel" aria-hidden={!open}>
            <div className="sm-panel-inner">
              <ul className="sm-panel-list" role="list">
                {navItems.map((it) => {
                  const isActive = it.id === 'menu'
                    ? currentPath === '/menu'
                    : (it.id === 'about' ? currentPath === '/about' : (activeSection === it.id && currentPath !== '/menu' && currentPath !== '/about'));

                  return (
                    <li className="sm-panel-itemWrap" key={it.id}>
                      <a
                        className={`sm-panel-item ${isActive ? 'active' : ''}`}
                        href={it.target}
                        onClick={(e) => handleItemClick(e, it.action, it.target)}
                        aria-label={it.label}
                      >
                        <span className="sm-panel-itemLabel">
                          <span className="sm-panel-item-num">{it.num}</span>
                          {it.label}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>

              <button
                className="btn btn-dark sm-panel-cta"
                onClick={(e) => handleItemClick(e, 'modal', 'booking')}
              >
                ЗАБРОНИРОВАТЬ СТОЛ
              </button>

              <div className="sm-panel-footer">
                <img
                  src="/cafe_sisi_logo_transparent.svg"
                  className="sm-panel-footer-logo"
                  alt="Cafe Sisi Italy Logo"
                />
                <div className="sm-panel-footer-contacts">
                  <p className="sm-panel-address">Темерницкая ул., 55</p>
                  <a href="tel:+79614365680" className="sm-panel-phone">+7 (961) 436-56-80</a>
                  
                  <div className="sm-panel-socials-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="sm-panel-socials">
                      <a href={RESTAURANT_INFO.socials.instagram} target="_blank" rel="noreferrer" className="sm-panel-social-link">
                        Instagram
                      </a>
                      <a href={RESTAURANT_INFO.socials.whatsapp} target="_blank" rel="noreferrer" className="sm-panel-social-link">
                        WhatsApp
                      </a>
                    </div>
                    <p style={{ fontSize: '8px', opacity: 0.45, color: '#211B18', margin: '4px 0 0', lineHeight: '1.3', letterSpacing: '0.01em' }}>
                      * Instagram и WhatsApp — продукты компании Meta (запрещена в РФ)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>,
        document.body
      )}
    </div>
  );
};

export default MobileMenu;
