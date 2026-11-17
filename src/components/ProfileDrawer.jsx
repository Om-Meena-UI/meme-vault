import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCloud, FiLogOut, FiRefreshCw, FiCheck, FiDownload, FiUser, FiHardDrive } from 'react-icons/fi';
import { formatDate } from '../store';
import './ProfileDrawer.css';

const AVATARS = ['😎', '🐱', '🐸', '🐶', '🦄', '🚀', '🎭', '👑', '🥑', '👾', '🔥', '✨'];

export default function ProfileDrawer({ user, items, onClose, onSignOut, onUpdateProfile, onSync }) {
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const memesCount = items.filter(i => i.type === 'meme').length;
  const soundsCount = items.filter(i => i.type === 'sound').length;
  const reelsCount = items.filter(i => i.type === 'reel').length;
  const favsCount = items.filter(i => i.favorite).length;

  const handleSyncNow = async () => {
    setSyncing(true);
    await onSync();
    setSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2500);
  };

  const handleSaveName = async () => {
    if (name.trim()) {
      await onUpdateProfile({ name: name.trim() });
      setIsEditingName(false);
    }
  };

  const handleExportBackup = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      user: { name: user.name, email: user.email },
      itemsCount: items.length,
      items: items.map(i => ({
        name: i.name,
        type: i.type,
        tags: i.tags,
        preview: i.preview,
        url: i.url,
        favorite: i.favorite,
        emoji: i.emoji,
      })),
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meme-vault-backup-${user.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="profile-drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h3>Account & Vault</h3>
          <button className="drawer-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="drawer-content">
          {/* User Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar-wrap" onClick={() => setEditingAvatar(!editingAvatar)}>
              <span className="profile-avatar">{user.avatar || '😎'}</span>
              <span className="avatar-edit-hint">Change</span>
            </div>

            {editingAvatar && (
              <motion.div
                className="drawer-avatar-picker"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {AVATARS.map(av => (
                  <button
                    key={av}
                    className={`drawer-av-btn ${user.avatar === av ? 'selected' : ''}`}
                    onClick={() => {
                      onUpdateProfile({ avatar: av });
                      setEditingAvatar(false);
                    }}
                  >
                    {av}
                  </button>
                ))}
              </motion.div>
            )}

            <div className="profile-info">
              {isEditingName ? (
                <div className="profile-name-edit">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="save-name-btn">
                    <FiCheck />
                  </button>
                </div>
              ) : (
                <h4 onClick={() => setIsEditingName(true)} title="Click to rename">
                  {user.name} <span className="rename-hint">✏️</span>
                </h4>
              )}
              <p className="profile-email">{user.email}</p>
              <span className="member-badge">💎 Vault Pro Member</span>
            </div>
          </div>

          {/* Cloud Sync Status */}
          <div className="cloud-sync-card">
            <div className="sync-info">
              <div className="sync-icon-wrap">
                <FiCloud className={syncing ? 'pulsing' : ''} />
              </div>
              <div className="sync-texts">
                <h5>Cloud Sync</h5>
                <p>
                  {syncSuccess
                    ? 'Synced just now! ✅'
                    : user.lastSyncedAt
                    ? `Last backup: ${formatDate(user.lastSyncedAt)}`
                    : 'Real-time sync active'}
                </p>
              </div>
            </div>
            <button
              className="sync-trigger-btn"
              onClick={handleSyncNow}
              disabled={syncing}
            >
              <FiRefreshCw className={syncing ? 'spinning' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>

          {/* Vault Stats */}
          <div className="stats-section">
            <label className="section-label">Your Vault Stats</label>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-num">{memesCount}</span>
                <span className="stat-desc">Memes 😂</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{soundsCount}</span>
                <span className="stat-desc">Sounds 🔊</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{reelsCount}</span>
                <span className="stat-desc">Reels 🎬</span>
              </div>
              <div className="stat-card">
                <span className="stat-num">{favsCount}</span>
                <span className="stat-desc">Favorites ⭐</span>
              </div>
            </div>
          </div>

          {/* Vault Actions */}
          <div className="drawer-actions">
            <button className="drawer-action-btn" onClick={handleExportBackup}>
              <FiDownload />
              <span>Export Vault JSON Backup</span>
            </button>
            <button className="drawer-action-btn signout" onClick={onSignOut}>
              <FiLogOut />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
