import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import HeroSlider from './components/HeroSlider';
import Navbar from './components/Navbar';
import UploadModal from './components/UploadModal';
import CollectionView from './components/CollectionView';
import SoundboardView from './components/SoundboardView';
import MediaViewer from './components/MediaViewer';
import AuthModal from './components/AuthModal';
import ProfileDrawer from './components/ProfileDrawer';
import {
  getAllItems,
  saveItem,
  deleteItem,
  updateItem,
  saveMediaBlob,
  generatePreview,
  getTypeFromFile,
  getCurrentUser,
  signOut,
  updateProfile,
  syncToCloud,
} from './store';
import './App.css';

// Demo items for first-time or guest users
const DEMO_ITEMS = [
  {
    id: 'demo-1',
    name: 'Distracted Boyfriend',
    type: 'meme',
    tags: ['classic', 'relatable'],
    collection: 'memes',
    preview: 'https://i.imgflip.com/1ur9b0.jpg',
    url: 'https://i.imgflip.com/1ur9b0.jpg',
    createdAt: Date.now() - 86400000 * 5,
    favorite: true,
  },
  {
    id: 'demo-2',
    name: 'Drake Hotline Bling',
    type: 'meme',
    tags: ['drake', 'format'],
    collection: 'memes',
    preview: 'https://i.imgflip.com/30b1gx.jpg',
    url: 'https://i.imgflip.com/30b1gx.jpg',
    createdAt: Date.now() - 86400000 * 3,
    favorite: false,
  },
  {
    id: 'demo-3',
    name: 'This Is Fine',
    type: 'meme',
    tags: ['fire', 'dog', 'classic'],
    collection: 'memes',
    preview: 'https://i.imgflip.com/wxica.jpg',
    url: 'https://i.imgflip.com/wxica.jpg',
    createdAt: Date.now() - 86400000 * 2,
    favorite: true,
  },
  {
    id: 'demo-4',
    name: 'Woman Yelling at Cat',
    type: 'meme',
    tags: ['classic', 'cat'],
    collection: 'memes',
    preview: 'https://i.imgflip.com/345v97.jpg',
    url: 'https://i.imgflip.com/345v97.jpg',
    createdAt: Date.now() - 86400000,
    favorite: false,
  },
  {
    id: 'demo-5',
    name: 'Expanding Brain',
    type: 'meme',
    tags: ['brain', 'levels'],
    collection: 'memes',
    preview: 'https://i.imgflip.com/1jwhww.jpg',
    url: 'https://i.imgflip.com/1jwhww.jpg',
    createdAt: Date.now() - 86400000 * 4,
    favorite: false,
  },
  {
    id: 'demo-6',
    name: 'Change My Mind',
    type: 'meme',
    tags: ['debate', 'crowder'],
    collection: 'memes',
    preview: 'https://i.imgflip.com/24y43o.jpg',
    url: 'https://i.imgflip.com/24y43o.jpg',
    createdAt: Date.now() - 86400000 * 6,
    favorite: false,
  },
  {
    id: 'demo-7',
    name: 'Vine Boom',
    type: 'sound',
    tags: ['effect', 'boom'],
    collection: 'sounds',
    preview: null,
    url: null,
    createdAt: Date.now() - 86400000 * 2,
    favorite: true,
    emoji: '💥',
    color: '#ff6b6b',
  },
  {
    id: 'demo-8',
    name: 'Bruh',
    type: 'sound',
    tags: ['effect', 'bruh'],
    collection: 'sounds',
    preview: null,
    url: null,
    createdAt: Date.now() - 86400000 * 3,
    favorite: false,
    emoji: '😐',
    color: '#4ecdc4',
  },
  {
    id: 'demo-9',
    name: 'Oof',
    type: 'sound',
    tags: ['roblox', 'oof'],
    collection: 'sounds',
    preview: null,
    url: null,
    createdAt: Date.now() - 86400000 * 4,
    favorite: false,
    emoji: '😵',
    color: '#a855f7',
  },
  {
    id: 'demo-10',
    name: 'Sad Violin',
    type: 'sound',
    tags: ['sad', 'dramatic'],
    collection: 'sounds',
    preview: null,
    url: null,
    createdAt: Date.now() - 86400000,
    favorite: false,
    emoji: '🎻',
    color: '#f5a623',
  },
  {
    id: 'demo-11',
    name: 'MLG Airhorn',
    type: 'sound',
    tags: ['mlg', 'horn'],
    collection: 'sounds',
    preview: null,
    url: null,
    createdAt: Date.now() - 86400000 * 5,
    favorite: true,
    emoji: '📯',
    color: '#ff6b6b',
  },
  {
    id: 'demo-12',
    name: 'Taco Bell Bong',
    type: 'sound',
    tags: ['taco', 'bell'],
    collection: 'sounds',
    preview: null,
    url: null,
    createdAt: Date.now() - 86400000 * 2,
    favorite: false,
    emoji: '🔔',
    color: '#4ecdc4',
  },
];

function App() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [view, setView] = useState('hero'); // hero | collection | soundboard
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [viewerItem, setViewerItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize user and media items
  useEffect(() => {
    async function init() {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      await loadUserItems(currentUser?.id || null);
      setLoading(false);
    }
    init();
  }, []);

  const loadUserItems = async (userId = null) => {
    let stored = await getAllItems(userId);
    if (!stored || stored.length === 0) {
      stored = DEMO_ITEMS;
    }
    setItems(stored);
  };

  const handleAuthSuccess = async (authUser) => {
    setUser(authUser);
    await loadUserItems(authUser.id);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setShowProfile(false);
    await loadUserItems(null);
  };

  const handleUpdateProfile = async (updates) => {
    const updated = await updateProfile(updates);
    if (updated) setUser(updated);
  };

  const handleSync = async () => {
    if (user) {
      const updated = await syncToCloud(user.id);
      if (updated) setUser(updated);
    }
  };

  const handleUpload = useCallback(async (files, metadata) => {
    const newItems = [];
    const userId = user?.id || null;
    for (const file of files) {
      const preview = await generatePreview(file);
      const type = metadata.type || getTypeFromFile(file);
      const url = URL.createObjectURL(file);

      const item = await saveItem(
        {
          name: metadata.name || file.name.replace(/\.[^/.]+$/, ''),
          type,
          tags: metadata.tags || [],
          collection: metadata.collection || type + 's',
          preview,
          url,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          emoji: metadata.emoji || null,
          color: metadata.color || null,
        },
        userId
      );

      await saveMediaBlob(item.id, file);
      newItems.push(item);
    }
    setItems(prev => [...newItems, ...prev]);
    setShowUpload(false);
  }, [user]);

  const handleDelete = useCallback(async (id) => {
    await deleteItem(id, user?.id || null);
    setItems(prev => prev.filter(i => i.id !== id));
    setViewerItem(null);
  }, [user]);

  const handleToggleFavorite = useCallback(async (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const updated = await updateItem(id, { favorite: !item.favorite }, user?.id || null);
      if (updated) {
        setItems(prev => prev.map(i => (i.id === id ? { ...i, favorite: !i.favorite } : i)));
      }
    }
  }, [items, user]);

  const filteredItems = items
    .filter(item => {
      if (activeFilter === 'favorites') return item.favorite;
      if (activeFilter === 'memes') return item.type === 'meme';
      if (activeFilter === 'sounds') return item.type === 'sound';
      if (activeFilter === 'reels') return item.type === 'reel';
      return true;
    })
    .filter(item => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.tags?.some(t => t.toLowerCase().includes(q)) ||
        item.type?.toLowerCase().includes(q)
      );
    });

  const memeItems = items.filter(i => i.type === 'meme');
  const soundItems = items.filter(i => i.type === 'sound');
  const reelItems = items.filter(i => i.type === 'reel');

  return (
    <div className="app">
      <Navbar
        view={view}
        setView={setView}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onUpload={() => setShowUpload(true)}
        counts={{
          all: items.length,
          memes: memeItems.length,
          sounds: soundItems.length,
          reels: reelItems.length,
        }}
        user={user}
        onOpenAuth={() => setShowAuth(true)}
        onOpenProfile={() => setShowProfile(true)}
      />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {view === 'hero' && (
            <HeroSlider
              key="hero"
              items={filteredItems.filter(i => i.type !== 'sound')}
              onItemClick={setViewerItem}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          {view === 'collection' && (
            <CollectionView
              key="collection"
              items={filteredItems}
              onItemClick={setViewerItem}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          {view === 'soundboard' && (
            <SoundboardView
              key="soundboard"
              items={filteredItems.filter(i => i.type === 'sound')}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onUpload={handleUpload}
          />
        )}
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onAuthSuccess={handleAuthSuccess}
          />
        )}
        {showProfile && user && (
          <ProfileDrawer
            user={user}
            items={items}
            onClose={() => setShowProfile(false)}
            onSignOut={handleSignOut}
            onUpdateProfile={handleUpdateProfile}
            onSync={handleSync}
          />
        )}
        {viewerItem && (
          <MediaViewer
            item={viewerItem}
            onClose={() => setViewerItem(null)}
            onDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
