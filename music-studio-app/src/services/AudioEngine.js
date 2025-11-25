import { Audio } from 'expo-av';

class AudioEngine {
    constructor() {
        this.sounds = {};
    }

    async loadSound(key, source) {
        try {
            const { sound } = await Audio.Sound.createAsync(source);
            this.sounds[key] = sound;
            return true;
        } catch (error) {
            console.error(`Failed to load sound ${key}`, error);
            return false;
        }
    }

    async playSound(key) {
        try {
            const sound = this.sounds[key];
            if (sound) {
                await sound.replayAsync();
            } else {
                console.warn(`Sound ${key} not loaded`);
            }
        } catch (error) {
            console.error(`Failed to play sound ${key}`, error);
        }
    }

    async unloadAll() {
        try {
            const promises = Object.values(this.sounds).map(sound => sound.unloadAsync());
            await Promise.all(promises);
            this.sounds = {};
        } catch (error) {
            console.error('Failed to unload sounds', error);
        }
    }
}

export default new AudioEngine();
