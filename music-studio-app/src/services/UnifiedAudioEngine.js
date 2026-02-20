import { Platform } from 'react-native';
import WebAudioEngine from './WebAudioEngine';
import { Audio } from 'expo-av';
import { Asset } from 'expo-asset';
import { INSTRUMENTS, getSampleUrl, getLocalPercussionAsset } from './SampleLibrary';
import AudioPlaybackService from './AudioPlaybackService';
import AudioManager from '../utils/AudioManager';
import { INSTRUMENT_TRACK_MAP } from '../constants/AudioConstants';

import UnifiedAudioContext from './UnifiedAudioContext';

class NativeAudioEngine {
    constructor() {
        this.ctx = null;
        this.players = {};
        this.activePlayers = {}; 
        this.masterVolume = 1.0;
        this.initialized = false;
        
        // Track playing oscillators for stopping
        this.playingNodes = new Map();
    }

    async init() {
        if (this.initialized) return true;
        if (this.initFailed) return false;
        
        try {
            console.log('🎵 Initializing Native Audio (Sample Mode via expo-av)...');
            
            // Set Audio Mode for iOS/Android
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
            });

            // 1. Get the Unified Context
            this.ctx = UnifiedAudioContext.get();
            if (!this.ctx) {
                this.initFailed = true;
                // [MOBILE FAILOVER] Demote to info log as this is expected in Expo Go
                console.log('ℹ️ Synthesis Engine Unavailable. Falling back to Sample Playback (Expo Go mode).');
                return false;
            }

            // 3. Setup Master Chain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.initialized = true;
            console.log('✅ NativeAudioEngine (Audio API) Initialized');
            return true;
        } catch (error) {
            console.log('ℹ️ Native Audio Failover:', error.message);
            return false;
        }
    }

    async preload() {
        await this.init();
    }

    playSound(noteName, instrument = 'piano', delay = 0, velocity = 1.0) {
        if (!this.initialized && !this.initFailed) {
            this.init().then(() => {
                if (this.ctx) {
                    this.playSynthesizedSound(noteName, instrument, delay, velocity).catch(err => {
                        console.debug('playSynthesizedSound error', err);
                    });
                } else {
                    this.playSampleSound(noteName, instrument, velocity);
                }
            });
            return;
        }

        if (this.ctx) {
            this.playSynthesizedSound(noteName, instrument, delay, velocity).catch(err => {
                console.debug('playSynthesizedSound error', err);
            });
        } else {
            this.playSampleSound(noteName, instrument, velocity);
        }
    }

    async playSampleSound(noteName, instrument, volume = 1.0) {
        const instrumentKey = INSTRUMENTS[instrument.toUpperCase()] || instrument;
        const url = getSampleUrl(instrumentKey, noteName);
        const key = `${instrumentKey}-${noteName}`;
        
        // [PERFORMANCE] Reuse players to avoid memory spikes and lag on mobile
        if (!this.playerPool) this.playerPool = new Map();

        const createPlayer = async () => {
            const { sound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: false, volume: volume * this.masterVolume }
            );
            return sound;
        };

        let soundObj = this.playerPool.get(key);

        try {
            if (!soundObj) {
                soundObj = await createPlayer();
                this.playerPool.set(key, soundObj);
            } else {
                try {
                    await soundObj.setPositionAsync(0);
                    await soundObj.setVolumeAsync(volume * this.masterVolume);
                } catch (resetError) {
                    console.log(`♻️ Player reset failed for ${key}, recreating...`);
                    this.playerPool.delete(key);
                    soundObj = await createPlayer();
                    this.playerPool.set(key, soundObj);
                }
            }

            // Attempt playback
            await soundObj.playAsync();
        } catch (playError) {
            console.warn(`⚠️ Playback failed for ${key}: ${playError.message}. Retrying once...`);
            
            // ONE-TIME RETRY: Force recreation if playback failed (e.g. "Player does not exist")
            try {
                this.playerPool.delete(key);
                soundObj = await createPlayer();
                this.playerPool.set(key, soundObj);
                await soundObj.playAsync();
                console.log(`✅ Retry successful for ${key}`);
            } catch (retryError) {
                console.error(`❌ Final playback failure for ${key}:`, retryError.message);
                this.playerPool.delete(key);
            }
        }
    }

    async stopPlayerQuiet(key) {
        // Legacy compat
    }

    async playDrumSoundNative(id, instrument, volume, pan = 0) {
        const asset = getLocalPercussionAsset(instrument, id);
        if (!asset) return;
        
        try {
            const { sound } = await Audio.Sound.createAsync(
                asset,
                { shouldPlay: true, volume: volume * this.masterVolume }
            );
            // Fire and forget for drums, letting GC handle it naturally or rely on unloadAll
            // For better perf, we should pool these too, but let's fix sound first.
        } catch (e) {
            console.warn('⚠️ Native drum playback failed', e.message);
        }
    }

    async playSynthesizedSound(noteName, instrument, delay = 0, velocity = 1.0) {
        if (!this.ctx) return;

        const freq = this.getFrequency(noteName);
        const now = this.ctx.currentTime;
        const startTime = now + delay;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // [SYNTHESIS ENGINE]
        osc.type = instrument === 'piano' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        // ADSR
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(velocity * 0.7, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 1.6);

        const key = `${instrument}-${noteName}`;
        if (!this.playingNodes.has(key)) this.playingNodes.set(key, []);
        this.playingNodes.get(key).push({ osc, gain });

        osc.onended = () => {
            const list = this.playingNodes.get(key);
            if (list) {
                this.playingNodes.set(key, list.filter(item => item.osc !== osc));
            }
        };
    }

    setMasterVolume(volume) {
        this.masterVolume = volume;
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
        }
    }

    async stopSound(noteName, instrument = 'piano') {
        const key = `${instrument}-${noteName}`;
        const nodes = this.playingNodes.get(key);
        if (nodes) {
            const now = this.ctx ? this.ctx.currentTime : 0;
            nodes.forEach(({ osc, gain }) => {
                try {
                    gain.gain.cancelScheduledValues(now);
                    gain.gain.setTargetAtTime(0, now, 0.05);
                    osc.stop(now + 0.1);
                } catch (e) {}
            });
            this.playingNodes.delete(key);
        }
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

    stopAll() {
        const now = this.ctx ? this.ctx.currentTime : 0;
        this.playingNodes.forEach((nodes) => {
            nodes.forEach(({ osc, gain }) => {
                try {
                    gain.gain.setTargetAtTime(0, now, 0.05);
                    osc.stop(now + 0.1);
                } catch (e) {}
            });
        });
        this.playingNodes.clear();

        // [MOBILE FALLBACK] Stop all cached players
        if (this.playerPool) {
            this.playerPool.forEach(player => {
                try {
                    if (player.playing) player.pause();
                    player.seekTo(0);
                } catch (e) {}
            });
        }
    }

    async unloadAll() {
        this.stopAll();
        // Clear all native players to free up memory
        if (this.playerPool) {
            this.playerPool.forEach(player => {
                try {
                    player.unloadAsync();
                } catch (e) {}
            });
            this.playerPool.clear();
        }
        console.log('🧹 Native Audio Engine: Resources Unloaded');
    }

    setMixerSettings(instrumentId, settings) {
        if (!this.instrumentSettings) this.instrumentSettings = {};
        this.instrumentSettings[instrumentId] = {
            ...(this.instrumentSettings[instrumentId] || { volume: 1.0, pan: 0, mute: false }),
            ...settings
        };
        
        // Apply instantly to any active players if possible
        // (For simplicity in v1, new notes will pick up these settings)
    }
}


const nativeEngine = new NativeAudioEngine();

const UnifiedAudioEngine = {
    ambienceMute: false,

    setMasterMute(value) {
        this.ambienceMute = value;
        if (value) {
            // Only stop background ambience when this toggle is used
            AudioManager.stopAll();
        } else {
            // Restore background ambience if valid
            AudioManager.playHomeScreenAmbience();
        }
    },

    setMasterVolume(volume) {
        AudioPlaybackService.setMasterVolume(volume);
        if (Platform.OS !== 'web') {
            nativeEngine.setMasterVolume(volume);
        }
    },

    init: async () => {
        const success = Platform.OS === 'web' ? await WebAudioEngine.init() : await nativeEngine.init();
        
        // [MOBILE COMPATIBILITY] Ensure Audio Context is resumed after engine init
        await UnifiedAudioContext.resume();
        
        return success;
    },

    /**
     * Call this from a user gesture (onPress) to ensure audio is "unlocked" on mobile.
     * This addresses both Web Audio suspension and Native Audio Session activation.
     */
    activateAudio: async () => {
        console.log('🔗 UnifiedAudioEngine: Activating Audio...');
        try {
            await UnifiedAudioContext.resume();

            if (Platform.OS !== 'web') {
                // Active native engine if not already
                await nativeEngine.init();
            }
            return true;
        } catch (e) {
            console.warn('⚠️ UnifiedAudioEngine activation failed:', e);
            return false;
        }
    },

    playSound: async (noteName, instrument = 'piano', delay = 0, velocity = 0.5) => {
        console.log(`🔊 UnifiedAudioEngine.playSound called: ${instrument} - ${noteName}`);
        if (Platform.OS === 'web') {
            return WebAudioEngine.playSound(noteName, instrument, delay, velocity);
        } else {
            return nativeEngine.playSound(noteName, instrument, delay, velocity);
        }
    },

    stopSound: async (noteName, instrument = 'piano') => {
        if (Platform.OS === 'web') {
            return WebAudioEngine.stopSound(noteName, instrument);
        } else {
            return nativeEngine.stopSound(noteName, instrument);
        }
    },

    playDrumSound: async (padId, instrument = 'drums', volume = 1.0, pan = 0) => {
        if (Platform.OS === 'web') {
            return WebAudioEngine.playDrumSound(padId, instrument, volume, pan);
        } else {
            return nativeEngine.playDrumSoundNative(padId, instrument, volume, pan);
        }
    },

    setMixerSettings(instrumentId, settings) {
        if (Platform.OS === 'web') {
            AudioPlaybackService.setTrackSettings(instrumentId, settings);
        } else {
            nativeEngine.setMixerSettings(instrumentId, settings);
        }
    },

    preload: async () => {
        if (Platform.OS === 'web') {
            await WebAudioEngine.preload();
        } else {
            await nativeEngine.preload();
        }
    },

    stopAll: async () => {
        // 1. Stop Instruments (Web/Native)
        if (Platform.OS === 'web') {
            WebAudioEngine.stopAll();
        } else {
            nativeEngine.stopAll();
        }

        // 2. Stop Timeline/Recordings
        AudioPlaybackService.stopAll();

        // 3. Stop Background Ambience
        AudioManager.stopAll();
    },

    unloadAll: async () => {
        if (Platform.OS !== 'web') {
            await nativeEngine.unloadAll();
        }
    },

    setSustain: (active) => {
        if (Platform.OS === 'web') {
            WebAudioEngine.setSustain(active);
        }
        // Native sustain can be added later if needed via timers
    }
};

export default UnifiedAudioEngine;
