import { Platform } from 'react-native';
import { AUDIO_CONFIG } from '../constants/UIConfig';
import UnifiedAudioContext from '../services/UnifiedAudioContext';

class AudioManager {
    constructor() {
        this.sounds = {
            river: null,
            wind: null,
            instrument: null,
        };
        this.initialized = false;
        this.audioContext = null;
        this.oscillators = [];
        this.gainNodes = [];
    }

    async initialize() {
        if (this.initialized) return;

        try {
            // Initialize Web Audio API for web platform using UnifiedAudioContext
            if (Platform.OS === 'web') {
                this.audioContext = UnifiedAudioContext.get();
            }

            this.initialized = true;
        } catch (error) {
            console.log('Error initializing audio:', error);
        }
    }

    // Create ambient river sound - GENTLE & RELAXING
    createRiverSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 1; // REDUCED
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // Generate simple white noise - CHUNKED and LIGHTWEIGHT
        const generateRiverChunked = () => {
            const chunkSize = 2500; // REDUCED: Ultra-granular for 60FPS
            let currentSample = 0;

            const processNextChunk = () => {
                const end = Math.min(currentSample + chunkSize, bufferSize);
                
                for (let channel = 0; channel < 2; channel++) {
                    const data = buffer.getChannelData(channel);
                    for (let i = currentSample; i < end; i++) {
                        // Pure white noise is very fast to generate
                        data[i] = (Math.random() * 2 - 1) * 0.5;
                    }
                }

                currentSample = end;
                if (currentSample < bufferSize) {
                    // Yield immediately to the scheduler
                    if (typeof requestAnimationFrame !== 'undefined') {
                        requestAnimationFrame(() => setTimeout(processNextChunk, 0));
                    } else {
                        setTimeout(processNextChunk, 0);
                    }
                } else {
                    finalizeRiver();
                }
            };

            const finalizeRiver = () => {
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.loop = true;

                // Move pink noise shaping to native filters (DOUBLY EFFICIENT)
                const pinkFilter = this.audioContext.createBiquadFilter();
                pinkFilter.type = 'lowpass';
                pinkFilter.frequency.value = 400; // Simulated pink noise roll-off
                pinkFilter.Q.value = 0.7;

                const lowpass1 = this.audioContext.createBiquadFilter();
                lowpass1.type = 'lowpass';
                lowpass1.frequency.value = 600;
                lowpass1.Q.value = 0.5;

                const lowpass2 = this.audioContext.createBiquadFilter();
                lowpass2.type = 'lowpass';
                lowpass2.frequency.value = 300;
                lowpass2.Q.value = 1;

                const highpass = this.audioContext.createBiquadFilter();
                highpass.type = 'highpass';
                highpass.frequency.value = 80;
                highpass.Q.value = 0.5;

                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = AUDIO_CONFIG.river.volume * 0.6;

                const lfo = this.audioContext.createOscillator();
                lfo.frequency.value = 0.05;
                const lfoGain = this.audioContext.createGain();
                lfoGain.gain.value = 0.02;
                lfo.connect(lfoGain);
                lfoGain.connect(gainNode.gain);
                lfo.start(0);

                source.connect(pinkFilter);
                pinkFilter.connect(highpass);
                highpass.connect(lowpass1);
                lowpass1.connect(lowpass2);
                lowpass2.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                source.start(0);
                this.oscillators.push(source);
                this.oscillators.push(lfo);
                this.gainNodes.push(gainNode);
                console.log('✓ Gentle river flowing');
            };

            processNextChunk();
        };

        setTimeout(generateRiverChunked, 50);
    }

    // Create ambient wind sound - SLOW BREEZE
    createWindSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 1; // REDUCED
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // Generate lightweight noise - CHUNKED
        const generateWindChunked = () => {
            const chunkSize = 2500; // REDUCED
            let currentSample = 0;

            const processNextChunk = () => {
                const end = Math.min(currentSample + chunkSize, bufferSize);
                for (let channel = 0; channel < 2; channel++) {
                    const data = buffer.getChannelData(channel);
                    for (let i = currentSample; i < end; i++) {
                        data[i] = (Math.random() * 2 - 1) * 0.3;
                    }
                }

                currentSample = end;
                if (currentSample < bufferSize) {
                    setTimeout(processNextChunk, 0);
                } else {
                    finalizeWind();
                }
            };

            const finalizeWind = () => {
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.loop = true;

                const bandpass = this.audioContext.createBiquadFilter();
                bandpass.type = 'bandpass';
                bandpass.frequency.value = 250;
                bandpass.Q.value = 0.3;

                const lowpass = this.audioContext.createBiquadFilter();
                lowpass.type = 'lowpass';
                lowpass.frequency.value = 500;
                lowpass.Q.value = 0.5;

                const gainNode = this.audioContext.createGain();
                gainNode.gain.value = AUDIO_CONFIG.wind.volume * 0.5;

                const lfo = this.audioContext.createOscillator();
                lfo.frequency.value = 0.03;
                const lfoGain = this.audioContext.createGain();
                lfoGain.gain.value = 0.03;
                lfo.connect(lfoGain);
                lfoGain.connect(gainNode.gain);
                lfo.start(0);

                const filterLfo = this.audioContext.createOscillator();
                filterLfo.frequency.value = 0.02;
                const filterLfoGain = this.audioContext.createGain();
                filterLfoGain.gain.value = 30;
                filterLfo.connect(filterLfoGain);
                filterLfoGain.connect(bandpass.frequency);
                filterLfo.start(0);

                source.connect(bandpass);
                bandpass.connect(lowpass);
                lowpass.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                source.start(0);
                this.oscillators.push(source);
                this.oscillators.push(lfo);
                this.oscillators.push(filterLfo);
                this.gainNodes.push(gainNode);
                console.log('✓ Slow breeze blowing');
            };

            processNextChunk();
        };

        setTimeout(generateWindChunked, 150);
    }

    // Create ambient instrument sound - PEACEFUL & MEDITATIVE
    createInstrumentSound() {
        if (!this.audioContext) return;

        // Store reference to current context to prevent cross-context connections
        const ctx = this.audioContext;

        // Lower pentatonic scale for more peaceful sound
        const pentatonicScale = [
            130.81, // C3
            146.83, // D3
            164.81, // E3
            196.00, // G3
            220.00, // A3
            261.63, // C4
        ];

        const gainNode = ctx.createGain();
        gainNode.gain.value = AUDIO_CONFIG.instrument.volume * 0.7;
        gainNode.connect(ctx.destination);

        // Play random notes from pentatonic scale - SLOWER & SOFTER
        const playNote = () => {
            // Validate context is still the same and not closed
            if (!this.audioContext || this.audioContext !== ctx || ctx.state === 'closed') {
                return; // Stop if audio context changed or was closed
            }

            const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const noteGain = ctx.createGain();
            noteGain.gain.value = 0;

            // Gentle ADSR envelope - longer attack and release
            const now = ctx.currentTime;
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
            noteGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 5);

            // Add subtle vibrato for more natural sound
            const vibrato = ctx.createOscillator();
            vibrato.frequency.value = 3;
            const vibratoGain = ctx.createGain();
            vibratoGain.gain.value = 2;
            vibrato.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            vibrato.start(now);
            vibrato.stop(now + 5);

            osc.connect(noteGain);
            noteGain.connect(gainNode);

            osc.start(now);
            osc.stop(now + 5);

            // Schedule next note - MUCH LONGER intervals (5-10 seconds)
            setTimeout(playNote, 5000 + Math.random() * 5000);
        };

        playNote();
        this.gainNodes.push(gainNode);
        console.log('✓ Peaceful instrument');
    }

    async playHomeScreenAmbience() {
        // Guard for background ambience setting
        const UnifiedAudioEngine = require('../services/UnifiedAudioEngine').default;
        if (UnifiedAudioEngine && UnifiedAudioEngine.ambienceMute) {
            return false;
        }

        await this.initialize();

        if (Platform.OS === 'web' && this.audioContext) {
            // Check if context is suspended (autoplay policy)
            if (this.audioContext.state === 'suspended') {
                console.log('🔇 AudioContext is suspended. Waiting for user interaction...');
                return false; // Indicate that it didn't start yet
            }

            console.log('🎵 Starting peaceful ambient soundscape...');
            // Defer ambience start to prevent blocking navigation/startup
            setTimeout(() => this._startAmbience(), 500);
            return true;
        }
        return false;
    }

    async resumeContext() {
        if (Platform.OS === 'web' && this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('🔊 AudioContext resumed! Starting soundscape...');
            // Defer ambience start further to ensure UI responsiveness
            setTimeout(() => this._startAmbience(), 500);
            return true;
        }
        return false;
    }

    _startAmbience() {
        // STAGGER initializations to avoid frame drops
        if (AUDIO_CONFIG.river.enabled) {
            setTimeout(() => this.createRiverSound(), 100);
        }

        if (AUDIO_CONFIG.wind.enabled) {
            setTimeout(() => this.createWindSound(), 2000); // Wait 2s for first sound to finish chunking
        }

        if (AUDIO_CONFIG.instrument.enabled) {
            setTimeout(() => this.createInstrumentSound(), 4000); // Wait 4s 
        }
    }

    async stopAll() {
        // Stop all oscillators
        this.oscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.oscillators = [];
        this.gainNodes = [];

        // Stop any loaded sounds
        for (const key in this.sounds) {
            if (this.sounds[key]) {
                await this.sounds[key].stopAsync();
                await this.sounds[key].unloadAsync();
                this.sounds[key] = null;
            }
        }

        // DO NOT close the shared audio context. 
        // Just reset the initialized flag so it can be re-prepped if needed.
        this.initialized = false;
    }

    async setVolume(key, volume) {
        const gainNode = this.gainNodes.find(node => node.context === this.audioContext);
        if (gainNode) {
            gainNode.gain.value = volume;
        }
    }
}

export default new AudioManager();
