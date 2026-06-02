import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';

const SHOWCASE_DATA = [
  {
    id: 'breakfast',
    title: 'Завтраки',
    color: 'var(--accent-green)',
    items: [
      {
        id: 'bf-1',
        name: 'Фриттата с трюфельным кремом и вешенками',
        price: 590,
        weight: '240 гр.',
        description: 'Пышный итальянский омлет со специями, обжаренными вешенками и нежным сливочно-трюфельным соусом.',
        icon: 'egg'
      },
      {
        id: 'bf-2',
        name: 'Бенедикт на теплой бриоши со слабосоленым лососем',
        price: 720,
        weight: '210 гр.',
        description: 'Два фермерских яйца пашот под нежным соусом Голландез на ломтике сливочной бриоши собственной выпечки.',
        icon: 'egg'
      },
      {
        id: 'bf-3',
        name: 'Круассан с кремом маскарпоне и свежими ягодами',
        price: 490,
        weight: '180 гр.',
        description: 'Хрустящий ремесленный круассан, наполненный воздушным кремом из маскарпоне и украшенный свежей ягодой.',
        icon: 'croissant'
      }
    ]
  },
  {
    id: 'pasta',
    title: 'Паста',
    color: 'var(--accent-terracotta)',
    items: [
      {
        id: 'pa-1',
        name: 'Паста с крабом и трюфельным соусом',
        price: 990,
        weight: '290 гр.',
        description: 'Домашняя паста с нежным мясом камчатского краба в ароматном густом соусе на основе трюфельного масла и пармезана.',
        icon: 'pasta'
      },
      {
        id: 'pa-2',
        name: 'Равиоли с кроликом в грибном соусе',
        price: 570,
        weight: '300 гр.',
        description: 'Тонкое яичное тесто с начинкой из томленого фермерского кролика, подается в соусе из лесных шампиньонов и свежего шалфея.',
        icon: 'ravioli'
      },
      {
        id: 'pa-3',
        name: 'Классическая Карбонара с гуанчале',
        price: 670,
        weight: '270 гр.',
        description: 'Традиционный римский рецепт без сливок: домашняя паста, сыровяленые свиные щеки гуанчале, желтки яиц и овечий сыр пекорино романо.',
        icon: 'pasta'
      }
    ]
  },
  {
    id: 'desserts',
    title: 'Десерты',
    color: 'var(--accent-gold)',
    items: [
      {
        id: 'de-1',
        name: 'Фирменный Баскский чизкейк',
        price: 490,
        weight: '200 гр.',
        description: 'Знаменитый «горелый» чизкейк с карамельной корочкой и нежнейшей, тающей кремовой сердцевиной.',
        icon: 'cake'
      },
      {
        id: 'de-2',
        name: 'Панна-котта с облепихой и тыквой',
        price: 490,
        weight: '220 гр.',
        description: 'Нежное сливочное желе из натуральных сливок и стручковой ванили под ярким соусом из спелой облепихи и сладкой тыквы.',
        icon: 'dessert'
      },
      {
        id: 'de-3',
        name: 'Шоколадный фондан с шариком пломбира',
        price: 490,
        weight: '160 гр.',
        description: 'Горячий шоколадный бисквит с жидким центром из темного бельгийского шоколада, подается с шариком ванильного мороженого.',
        icon: 'cake'
      }
    ]
  },
  {
    id: 'wine',
    title: 'Вино и напитки',
    color: 'var(--accent-terracotta)',
    items: [
      {
        id: 'wn-1',
        name: 'Кьянти Классико DOCG (Тоскана) красное сухое',
        price: 650,
        weight: '150 мл.',
        description: 'Благородное тосканское вино с ароматом спелой вишни, фиалок и тонкими древесно-пряными оттенками вкуса.',
        icon: 'wine'
      },
      {
        id: 'wn-2',
        name: 'Пино Гриджо Делле Венецие IGT белое сухое',
        price: 550,
        weight: '150 мл.',
        description: 'Освежающее легкое венецианское вино с цветочными нотами, оттенками зеленого яблока, груши и приятной кислинкой.',
        icon: 'wine'
      },
      {
        id: 'wn-3',
        name: 'Спешелти Раф Лаванда-Цитрус',
        price: 350,
        weight: '300 мл.',
        description: 'Нежнейший сливочный кофейный напиток на основе эспрессо с добавлением натуральных цветов лаванды и цедры апельсина.',
        icon: 'coffee'
      }
    ]
  }
];

// Helper to render customized premium visual SVG icons inside expanded item details
const DishIcon = ({ type }) => {
  const strokeColor = "var(--accent-gold)";
  if (type === 'egg') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C7.5 2 4 7.5 4 12c0 4.5 3.5 10 8 10s8-5.5 8-10c0-4.5-3.5-10-8-10z" />
        <circle cx="12" cy="13" r="4" fill="rgba(165, 139, 111, 0.15)" stroke={strokeColor} strokeWidth="1" />
      </svg>
    );
  }
  if (type === 'croissant') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m14 18-3-3h-1.5L6 11.5l3.5-3.5h3L17 12Z" />
        <path d="M10 8.5 7.5 6 4 9.5l3 3.5" />
        <path d="m14 15.5 2.5 2.5 3.5-3.5-3-3.5" />
      </svg>
    );
  }
  if (type === 'pasta') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20" />
        <path d="M17 5v14" />
        <path d="M7 5v14" />
        <path d="M3 8h18" />
        <path d="M3 16h18" />
      </svg>
    );
  }
  if (type === 'ravioli') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="12" cy="12" r="3" fill="rgba(165, 139, 111, 0.15)" />
        <path d="M8 4V2M12 4V2M16 4V2M8 20v2M12 20v2M16 20v2" />
      </svg>
    );
  }
  if (type === 'cake') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20M5 17h14v3H5z" />
        <path d="M6 17c0-3 3-5 6-5s6 2 6 5" />
        <circle cx="12" cy="9" r="2" />
      </svg>
    );
  }
  if (type === 'dessert') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8.5 2 6 5.5 6 9c0 2 1.5 4 3 5v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5c1.5-1 3-3 3-5 0-3.5-2.5-7-6-7z" />
        <path d="M9 9h6" />
      </svg>
    );
  }
  if (type === 'wine') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.5 2h-11a.5.5 0 0 0-.5.5v7c0 3.5 3 6.5 6.5 6.5s6.5-3 6.5-6.5v-7a.5.5 0 0 0-.5-.5z" />
        <path d="M12 16v6M8 22h8" />
        <path d="M6.5 7h11" />
      </svg>
    );
  }
  if (type === 'coffee') {
    return (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <path d="M6 2v2M10 2v2M14 2v2" />
      </svg>
    );
  }
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
};

const StaggeredShowcaseMenu = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('breakfast');
  const [expandedItem, setExpandedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const tablistRef = useRef(null);

  // Responsive device width listener
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Keyboard navigation for role="tablist"
  const handleKeyDown = (e, index) => {
    const tabs = SHOWCASE_DATA;
    let nextIndex = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== index) {
      e.preventDefault();
      const nextTabId = tabs[nextIndex].id;
      setActiveTab(nextTabId);
      // set focus to the next tab element
      const nextBtn = tablistRef.current?.querySelector(`[data-tab-index="${nextIndex}"]`);
      nextBtn?.focus();
    }
  };

  const handleTabSelect = (tabId) => {
    setActiveTab(tabId);
    setExpandedItem(null);
  };

  const handleItemToggle = (itemId) => {
    setExpandedItem((prev) => (prev === itemId ? null : itemId));
  };

  // Framer Motion staggered variants configuration
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 280,
        damping: 22
      }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.18 } }
  };

  return (
    <section className="showcase-menu-section" id="showcase-menu">
      <div className="section showcase-menu-container">
        
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-label">Эксклюзивный выбор</span>
          <h2 className="section-title">Фирменные Блюда</h2>
          <p className="section-body" style={{ maxWidth: '600px', margin: '0 auto' }}>
            Попробуйте наши избранные позиции. Раскройте карточку блюда, чтобы узнать подробнее о его составе и оформлении.
          </p>
        </div>

        {/* --- DESKTOP AND TABLET TABS LAYOUT --- */}
        {!isMobile ? (
          <>
            {/* Horizontal Categories Row */}
            <div 
              ref={tablistRef}
              className="showcase-tabs-wrapper" 
              role="tablist" 
              aria-label="Фирменные категории меню"
            >
              {SHOWCASE_DATA.map((cat, idx) => {
                const isActive = activeTab === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    id={`showcase-tab-${cat.id}`}
                    aria-selected={isActive}
                    aria-controls={`showcase-panel-${cat.id}`}
                    tabIndex={isActive ? 0 : -1}
                    data-tab-index={idx}
                    className={`showcase-tab-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleTabSelect(cat.id)}
                    onKeyDown={(e) => handleKeyDown(e, idx, cat.id)}
                  >
                    <span className="category-marker" style={{ backgroundColor: cat.color, marginRight: '8px' }} />
                    {cat.title}
                  </button>
                );
              })}
            </div>

            {/* Showcase Items Grid Panel */}
            <div className="showcase-panels-container">
              <AnimatePresence mode="wait">
                {SHOWCASE_DATA.map((cat) => {
                  if (activeTab !== cat.id) return null;
                  return (
                    <motion.div
                      key={cat.id}
                      role="tabpanel"
                      id={`showcase-panel-${cat.id}`}
                      aria-labelledby={`showcase-tab-${cat.id}`}
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="showcase-items-list"
                    >
                      {cat.items.map((item) => {
                        const isExpanded = expandedItem === item.id;
                        return (
                          <motion.li 
                            key={item.id}
                            variants={itemVariants}
                            style={{ listStyle: 'none' }}
                          >
                            <div className={`showcase-item-card ${isExpanded ? 'expanded' : ''}`}>
                              {/* Header Trigger */}
                              <button
                                className="showcase-item-trigger"
                                onClick={() => handleItemToggle(item.id)}
                                aria-expanded={isExpanded}
                                aria-controls={`details-${item.id}`}
                                id={`trigger-${item.id}`}
                              >
                                <span className="showcase-item-name">{item.name}</span>
                                <div className="showcase-item-dots" />
                                <span className="showcase-item-price">{item.price} ₽</span>
                                <span className={`showcase-item-arrow ${isExpanded ? 'active' : ''}`}>
                                  <ChevronDown size={16} />
                                </span>
                              </button>

                              {/* Details Content Drawer */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    id={`details-${item.id}`}
                                    role="region"
                                    aria-labelledby={`trigger-${item.id}`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="showcase-item-details-drawer"
                                  >
                                    <div className="showcase-item-details-content">
                                      <div className="showcase-details-text">
                                        <span className="showcase-item-weight">Выход: {item.weight}</span>
                                        <p className="showcase-item-desc">{item.description}</p>
                                      </div>
                                      <div className="showcase-details-visual">
                                        <DishIcon type={item.icon} />
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.li>
                        );
                      })}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        ) : (
          /* --- MOBILE ACCORDION LAYOUT --- */
          <div className="showcase-mobile-accordion">
            {SHOWCASE_DATA.map((cat) => {
              const isCatActive = activeTab === cat.id;
              return (
                <div key={cat.id} className="showcase-mobile-category-row">
                  <button
                    className={`showcase-mobile-cat-header ${isCatActive ? 'active' : ''}`}
                    onClick={() => handleTabSelect(isCatActive ? null : cat.id)}
                    aria-expanded={isCatActive}
                    aria-controls={`mobile-panel-${cat.id}`}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="category-marker" style={{ backgroundColor: cat.color }} />
                      <span className="font-display" style={{ letterSpacing: '0.05em' }}>{cat.title}</span>
                    </span>
                    <span className={`cat-arrow ${isCatActive ? 'active' : ''}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isCatActive && (
                      <motion.div
                        id={`mobile-panel-${cat.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="showcase-mobile-panel"
                      >
                        <motion.ul 
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="showcase-mobile-items-list"
                        >
                          {cat.items.map((item) => {
                            const isItemExpanded = expandedItem === item.id;
                            return (
                              <motion.li 
                                key={item.id} 
                                variants={itemVariants}
                                className="showcase-mobile-item-item"
                              >
                                <button
                                  className={`showcase-mobile-item-trigger ${isItemExpanded ? 'active' : ''}`}
                                  onClick={() => handleItemToggle(item.id)}
                                  aria-expanded={isItemExpanded}
                                  aria-controls={`mobile-detail-${item.id}`}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                    <span className="showcase-mobile-item-name">{item.name}</span>
                                    <span className="showcase-mobile-item-price">{item.price} ₽</span>
                                  </div>
                                  <span className="showcase-mobile-item-sub">{item.weight}</span>
                                </button>

                                <AnimatePresence initial={false}>
                                  {isItemExpanded && (
                                    <motion.div
                                      id={`mobile-detail-${item.id}`}
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                      className="showcase-mobile-item-drawer"
                                    >
                                      <p className="showcase-mobile-item-desc">{item.description}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.li>
                            );
                          })}
                        </motion.ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Showcase Bottom Navigation CTA */}
        <div className="showcase-menu-cta">
          <a
            href="/menu"
            onClick={(e) => onNavigate(e, '/menu')}
            className="btn btn-outline showcase-cta-btn"
          >
            Смотреть полный каталог
            <ArrowRight size={14} style={{ marginLeft: '8px' }} />
          </a>
        </div>

      </div>
    </section>
  );
};

export default StaggeredShowcaseMenu;
