import { motion } from 'framer-motion';
import { FiX, FiHeart, FiTrash2, FiDownload, FiCopy, FiTag, FiClock } from 'react-icons/fi';
import { getTypeColor, getTypeIcon, formatDate } from '../store';
import './MediaViewer.css';

export default function MediaViewer({ item, onClose, onDelete, onToggleFavorite }) {
  const handleCopy = () => {
    if (item.preview || item.url) {
      // Try to copy image
      navigator.clipboard?.writeText(item.url || item.preview || '');
    }
  };

  const handleDownload = () => {
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.fileName || item.name;
      a.click();
    }
  };

  return (
    <motion.div
      className="viewer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="viewer-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="viewer-close" onClick={onClose}>
          <FiX />
        </button>

        {/* Media display */}
        <div className="viewer-media">
          {item.type === 'reel' && item.url ? (
            <video
              src={item.url}
              className="viewer-video"
              controls
              autoPlay
              loop
            />
          ) : item.preview || item.url ? (
            <img src={item.preview || item.url} alt={item.name} className="viewer-image" />
          ) : (
            <div
              className="viewer-audio"
              style={{ background: `linear-gradient(135deg, ${item.color || getTypeColor(item.type)}33, ${item.color || getTypeColor(item.type)}11)` }}
            >
              <span className="viewer-audio-emoji">{item.emoji || getTypeIcon(item.type)}</span>
              <span className="viewer-audio-label">{item.name}</span>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="viewer-info">
          <div className="viewer-header">
            <div className="viewer-type-badge" style={{ background: getTypeColor(item.type) }}>
              {getTypeIcon(item.type)} {item.type}
            </div>
            <h2 className="viewer-title">{item.name}</h2>
          </div>

          <div className="viewer-details">
            <div className="viewer-detail">
              <FiClock size={14} />
              <span>{formatDate(item.createdAt)}</span>
            </div>
            {item.tags?.length > 0 && (
              <div className="viewer-detail">
                <FiTag size={14} />
                <div className="viewer-tags">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="viewer-tag">#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            {item.fileSize && (
              <div className="viewer-detail">
                <span className="viewer-file-size">{(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}
          </div>

          <div className="viewer-actions">
            <button
              className={`viewer-action-btn ${item.favorite ? 'favorited' : ''}`}
              onClick={() => onToggleFavorite(item.id)}
            >
              <FiHeart fill={item.favorite ? '#ff6b6b' : 'none'} />
              <span>{item.favorite ? 'Favorited' : 'Favorite'}</span>
            </button>
            <button className="viewer-action-btn" onClick={handleCopy}>
              <FiCopy />
              <span>Copy</span>
            </button>
            <button className="viewer-action-btn" onClick={handleDownload}>
              <FiDownload />
              <span>Download</span>
            </button>
            <button className="viewer-action-btn delete" onClick={() => onDelete(item.id)}>
              <FiTrash2 />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
