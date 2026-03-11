import { Platform } from 'react-native';
import WebAudioEngine from './WebAudioEngine';
import * as Audio from 'expo-audio';
import { Asset } from 'expo-asset';
import { INSTRUMENTS, getSafeSampleUrl, getLocalPercussionAsset } from './SampleLibrary';
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
        this.playerPool = new Map();
        this.drumPlayerPool = new Map(); // Pool for transient drum sounds
    }

    async init() {
        if (this.initialized) return true;
        if (this.initFailed) return false;
        
        try {
            // console.log('🎵 Initializing Native Audio (Sample Mode via expo-audio)...');
            
            // Set Audio Mode for iOS/Android
            const audioMode = {
                playsInSilentMode: true,
                shouldPlayInBackground: true,
                interruptionMode: 'mixWithOthers',
                shouldRouteThroughEarpiece: false,
            };

            // [MOBILE COMPATIBILITY] Add Android-specific fallback if needed, though expo-audio should handle it
            if (Platform.OS === 'android') {
                audioMode.interruptionModeAndroid = 'mixWithOthers';
            }

            await Audio.setAudioModeAsync(audioMode);

            // Ensure Audio Session is Active
            await Audio.setIsAudioActiveAsync(true);

            // 1. Get the Unified Context
            this.ctx = UnifiedAudioContext.get();
            if (!this.ctx) {
                // [MOBILE FAILOVER] expected in Expo Go/Native
                if (__DEV__) console.debug('ℹ️ Synthesis Engine Unavailable. Using Sample Playback.');
                this.initialized = true; 
                return true;
            }

            // 3. Setup Master Chain
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.initialized = true;
            // console.log('✅ NativeAudioEngine (Audio API) Initialized');
            return true;
        } catch (error) {
            if (__DEV__) console.debug('ℹ️ Native Audio Failover:', error.message);
            this.initFailed = true; // Mark as failed to avoid loops
            return false;
        }
    }

    async preload() {
        await this.init();
    }

    playSound(noteName, instrument = 'piano', delay = 0, velocity = 1.0) {
        const lowerInst = String(instrument).toLowerCase();
        
        if (!this.initialized && !this.initFailed) {
            this.init().then(() => {
                if (this.ctx) {
                    this.playSynthesizedSound(noteName, lowerInst, delay, velocity).catch(err => {
                        console.debug('playSynthesizedSound error', err);
                    });
                } else {
                    this.playSampleSound(noteName, lowerInst, velocity);
                }
            });
            return;
        }

        if (this.ctx) {
            this.playSynthesizedSound(noteName, lowerInst, delay, velocity).catch(err => {
                console.debug('playSynthesizedSound error', err);
            });
        } else {
            this.playSampleSound(noteName, lowerInst, velocity);
        }
    }

    async playSampleSound(noteName, instrument, volume = 1.0) {
        const instrumentKey = INSTRUMENTS[instrument.toUpperCase()] || instrument;
        const url = getSafeSampleUrl(instrumentKey, noteName);
        const key = `${instrumentKey}-${noteName}`;
        
        // console.log(`🎵 [AudioEngine] Playing ${key} - URL: ${url}`);
        
        const MAX_POOL_SIZE = 32;

        const createPlayer = () => {
            try {
                const player = Audio.createAudioPlayer(url);
                player.volume = volume * this.masterVolume;
                player._lastPlayed = Date.now();
                return player;
            } catch (e) {
                console.error(`❌ [AudioEngine] Create player failed for ${key}:`, e);
                return null;
            }
        };

        // --- Pool Management (LRU Disposal) ---
        if (this.playerPool.size >= MAX_POOL_SIZE && !this.playerPool.has(key)) {
            let oldestKey = null;
            let oldestTime = Date.now();

            // Find oldest candidate that is NOT currently playing
            for (const [k, p] of this.playerPool.entries()) {
                const isPlaying = p.status === 'playing' || p.isPlaying; // Native expo-audio status check
                if (!isPlaying && p._lastPlayed < oldestTime) {
                    oldestTime = p._lastPlayed;
                    oldestKey = k;
                }
            }

            // If no non-playing candidate found, we might skip eviction or increase limit
            if (oldestKey) {
                const oldestPlayer = this.playerPool.get(oldestKey);
                try {
                    oldestPlayer.stop();
                    if (oldestPlayer.remove) oldestPlayer.remove();
                } catch (e) {
                    console.debug('Failed to remove player from native side', e.message);
                }
                this.playerPool.delete(oldestKey);
            } else if (this.playerPool.size >= MAX_POOL_SIZE + 8) {
                // Hard limit reached even for playing sounds - force eviction of the absolute oldest
                let absoluteOldestKey = null;
                let absoluteOldestTime = Date.now();
                for (const [k, p] of this.playerPool.entries()) {
                    if (p._lastPlayed < absoluteOldestTime) {
                        absoluteOldestTime = p._lastPlayed;
                        absoluteOldestKey = k;
                    }
                }
                if (absoluteOldestKey) {
                    const p = this.playerPool.get(absoluteOldestKey);
                    try { p.stop(); if (p.remove) p.remove(); } catch(e){}
                    this.playerPool.delete(absoluteOldestKey);
                }
            }
        }

        let player = this.playerPool.get(key);

        try {
            if (!player) {
                player = createPlayer();
                if (player) this.playerPool.set(key, player);
            } else {
                // Ensure player is stopped before seeking/restarting
                try { 
                    player.stop(); 
                    player.seekTo(0); 
                } catch (e) {}
                player.volume = volume * this.masterVolume;
                player._lastPlayed = Date.now();
            }

            if (player) {
                player.play();
            }
        } catch (playError) {
            // [ROBUSTNESS] Silent fallback to synthesis - never let the user experience silence
            try {
                const oldPlayer = this.playerPool.get(key);
                if (oldPlayer && oldPlayer.remove) try { oldPlayer.remove(); } catch(e){}
                
                this.playerPool.delete(key);
                
                // If synthesis engine is available, use it immediately as fallback
                if (this.ctx) {
                    this.playSynthesizedSound(noteName, instrument, 0, volume);
                }
            } catch (fallbackError) {
                // Last resort: fail silently but don't crash
            }
        }
    }

    async playDrumSoundNative(id, instrument, volume, pan = 0) {
        const asset = getLocalPercussionAsset(instrument, id);
        if (!asset) return;
        
        const assetId = typeof asset === 'number' ? asset : (asset.uri || JSON.stringify(asset));
        const poolKey = `${instrument}-${id}-${assetId}`;
        
        try {
            // 1. Try to find an idle player in the pool
            let player = this.drumPlayerPool.get(poolKey);
            
            if (!player) {
                // Check pool size limit (prevent resource exhaustion)
                if (this.drumPlayerPool.size > 24) {
                    // Dispose of the oldest/unused player if needed, but for drums we usually key by sound
                    // Just create and manage if not too many unique sounds
                }
                
                player = Audio.createAudioPlayer(asset);
                player.isBusy = false;
                this.drumPlayerPool.set(poolKey, player);
            }

            // 2. Setup and Play
            player.volume = volume * this.masterVolume;
            
            // Re-trigger playback if already initialized
            if (player.isBusy) {
                try {
                    player.stop();
                    player.seekTo(0);
                } catch (e) {}
            }

            player.isBusy = true;
            
            // 3. Listen for completion to mark as idle or release if needed
            // Note: subscribing every time might be heavy if not removed, 
            // but expo-audio subscriptions are manageable.
            const subscription = player.addListener('statusChange', (status) => {
                if (status.status === 'finished' || status.status === 'error') {
                    player.isBusy = false;
                    subscription.remove();
                }
            });

            player.play();
        } catch (e) {
            if (__DEV__) console.warn('⚠️ Native drum playback failed', e.message);
            // Cleanup references on error
            if (this.drumPlayerPool.has(poolKey)) {
                const p = this.drumPlayerPool.get(poolKey);
                if (p && p.remove) p.remove();
                this.drumPlayerPool.delete(poolKey);
            }
        }
    }

    async playSynthesizedSound(noteName, instrument, delay = 0, velocity = 1.0) {
        if (!this.ctx) return;

        const freq = this.getFrequency(noteName);
        const now = this.ctx.currentTime;
        const startTime = now + delay;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = instrument === 'piano' ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(velocity * 0.7, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

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

        if (this.playerPool) {
            this.playerPool.forEach(player => {
                try {
                    player.pause();
                    player.seekTo(0);
                } catch (e) {}
            });
        }
    }

    async unloadAll() {
        this.stopAll();
        
        // Release all players in the pool
        const releasePool = async (pool) => {
            for (const player of pool.values()) {
                try {
                    player.stop();
                    if (player.remove) await player.remove();
                } catch (e) {
                    console.debug('Error releasing player during unload:', e.message);
                }
            }
            pool.clear();
        };

        if (this.playerPool) await releasePool(this.playerPool);
        if (this.drumPlayerPool) await releasePool(this.drumPlayerPool);

        // console.log('🧹 Native Audio Engine: Resources Unloaded');
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
        // console.log('🔗 UnifiedAudioEngine: Activating Audio...');
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
        // console.log(`🔊 UnifiedAudioEngine.playSound called: ${instrument} - ${noteName}`);
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
