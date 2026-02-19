// Simple recording playback service that handles idb:// URIs
// Uses HTML5 Audio on web, expo-audio on native
import { Platform } from 'react-native';
import * as Audio from 'expo-audio';
import { initDB, STORE_NAME } from '../utils/webStorage';

class RecordingPlaybackService {
    constructor() {
        this.currentPlayer = null;
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
                            this.currentPlayer = audio;
                        })
                        .catch(reject);
                } catch (error) {
                    this.cleanup();
                    reject(error);
                }
            });
        } else {
            // Native: Use expo-audio
            try {
                const player = Audio.createAudioPlayer(playableUri);
                this.currentPlayer = player;

                player.addListener('playbackStatusUpdate', (status) => {
                    if (status.didJustFinish) {
                        this.currentPlayer = null;
                    }
                });

                player.play();
            } catch (error) {
                console.error('Native audio playback error:', error);
                throw error;
            }
        }
    }

    async pause() {
        if (!this.currentPlayer) return;

        if (Platform.OS === 'web') {
            this.currentPlayer.pause();
        } else {
            this.currentPlayer.pause();
        }
    }

    async resume() {
        if (!this.currentPlayer) return;

        if (Platform.OS === 'web') {
            await this.currentPlayer.play();
        } else {
            this.currentPlayer.play();
        }
    }

    cleanup() {
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }
    }

    async stop() {
        if (!this.currentPlayer) return;

        try {
            if (Platform.OS === 'web') {
                this.currentPlayer.pause();
                this.currentPlayer.currentTime = 0;
            } else {
                this.currentPlayer.pause();
                // seeker cleanup if needed
            }
        } catch (error) {
            console.log('Error stopping sound:', error);
        } finally {
            this.currentPlayer = null;
            this.cleanup();
        }
    }

    isPlaying() {
        if (!this.currentPlayer) return false;

        if (Platform.OS === 'web') {
            return !this.currentPlayer.paused;
        }
        // In expo-audio, isPlaying might be a property or state
        return this.currentPlayer.playing || false;
    }
}

export default new RecordingPlaybackService();

