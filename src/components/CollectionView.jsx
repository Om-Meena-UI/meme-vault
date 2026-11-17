import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiPlay } from 'react-icons/fi';
import { getTypeColor, getTypeIcon, formatDate } from '../store';
import './CollectionView.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export default function CollectionView({ items, onItemClick, onDelete, onToggleFavorite }) {
  if (items.length === 0) {
    return (
      <motion.div className="collection-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="empty-icon">📭</div>
        <h2>Nothing here yet</h2>
        <p>Add some media to see your collection</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="collection-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="collection-grid" variants={container} initial="hidden" animate="show">
        {items.map((itm) => (
          <motion.div
            key={itm.id}
            className="collection-card"
            variants={item}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => onItemClick(itm)}
          >
            <div className="card-visual">
              {itm.preview || itm.url ? (
                <>
                  <img src={itm.preview || itm.url} alt={itm.name} className="card-image" />
                  {itm.type === 'reel' && (
                    <div className="card-play-overlay">
                      <FiPlay />
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="card-audio-visual"
                  style={{ background: `linear-gradient(135deg, ${itm.color || getTypeColor(itm.type)}33, ${itm.color || getTypeColor(itm.type)}11)` }}
                >
                  <span className="card-audio-emoji">{itm.emoji || getTypeIcon(itm.type)}</span>
                  <div className="card-audio-waves">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.15}s`, height: `${20 + Math.random() * 30}px` }} />
                    ))}
                  </div>
                </div>
              )}
              <div className="card-type-badge" style={{ background: getTypeColor(itm.type) }}>
                {getTypeIcon(itm.type)}
              </div>
            </div>

            <div className="card-info">
              <h3 className="card-name">{itm.name}</h3>
              <div className="card-meta">
                <span className="card-date">{formatDate(itm.createdAt)}</span>
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button
                    className={`card-action-btn ${itm.favorite ? 'favorited' : ''}`}
                    onClick={() => onToggleFavorite(itm.id)}
                  >
                    <FiHeart fill={itm.favorite ? '#ff6b6b' : 'none'} size={14} />
                  </button>
                  <button className="card-action-btn delete" onClick={() => onDelete(itm.id)}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
              {itm.tags?.length > 0 && (
                <div className="card-tags">
                  {itm.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="card-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
