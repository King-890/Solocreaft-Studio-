import { useAudioPlayer, AudioSource } from 'expo-audio';

class AudioEngine {
    constructor() {
        this.sounds = {};
    }

    async loadSound(key, source) {
        try {
            // expo-audio uses a different API - we'll store the source for later playback
            this.sounds[key] = source;
            return true;
        } catch (error) {
            console.error(`Failed to load sound ${key}`, error);
            return false;
        }
    }

    async playSound(key) {
        try {
            const source = this.sounds[key];
            if (source) {
                // Note: expo-audio uses hooks (useAudioPlayer) for playback
                // This class-based approach needs to be refactored to use hooks
                // For now, we'll keep the structure but log a warning
                console.warn(`Sound playback requires hook-based implementation with useAudioPlayer`);
            } else {
                console.warn(`Sound ${key} not loaded`);
            }
        } catch (error) {
            console.error(`Failed to play sound ${key}`, error);
        }
    }

    async unloadAll() {
        try {
            // Clear all sound references
            this.sounds = {};
        } catch (error) {
            console.error('Failed to unload sounds', error);
        }
    }
}

export default new AudioEngine();
