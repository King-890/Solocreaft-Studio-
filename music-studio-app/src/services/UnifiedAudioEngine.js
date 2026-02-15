import { Platform } from 'react-native';
import WebAudioEngine from './WebAudioEngine';
import { Audio } from 'expo-av';
import { generateTone } from '../utils/NativeToneGenerator';
import { INSTRUMENTS, getSampleUrl } from './SampleLibrary';

class NativeAudioEngine {
    constructor() {
        this.sounds = {};
        this.activeSounds = {}; 
        this.toneCache = {}; 
        this.soundPool = {}; 
        this.maxConcurrentSounds = 12; // Increased
        this.soundFiles = {
            piano: require('../../assets/sounds/piano/C4.mp3'),
            guitar: require('../../assets/sounds/guitar/C4.mp3'),
            drums: {
                kick: require('../../assets/sounds/drums/kick.wav'),
                snare: require('../../assets/sounds/drums/snare.wav'),
                hihat: require('../../assets/sounds/drums/hihat.wav'),
            },
        };
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false, // Changed for latency
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: false,
            });
            this.initialized = true;
            return true;
        } catch (error) {
            console.warn('Failed to init NativeAudioEngine:', error);
            return false;
        }
    }

    async preload() {
        console.log('🚀 Preloading Native Audio...');
        await this.init();
        // Native preloading can be heavy, we'll load on demand but keep in memory
    }

    playSound(noteName, instrument = 'piano', volume = 0.8) {
        this._playSoundAsync(noteName, instrument, volume).catch(() => {});
    }

    async _playSoundAsync(noteName, instrument, volume) {
        try {
            await this.init();
            
            // Map instrument name to sample (Local fallback or Internet Sample)
            const instrumentKey = instrument.toLowerCase();
            
            // Simple pool limit
            if (Object.keys(this.activeSounds).length >= this.maxConcurrentSounds) {
                const oldest = Object.keys(this.activeSounds)[0];
                this.stopSoundQuiet(oldest);
            }

            // Percussion logic
            if (['drums', 'tabla', 'dholak'].includes(instrumentKey)) {
                return this.playDrumSoundNative(noteName, instrumentKey, volume);
            }

            // Fallback synthesis for native for now to guarantee speed
            // Real sample loading on native requires careful asset management
            await this.playSynthesizedSound(noteName, instrumentKey, volume);
        } catch (e) {
            if (__DEV__) console.warn('Native playback error', e);
        }
    }

    async playDrumSoundNative(id, instrument, volume) {
        // Implementation for drum sounds on native
        const source = this.soundFiles.drums.kick; // Default
        const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true, volume });
        sound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) sound.unloadAsync();
        });
    }

    async stopSoundQuiet(key) {
        const s = this.activeSounds[key];
        if (s) {
            try { await s.unloadAsync(); } catch(e) {}
            delete this.activeSounds[key];
        }
    }

    async playSynthesizedSound(noteName, instrument, volume = 0.8) {
        const frequency = this.getFrequency(noteName);
        const cacheKey = `${frequency}-sine`;
        let uri = this.toneCache[cacheKey];

        if (!uri) {
            uri = generateTone(frequency, 400, 'sine', volume);
            this.toneCache[cacheKey] = uri;
        }

        const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume });
        const key = `${instrument}-${noteName}-${Date.now()}`;
        this.activeSounds[key] = sound;

        sound.setOnPlaybackStatusUpdate(status => {
            if (status.didJustFinish) {
                sound.unloadAsync();
                delete this.activeSounds[key];
            }
        });
    }

    getFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const match = note.match(/^([A-G]#?)(\d)$/);
        if (!match) return 440;
        const [, noteName, octave] = match;
        const semitone = notes.indexOf(noteName);
        const midiNote = (parseInt(octave) + 1) * 12 + semitone;
        return 440 * Math.pow(2, (midiNote - 69) / 12);
    }

    async stopAll() {
        Object.values(this.activeSounds).forEach(s => s.unloadAsync().catch(() => {}));
        this.activeSounds = {};
    }
}

const nativeEngine = new NativeAudioEngine();

const UnifiedAudioEngine = {
    mixerSettings: {},

    setMixerSettings(instrument, settings) {
        this.mixerSettings[instrument] = { ...this.mixerSettings[instrument], ...settings };
    },

    getMixerSettings(instrument) {
        return this.mixerSettings[instrument] || { volume: 0.8, mute: false, solo: false };
    },

    init: async () => {
        return Platform.OS === 'web' ? WebAudioEngine.init() : nativeEngine.init();
    },

    playSound: async (noteName, instrument = 'piano') => {
        const settings = UnifiedAudioEngine.getMixerSettings(instrument);
        if (settings.mute) return;

        // Solo logic
        const anySolo = Object.values(UnifiedAudioEngine.mixerSettings).some(s => s?.solo);
        if (anySolo && !settings.solo) return;

        if (Platform.OS === 'web') {
            return WebAudioEngine.playSound(noteName, instrument);
        } else {
            return nativeEngine.playSound(noteName, instrument, settings.volume);
        }
    },

    playDrumSound: async (padId, volume = 1.0, pan = 0) => {
        if (Platform.OS === 'web') {
            return WebAudioEngine.playDrumSound(padId, volume, pan);
        } else {
            return nativeEngine.playDrumSoundNative(padId, 'drums', volume);
        }
    },

    preload: async () => {
        if (Platform.OS === 'web') {
            WebAudioEngine.preload();
        } else {
            nativeEngine.preload();
        }
    },

    stopAll: async () => {
        if (Platform.OS === 'web') {
            WebAudioEngine.stopAll();
        } else {
            nativeEngine.stopAll();
        }
    }
};

export default UnifiedAudioEngine;
