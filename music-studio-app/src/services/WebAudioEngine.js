// Web Audio API-based sound engine for browser playback
// This provides basic beep sounds for demo purposes
// Replace with real audio samples for production

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
        if (!this.audioContext) {
            try {
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

    async playSound(noteName) {
        console.log(`🎵 Playing sound: ${noteName}`);

        if (!this.init()) {
            console.error('❌ Cannot play sound - init failed');
            return;
        }

        const resumed = await this.resumeContext();
        if (!resumed) {
            console.error('❌ Cannot play sound - resume failed');
            return;
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

        try {
            // Create oscillator for beep sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine'; // Can be 'sine', 'square', 'sawtooth', 'triangle'

            // Envelope: quick attack, short sustain, quick release
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Attack
            gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);  // Sustain
            gainNode.gain.linearRampToValueAtTime(0, now + 0.3);    // Release

            oscillator.start(now);
            oscillator.stop(now + 0.3);

            console.log(`✅ Played ${noteName} at ${frequency.toFixed(2)}Hz`);
        } catch (error) {
            console.error('❌ Error playing sound:', error);
        }
    }

    async playDrumSound(padNumber) {
        console.log(`🥁 Playing drum pad: ${padNumber}`);

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
            const frequency = frequencies[(padNumber - 1) % frequencies.length];

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sawtooth';

            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0.5, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

            oscillator.start(now);
            oscillator.stop(now + 0.1);

            console.log(`✅ Played drum pad ${padNumber} at ${frequency}Hz`);
        } catch (error) {
            console.error('❌ Error playing drum:', error);
        }
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
