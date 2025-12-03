/**
 * Audio Manager
 * Handles all ambient audio playback for the app using Web Audio API
 */

import { Platform } from 'react-native';
import { AUDIO_CONFIG } from '../constants/UIConfig';

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
            // Initialize Web Audio API for web platform
            if (Platform.OS === 'web' && typeof window !== 'undefined') {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                this.audioContext = new AudioContext();
            }

            this.initialized = true;
        } catch (error) {
            console.log('Error initializing audio:', error);
        }
    }

    // Create ambient river sound - GENTLE & RELAXING
    createRiverSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // Create stereo river sound for more depth
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);

            // Generate very gentle pink noise for river
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = (Math.random() * 2 - 1) * 0.3;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
                b6 = white * 0.115926;
            }
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Multi-stage filtering for gentle river sound
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

        // Add very slow modulation for natural flow variation
        const lfo = this.audioContext.createOscillator();
        lfo.frequency.value = 0.05;
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.02;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start(0);

        source.connect(highpass);
        highpass.connect(lowpass1);
        lowpass1.connect(lowpass2);
        lowpass2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
        this.oscillators.push(source);
        this.oscillators.push(lfo);
        this.gainNodes.push(gainNode);
    }

    // Create ambient wind sound - SLOW BREEZE
    createWindSound() {
        if (!this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * 4;
        const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

        // Generate very gentle wind noise
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.15;
            }
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Gentle bandpass filter for wind
        const bandpass = this.audioContext.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 250;
        bandpass.Q.value = 0.3;

        // Additional lowpass for smoothness
        const lowpass = this.audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 500;
        lowpass.Q.value = 0.5;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = AUDIO_CONFIG.wind.volume * 0.5;

        // VERY slow LFO for gentle wind variation (slow breeze)
        const lfo = this.audioContext.createOscillator();
        lfo.frequency.value = 0.03;
        const lfoGain = this.audioContext.createGain();
        lfoGain.gain.value = 0.03;
        lfo.connect(lfoGain);
        lfoGain.connect(gainNode.gain);
        lfo.start(0);

        // Add second LFO for filter modulation (creates gentle "whoosh")
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
    }

    // Create ambient instrument sound - PEACEFUL & MEDITATIVE
    createInstrumentSound() {
        if (!this.audioContext) return;

        // Lower pentatonic scale for more peaceful sound
        const pentatonicScale = [
            130.81, // C3
            146.83, // D3
            164.81, // E3
            196.00, // G3
            220.00, // A3
            261.63, // C4
        ];

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = AUDIO_CONFIG.instrument.volume * 0.7;
        gainNode.connect(this.audioContext.destination);

        // Play random notes from pentatonic scale - SLOWER & SOFTER
        const playNote = () => {
            if (!this.audioContext) return; // Stop if audio context is gone

            const freq = pentatonicScale[Math.floor(Math.random() * pentatonicScale.length)];
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            const noteGain = this.audioContext.createGain();
            noteGain.gain.value = 0;

            // Gentle ADSR envelope - longer attack and release
            const now = this.audioContext.currentTime;
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
            noteGain.gain.linearRampToValueAtTime(0.06, now + 1.5);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 5);

            // Add subtle vibrato for more natural sound
            const vibrato = this.audioContext.createOscillator();
            vibrato.frequency.value = 3;
            const vibratoGain = this.audioContext.createGain();
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
    }

    async playHomeScreenAmbience() {
        await this.initialize();

        if (Platform.OS === 'web' && this.audioContext) {
            // Resume audio context (required by browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            console.log('🎵 Starting peaceful ambient soundscape...');

            if (AUDIO_CONFIG.river.enabled) {
                this.createRiverSound();
                console.log('✓ Gentle river flowing');
            }

            if (AUDIO_CONFIG.wind.enabled) {
                this.createWindSound();
                console.log('✓ Slow breeze blowing');
            }

            if (AUDIO_CONFIG.instrument.enabled) {
                this.createInstrumentSound();
                console.log('✓ Peaceful instrument');
            }
        } else {
            console.log('Audio synthesis available on web platform only');
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

        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
            this.initialized = false;
        }
    }

    async setVolume(key, volume) {
        const gainNode = this.gainNodes.find(node => node.context === this.audioContext);
        if (gainNode) {
            gainNode.gain.value = volume;
        }
    }
}

export default new AudioManager();
