import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiLock, FiUser, FiArrowRight, FiCheck } from 'react-icons/fi';
import { signUp, signIn } from '../store';
import './AuthModal.css';

const AVATARS = ['😎', '🐱', '🐸', '🐶', '🦄', '🚀', '🎭', '👑', '🥑', '👾', '🔥', '✨'];

export default function AuthModal({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('😎');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const user = await signUp({ name: name || 'Vault Explorer', email, password, avatar });
        onAuthSuccess(user);
      } else {
        const user = await signIn({ email, password });
        onAuthSuccess(user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      const demoEmail = 'creator@memevault.app';
      const demoPass = 'vault123';
      try {
        const user = await signIn({ email: demoEmail, password: demoPass });
        onAuthSuccess(user);
      } catch {
        const user = await signUp({
          name: 'Alex The Memer',
          email: demoEmail,
          password: demoPass,
          avatar: '🚀',
        });
        onAuthSuccess(user);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="auth-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="auth-modal"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <button className="auth-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="auth-header">
          <div className="auth-icon-badge">
            <span className="auth-badge-emoji">{avatar}</span>
          </div>
          <h2>{mode === 'signup' ? 'Create Your Vault Account' : 'Welcome Back'}</h2>
          <p>
            {mode === 'signup'
              ? 'Save, sync, and access your memes & soundboard across any device.'
              : 'Sign in to access your cloud-synced media collection.'}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="auth-extra-fields"
              >
                <div className="auth-field">
                  <label>Display Name</label>
                  <div className="auth-input-wrapper">
                    <FiUser className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="e.g. MemeMaster99"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label>Choose Avatar</label>
                  <div className="avatar-grid">
                    {AVATARS.map(av => (
                      <button
                        type="button"
                        key={av}
                        className={`avatar-option ${avatar === av ? 'selected' : ''}`}
                        onClick={() => setAvatar(av)}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-input-wrapper">
              <FiMail className="auth-input-icon" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <FiLock className="auth-input-icon" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            <span>{loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            <FiArrowRight />
          </button>
        </form>

        <div className="auth-divider">
          <span>or explore instantly</span>
        </div>

        <button type="button" className="auth-demo-btn" onClick={handleQuickDemo} disabled={loading}>
          <span>🚀 Instant Demo Account</span>
          <span className="auth-demo-sub">Try out cloud sync features immediately</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
