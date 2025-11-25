import { useAudioPlayer, AudioSource } from 'expo-audio';
import { Platform } from 'react-native';

class UISounds {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.audioContext = null;
    }

    async loadSound(name, source) {
        try {
            // expo-audio doesn't need preloading for simple sounds
            // We'll create sounds on-demand
            this.sounds[name] = source;
        } catch (error) {
            console.log(`Error loading sound ${name}:`, error);
        }
    }

    async init() {
        try {
            // expo-audio handles audio mode automatically
            if (Platform.OS === 'web' && typeof AudioContext !== 'undefined') {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            console.log('UI Sounds initialized');
        } catch (error) {
            console.log('Error initializing UI sounds:', error);
        }
    }

    async playTap() {
        if (!this.enabled) return;
        this.playFrequency(800, 100);
    }

    async playType() {
        if (!this.enabled) return;
        this.playFrequency(600, 50);
    }

    async playTypeForChar(char) {
        if (!this.enabled) return;

        if (/[a-zA-Z]/.test(char)) {
            this.playFrequency(700 + Math.random() * 200, 50);
        } else if (/[0-9]/.test(char)) {
            this.playFrequency(1000 + Math.random() * 200, 50);
        } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(char)) {
            this.playFrequency(500 + Math.random() * 150, 60);
        } else {
            this.playFrequency(600, 40);
        }
    }

    async playKeySound(key, keyCode) {
        if (!this.enabled) return;

        if (key === 'Backspace' || keyCode === 8) {
            this.playComplexTone([800, 600], 80);
        } else if (key === 'Delete' || keyCode === 46) {
            this.playComplexTone([1200, 900], 70);
        } else if (key === 'Enter' || keyCode === 13) {
            this.playChord([523, 659, 784], 150);
        } else if (key === 'Tab' || keyCode === 9) {
            this.playGlide(400, 600, 100);
        } else if (key === 'Escape' || keyCode === 27) {
            this.playComplexTone([600, 400], 100);
        } else if (key === ' ' || keyCode === 32) {
            this.playBell(400, 80);
        } else if (/[a-e]/i.test(key)) {
            this.playBell(1000 + Math.random() * 400, 60);
        } else if (/[f-j]/i.test(key)) {
            this.playWood(600 + Math.random() * 200, 70);
        } else if (/[k-o]/i.test(key)) {
            this.playMetal(900 + Math.random() * 300, 80);
        } else if (/[p-t]/i.test(key)) {
            this.playString(700 + Math.random() * 250, 90);
        } else if (/[u-z]/i.test(key)) {
            this.playWind(500 + Math.random() * 300, 70);
        } else if (/[0-9]/.test(key)) {
            const notes = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];
            const index = parseInt(key);
            this.playPiano(notes[index], 100);
        } else if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(key)) {
            this.playPercussion(400 + Math.random() * 400, 50);
        } else {
            this.playFrequency(600, 50);
        }
    }

    async playButton() {
        if (!this.enabled) return;
        this.playFrequency(1000, 150);
    }

    async playFocus() {
        if (!this.enabled) return;
        this.playFrequency(700, 120);
    }

    async playSuccess() {
        if (!this.enabled) return;
        this.playFrequency(1200, 200);
    }

    async playError() {
        if (!this.enabled) return;
        this.playFrequency(400, 150);
    }

    playFrequency(frequency, duration) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            } catch (error) {
                console.log('Error playing frequency:', error);
            }
        }
    }

    playComplexTone(frequencies, duration) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                frequencies.forEach((freq, index) => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';

                    const volume = 0.08 / (index + 1);
                    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + duration / 1000);
                });
            } catch (error) {
                console.log('Error playing complex tone:', error);
            }
        }
    }

    playChord(frequencies, duration) {
        this.playComplexTone(frequencies, duration);
    }

    playGlide(startFreq, endFreq, duration) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(endFreq, audioContext.currentTime + duration / 1000);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            } catch (error) {
                console.log('Error playing glide:', error);
            }
        }
    }

    playBell(frequency, duration) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            } catch (error) {
                console.log('Error playing bell:', error);
            }
        }
    }

    playWood(frequency, duration) {
        this.playWithWaveform(frequency, duration, 'triangle', 0.12);
    }

    playMetal(frequency, duration) {
        this.playWithWaveform(frequency, duration, 'square', 0.08);
    }

    playString(frequency, duration) {
        this.playWithWaveform(frequency, duration, 'sawtooth', 0.1);
    }

    playWind(frequency, duration) {
        this.playWithWaveform(frequency, duration, 'sine', 0.07);
    }

    playPiano(frequency, duration) {
        this.playComplexTone([frequency, frequency * 2, frequency * 3], duration);
    }

    playPercussion(frequency, duration) {
        this.playWithWaveform(frequency, duration, 'square', 0.15);
    }

    playWithWaveform(frequency, duration, waveform, volume) {
        if (typeof window !== 'undefined' && window.AudioContext) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = waveform;

                gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration / 1000);
            } catch (error) {
                console.log('Error playing waveform:', error);
            }
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    async cleanup() {
        for (const sound of Object.values(this.sounds)) {
            try {
                await sound.unloadAsync();
            } catch (error) {
                console.log('Error unloading sound:', error);
            }
        }
    }
}

export default new UISounds();
