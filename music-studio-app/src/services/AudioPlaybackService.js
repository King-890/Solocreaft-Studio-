// Audio playback service handling both Web Audio API (Web) and Expo AV (Native)
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

class AudioPlaybackService {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map(); // Store loaded audio buffers (Web)
        this.activeSources = []; // Track active audio sources (Web)
        this.nativeSounds = new Map(); // Track loaded native sounds (Native)
    }

    init() {
        if (Platform.OS === 'web' && !this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async loadAudioFromUri(uri, clipId) {
        if (Platform.OS === 'web') {
            this.init();
            try {
                const response = await fetch(uri);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.audioBuffers.set(clipId, audioBuffer);
                return audioBuffer;
            } catch (error) {
                console.error('Error loading audio (Web):', error);
                throw new Error('Failed to load audio file.');
            }
        } else {
            // Native: expo-av handles loading during playback creation, 
            // but we can pre-load if needed. For now, we'll just return true.
            return true;
        }
    }

    playClip(clip, startOffset = 0) {
        if (Platform.OS === 'web') {
            return this.playClipWeb(clip, startOffset);
        } else {
            return this.playClipNative(clip, startOffset);
        }
    }

    // --- Web Implementation ---
    playClipWeb(clip, startOffset) {
        this.init();
        return new Promise(async (resolve) => {
            try {
                let audioBuffer = this.audioBuffers.get(clip.id);
                if (!audioBuffer) {
                    audioBuffer = await this.loadAudioFromUri(clip.audioUri, clip.id);
                    if (!audioBuffer) {
                        resolve();
                        return;
                    }
                }

                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);

                const clipStartTime = clip.startTime / 1000;
                const currentPlaybackTime = startOffset / 1000;

                if (currentPlaybackTime >= clipStartTime) {
                    const offsetIntoClip = currentPlaybackTime - clipStartTime;
                    if (offsetIntoClip < audioBuffer.duration) {
                        source.start(0, offsetIntoClip);
                    } else {
                        resolve(); // Clip already finished
                        return;
                    }
                } else {
                    const delay = clipStartTime - currentPlaybackTime;
                    source.start(this.audioContext.currentTime + delay);
                }

                this.activeSources.push(source);

                source.onended = () => {
                    this.activeSources = this.activeSources.filter(s => s !== source);
                    resolve();
                };
            } catch (error) {
                console.error('Error playing clip (Web):', error);
                resolve();
            }
        });
    }

    // --- Native Implementation ---
    async playClipNative(clip, startOffset) {
        try {
            // Unload existing if any (simple implementation)
            if (this.nativeSounds.has(clip.id)) {
                const oldSound = this.nativeSounds.get(clip.id);
                await oldSound.unloadAsync();
                this.nativeSounds.delete(clip.id);
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: clip.audioUri },
                { shouldPlay: false }
            );

            this.nativeSounds.set(clip.id, sound);

            const clipStartTime = clip.startTime; // ms
            const currentPlaybackTime = startOffset; // ms

            if (currentPlaybackTime >= clipStartTime) {
                const offsetIntoClip = currentPlaybackTime - clipStartTime;
                // Check duration if possible, but for now just play from offset
                await sound.playFromPositionAsync(offsetIntoClip);
            } else {
                const delay = clipStartTime - currentPlaybackTime;
                setTimeout(async () => {
                    try {
                        await sound.playAsync();
                    } catch (e) {
                        console.warn('Delayed playback failed', e);
                    }
                }, delay);
            }

            // Cleanup when done
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                    this.nativeSounds.delete(clip.id);
                }
            });

        } catch (error) {
            console.error('Error playing clip (Native):', error);
        }
    }

    stopAll() {
        if (Platform.OS === 'web') {
            this.activeSources.forEach(source => {
                try { source.stop(); } catch (e) { }
            });
            this.activeSources = [];
        } else {
            this.nativeSounds.forEach(async (sound) => {
                try {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                } catch (e) { }
            });
            this.nativeSounds.clear();
        }
    }

    async playClips(clips, startTime = 0) {
        this.stopAll();
        const promises = clips.map(clip => this.playClip(clip, startTime));
        await Promise.all(promises);
    }
}

export default new AudioPlaybackService();
