import { Platform } from 'react-native';
import { getSampleUrl, INSTRUMENTS, getLocalPercussionAsset } from './SampleLibrary';
import { INSTRUMENT_TRACK_MAP } from '../constants/AudioConstants';
import UnifiedAudioContext from './UnifiedAudioContext';

class WebAudioEngine {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.bufferCache = {}; // Cache for AudioBuffers
        this.loadingPromises = {}; // Track active loads to prevent duplicates
        this.playingSources = new Map(); // Track active sources for stopping
        this.sustainActive = false; // Global sustain pedal state
        this.sustainedNotes = new Set(); // Notes to release when pedal is lifted
        
        // [NATURAL SOUND] Round Robin Tracking
        this.percussionIndices = {}; // Track next variation index for each sound
        
        // [NATURAL SOUND] Convolution Reverb
        this.convolverNode = null;
        this.reverbWetGain = null;
        this.reverbDryGain = null;

        // [VOLUME OPTIMIZATION] Master Gain & Compression
        this.masterGainNode = null;
        this.masterCompressor = null;
    }

    setSustain(active) {
        this.sustainActive = active;
        if (!active) {
            // Release all notes currently in sustain
            this.sustainedNotes.forEach(playId => {
                const [instrument, noteName] = playId.split('-');
                this.stopSound(noteName, instrument, true);
            });
            this.sustainedNotes.clear();
        }
    }

    async init() {
        if (Platform.OS !== 'web') return false;
        if (this.initialized) {
            // Even if initialized, check if we need to resume
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await UnifiedAudioContext.resume();
            }
            return true;
        }
        
        try {
            this.audioContext = UnifiedAudioContext.get();
            if (!this.audioContext) return false;

            // Initialize Master Gain Staging
            this.initMasterChain();

            // Initialize Reverb Chain
            this.initReverb();

            // [RESUME]
            if (this.audioContext.state === 'suspended') {
                await UnifiedAudioContext.resume();
            }

            this.initialized = true;
            console.log('✅ WebAudioEngine Initialized with Gain-Optimized Sound Engine');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize WebAudioEngine:', error);
            return false;
        }
    }

    initMasterChain() {
        if (!this.audioContext) return;

        // 1. Dynamics Compressor (Acts as an Automatic Gain Control)
        this.masterCompressor = this.audioContext.createDynamicsCompressor();
        this.masterCompressor.threshold.setValueAtTime(-24, this.audioContext.currentTime);
        this.masterCompressor.knee.setValueAtTime(40, this.audioContext.currentTime);
        this.masterCompressor.ratio.setValueAtTime(4, this.audioContext.currentTime);
        this.masterCompressor.attack.setValueAtTime(0, this.audioContext.currentTime);
        this.masterCompressor.release.setValueAtTime(0.25, this.audioContext.currentTime);

        // 2. Master Gain (Baseline 200% boost)
        this.masterGainNode = this.audioContext.createGain();
        this.masterGainNode.gain.setValueAtTime(2.0, this.audioContext.currentTime);

        // 3. Final Limiter Node (Prevent Distortion)
        this.masterLimiter = this.audioContext.createDynamicsCompressor();
        this.masterLimiter.threshold.setValueAtTime(-1.0, this.audioContext.currentTime);
        this.masterLimiter.knee.setValueAtTime(0, this.audioContext.currentTime);
        this.masterLimiter.ratio.setValueAtTime(20, this.audioContext.currentTime);
        this.masterLimiter.attack.setValueAtTime(0, this.audioContext.currentTime);
        this.masterLimiter.release.setValueAtTime(0.1, this.audioContext.currentTime);

    // Connect Chain: Sources -> Compressor -> Gain -> Limiter -> Destination
    this.masterCompressor.connect(this.masterGainNode);
    this.masterGainNode.connect(this.masterLimiter);
    this.masterLimiter.connect(this.audioContext.destination);
    
    // [REFINEMENT] Immediate context resume attempt
    if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
    }
}

    initReverb() {
        if (!this.audioContext) return;
        
        this.convolverNode = this.audioContext.createConvolver();
        this.reverbWetGain = this.audioContext.createGain();
        this.reverbDryGain = this.audioContext.createGain();
        
        this.reverbWetGain.gain.setValueAtTime(0.3, this.audioContext.currentTime); // Default 30% wet
        this.reverbDryGain.gain.setValueAtTime(0.8, this.audioContext.currentTime);
        
        // Use high-quality synthetic impulse (Zero-latency, NO CORS ERRORS)
        this.convolverNode.buffer = this.createSyntheticImpulse(2.0, 2.0);
    }

    createSyntheticImpulse(duration, decay) {
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

    async attemptResume() {
        return UnifiedAudioContext.resume();
    }

    async preloadInstrument(instrumentName) {
        if (!this.init()) return;
        const instrumentKey = INSTRUMENTS[instrumentName.toUpperCase()] || instrumentName;
        // Preload middle C as a starter
        await this.loadSample(instrumentKey, 'C4');
    }

    async loadSample(instrumentKey, noteName, isPercussion = false, velocity = 0.8) {
        // Round Robin index for percussion
        const rrIndex = isPercussion ? (this.percussionIndices[noteName] || 0) : 0;
        
        const url = isPercussion 
            ? getLocalPercussionAsset(instrumentKey, noteName, rrIndex) 
            : getSampleUrl(instrumentKey, noteName, velocity);
            
        if (!url) return null;
        
        const cacheKey = isPercussion ? `${instrumentKey}-${noteName}-${rrIndex}` : `${instrumentKey}-${noteName}-${velocity > 0.6 ? 'hard' : 'soft'}`;

        if (this.bufferCache[cacheKey]) return this.bufferCache[cacheKey];
        if (this.loadingPromises[cacheKey]) return this.loadingPromises[cacheKey];

        this.loadingPromises[cacheKey] = (async () => {
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Sample load timeout')), 3000)
            );

            try {
                const response = await Promise.race([fetch(url), timeoutPromise]);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.bufferCache[cacheKey] = audioBuffer;
                delete this.loadingPromises[cacheKey];
                return audioBuffer;
            } catch (error) {
                console.warn(`⚠️ Sample ${cacheKey} load failed or timed out:`, error.message);
                delete this.loadingPromises[cacheKey];
                return null;
            }
        })();

        return this.loadingPromises[cacheKey];
    }

    async playSound(noteName, instrument = 'piano', delay = 0, velocity = 0.85) {
        // [RESUME] Synchronous check/resume for browser gesture linkage
        if (this.audioContext && this.audioContext.state !== 'running') {
            this.audioContext.resume().catch(() => {});
        }
        
        if (!this.init()) return;

        const instrumentKey = INSTRUMENTS[instrument.toUpperCase()] || INSTRUMENTS.PIANO;
        const cacheKey = `${instrumentKey}-${noteName}-${velocity > 0.6 ? 'hard' : 'soft'}`;

        let buffer = this.bufferCache[cacheKey] || this.bufferCache[`${instrumentKey}-${noteName}-med`];
        
        const trackId = INSTRUMENT_TRACK_MAP[instrument.toLowerCase()];
        const AudioPlaybackService = require('./AudioPlaybackService').default;
        const targetNode = trackId ? AudioPlaybackService.getTrackSignalChain(trackId)?.input : null;

        // PHYSICAL ACCURACY: Wait for real sample if it's not loaded
        if (!buffer) {
            console.log(`📥 Real-time loading sample for ${cacheKey}...`);
            buffer = await this.loadSample(instrumentKey, noteName, false, velocity);
            
            // If still no buffer (network fail), use High-Fidelity physical fallback
            if (!buffer) {
                return this.playSynthFallback(noteName, instrument, targetNode, velocity);
            }
        }

        this.playBuffer(buffer, velocity, instrument, noteName, targetNode, delay);
    }

    playBuffer(buffer, volume = 0.5, instrument, noteName, destination = null, delay = 0, pan = 0) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();
        const filter = this.audioContext.createBiquadFilter();

        source.buffer = buffer;
        
        // [NATURAL SOUND] VELOCITY-BASED DYNAMIC FILTERING (Simulates physical strike)
        filter.type = 'lowpass';
        // Harder strikes are brighter (more high frequencies), softer are mellower
        const cutoff = 12000 * Math.pow(volume, 0.4) + 800;
        filter.frequency.setValueAtTime(cutoff, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.7, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(panner);
        
        // [NATURAL SOUND] Route to Reverb Chain
        const globalChainInput = this.masterCompressor || this.audioContext.destination;
        panner.connect(globalChainInput); // Dry path (Now compressed & boosted)
        
        if (this.convolverNode) {
            panner.connect(this.convolverNode); // Send to reverb
            this.convolverNode.connect(this.reverbWetGain);
            this.reverbWetGain.connect(globalChainInput); // Wet path
        }

        panner.pan.setValueAtTime(pan, this.audioContext.currentTime);

        const startTime = this.audioContext.currentTime + delay;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.005);
        
        const duration = buffer.duration;
        const releaseTime = 0.4; // Slightly longer for more natural tail
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration + releaseTime);
        
        source.start(startTime);
        source.stop(startTime + duration + releaseTime + 0.1);

        const playId = `${instrument}-${noteName}`;
        if (!this.playingSources.has(playId)) {
            this.playingSources.set(playId, []);
        }
        this.playingSources.get(playId).push({ source, gainNode });
        
        source.onended = () => {
            const sources = this.playingSources.get(playId);
            if (sources) {
                this.playingSources.set(playId, sources.filter(s => s.source !== source));
            }
        };
    }

    // ADVANCED PHYSICAL MODELING ENGINE
    playSynthFallback(noteName, instrument, destination = null, velocity = 0.5) {
        const SEMITONE_MAP = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 
            'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };
        
        const match = noteName.match(/^([A-G][#b]?)(\d)$/);
        if (!match) return;
        let [, note, octave] = match;
        let octaveNum = parseInt(octave);
        if (note === 'B#') { note = 'C'; octaveNum++; }
        if (note === 'E#') { note = 'F'; }
        
        const freq = 440 * Math.pow(2, (octaveNum - 4) + (SEMITONE_MAP[note] - 9) / 12);
        if (!isFinite(freq)) return;

        const isString = ['guitar', 'banjo', 'harp', 'sitar', 'violin', 'cello', 'bass'].includes(instrument.toLowerCase());
        
        if (isString) {
            return this.playKarplusStrong(freq, velocity, destination);
        }

        // FM-ish Fallback for non-strings (Piano, Brass, etc)
        try {
            const now = this.audioContext.currentTime;
            const osc = this.audioContext.createOscillator();
            const mod = this.audioContext.createOscillator();
            const modGain = this.audioContext.createGain();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            osc.type = instrument === 'piano' ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now);
            
            mod.frequency.setValueAtTime(freq * 2, now);
            modGain.gain.setValueAtTime(freq * 0.5 * velocity, now);
            modGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

            mod.connect(modGain);
            modGain.connect(osc.frequency);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(10000 * velocity, now);
            filter.frequency.exponentialRampToValueAtTime(400 * velocity + 100, now + 1.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(destination || this.audioContext.destination);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(velocity * 0.7, now + 0.01); // Increased from 0.3
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

            osc.start(now);
            mod.start(now);
            osc.stop(now + 2.1);
            mod.stop(now + 2.1);
        } catch (e) {
            console.error('Physical fallback error:', e);
        }
    }

    // KARPLUS-STRONG STRING SYNTHESIS (Physical Modeling)
    playKarplusStrong(freq, velocity, destination) {
        try {
            const now = this.audioContext.currentTime;
            const duration = 2.0;
            const sampleRate = this.audioContext.sampleRate;
            const bufferSize = Math.round(sampleRate / freq);
            if (bufferSize <= 0) return;
            
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const channelData = buffer.getChannelData(0);
            
            // 1. Initial burst of noise (exciting the string)
            for (let i = 0; i < bufferSize; i++) {
                channelData[i] = (Math.random() * 2 - 1) * velocity;
            }
            
            // 2. Karplus-Strong feedback loop simulation
            const decay = 0.995 - (0.005 * (1 - velocity)); 
            const smoothing = 0.5; 
            
            for (let i = bufferSize; i < channelData.length; i++) {
                const newVal = (channelData[i - bufferSize] + channelData[i - bufferSize - 1]) * smoothing * decay;
                channelData[i] = newVal;
            }

            const source = this.audioContext.createBufferSource();
            const gain = this.audioContext.createGain();
            source.buffer = buffer;
            source.connect(gain);
            gain.connect(destination || this.audioContext.destination);
            
            gain.gain.setValueAtTime(1.0, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
            
            source.start(now);
            source.stop(now + duration);
        } catch (e) {
            console.error('KarplusStrong error:', e);
        }
    }

    stopSound(noteName, instrument = 'piano', force = false) {
        const playId = `${instrument}-${noteName}`;
        
        if (this.sustainActive && !force) {
            this.sustainedNotes.add(playId);
            return;
        }

        const sources = this.playingSources.get(playId);
        
        if (sources && sources.length > 0) {
            const now = this.audioContext.currentTime;
            sources.forEach(({ source, gainNode }) => {
                try {
                    // Quick fade out to prevent clicks
                    gainNode.gain.cancelScheduledValues(now);
                    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    source.stop(now + 0.15);
                } catch (e) {
                    console.warn('Error stopping sound:', e);
                }
            });
            this.playingSources.delete(playId);
        }
    }

    async playDrumSound(padName, instrument = 'drums', volume = 0.8, pan = 0) {
        // [RESUME] Synchronous check for gesture linkage
        if (this.audioContext && this.audioContext.state !== 'running') {
            this.audioContext.resume().catch(() => {});
        }
        
        if (!this.init()) return;

        const AudioPlaybackService = require('./AudioPlaybackService').default;
        // Map instrument to signal chain (Drums, Tabla, Dholak all use '3' for percussion for now)
        const targetNode = AudioPlaybackService.getTrackSignalChain('3')?.input; 

        // Normalize instrument name
        const instrumentKey = instrument.toLowerCase();
        const cacheKey = `${instrumentKey}-${padName}`;
        let buffer = this.bufferCache[cacheKey];

        if (!buffer) {
            // Priority load for percussion
            buffer = await this.loadSample(instrumentKey, padName, true);
        }

        if (buffer) {
            this.playBuffer(buffer, volume, instrumentKey, padName, targetNode, 0, pan);
        } else {
            // Final fallback to synth if sample fails
            this.playSynthDrum(padName, volume, pan, targetNode);
        }
    }

    playSynthDrum(type, volume, pan, destination = null) {
        // Fix for TypeError: type.includes is not a function
        const typeStr = String(type).toLowerCase();
        const now = this.audioContext.currentTime;
        const gain = this.audioContext.createGain();
        const panner = this.audioContext.createStereoPanner();

        gain.connect(panner);
        panner.connect(destination || this.audioContext.destination);
        panner.pan.value = pan;

        if (typeStr.includes('kick') || typeStr === 'dha' || typeStr.includes('conga low') || typeStr === 'djembe') {
            const osc = this.audioContext.createOscillator();
            osc.connect(gain);
            // Congas have a slightly higher resonant pitch than a kick
            const baseFreq = typeStr.includes('conga') ? 180 : (typeStr === 'dha' ? 120 : 150);
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.6);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.type = 'sine';
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (typeStr.includes('snare') || typeStr === 'ta' || typeStr === 'na' || typeStr.includes('bongo') || typeStr.includes('conga high')) {
            const bufferSize = this.audioContext.sampleRate * 0.2;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;

            const osc = this.audioContext.createOscillator();
            osc.type = 'triangle';
            // Bongos have high, tight pitches
            let pitch = 180;
            if (typeStr.includes('bongo high')) pitch = 600;
            else if (typeStr.includes('bongo low')) pitch = 350;
            else if (typeStr.includes('conga high')) pitch = 280;
            else if (typeStr === 'na') pitch = 440;
            
            osc.frequency.setValueAtTime(pitch, now);

            const noiseGain = this.audioContext.createGain();
            const toneGain = this.audioContext.createGain();

            noise.connect(noiseGain);
            osc.connect(toneGain);
            noiseGain.connect(gain);
            toneGain.connect(gain);

            noiseGain.gain.setValueAtTime(volume * 0.8, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + (typeStr.includes('bongo') ? 0.08 : 0.2));
            toneGain.gain.setValueAtTime(volume * 0.6, now);
            toneGain.gain.exponentialRampToValueAtTime(0.01, now + (typeStr.includes('bongo') ? 0.12 : 0.2));

            noise.start(now);
            osc.start(now);
            noise.stop(now + 0.2);
            osc.stop(now + 0.2);
        } else if (typeStr.includes('hihat') || typeStr === 'tin' || typeStr === 'te' || typeStr === 'ke' || typeStr.includes('shaker')) {
            const bufferSize = this.audioContext.sampleRate * 0.15;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;

            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            // Shakers have a lower cutoff than hihats and more 'grain'
            filter.frequency.value = typeStr.includes('shaker') ? 3500 : (typeStr === 'ke' ? 2000 : 7000);

            noise.connect(filter);
            filter.connect(gain);

            gain.gain.setValueAtTime(volume * (typeStr.includes('shaker') ? 0.5 : 0.3), now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + (typeStr.includes('shaker') ? 0.12 : 0.05));

            noise.start(now);
            noise.stop(now + 0.15);
        } else if (typeStr === 'ge' || typeStr === 'tun') {
            const osc = this.audioContext.createOscillator();
            osc.connect(gain);
            osc.frequency.setValueAtTime(typeStr === 'ge' ? 80 : 200, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.6);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
            osc.type = 'sine';
            osc.start(now);
            osc.stop(now + 0.6);
        } else if (typeStr.includes('cowbell')) {
            // Metallic cowbell sound (using multiple oscillators for harmonics)
            const osc1 = this.audioContext.createOscillator();
            const osc2 = this.audioContext.createOscillator();
            osc1.type = 'square';
            osc2.type = 'square';
            osc1.frequency.setValueAtTime(560, now);
            osc2.frequency.setValueAtTime(800, now);
            
            osc1.connect(gain);
            osc2.connect(gain);
            
            gain.gain.setValueAtTime(volume * 0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            
            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + 0.3);
            osc2.stop(now + 0.3);
        } else {
            // Generic knock
            const osc = this.audioContext.createOscillator();
            osc.connect(gain);
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.2);
            gain.gain.setValueAtTime(volume, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.type = 'sine';
            osc.start(now);
            osc.stop(now + 0.2);
        }
    }

    stopAll() {
        if (this.playingSources) {
            const now = this.audioContext ? this.audioContext.currentTime : 0;
            this.playingSources.forEach((sources) => {
                sources.forEach(({ source, gainNode }) => {
                    try {
                        if (gainNode && now) {
                            gainNode.gain.cancelScheduledValues(now);
                            gainNode.gain.setTargetAtTime(0, now, 0.05);
                        }
                        source.stop(now + 0.1);
                    } catch (e) {}
                });
            });
            this.playingSources.clear();
        }
        this.sustainedNotes.clear();
    }


    playTestTone() {
        if (!this.init()) return;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        osc.stop(this.audioContext.currentTime + 1);
        console.log('🎵 Web Test Tone Played');
    }

    preload() {
        this.init();
        // Preload common instruments
        this.preloadInstrument('piano');
        this.preloadInstrument('guitar');
    }
}

export default new WebAudioEngine();
