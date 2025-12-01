import { Platform } from 'react-native';
import WebAudioEngine from './WebAudioEngine';
import { Audio } from 'expo-av';
import { generateTone } from '../utils/NativeToneGenerator';

class NativeAudioEngine {
    constructor() {
        this.sounds = {};
        this.soundFiles = {
            piano: {
                'C4': require('../../assets/sounds/piano/C4.mp3'),
                'C5': require('../../assets/sounds/piano/C5.mp3'),
            },
            guitar: {
                'C4': require('../../assets/sounds/guitar/C4.mp3'),
                'C5': require('../../assets/sounds/guitar/C5.mp3'),
            },
            sitar: {
                // Use guitar samples for sitar (similar string instrument)
                'C4': require('../../assets/sounds/guitar/C4.mp3'),
                'C5': require('../../assets/sounds/guitar/C5.mp3'),
            },
            bass: {
                'C3': require('../../assets/sounds/bass/C3.mp3'),
            },
            violin: {
                'C4': require('../../assets/sounds/violin/C4.mp3'),
            },
            flute: {
                'C4': require('../../assets/sounds/flute/C4.mp3'),
            },
            drums: {
                'kick': require('../../assets/sounds/drums/kick.wav'),
                'snare': require('../../assets/sounds/drums/snare.wav'),
                'hihat': require('../../assets/sounds/drums/hihat.wav'),
                // Use existing samples for missing drums
                'tom1': require('../../assets/sounds/drums/kick.wav'), // Fallback
                'tom2': require('../../assets/sounds/drums/kick.wav'), // Fallback
                'crash': require('../../assets/sounds/drums/hihat.wav'), // Fallback
                'ride': require('../../assets/sounds/drums/hihat.wav'), // Fallback
            },
            tabla: {
                'dha': require('../../assets/sounds/tabla/dha.wav'),
                'tin': require('../../assets/sounds/tabla/tin.wav'),
                // Map all tabla sounds to available samples
                'na': require('../../assets/sounds/tabla/tin.wav'),
                'tun': require('../../assets/sounds/tabla/tin.wav'),
                'te': require('../../assets/sounds/tabla/tin.wav'),
                'ge': require('../../assets/sounds/tabla/dha.wav'),
                'ke': require('../../assets/sounds/tabla/dha.wav'),
                'kat': require('../../assets/sounds/tabla/dha.wav'),
            },
            dholak: {
                'dha': require('../../assets/sounds/dholak/dha.wav'),
            },
        };
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: true,
            });
            this.initialized = true;
            return true;
        } catch (error) {
            console.warn('Failed to init NativeAudioEngine:', error);
            return false;
        }
    }

    async playSound(noteName, instrument = 'piano') {
        // console.log(`🎵 [Native] Playing sound: ${noteName} (${instrument})`);
        try {
            // Ensure audio is initialized
            await this.init();

            // Check if we have a sample for this instrument
            const instrumentKey = instrument.toLowerCase();
            if (this.soundFiles[instrumentKey]) {
                await this.playSampledSound(noteName, instrumentKey);
            } else {
                // Fallback to synthesis
                await this.playSynthesizedSound(noteName, instrument);
            }
        } catch (error) {
            console.warn('Failed to play native sound:', error);
        }
    }

    async playSampledSound(noteName, instrument) {
        try {
            // Percussion handling
            if (['drums', 'tabla', 'dholak'].includes(instrument)) {
                // Map note names to specific samples
                // For drums: C4->kick, D4->snare, F#4->hihat (General MIDIish)
                // For Tabla/Dholak: Map specific strokes

                let sampleKey = null;
                if (instrument === 'drums') {
                    if (noteName.includes('C')) sampleKey = 'kick';
                    else if (noteName.includes('D') || noteName.includes('E')) sampleKey = 'snare';
                    else sampleKey = 'hihat';
                } else if (instrument === 'tabla') {
                    if (noteName.includes('C')) sampleKey = 'dha';
                    else sampleKey = 'tin';
                } else if (instrument === 'dholak') {
                    sampleKey = 'dha';
                }

                if (sampleKey && this.soundFiles[instrument][sampleKey]) {
                    const source = this.soundFiles[instrument][sampleKey];
                    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
                    sound.setOnPlaybackStatusUpdate(async (status) => {
                        if (status.didJustFinish) await sound.unloadAsync();
                    });
                    return;
                }
            }

            // Melodic pitch shifting logic
            // We have C4 (Middle C) and C5
            // Determine closest base sample
            const targetFreq = this.getFrequency(noteName);
            const c4Freq = this.getFrequency('C4');
            const c5Freq = this.getFrequency('C5');
            const c3Freq = this.getFrequency('C3');

            let baseSample = 'C4';
            let baseFreq = c4Freq;

            if (instrument === 'bass') {
                baseSample = 'C3';
                baseFreq = c3Freq;
            } else if (this.soundFiles[instrument]['C5'] && Math.abs(targetFreq - c5Freq) < Math.abs(targetFreq - c4Freq)) {
                baseSample = 'C5';
                baseFreq = c5Freq;
            }

            // Check if base sample exists, else fallback to C4
            if (!this.soundFiles[instrument][baseSample]) {
                baseSample = 'C4';
                baseFreq = c4Freq;
            }

            const source = this.soundFiles[instrument][baseSample];
            const rate = targetFreq / baseFreq;

            const { sound } = await Audio.Sound.createAsync(
                source,
                { shouldPlay: true, rate: rate }
            );

            // Auto-unload
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });
        } catch (error) {
            console.warn(`Failed to play sampled ${instrument}:`, error);
            // Fallback to synthesis if sample fails
            await this.playSynthesizedSound(noteName, instrument);
        }
    }

    async playSynthesizedSound(noteName, instrument) {
        // Map note name to frequency
        const frequency = this.getFrequency(noteName);

        // Map instrument to waveform
        let waveform = 'sine';
        switch (instrument.toLowerCase()) {
            case 'piano': waveform = 'sine'; break;
            case 'guitar': waveform = 'sawtooth'; break;
            case 'bass': waveform = 'triangle'; break;
            case 'synth': waveform = 'square'; break;
            case 'violin': waveform = 'sawtooth'; break;
            case 'flute': waveform = 'sine'; break;
            case 'drums': waveform = 'noise'; break;
            case 'sitar': waveform = 'sawtooth'; break; // Sitar has a buzzy quality
            case 'veena': waveform = 'sawtooth'; break;
            default: waveform = 'sine';
        }

        // Generate base64 WAV
        const uri = generateTone(frequency, 500, waveform, 0.6);

        const { sound } = await Audio.Sound.createAsync(
            { uri },
            { shouldPlay: true }
        );

        // Auto-unload after playback
        sound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.didJustFinish) {
                await sound.unloadAsync();
            }
        });
    }

    getFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const match = note.match(/^([A-G]#?)(\d)$/);
        if (!match) return 440;

        const [, noteName, octave] = match;
        const semitone = notes.indexOf(noteName);
        if (semitone === -1) return 440;

        const midiNote = (parseInt(octave) + 1) * 12 + semitone;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    async playDrumSound(padId, volume = 1.0, pan = 0) {
        console.log(`🥁 [Native] Playing drum: ${padId}`);
        try {
            // Ensure audio is initialized
            await this.init();

            const id = String(padId).toLowerCase();

            // 1. Check for Sampled Sounds first
            let source = null;
            if (this.soundFiles.drums[id]) source = this.soundFiles.drums[id];
            else if (this.soundFiles.tabla[id]) source = this.soundFiles.tabla[id];
            else if (this.soundFiles.dholak[id]) source = this.soundFiles.dholak[id];

            if (source) {
                // Play the sample
                try {
                    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true });
                    sound.setOnPlaybackStatusUpdate(async (status) => {
                        if (status.didJustFinish) await sound.unloadAsync();
                    });
                    return;
                } catch (sampleError) {
                    console.warn('Failed to play drum sample, falling back to synthesis:', sampleError);
                }
            }

            // 2. Fallback to Synthesis
            // Use passed volume as base, modify by instrument specific volume
            let baseVolume = volume;

            // Reset defaults for synthesis
            let frequency = 100;
            let duration = 200;
            let waveform = 'noise';

            // --- Standard Kit ---
            if (id.includes('kick') || id === '1' || id === '36') {
                frequency = 60;
                duration = 300;
                waveform = 'sine'; // Kick
                volume = 1.0;
            } else if (id.includes('snare') || id === '2' || id === '38') {
                frequency = 200;
                duration = 200;
                waveform = 'noise'; // Snare
            } else if (id.includes('hat') || id === '3' || id === '42') {
                frequency = 800;
                duration = 50;
                waveform = 'noise'; // Hi-hat
            } else if (id.includes('tom') || id === '4') {
                frequency = 100;
                duration = 400;
                waveform = 'triangle'; // Tom
            } else if (id.includes('cymbal') || id === '5') {
                frequency = 1000;
                duration = 800;
                waveform = 'noise'; // Cymbal
            }
            // --- Tabla ---
            else if (id === 'ge' || id === 'ke' || id === 'kat') {
                frequency = 80;
                duration = 400;
                waveform = 'sine'; // Bayan (Bass)
                volume = 0.9;
            } else if (id === 'na' || id === 'tin' || id === 'tun' || id === 'te') {
                frequency = 400;
                duration = 150;
                waveform = 'triangle'; // Dayan (Treble)
                volume = 0.7;
            }
            // --- Dholak ---
            else if (id === 'dha') {
                frequency = 100;
                duration = 300;
                waveform = 'sine';
            } else if (id === 'ta') {
                frequency = 500;
                duration = 100;
                waveform = 'triangle';
            }
            // --- World Percussion ---
            else if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(id)) {
                // Map to better synthesized percussion
                switch (id) {
                    case '1': // Conga High
                        frequency = 400; duration = 150; waveform = 'triangle'; volume = 0.8; break;
                    case '2': // Conga Low
                        frequency = 200; duration = 250; waveform = 'triangle'; volume = 0.9; break;
                    case '3': // Bongo High
                        frequency = 600; duration = 100; waveform = 'sine'; volume = 0.7; break;
                    case '4': // Bongo Low
                        frequency = 300; duration = 150; waveform = 'sine'; volume = 0.8; break;
                    case '5': // Djembe
                        frequency = 150; duration = 300; waveform = 'square'; volume = 1.0; break; // Bass-like
                    case '6': // Tabla (fallback if not using sample)
                        frequency = 250; duration = 200; waveform = 'sine'; volume = 0.8; break;
                    case '7': // Shaker
                        frequency = 1000; duration = 50; waveform = 'noise'; volume = 0.5; break;
                    case '8': // Cowbell
                        frequency = 800; duration = 150; waveform = 'sawtooth'; volume = 0.8; break;
                    default:
                        frequency = 200; duration = 200; waveform = 'noise';
                }
            }
            else {
                // Default generic percussion
                frequency = 150 + (parseInt(id) || 0) * 50;
                duration = 100;
                waveform = 'noise';
            }

            const uri = generateTone(frequency, duration, waveform, volume);

            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );

            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                }
            });
        } catch (error) {
            console.warn('Failed to play native drum:', error);
        }
    }

    async stopAll() {
        // Stop all native sounds
    }
}

const nativeEngine = new NativeAudioEngine();

const UnifiedAudioEngine = {
    init: async () => {
        if (Platform.OS === 'web') {
            return WebAudioEngine.init();
        } else {
            return nativeEngine.init();
        }
    },
    playSound: async (noteName, instrument) => {
        if (Platform.OS === 'web') {
            return WebAudioEngine.playSound(noteName, instrument);
        } else {
            return nativeEngine.playSound(noteName, instrument);
        }
    },
    playDrumSound: async (padId) => {
        if (Platform.OS === 'web') {
            return WebAudioEngine.playDrumSound(padId);
        } else {
            return nativeEngine.playDrumSound(padId);
        }
    },
    stopAll: async () => {
        if (Platform.OS === 'web') {
            // WebAudioEngine doesn't have stopAll exposed yet, but we can add it or ignore
        } else {
            return nativeEngine.stopAll();
        }
    }
};

export default UnifiedAudioEngine;
