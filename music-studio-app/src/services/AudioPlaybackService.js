import { Platform } from 'react-native';
// import * as Audio from 'expo-audio'; // Deprecated for this session, using expo-av
import UnifiedAudioContext from './UnifiedAudioContext';

class AudioPlaybackService {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map(); // Store loaded audio buffers (Web)
        this.activeSources = []; // Track active audio sources (Web)
        this.nativePlayers = new Map(); // Clip ID -> AudioPlayer Object (Native)
        this.nativePlayerTrackIds = new Map(); // Clip ID -> Track ID (Native)
        // Effects Nodes (Consolidated into Unified Master Bus)
        this.masterBus = null;
        this.masterVolume = 1.0;
        this.masterAvgLevel = 0;

        // Internal State
        this._playbackTimeouts = [];
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = UnifiedAudioContext.get();
            if (!this.audioContext) return;

            this.masterBus = UnifiedAudioContext.getMasterBus();
            this.masterAnalyser = this.masterBus.analyser;
            this.setMasterVolume(this.masterVolume);
        }
    }

    // --- Signal Chain Management (Web) ---
    // Simplified Signal Chain (Web) ---
    async getTrackSignalChain() {
        if (!this.audioContext) {
            await this.init();
            if (!this.audioContext) return null;
        }

        // Return a direct connection to master analyser
        return {
            input: this.masterAnalyser || this.audioContext.destination
        };
    }

    // Helper to create a simple Reverb impulse
    async createReverbImpulse(duration = 2, decay = 2) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        for (let i = 0; i < 2; i++) {
            const channel = impulse.getChannelData(i);
            for (let j = 0; j < length; j++) {
                channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
            }
        }
        return impulse;
    }

    // Get or create a GainNode for a specific track (Legacy/Compatibility)
    getTrackGainNode() {
        return this.masterBus?.gain || null;
    }

    // Distortion Curve Helper
    makeDistortionCurve(amount) {
        const k = typeof amount === 'number' ? amount * 100 : 0;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0 ; i < n_samples; ++i ) {
            const x = i * 2 / n_samples - 1;
            curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
        }
        return curve;
    }

    setDistortion(amount) {
        if (!this.masterBus?.distortion) return;
        this.masterBus.distortion.curve = UnifiedAudioContext.makeDistortionCurve(amount);
    }

    setDelay(mix, time = 0.4, feedback = 0.4) {
        if (!this.masterBus?.delay) return;
        const now = this.audioContext.currentTime;
        this.masterBus.delayMix.gain.setTargetAtTime(mix, now, 0.05);
        this.masterBus.delay.delayTime.setTargetAtTime(time, now, 0.05);
        this.masterBus.delayFeedback.gain.setTargetAtTime(feedback, now, 0.05);
    }

    setReverb(mix) {
        if (!this.masterBus?.reverbMix) return;
        this.masterBus.reverbMix.gain.setTargetAtTime(mix, this.audioContext.currentTime, 0.05);
    }

    setCompressor(threshold, ratio) {
        if (!this.masterBus?.compressor) return;
        this.masterBus.compressor.threshold.setTargetAtTime(threshold, this.audioContext.currentTime, 0.05);
        this.masterBus.compressor.ratio.setTargetAtTime(ratio, this.audioContext.currentTime, 0.05);
    }

    setEQ(low, mid, high) {
        if (!this.masterBus?.eqLow) return;
        this.masterBus.eqLow.gain.setTargetAtTime(low, this.audioContext.currentTime, 0.05);
        this.masterBus.eqMid.gain.setTargetAtTime(mid, this.audioContext.currentTime, 0.05);
        this.masterBus.eqHigh.gain.setTargetAtTime(high, this.audioContext.currentTime, 0.05);
    }

    setMasterPreset(name) {
        UnifiedAudioContext.applyPreset(name);
    }

    async loadAudioFromUri(uri, clipId) {
        if (Platform.OS === 'web') {
            await this.init();
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
    async playClipWeb(clip, startOffset) {
        await this.init();
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

                // Connect to the unified master bus input
                const masterInput = this.masterBus?.input || this.audioContext.destination;
                source.connect(masterInput);

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
            // [STABILITY] Use expo-av for consistent playback with UnifiedAudioEngine
             const { Audio } = require('expo-av');

            if (this.nativePlayers.has(clip.id)) {
                try {
                    const oldPlayer = this.nativePlayers.get(clip.id);
                    oldPlayer.setOnPlaybackStatusUpdate(null); // Remove listeners
                    await oldPlayer.stopAsync();
                    await oldPlayer.unloadAsync(); // Fully release
                } catch (e) {}
                this.nativePlayers.delete(clip.id);
                this.nativePlayerTrackIds.delete(clip.id);
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri: clip.audioUri },
                { shouldPlay: false, volume: this.masterVolume }
            );

            this.nativePlayers.set(clip.id, sound);
            this.nativePlayerTrackIds.set(clip.id, clip.trackId);

            const clipStartTime = clip.startTime;
            const currentPlaybackTime = startOffset;

            if (currentPlaybackTime >= clipStartTime) {
                const offsetIntoClip = currentPlaybackTime - clipStartTime;
                await sound.setPositionAsync(offsetIntoClip);
                await sound.playAsync();
            } else {
                const delay = clipStartTime - currentPlaybackTime;
                const tid = setTimeout(async () => {
                    try {
                        this._playbackTimeouts = this._playbackTimeouts.filter(t => t !== tid);
                        await sound.playAsync();
                    } catch (e) {
                        console.warn('Delayed playback failed', e);
                    }
                }, delay);
                this._playbackTimeouts.push(tid);
            }

            // Cleanup when clip ends
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    try {
                        sound.setOnPlaybackStatusUpdate(null); // Clean up listener
                        await sound.stopAsync();
                        await sound.unloadAsync();
                    } catch (e) {}
                    this.nativePlayers.delete(clip.id);
                    this.nativePlayerTrackIds.delete(clip.id);
                }
            });

        } catch (error) {
            console.error('Error playing clip (Native):', error);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        if (Platform.OS === 'web' && this.masterBus && this.audioContext) {
            const targetGain = Math.min(volume, 2.0); 
            this.masterBus.gain.gain.setTargetAtTime(targetGain, this.audioContext.currentTime, 0.05);
        } else if (Platform.OS !== 'web') {
            // Update all active native players
            this.nativePlayers.forEach(async (sound) => {
                try { await sound.setVolumeAsync(volume); } catch (e) {}
            });
        }
    }

    stopAll() {
        if (Platform.OS === 'web') {
            this.activeSources.forEach(source => {
                try { source.stop(); } catch (e) { }
            });
            this.activeSources = [];
        } else {
            this.nativePlayers.forEach(async (sound, clipId) => {
                try {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                } catch (e) { }
            });
            this.nativePlayers.clear();
            this.nativePlayerTrackIds.clear();

            // Clear pending timeouts
            this._playbackTimeouts.forEach(clearTimeout);
            this._playbackTimeouts = [];
        }
    }

    async playClips(clips, startTime = 0) {
        this.stopAll();
        const promises = clips.map(clip => this.playClip(clip, startTime));
        await Promise.all(promises);
    }

    // --- Visualization Data Access ---
    getFrequencyData() {
        if (Platform.OS !== 'web' || !this.masterAnalyser) return new Uint8Array(0);
        
        // PERFORMANCE: Reuse buffer to avoid GC pressure in the 60fps loop
        if (!this.frequencyDataBuffer || this.frequencyDataBuffer.length !== this.masterAnalyser.frequencyBinCount) {
            this.frequencyDataBuffer = new Uint8Array(this.masterAnalyser.frequencyBinCount);
        }
        
        this.masterAnalyser.getByteFrequencyData(this.frequencyDataBuffer);
        return this.frequencyDataBuffer;
    }

    getPeakLevel() {
        if (Platform.OS !== 'web' || !this.masterAnalyser) return 0;
        const dataArray = new Uint8Array(this.masterAnalyser.fftSize);
        this.masterAnalyser.getByteTimeDomainData(dataArray);

        let max = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const val = Math.abs(dataArray[i] - 128) / 128;
            if (val > max) max = val;
        }
        return max;
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

