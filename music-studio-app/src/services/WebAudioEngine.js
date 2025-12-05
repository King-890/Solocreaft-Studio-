// Web Audio API-based sound engine for browser playback
// This provides basic beep sounds for demo purposes
// Replace with real audio samples for production

import { Platform } from 'react-native';

class WebAudioEngine {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.noteFrequencies = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
    }

    init() {
        // WebAudioEngine only works on web platform
        if (Platform.OS !== 'web') {
            // console.log('ℹ️ WebAudioEngine is only available on web platform');
            return false;
        }

        if (!this.audioContext) {
            try {
                if (typeof window === 'undefined' || !window.AudioContext) {
                    console.warn('⚠️ AudioContext not available');
                    return false;
                }
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.initialized = true;
                console.log('✅ WebAudioEngine initialized');
            } catch (error) {
                console.error('❌ Failed to initialize WebAudioEngine:', error);
                return false;
            }
        }
        return true;
    }

    async resumeContext() {
        if (!this.audioContext) {
            console.warn('⚠️ AudioContext not initialized');
            return false;
        }

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('▶️ AudioContext resumed');
                return true;
            } catch (error) {
                console.error('❌ Failed to resume AudioContext:', error);
                return false;
            }
        }
        return true;
    }

    async playSound(noteName, instrument = 'piano') {
        // Initialize on first call only
        if (!this.audioContext && !this.init()) {
            return;
        }

        // Resume context if suspended (only first time)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Parse note name (e.g., "C4", "F#3")
        const match = noteName.match(/^([A-G]#?)(\d)$/);
        if (!match) {
            console.warn('⚠️ Invalid note name:', noteName);
            return;
        }

        const [, note, octave] = match;
        const baseFreq = this.noteFrequencies[note];
        if (!baseFreq) {
            console.warn('⚠️ Unknown note:', note);
            return;
        }

        // Calculate frequency for the octave (A4 = 440Hz is octave 4)
        const frequency = baseFreq * Math.pow(2, octave - 4);

        // Map instrument to waveform (matching NativeAudioEngine)
        let waveform = 'sine';
        switch (instrument.toLowerCase()) {
            case 'piano': waveform = 'sine'; break;
            case 'guitar': waveform = 'sawtooth'; break;
            case 'bass': waveform = 'triangle'; break;
            case 'synth': waveform = 'square'; break;
            case 'violin': waveform = 'sawtooth'; break;
            case 'flute': waveform = 'sine'; break;
            // case 'sitar': waveform = 'sawtooth'; break;
            case 'veena': waveform = 'sawtooth'; break;
            case 'trumpet': waveform = 'square'; break;
            case 'saxophone': waveform = 'sawtooth'; break;
            default: waveform = 'sine';
        }

        try {
            // Create oscillator for beep sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = waveform;

            // Envelope: quick attack, short sustain, quick release
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);  // Sustain
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);    // Release

            oscillator.start(now);
            oscillator.stop(now + 0.3);
        } catch (error) {
            console.error('❌ Error playing sound:', error);
        }
    }

    async playDrumSound(padNumber, volume = 0.8, pan = 0) {
        // Map string IDs to numeric values
        const drumMap = {
            'kick': 1, 'snare': 2, 'hihat': 3, 'tom1': 4, 'tom2': 5,
            'crash': 6, 'ride': 7, 'na': 8, 'tin': 9, 'tun': 10,
            'te': 11, 'ge': 12, 'ke': 13, 'kat': 14, 'dha': 15, 'ta': 16
        };

        // Convert string to number if needed
        const numericPad = typeof padNumber === 'string' ? drumMap[padNumber] : padNumber;

        console.log(`🥁 Playing drum pad: ${padNumber} (mapped to ${numericPad})`);

        // Validate padNumber
        if (typeof numericPad !== 'number' || isNaN(numericPad)) {
            console.error(`❌ Invalid drum pad number: ${padNumber}`);
            return;
        }

        if (!this.init()) {
            console.error('❌ Cannot play drum - init failed');
            return;
        }

        const resumed = await this.resumeContext();
        if (!resumed) {
            console.error('❌ Cannot play drum - resume failed');
            return;
        }

        try {
            // Different frequencies for different drum pads
            const frequencies = [80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500];
            const frequency = frequencies[(numericPad - 1) % frequencies.length];

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const pannerNode = this.audioContext.createStereoPanner();

            oscillator.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sawtooth';

            // Apply volume and pan
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(volume * 0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            pannerNode.pan.value = Math.max(-1, Math.min(1, pan));

            oscillator.start(now);
            oscillator.stop(now + 0.1);

            console.log(`✅ Played drum pad ${padNumber} at ${frequency}Hz`);
        } catch (error) {
            console.error('❌ Error playing drum:', error);
        }
    }

    stopSound(noteName, instrument) {
        // Web Audio API 'stop' is done on the oscillator node which we don't keep a reference to in this simple implementation.
        // For a full implementation, we would need to track active oscillators.
        // For now, we'll just log it to prevent crashes.
        // console.log(`⏹ Stopping sound: ${noteName} (${instrument}) - (Not fully implemented on web)`);
    }

    stopAll() {
        if (this.audioContext) {
            try {
                this.audioContext.suspend();
                this.audioContext.resume();
            } catch (e) {
                console.warn('Error stopping all sounds on web:', e);
            }
        }
    }

    preload() {
        return this.init();
    }

    // Get audio context state for debugging
    getState() {
        return {
            initialized: this.initialized,
            contextState: this.audioContext?.state || 'not created',
            sampleRate: this.audioContext?.sampleRate || 0,
        };
    }
}

export default new WebAudioEngine();
