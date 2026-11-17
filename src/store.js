import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Configure localforage
localforage.config({
  name: 'MemeVault',
  storeName: 'media_collection',
});

const COLLECTIONS_KEY = 'vault_collections';
const USERS_KEY = 'vault_users';
const CURRENT_USER_KEY = 'vault_current_user';

// Media store for blobs
const mediaStore = localforage.createInstance({
  name: 'MemeVault',
  storeName: 'media_blobs',
});

// Helper for user-scoped item key
function getItemsKey(userId) {
  return userId ? `vault_items_${userId}` : 'vault_items_guest';
}

/* ================= AUTHENTICATION & USERS ================= */

export async function getCurrentUser() {
  const user = await localforage.getItem(CURRENT_USER_KEY);
  return user || null;
}

export async function getUsers() {
  const users = await localforage.getItem(USERS_KEY);
  return users || [];
}

export async function signUp({ name, email, password, avatar }) {
  const users = await getUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: uuidv4(),
    name: name.trim() || 'Vault Explorer',
    email: email.trim().toLowerCase(),
    password, // Stored locally in IndexedDB
    avatar: avatar || '😎',
    joinedAt: Date.now(),
    lastSyncedAt: Date.now(),
  };

  users.push(newUser);
  await localforage.setItem(USERS_KEY, users);
  await localforage.setItem(CURRENT_USER_KEY, newUser);

  // Migrate any guest items into the new user's vault if available
  const guestItems = await localforage.getItem('vault_items_guest');
  if (guestItems && guestItems.length > 0) {
    await localforage.setItem(getItemsKey(newUser.id), guestItems);
  }

  return newUser;
}

export async function signIn({ email, password }) {
  const users = await getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    throw new Error('Invalid email or password.');
  }

  user.lastSyncedAt = Date.now();
  await localforage.setItem(CURRENT_USER_KEY, user);
  return user;
}

export async function signOut() {
  await localforage.removeItem(CURRENT_USER_KEY);
  return null;
}

export async function updateProfile(updates) {
  const current = await getCurrentUser();
  if (!current) return null;

  const updated = { ...current, ...updates };
  await localforage.setItem(CURRENT_USER_KEY, updated);

  const users = await getUsers();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx !== -1) {
    users[idx] = updated;
    await localforage.setItem(USERS_KEY, users);
  }

  return updated;
}

export async function syncToCloud(userId) {
  // Simulates cloud sync ping and persists timestamp
  await new Promise(r => setTimeout(r, 600));
  const current = await getCurrentUser();
  if (current) {
    current.lastSyncedAt = Date.now();
    await localforage.setItem(CURRENT_USER_KEY, current);
    return current;
  }
  return null;
}

/* ================= MEDIA ITEMS ================= */

export async function getAllItems(userId = null) {
  const key = getItemsKey(userId);
  const items = await localforage.getItem(key);
  return items || [];
}

export async function saveItem(item, userId = null) {
  const key = getItemsKey(userId);
  const items = await getAllItems(userId);
  const newItem = {
    id: uuidv4(),
    ...item,
    createdAt: Date.now(),
    favorite: false,
    ownerId: userId || 'guest',
  };
  items.unshift(newItem);
  await localforage.setItem(key, items);
  return newItem;
}

export async function updateItem(id, updates, userId = null) {
  const key = getItemsKey(userId);
  const items = await getAllItems(userId);
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    await localforage.setItem(key, items);
    return items[idx];
  }
  return null;
}

export async function deleteItem(id, userId = null) {
  const key = getItemsKey(userId);
  let items = await getAllItems(userId);
  items = items.filter(i => i.id !== id);
  await localforage.setItem(key, items);
  await mediaStore.removeItem(id);
}

export async function saveMediaBlob(id, blob) {
  await mediaStore.setItem(id, blob);
}

export async function getMediaBlob(id) {
  return await mediaStore.getItem(id);
}

export async function getAllCollections() {
  const collections = await localforage.getItem(COLLECTIONS_KEY);
  return collections || [
    { id: 'all', name: 'All', icon: '🗂️' },
    { id: 'memes', name: 'Memes', icon: '😂' },
    { id: 'sounds', name: 'Soundboard', icon: '🔊' },
    { id: 'reels', name: 'Reels', icon: '🎬' },
    { id: 'favorites', name: 'Favorites', icon: '⭐' },
  ];
}

// Generate thumbnail/preview from file
export function generatePreview(file) {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith('audio/')) {
      resolve(null);
    } else {
      resolve(null);
    }
  });
}

export function getTypeFromFile(file) {
  if (file.type.startsWith('image/')) return 'meme';
  if (file.type.startsWith('audio/')) return 'sound';
  if (file.type.startsWith('video/')) return 'reel';
  return 'meme';
}

export function getTypeColor(type) {
  switch (type) {
    case 'meme': return '#ff6b6b';
    case 'sound': return '#4ecdc4';
    case 'reel': return '#a855f7';
    default: return '#f5a623';
  }
}

export function getTypeIcon(type) {
  switch (type) {
    case 'meme': return '😂';
    case 'sound': return '🔊';
    case 'reel': return '🎬';
    default: return '📁';
  }
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
