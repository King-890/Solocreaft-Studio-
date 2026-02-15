import { Platform } from 'react-native';
import { getSampleUrl, INSTRUMENTS } from './SampleLibrary';

class WebAudioEngine {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.bufferCache = {}; // Cache for AudioBuffers
        this.loadingPromises = {}; // Track active loads to prevent duplicates
    }

    init() {
        if (Platform.OS !== 'web') return false;

        if (!this.audioContext) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (!AudioCtx) {
                    console.warn('⚠️ AudioContext not available');
                    return false;
                }
                this.audioContext = new AudioCtx();
                this.initialized = true;
                console.log('✅ WebAudioEngine initialized');
            } catch (error) {
                console.error('❌ Failed to initialize WebAudioEngine:', error);
                return false;
            }
        }
        return true;
    }

    async preloadInstrument(instrumentName) {
        if (!this.init()) return;
        const instrumentKey = INSTRUMENTS[instrumentName.toUpperCase()] || instrumentName;
        // Preload middle C as a starter
        await this.loadSample(instrumentKey, 'C4');
    }

    async loadSample(instrumentKey, noteName) {
        const url = getSampleUrl(instrumentKey, noteName);
        const cacheKey = `${instrumentKey}-${noteName}`;

        if (this.bufferCache[cacheKey]) return this.bufferCache[cacheKey];
        if (this.loadingPromises[cacheKey]) return this.loadingPromises[cacheKey];

        this.loadingPromises[cacheKey] = (async () => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.bufferCache[cacheKey] = audioBuffer;
                delete this.loadingPromises[cacheKey];
                return audioBuffer;
            } catch (error) {
                console.error(`❌ Failed to load sample ${cacheKey}:`, error);
                delete this.loadingPromises[cacheKey];
                return null;
            }
        })();

        return this.loadingPromises[cacheKey];
    }

    async playSound(noteName, instrument = 'piano') {
        if (!this.init()) return;
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const instrumentKey = INSTRUMENTS[instrument.toUpperCase()] || INSTRUMENTS.PIANO;
        const cacheKey = `${instrumentKey}-${noteName}`;

        let buffer = this.bufferCache[cacheKey];
        
        if (!buffer) {
            // Trigger load but play a synth fallback immediately if it's the first time
            this.loadSample(instrumentKey, noteName);
            this.playSynthFallback(noteName);
            return;
        }

        this.playBuffer(buffer);
    }

    playBuffer(buffer, volume = 0.5) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        // Subtle fade out to prevent clicks
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + buffer.duration);

        source.start(0);
    }

    // Quick fallback if sample isn't loaded yet
    playSynthFallback(noteName) {
        const notes = { 'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13, 'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00, 'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88 };
        const match = noteName.match(/^([A-G]#?)(\d)$/);
        if (!match) return;
        const [, note, octave] = match;
        const frequency = notes[note] * Math.pow(2, octave - 4);

        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.frequency.value = frequency;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    async playDrumSound(padName, volume = 0.8, pan = 0) {
        if (!this.init()) return;
        
        // Resume context for gesture-triggered audio
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // For drums, we'll keep using the synth generator for now but with better parameters
        // or we could map them to SampleLibrary drums if we added them.
        this.playSynthDrum(padName, volume, pan);
    }

    playSynthDrum(type, volume, pan) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();

        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.audioContext.destination);

        panner.pan.value = pan;

        if (type.includes('kick')) {
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.type = 'sine';
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (type.includes('snare')) {
            osc.frequency.setValueAtTime(200, now);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.type = 'triangle';
            osc.start(now);
            osc.stop(now + 0.2);
        } else {
            osc.frequency.setValueAtTime(1000, now);
            gain.gain.setValueAtTime(volume * 0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.type = 'sawtooth';
            osc.start(now);
            osc.stop(now + 0.05);
        }
    }

    stopAll() {
        if (this.audioContext) {
            this.audioContext.close().then(() => {
                this.audioContext = null;
                this.initialized = false;
                this.init();
            });
        }
    }

    preload() {
        this.init();
        // Preload common instruments
        this.preloadInstrument('piano');
        this.preloadInstrument('guitar');
    }
}

export default new WebAudioEngine();
