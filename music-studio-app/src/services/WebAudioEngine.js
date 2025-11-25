// Web Audio API-based sound engine for browser playback
// This provides basic beep sounds for demo purposes
// Replace with real audio samples for production

class WebAudioEngine {
    constructor() {
        this.audioContext = null;
        this.noteFrequencies = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(noteName) {
        this.init();

        // Parse note name (e.g., "C4", "F#3")
        const match = noteName.match(/^([A-G]#?)(\d)$/);
        if (!match) {
            console.warn('Invalid note name:', noteName);
            return;
        }

        const [, note, octave] = match;
        const baseFreq = this.noteFrequencies[note];
        if (!baseFreq) return;

        // Calculate frequency for the octave (A4 = 440Hz is octave 4)
        const frequency = baseFreq * Math.pow(2, octave - 4);

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
    }

    playDrumSound(padNumber) {
        this.init();

        // Different frequencies for different drum pads
        const frequencies = [80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500];
        const frequency = frequencies[padNumber % frequencies.length];

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
    }
}

export default new WebAudioEngine();
