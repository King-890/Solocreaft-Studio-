import { Platform } from 'react-native';
import * as Audio from 'expo-audio';
import UnifiedAudioContext from './UnifiedAudioContext';

class AudioPlaybackService {
    constructor() {
        this.audioContext = null;
        this.audioBuffers = new Map(); // Store loaded audio buffers (Web)
        this.activeSources = []; // Track active audio sources (Web)
        this.nativePlayers = new Map(); // Clip ID -> AudioPlayer Object (Native)
        this.nativePlayerTrackIds = new Map(); // Clip ID -> Track ID (Native)
        this.masterGainNode = null; // Master Volume Node
        this.masterVolume = 1.0; 
        
        // Effects Nodes
        this.masterDistortionNode = null;
        this.masterDelayNode = null;
        this.masterDelayFeedback = null;
    }

    async init() {
        if (!this.audioContext) {
            this.audioContext = UnifiedAudioContext.get();
            if (!this.audioContext) return;

            console.log('🔗 AudioPlaybackService Initialized with UnifiedAudioContext');
            
            this.masterAnalyser = this.audioContext.createAnalyser();
            this.masterAnalyser.fftSize = 2048;

            // GLOBAL STUDIO REVERB BUS
            this.masterReverbNode = this.audioContext.createConvolver();
            const impulse = await this.createReverbImpulse(2.5, 3.0); // Studio Hall size
            this.masterReverbNode.buffer = impulse;
            
            this.masterReverbGain = this.audioContext.createGain();
            this.masterReverbGain.gain.value = 0.15; // Subtle but noticeable 15% wet
            
            this.masterReverbNode.connect(this.masterReverbGain);
            this.masterReverbGain.connect(this.masterAnalyser);

            // MASTER LIMITER/PROTECTION CHAIN
            this.masterLimiter = this.audioContext.createDynamicsCompressor();
            this.masterLimiter.threshold.setValueAtTime(-1, this.audioContext.currentTime);
            this.masterLimiter.knee.setValueAtTime(0, this.audioContext.currentTime);
            this.masterLimiter.ratio.setValueAtTime(20, this.audioContext.currentTime);
            this.masterLimiter.attack.setValueAtTime(0.003, this.audioContext.currentTime);
            this.masterLimiter.release.setValueAtTime(0.1, this.audioContext.currentTime);

            this.masterAnalyser.connect(this.masterLimiter);
            
            // --- EFFECTS RACK ---
            
            // 1. Distortion (WaveShaper)
            this.masterDistortionNode = this.audioContext.createWaveShaper();
            this.masterDistortionNode.curve = this.makeDistortionCurve(0);
            this.masterDistortionNode.oversample = '4x';
            
            // 2. Delay
            this.masterDelayNode = this.audioContext.createDelay(2.0);
            this.masterDelayNode.delayTime.value = 0.4;
            this.masterDelayFeedback = this.audioContext.createGain();
            this.masterDelayFeedback.gain.value = 0.4;
            
            // Delay Loop
            this.masterDelayNode.connect(this.masterDelayFeedback);
            this.masterDelayFeedback.connect(this.masterDelayNode);
            
            this.masterDelayGain = this.audioContext.createGain();
            this.masterDelayGain.gain.value = 0; // Start off (mix)
            this.masterDelayNode.connect(this.masterDelayGain);

            // Connect Chain: Limiter -> [Distortion] -> Gain -> Destination
            this.masterLimiter.connect(this.masterDistortionNode);
            
            this.masterGainNode = this.audioContext.createGain();
            this.masterGainNode.gain.value = 2.5; // Increased baseline boost
            
            this.masterDistortionNode.connect(this.masterGainNode);
            this.masterDelayGain.connect(this.masterGainNode);
            
            this.masterGainNode.connect(this.audioContext.destination);
            
            // Apply current master volume
            this.setMasterVolume(this.masterVolume);
        }
    }

    // --- Signal Chain Management (Web) ---
    // Simplified Signal Chain (Web) ---
    getTrackSignalChain() {
        if (!this.audioContext) {
            this.init();
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
        return this.masterGainNode;
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
        if (!this.masterDistortionNode) return;
        this.masterDistortionNode.curve = this.makeDistortionCurve(amount);
    }

    setDelay(mix, time = 0.4, feedback = 0.4) {
        if (!this.masterDelayNode) return;
        this.masterDelayGain.gain.setTargetAtTime(mix, this.audioContext.currentTime, 0.05);
        this.masterDelayNode.delayTime.setTargetAtTime(time, this.audioContext.currentTime, 0.05);
        this.masterDelayFeedback.gain.setTargetAtTime(feedback, this.audioContext.currentTime, 0.05);
    }

    setReverb(mix) {
        if (!this.masterReverbGain) return;
        this.masterReverbGain.gain.setTargetAtTime(mix, this.audioContext.currentTime, 0.05);
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

                // Connect to the specific track's Signal Chain Input
                const chain = this.getTrackSignalChain(clip.trackId);
                if (chain) {
                    source.connect(chain.input);
                } else {
                    source.connect(this.audioContext.destination);
                }

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
            if (this.nativePlayers.has(clip.id)) {
                this.nativePlayers.get(clip.id).pause();
                this.nativePlayers.delete(clip.id);
                this.nativePlayerTrackIds.delete(clip.id);
            }

            // In expo-audio, we use createAudioPlayer
            const player = Audio.createAudioPlayer(clip.audioUri);
            player.volume = this.masterVolume; // Apply master volume to clip
            
            this.nativePlayers.set(clip.id, player);
            this.nativePlayerTrackIds.set(clip.id, clip.trackId);

            const clipStartTime = clip.startTime;
            const currentPlaybackTime = startOffset;

            if (currentPlaybackTime >= clipStartTime) {
                const offsetIntoClip = currentPlaybackTime - clipStartTime;
                player.seekTo(offsetIntoClip);
                player.play();
            } else {
                const delay = clipStartTime - currentPlaybackTime;
                setTimeout(() => {
                    try {
                        player.play();
                    } catch (e) {
                        console.warn('Delayed playback failed', e);
                    }
                }, delay);
            }

            // Cleanup when clip ends
            player.addListener('playbackStatusUpdate', (status) => {
                if (status.didJustFinish) {
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
        if (Platform.OS === 'web' && this.masterGainNode && this.audioContext) {
            // Apply a 2.5x boost on top of the master slider (Professional Loudness)
            this.masterGainNode.gain.setTargetAtTime(volume * 2.5, this.audioContext.currentTime, 0.05);
        } else if (Platform.OS !== 'web') {
            // Update all active native players
            this.nativePlayers.forEach(player => {
                try { player.volume = volume; } catch (e) {}
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
            this.nativePlayers.forEach((player, clipId) => {
                try {
                    player.pause();
                } catch (e) { }
            });
            this.nativePlayers.clear();
            this.nativePlayerTrackIds.clear();
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

