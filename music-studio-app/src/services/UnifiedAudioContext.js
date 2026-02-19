import { Platform } from 'react-native';

let AudioContextClass;

if (Platform.OS === 'web') {
    AudioContextClass = window.AudioContext || window.webkitAudioContext;
} else {
    // Native audio is handled by expo-audio in UnifiedAudioEngine.js
    // We don't need a Web Audio API polyfill here anymore.
    AudioContextClass = null;
}

class UnifiedAudioContext {
    constructor() {
        this.context = null;
    }

    get() {
        if (!this.context && AudioContextClass) {
            try {
                this.context = new AudioContextClass();
                console.log(`🎵 UnifiedAudioContext: Created (${Platform.OS})`);
                
                // Monitor state
                if (this.context.onstatechange !== undefined) {
                    this.context.onstatechange = () => {
                        console.log(`🎵 UnifiedAudioContext state: ${this.context.state}`);
                    };
                }
            } catch (e) {
                console.error('❌ Failed to create UnifiedAudioContext:', e);
            }
        }
        return this.context;
    }

    async resume() {
        const ctx = this.get();
        if (!ctx) return false;

        if (ctx.state === 'suspended' || ctx.state === 'interrupted') {
            try {
                await ctx.resume();
                console.log('✅ UnifiedAudioContext resumed');
                return true;
            } catch (e) {
                console.warn('⚠️ UnifiedAudioContext resume failed:', e);
                return false;
            }
        }
        return ctx.state === 'running';
    }
}

export default new UnifiedAudioContext();
