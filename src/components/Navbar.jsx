import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlus, FiGrid, FiMusic, FiX, FiUser } from 'react-icons/fi';
import { MdViewCarousel } from 'react-icons/md';
import './Navbar.css';

const filters = [
  { id: 'all', label: 'All', icon: '🗂️' },
  { id: 'memes', label: 'Memes', icon: '😂' },
  { id: 'sounds', label: 'Sounds', icon: '🔊' },
  { id: 'reels', label: 'Reels', icon: '🎬' },
  { id: 'favorites', label: 'Favorites', icon: '⭐' },
];

export default function Navbar({
  view,
  setView,
  activeFilter,
  setActiveFilter,
  searchQuery,
  setSearchQuery,
  onUpload,
  counts,
  user,
  onOpenAuth,
  onOpenProfile,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo">
          <span className="logo-icon">🗃️</span>
          <span className="logo-text">MEME VAULT</span>
        </div>
      </div>

      <div className="navbar-center">
        <div className="filter-tabs">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`filter-tab ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              <span className="filter-icon">{f.icon}</span>
              <span className="filter-label">{f.label}</span>
              {counts && f.id !== 'favorites' && f.id !== 'all' && (
                <span className="filter-count">{counts[f.id] || 0}</span>
              )}
              {activeFilter === f.id && (
                <motion.div
                  className="filter-indicator"
                  layoutId="filterIndicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        <div className={`search-container ${showSearch ? 'expanded' : ''}`}>
          {showSearch ? (
            <motion.div
              className="search-input-wrapper"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
            >
              <FiSearch className="search-icon-input" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search memes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
              <button className="search-close" onClick={() => { setShowSearch(false); setSearchQuery(''); }}>
                <FiX />
              </button>
            </motion.div>
          ) : (
            <button className="nav-btn" onClick={() => setShowSearch(true)} title="Search">
              <FiSearch />
            </button>
          )}
        </div>

        <div className="view-switcher">
          <button
            className={`nav-btn ${view === 'hero' ? 'active' : ''}`}
            onClick={() => setView('hero')}
            title="Showcase View"
          >
            <MdViewCarousel />
          </button>
          <button
            className={`nav-btn ${view === 'collection' ? 'active' : ''}`}
            onClick={() => setView('collection')}
            title="Grid View"
          >
            <FiGrid />
          </button>
          <button
            className={`nav-btn ${view === 'soundboard' ? 'active' : ''}`}
            onClick={() => setView('soundboard')}
            title="Soundboard"
          >
            <FiMusic />
          </button>
        </div>

        <button className="upload-btn" onClick={onUpload}>
          <FiPlus />
          <span>Add Media</span>
        </button>

        {/* User Account / Profile */}
        {user ? (
          <button className="user-profile-btn" onClick={onOpenProfile} title={`${user.name} - Open Profile`}>
            <span className="nav-user-avatar">{user.avatar || '😎'}</span>
            <span className="nav-user-name">{user.name.split(' ')[0]}</span>
            <span className="nav-sync-dot" title="Cloud Synced" />
          </button>
        ) : (
          <button className="account-login-btn" onClick={onOpenAuth} title="Sign In / Create Account">
            <FiUser />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
