import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FiX, FiUpload, FiImage, FiMusic, FiVideo, FiTag } from 'react-icons/fi';
import './UploadModal.css';

export default function UploadModal({ onClose, onUpload }) {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [tags, setTags] = useState('');
  const [step, setStep] = useState('drop'); // drop, details

  const onDrop = useCallback((accepted) => {
    const withPreviews = accepted.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) :
               file.type.startsWith('video/') ? URL.createObjectURL(file) : null,
    }));
    setFiles(withPreviews);
    if (accepted.length === 1) {
      const f = accepted[0];
      setName(f.name.replace(/\.[^/.]+$/, ''));
      if (f.type.startsWith('image/')) setType('meme');
      else if (f.type.startsWith('audio/')) setType('sound');
      else if (f.type.startsWith('video/')) setType('reel');
    }
    setStep('details');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'audio/*': [],
      'video/*': [],
    },
    multiple: true,
  });

  const handleSubmit = () => {
    if (files.length === 0) return;
    onUpload(
      files.map(f => f.file),
      {
        name: name || 'Untitled',
        type: type || 'meme',
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        collection: (type || 'meme') + 's',
      }
    );
  };

  const typeOptions = [
    { id: 'meme', label: 'Meme', icon: <FiImage />, emoji: '😂', color: 'var(--meme-color)' },
    { id: 'sound', label: 'Sound', icon: <FiMusic />, emoji: '🔊', color: 'var(--sound-color)' },
    { id: 'reel', label: 'Reel', icon: <FiVideo />, emoji: '🎬', color: 'var(--reel-color)' },
  ];

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="upload-modal"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="upload-modal-header">
          <h2>Add to Vault</h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {step === 'drop' && (
          <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <div className="dropzone-icon-row">
                <span className="dz-icon">😂</span>
                <span className="dz-icon">🔊</span>
                <span className="dz-icon">🎬</span>
              </div>
              <FiUpload className="dropzone-upload-icon" />
              <h3>Drop your media here</h3>
              <p>Images, audio, or video files</p>
              <span className="dropzone-or">or</span>
              <button className="dropzone-btn">Browse Files</button>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="upload-details">
            {/* Preview */}
            <div className="upload-preview-row">
              {files.map((f, i) => (
                <div key={i} className="upload-preview-item">
                  {f.preview ? (
                    f.file.type.startsWith('video/') ? (
                      <video src={f.preview} className="upload-preview-media" muted />
                    ) : (
                      <img src={f.preview} alt="" className="upload-preview-media" />
                    )
                  ) : (
                    <div className="upload-preview-audio">
                      <span>🎵</span>
                      <span className="upload-preview-name">{f.file.name}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="upload-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter a name..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Type</label>
                <div className="type-selector">
                  {typeOptions.map(opt => (
                    <button
                      key={opt.id}
                      className={`type-option ${type === opt.id ? 'selected' : ''}`}
                      onClick={() => setType(opt.id)}
                      style={{ '--type-color': opt.color }}
                    >
                      <span className="type-emoji">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label><FiTag style={{ marginRight: 6 }} /> Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="funny, classic, trending (comma separated)"
                  className="form-input"
                />
              </div>

              <button className="upload-submit-btn" onClick={handleSubmit}>
                <FiUpload />
                <span>Add to Vault</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
