import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Configure localforage
localforage.config({
  name: 'MemeVault',
  storeName: 'media_collection',
});

const ITEMS_KEY = 'vault_items';
const COLLECTIONS_KEY = 'vault_collections';

// Media store for blobs
const mediaStore = localforage.createInstance({
  name: 'MemeVault',
  storeName: 'media_blobs',
});

export async function getAllItems() {
  const items = await localforage.getItem(ITEMS_KEY);
  return items || [];
}

export async function saveItem(item) {
  const items = await getAllItems();
  const newItem = {
    id: uuidv4(),
    ...item,
    createdAt: Date.now(),
    favorite: false,
  };
  items.unshift(newItem);
  await localforage.setItem(ITEMS_KEY, items);
  return newItem;
}

export async function updateItem(id, updates) {
  const items = await getAllItems();
  const idx = items.findIndex(i => i.id === id);
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updates };
    await localforage.setItem(ITEMS_KEY, items);
    return items[idx];
  }
  return null;
}

export async function deleteItem(id) {
  let items = await getAllItems();
  items = items.filter(i => i.id !== id);
  await localforage.setItem(ITEMS_KEY, items);
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

export async function saveCollection(collection) {
  const collections = await getAllCollections();
  const newCollection = {
    id: uuidv4(),
    ...collection,
    createdAt: Date.now(),
  };
  collections.push(newCollection);
  await localforage.setItem(COLLECTIONS_KEY, collections);
  return newCollection;
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
