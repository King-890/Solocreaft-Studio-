// Audio playback service handling both Web Audio API (Web) and Expo AV (Native)
import { Platform } from 'react-native';
import { Audio } from 'expo-av';

class AudioPlaybackService {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map(); // Store loaded audio buffers (Web)
        this.activeSources = []; // Track active audio sources (Web)
        this.trackGainNodes = new Map(); // Track ID -> GainNode (Web)
        this.nativeSounds = new Map(); // Clip ID -> Sound Object (Native)
        this.nativeSoundTrackIds = new Map(); // Clip ID -> Track ID (Native)
    }

    init() {
        if (Platform.OS === 'web' && !this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Get or create a GainNode for a specific track (Web)
    getTrackGainNode(trackId) {
        if (!this.audioContext) return null;

        if (!this.trackGainNodes.has(trackId)) {
            const gainNode = this.audioContext.createGain();
            gainNode.connect(this.audioContext.destination);
            this.trackGainNodes.set(trackId, gainNode);
        }
        return this.trackGainNodes.get(trackId);
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

                // Connect to the specific track's GainNode instead of destination
                const trackGainNode = this.getTrackGainNode(clip.trackId);
                source.connect(trackGainNode);

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
            if (this.nativeSounds.has(clip.id)) {
                const oldSound = this.nativeSounds.get(clip.id);
                await oldSound.unloadAsync();
                this.nativeSounds.delete(clip.id);
                this.nativeSoundTrackIds.delete(clip.id);
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: clip.audioUri },
                { shouldPlay: false }
            );

            this.nativeSounds.set(clip.id, sound);
            this.nativeSoundTrackIds.set(clip.id, clip.trackId);

            const clipStartTime = clip.startTime;
            const currentPlaybackTime = startOffset;

            if (currentPlaybackTime >= clipStartTime) {
                const offsetIntoClip = currentPlaybackTime - clipStartTime;
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

            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                    this.nativeSounds.delete(clip.id);
                    this.nativeSoundTrackIds.delete(clip.id);
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
            this.nativeSoundTrackIds.clear();
        }
    }

    async playClips(clips, startTime = 0) {
        this.stopAll();
        const promises = clips.map(clip => this.playClip(clip, startTime));
        await Promise.all(promises);
    }

    // --- Real-time Mixer Controls ---

    setTrackVolume(trackId, volume) {
        if (Platform.OS === 'web') {
            const gainNode = this.getTrackGainNode(trackId);
            if (gainNode) {
                // Smooth transition to avoid clicks
                gainNode.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.02);
            }
        } else {
            // Native: Iterate all active sounds for this track
            this.nativeSounds.forEach(async (sound, clipId) => {
                if (this.nativeSoundTrackIds.get(clipId) === trackId) {
                    try {
                        await sound.setVolumeAsync(volume);
                    } catch (e) {
                        console.warn('Failed to set volume for clip', clipId);
                    }
                }
            });
        }
    }

    setTrackMute(trackId, muted, previousVolume) {
        const targetVolume = muted ? 0 : previousVolume;
        this.setTrackVolume(trackId, targetVolume);
    }

    setTrackPan(trackId, pan) {
        if (Platform.OS === 'web') {
            // Web Audio API Pan
            // Note: This requires a StereoPannerNode to be set up in the audio graph
            // For now, we'll log it as a placeholder or implement if PannerNode exists
            console.log(`Setting track ${trackId} pan to ${pan}`);
        } else {
            // console.log('Pan not supported on native expo-av yet');
        }
    }

    setTrackGain(trackId, gain) {
        // Gain is essentially volume, but applied before the fader. 
        // For simplicity, we might multiply it with volume in the future.
        console.log(`Setting track ${trackId} gain to ${gain}`);
    }

    setTrackEQ(trackId, eq) {
        console.log(`Setting track ${trackId} EQ:`, eq);
        // Web: BiquadFilterNode
    }

    setTrackAuxSend(trackId, sendIndex, level) {
        console.log(`Setting track ${trackId} Aux ${sendIndex} to ${level}`);
    }

    setTrackCompressor(trackId, settings) {
        console.log(`Setting track ${trackId} Compressor:`, settings);
        // Web: DynamicsCompressorNode
    }

    async playTestTone() {
        console.log('🎵 Playing test tone...');
        if (Platform.OS === 'web') {
            this.init();
            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);

                gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1);

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.start();
                oscillator.stop(this.audioContext.currentTime + 1);
            } catch (e) {
                console.error('Web test tone failed:', e);
            }
        } else {
            try {
                const UnifiedAudioEngine = require('./UnifiedAudioEngine').default;
                await UnifiedAudioEngine.playSound('A4', 'synth');
                console.log('✅ Native test tone played (A4 - 440Hz)');
            } catch (e) {
                console.error('Native test tone failed:', e);
            }
        }
    }
}

export default new AudioPlaybackService();
