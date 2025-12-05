import { Platform } from 'react-native';

const DB_NAME = 'MusicAppStorage';
export const STORE_NAME = 'files';

let dbInstance = null;
const blobURLCache = new Map(); // Track created blob URLs for cleanup

export const initDB = () => {
    if (dbInstance) return Promise.resolve(dbInstance);

    if (Platform.OS !== 'web' || typeof indexedDB === 'undefined') {
        return Promise.resolve(null);
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };
        request.onerror = (event) => reject(event.target.error);
    });
};

/**
 * Saves a file (from URI) to IndexedDB on Web.
 * Returns a persistent key reference instead of a temporary blob URL.
 */
export const saveFileToLocal = async (uri, key) => {
    if (Platform.OS !== 'web') return uri;

    try {
        const db = await initDB();
        if (!db) return uri;

        // Fetch the blob from the temporary URI
        const response = await fetch(uri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(blob, key);

            tx.oncomplete = () => {
                // Return the key instead of a blob URL
                // The key will be used to retrieve the blob later
                resolve(`idb://${key}`);
            };
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error('Error saving to IDB:', error);
        return uri;
    }
};

/**
 * Retrieves a file from IndexedDB on Web and creates a fresh blob URL.
 * Returns null if not found or not on Web.
 */
export const getFileFromLocal = async (keyOrUri) => {
    if (Platform.OS !== 'web') return keyOrUri;

    // Extract key from idb:// URI or use as-is
    const key = keyOrUri?.startsWith('idb://') ? keyOrUri.slice(6) : keyOrUri;

    try {
        const db = await initDB();
        if (!db) return keyOrUri;

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => {
                const blob = request.result;
                if (blob) {
                    // Revoke old URL if exists
                    if (blobURLCache.has(key)) {
                        URL.revokeObjectURL(blobURLCache.get(key));
                    }

                    // Create fresh blob URL
                    const blobURL = URL.createObjectURL(blob);
                    blobURLCache.set(key, blobURL);
                    resolve(blobURL);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error reading from IDB:', error);
        return null;
    }
};

/**
 * Deletes a file from IndexedDB on Web and revokes its blob URL.
 */
export const deleteFileFromLocal = async (keyOrUri) => {
    if (Platform.OS !== 'web') return;

    // Extract key from idb:// URI or use as-is
    const key = keyOrUri?.startsWith('idb://') ? keyOrUri.slice(6) : keyOrUri;

    try {
        const db = await initDB();
        if (!db) return;

        // Revoke blob URL if exists
        if (blobURLCache.has(key)) {
            URL.revokeObjectURL(blobURLCache.get(key));
            blobURLCache.delete(key);
        }

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error deleting from IDB:', error);
    }
};

/**
 * Cleanup all blob URLs (call on app unmount)
 */
export const cleanupBlobURLs = () => {
    if (Platform.OS !== 'web') return;

    blobURLCache.forEach((url) => {
        URL.revokeObjectURL(url);
    });
    blobURLCache.clear();
};
