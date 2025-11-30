import { Platform } from 'react-native';

const DB_NAME = 'MusicAppStorage';
const STORE_NAME = 'files';

let dbInstance = null;

const initDB = () => {
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
 * Returns the original URI on Native, or a new persistent Blob URI on Web.
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
                // Create a new URL for the stored blob
                resolve(URL.createObjectURL(blob));
            };
            tx.onerror = () => reject(tx.error);
        });
    } catch (error) {
        console.error('Error saving to IDB:', error);
        return uri;
    }
};

/**
 * Retrieves a file from IndexedDB on Web.
 * Returns null if not found or not on Web.
 */
export const getFileFromLocal = async (key) => {
    if (Platform.OS !== 'web') return null;

    try {
        const db = await initDB();
        if (!db) return null;

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => {
                const blob = request.result;
                if (blob) {
                    resolve(URL.createObjectURL(blob));
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
 * Deletes a file from IndexedDB on Web.
 */
export const deleteFileFromLocal = async (key) => {
    if (Platform.OS !== 'web') return;

    try {
        const db = await initDB();
        if (!db) return;

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
