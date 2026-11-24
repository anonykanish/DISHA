/**
 * IndexedDB storage for offline maps and static navigation directions.
 * Does NOT store sensitive medical records.
 */

const DB_NAME = 'disha_offline_db';
const DB_VERSION = 1;
const STORE_MAPS = 'hospital_maps';
const STORE_DIRECTIONS = 'cached_directions';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_MAPS)) {
        db.createObjectStore(STORE_MAPS, { keyPath: 'hospitalId' });
      }
      if (!db.objectStoreNames.contains(STORE_DIRECTIONS)) {
        db.createObjectStore(STORE_DIRECTIONS, { keyPath: 'routeKey' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineMap(hospitalId: string, mapData: any): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_MAPS, 'readwrite');
    tx.objectStore(STORE_MAPS).put({ hospitalId, mapData, cachedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Could not cache map to IndexedDB:', err);
  }
}

export async function getOfflineMap(hospitalId: string): Promise<any | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_MAPS, 'readonly');
      const req = tx.objectStore(STORE_MAPS).get(hospitalId);
      req.onsuccess = () => resolve(req.result ? req.result.mapData : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

export async function cacheOfflineRoute(routeKey: string, routeData: any): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_DIRECTIONS, 'readwrite');
    tx.objectStore(STORE_DIRECTIONS).put({ routeKey, routeData, cachedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Could not cache route to IndexedDB:', err);
  }
}

export async function getCachedOfflineRoute(routeKey: string): Promise<any | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DIRECTIONS, 'readonly');
      const req = tx.objectStore(STORE_DIRECTIONS).get(routeKey);
      req.onsuccess = () => resolve(req.result ? req.result.routeData : null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}
