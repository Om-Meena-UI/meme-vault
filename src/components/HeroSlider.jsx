import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiHeart, FiBookmark } from 'react-icons/fi';
import { getTypeColor, getTypeIcon, formatDate } from '../store';
import './HeroSlider.css';

export default function HeroSlider({ items, onItemClick, onToggleFavorite }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const displayItems = items.length > 0 ? items : [];

  useEffect(() => {
    if (activeIndex >= displayItems.length && displayItems.length > 0) {
      setActiveIndex(0);
    }
  }, [displayItems.length, activeIndex]);

  const goNext = useCallback(() => {
    if (displayItems.length <= 1) return;
    setDirection(1);
    setActiveIndex(prev => (prev + 1) % displayItems.length);
  }, [displayItems.length]);

  const goPrev = useCallback(() => {
    if (displayItems.length <= 1) return;
    setDirection(-1);
    setActiveIndex(prev => (prev - 1 + displayItems.length) % displayItems.length);
  }, [displayItems.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (displayItems.length <= 1) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext, displayItems.length]);

  if (displayItems.length === 0) {
    return (
      <motion.div
        className="hero-empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="empty-icon">🎭</div>
        <h2>Your Vault is Empty</h2>
        <p>Add some memes, sounds, or reels to get started!</p>
      </motion.div>
    );
  }

  const activeItem = displayItems[activeIndex];
  const getVisibleCards = () => {
    const cards = [];
    for (let i = 1; i <= 4; i++) {
      const idx = (activeIndex + i) % displayItems.length;
      if (idx !== activeIndex) cards.push({ ...displayItems[idx], _idx: idx });
    }
    return cards;
  };

  const visibleCards = getVisibleCards();
  const progress = ((activeIndex + 1) / displayItems.length) * 100;

  const heroVariants = {
    enter: (dir) => ({ opacity: 0, scale: 1.1, x: dir > 0 ? 100 : -100 }),
    center: { opacity: 1, scale: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, scale: 1.05, x: dir > 0 ? -100 : 100 }),
  };

  return (
    <motion.div
      className="hero-slider"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={activeItem.id}
          className="hero-background"
          custom={direction}
          variants={heroVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {activeItem.preview || activeItem.url ? (
            <img src={activeItem.preview || activeItem.url} alt="" className="hero-bg-img" />
          ) : (
            <div className="hero-bg-gradient" style={{ background: `linear-gradient(135deg, ${getTypeColor(activeItem.type)}22, var(--bg-primary))` }} />
          )}
          <div className="hero-overlay" />
          <div className="hero-overlay-gradient" />
        </motion.div>
      </AnimatePresence>

      {/* Top accent line */}
      <div className="hero-accent-line" />

      {/* Content */}
      <div className="hero-content">
        <div className="hero-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hero-info"
            >
              <div className="hero-category">
                <span className="hero-category-dot" style={{ background: getTypeColor(activeItem.type) }} />
                <span>{activeItem.type === 'meme' ? 'Meme Collection' : activeItem.type === 'reel' ? 'Reels Collection' : 'Sound Collection'}</span>
              </div>
              <h1 className="hero-title">{activeItem.name}</h1>
              <div className="hero-tags">
                {activeItem.tags?.map((tag, i) => (
                  <span key={i} className="hero-tag">#{tag}</span>
                ))}
              </div>
              <p className="hero-date">{formatDate(activeItem.createdAt)}</p>
              <div className="hero-actions">
                <button className="hero-action-btn primary" onClick={() => onItemClick(activeItem)}>
                  <FiBookmark />
                  <span>View Full</span>
                </button>
                <button
                  className={`hero-action-btn ${activeItem.favorite ? 'favorited' : ''}`}
                  onClick={() => onToggleFavorite(activeItem.id)}
                >
                  <FiHeart fill={activeItem.favorite ? '#ff6b6b' : 'none'} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hero-right">
          <div className="hero-cards">
            {visibleCards.map((card, i) => (
              <motion.div
                key={card.id}
                className="hero-card"
                initial={{ opacity: 0, x: 50, rotateY: -5 }}
                animate={{ opacity: 1 - i * 0.15, x: 0, rotateY: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => {
                  setDirection(1);
                  setActiveIndex(card._idx);
                }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                {card.preview || card.url ? (
                  <img src={card.preview || card.url} alt={card.name} className="hero-card-img" />
                ) : (
                  <div className="hero-card-placeholder" style={{ background: `linear-gradient(135deg, ${card.color || getTypeColor(card.type)}44, ${card.color || getTypeColor(card.type)}11)` }}>
                    <span className="hero-card-emoji">{card.emoji || getTypeIcon(card.type)}</span>
                  </div>
                )}
                <div className="hero-card-overlay">
                  <span className="hero-card-type">{card.type}</span>
                  <span className="hero-card-name">{card.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="hero-bottom">
        <div className="hero-nav-arrows">
          <button className="hero-nav-btn" onClick={goPrev}>
            <FiChevronLeft />
          </button>
          <button className="hero-nav-btn" onClick={goNext}>
            <FiChevronRight />
          </button>
        </div>

        <div className="hero-progress-container">
          <div className="hero-progress-bar">
            <motion.div
              className="hero-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="hero-counter">
          <span className="hero-counter-current">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="hero-counter-sep">/</span>
          <span className="hero-counter-total">{String(displayItems.length).padStart(2, '0')}</span>
        </div>
      </div>
    </motion.div>
  );
}
