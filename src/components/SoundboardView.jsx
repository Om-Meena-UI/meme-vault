import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiTrash2, FiVolume2, FiVolumeX } from 'react-icons/fi';
import { getMediaBlob } from '../store';
import './SoundboardView.css';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1 },
};

const SOUND_COLORS = [
  'linear-gradient(135deg, #ff6b6b, #ee5a24)',
  'linear-gradient(135deg, #4ecdc4, #2ecc71)',
  'linear-gradient(135deg, #a855f7, #6c5ce7)',
  'linear-gradient(135deg, #f5a623, #f39c12)',
  'linear-gradient(135deg, #74b9ff, #0984e3)',
  'linear-gradient(135deg, #fd79a8, #e84393)',
  'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
  'linear-gradient(135deg, #55efc4, #00b894)',
];

export default function SoundboardView({ items, onDelete, onToggleFavorite }) {
  const [playing, setPlaying] = useState(null);
  const audioRef = useRef(null);

  const playSound = async (itm) => {
    if (playing === itm.id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }

    try {
      const blob = await getMediaBlob(itm.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.pause();
        }
        audioRef.current = new Audio(url);
        audioRef.current.onended = () => setPlaying(null);
        audioRef.current.play();
        setPlaying(itm.id);
      }
    } catch (err) {
      console.log('No audio blob found for demo item');
    }
  };

  if (items.length === 0) {
    return (
      <motion.div className="sound-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="empty-icon">🔇</div>
        <h2>No Sounds Yet</h2>
        <p>Add audio files to build your soundboard</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="soundboard-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="soundboard-header">
        <h2>🔊 Soundboard</h2>
        <p>Tap a button to play</p>
      </div>

      <motion.div className="soundboard-grid" variants={container} initial="hidden" animate="show">
        {items.map((itm, i) => (
          <motion.div
            key={itm.id}
            className={`sound-pad ${playing === itm.id ? 'active' : ''}`}
            variants={item}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playSound(itm)}
            style={{ '--pad-bg': SOUND_COLORS[i % SOUND_COLORS.length] }}
          >
            <div className="sound-pad-bg" />
            <div className="sound-pad-content">
              <span className="sound-pad-emoji">{itm.emoji || '🔊'}</span>
              <span className="sound-pad-name">{itm.name}</span>
              <div className="sound-pad-indicator">
                {playing === itm.id ? <FiVolumeX size={14} /> : <FiVolume2 size={14} />}
              </div>
            </div>

            {playing === itm.id && (
              <div className="sound-pad-waves">
                {[...Array(8)].map((_, j) => (
                  <div key={j} className="sound-wave" style={{ animationDelay: `${j * 0.1}s` }} />
                ))}
              </div>
            )}

            <div className="sound-pad-actions" onClick={e => e.stopPropagation()}>
              <button
                className={`sound-action ${itm.favorite ? 'fav' : ''}`}
                onClick={() => onToggleFavorite(itm.id)}
              >
                <FiHeart fill={itm.favorite ? '#ff6b6b' : 'none'} size={12} />
              </button>
              <button className="sound-action del" onClick={() => onDelete(itm.id)}>
                <FiTrash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
