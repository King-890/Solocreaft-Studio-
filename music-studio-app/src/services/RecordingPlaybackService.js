// Simple recording playback service that handles idb:// URIs
// Uses HTML5 Audio on web, expo-av on native
import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import { initDB, STORE_NAME } from '../utils/webStorage';

class RecordingPlaybackService {
    constructor() {
        this.currentSound = null;
        this.currentBlobUrl = null;
    }

    async play(uri) {
        // Stop any existing playback
        await this.stop();

        // Handle idb:// URIs by fetching from IndexedDB
        let playableUri = uri;
        console.log('🎵 RecordingPlaybackService.play() called with URI:', uri);

        if (Platform.OS === 'web' && uri.startsWith('idb://')) {
            try {
                const key = uri.slice(6); // Remove 'idb://' prefix
                console.log('📦 Fetching from IndexedDB, key:', key);

                // Access IndexedDB to get the Blob
                const db = await initDB();

                if (!db) {
                    throw new Error('IndexedDB not available');
                }

                const blob = await new Promise((resolve, reject) => {
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const request = store.get(key);

                    request.onsuccess = () => {
                        resolve(request.result);
                    };
                    request.onerror = () => reject(request.error);
                });

                if (!blob || !(blob instanceof Blob)) {
                    console.error('❌ Recording not found in IndexedDB or invalid format');
                    throw new Error('Recording not found or invalid format');
                }

                console.log('✅ Blob retrieved from IndexedDB:', blob.type, blob.size, 'bytes');

                // Create a blob URL for playback
                playableUri = URL.createObjectURL(blob);
                this.currentBlobUrl = playableUri;
                console.log('✅ Created blob URL:', playableUri);
            } catch (error) {
                console.error('❌ Error loading recording from IndexedDB:', error);
                throw new Error('Could not load recording from storage');
            }
        }

        if (Platform.OS === 'web') {
            // Web: Use HTML5 Audio
            return new Promise((resolve, reject) => {
                try {
                    const audio = new window.Audio(playableUri);

                    audio.onended = () => {
                        this.cleanup();
                        resolve();
                    };

                    audio.onerror = (e) => {
                        console.error('Audio playback error:', e);
                        this.cleanup();
                        reject(new Error('Failed to play audio'));
                    };

                    audio.play()
                        .then(() => {
                            this.currentSound = audio;
                        })
                        .catch(reject);
                } catch (error) {
                    this.cleanup();
                    reject(error);
                }
            });
        } else {
            // Native: Use expo-av
            try {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: playableUri },
                    { shouldPlay: true }
                );
                this.currentSound = sound;

                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        this.currentSound = null;
                    }
                });
            } catch (error) {
                console.error('Native audio playback error:', error);
                throw error;
            }
        }
    }

    async pause() {
        if (!this.currentSound) return;

        if (Platform.OS === 'web') {
            this.currentSound.pause();
        } else {
            await this.currentSound.pauseAsync();
        }
    }

    async resume() {
        if (!this.currentSound) return;

        if (Platform.OS === 'web') {
            await this.currentSound.play();
        } else {
            await this.currentSound.playAsync();
        }
    }

    cleanup() {
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }
    }

    async stop() {
        if (!this.currentSound) return;

        try {
            if (Platform.OS === 'web') {
                this.currentSound.pause();
                this.currentSound.currentTime = 0;
            } else {
                await this.currentSound.stopAsync();
                await this.currentSound.unloadAsync();
            }
        } catch (error) {
            console.log('Error stopping sound:', error);
        } finally {
            this.currentSound = null;
            this.cleanup();
        }
    }

    isPlaying() {
        if (!this.currentSound) return false;

        if (Platform.OS === 'web') {
            return !this.currentSound.paused;
        }
        return true;
    }
}

export default new RecordingPlaybackService();
