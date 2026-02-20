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
        this.masterBus = null;
        this.currentPreset = 'Flat';
        this.vinylNode = null; // Node for procedural vinyl noise
    }

    getMasterBus() {
        if (!this.context) this.get();
        if (this.context && !this.masterBus) {
            this.initMasterBus();
        }
        return this.masterBus;
    }

    initMasterBus() {
        if (!this.context) return;

        // 1. Analyser (Shared for visualizations)
        const analyser = this.context.createAnalyser();
        analyser.fftSize = 2048;

        // 2. EQ Chain (3-Band)
        const eqLow = this.context.createBiquadFilter();
        eqLow.type = 'lowshelf';
        eqLow.frequency.value = 320;

        const eqMid = this.context.createBiquadFilter();
        eqMid.type = 'peaking';
        eqMid.frequency.value = 1000;
        eqMid.Q.value = 0.5;

        const eqHigh = this.context.createBiquadFilter();
        eqHigh.type = 'highshelf';
        eqHigh.frequency.value = 3200;

        // 3. Distortion (WaveShaper)
        const distortion = this.context.createWaveShaper();
        distortion.curve = this.makeDistortionCurve(0);
        distortion.oversample = '4x';

        // 4. Dynamics Compressor (Shared for loudness)
        const compressor = this.context.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, this.context.currentTime);
        compressor.knee.setValueAtTime(40, this.context.currentTime);
        compressor.ratio.setValueAtTime(4, this.context.currentTime);

        // 5. Master Gain
        const gain = this.context.createGain();
        gain.gain.setValueAtTime(1.2, this.context.currentTime);

        // 6. Final Limiter
        const limiter = this.context.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-1.0, this.context.currentTime);
        limiter.ratio.setValueAtTime(20, this.context.currentTime);

        // 7. Parallel Delay Path
        const delay = this.context.createDelay(1.0);
        const delayFeedback = this.context.createGain();
        const delayMix = this.context.createGain();
        delayMix.gain.value = 0;
        delayFeedback.gain.value = 0.4;
        
        // 8. Parallel Reverb Path (Placeholder buffer, will be loaded)
        const reverb = this.context.createConvolver();
        const reverbMix = this.context.createGain();
        reverbMix.gain.value = 0.15;

        // Connect Chain: Input -> Analyser -> EQ Low -> EQ Mid -> EQ High -> Distortion -> Compressor -> Gain -> Limiter -> Destination
        analyser.connect(eqLow);
        eqLow.connect(eqMid);
        eqMid.connect(eqHigh);
        eqHigh.connect(distortion);
        
        // Parallel sends from EQ High
        eqHigh.connect(delay);
        delay.connect(delayFeedback);
        delayFeedback.connect(delay);
        delay.connect(delayMix);
        delayMix.connect(compressor);

        eqHigh.connect(reverb);
        reverb.connect(reverbMix);
        reverbMix.connect(compressor);

        distortion.connect(compressor);
        compressor.connect(gain);
        gain.connect(limiter);
        limiter.connect(this.context.destination);

        this.masterBus = {
            input: analyser,
            analyser,
            eqLow,
            eqMid,
            eqHigh,
            distortion,
            compressor,
            gain,
            limiter,
            delay,
            delayFeedback,
            delayMix,
            reverb,
            reverbMix,
            noiseGain: this.context.createGain() // Gain for procedural noise
        };

        // Connect Noise Path
        this.masterBus.noiseGain.gain.value = 0;
        this.masterBus.noiseGain.connect(gain);

        // Load a default reverb impulse
        this.createReverbImpulse(2, 2).then(buf => {
            if (this.masterBus.reverb) this.masterBus.reverb.buffer = buf;
        });
    }

    makeDistortionCurve(amount, bits = 0) {
        const k = typeof amount === 'number' ? amount * 100 : 0;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        
        for (let i = 0 ; i < n_samples; ++i ) {
            let x = i * 2 / n_samples - 1;
            // Apply Sigmoid-like Saturation
            x = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
            
            // Apply Bit-crushing (Quantization) if bits > 0
            if (bits > 0) {
                const step = Math.pow(0.5, bits);
                x = Math.round(x / step) * step;
            }
            
            curve[i] = x;
        }
        return curve;
    }

    async createReverbImpulse(duration = 2, decay = 2) {
        if (!this.context) return null;
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.context.createBuffer(2, length, sampleRate);
        for (let i = 0; i < 2; i++) {
            const channel = impulse.getChannelData(i);
            for (let j = 0; j < length; j++) {
                channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, decay);
            }
        }
        return impulse;
    }

    applyPreset(name) {
        if (!this.masterBus) return;
        const bus = this.masterBus;
        const now = this.context.currentTime;
        this.currentPreset = name;

        switch (name) {
            case 'Lo-Fi':
                bus.eqHigh.gain.setTargetAtTime(-15, now, 0.1);
                bus.eqLow.gain.setTargetAtTime(4, now, 0.1);
                bus.distortion.curve = this.makeDistortionCurve(0.4, 8); // 8-bit saturation
                bus.compressor.threshold.setTargetAtTime(-35, now, 0.1);
                bus.compressor.ratio.setTargetAtTime(12, now, 0.1);
                bus.reverbMix.gain.setTargetAtTime(0.3, now, 0.1);
                bus.noiseGain.gain.setTargetAtTime(0.08, now, 0.5); // Fade in crackle
                this.startVinylCrackle();
                break;
            case 'Cinematic':
                this.stopVinylCrackle();
                bus.eqLow.gain.setTargetAtTime(8, now, 0.1);
                bus.eqHigh.gain.setTargetAtTime(2, now, 0.1);
                bus.reverbMix.gain.setTargetAtTime(0.6, now, 0.1);
                bus.compressor.threshold.setTargetAtTime(-20, now, 0.1);
                bus.compressor.ratio.setTargetAtTime(2, now, 0.1);
                bus.noiseGain.gain.setTargetAtTime(0, now, 0.2);
                break;
            case 'Radio Ready':
                this.stopVinylCrackle();
                bus.eqLow.gain.setTargetAtTime(2, now, 0.1);
                bus.eqMid.gain.setTargetAtTime(3, now, 0.1);
                bus.eqHigh.gain.setTargetAtTime(4, now, 0.1);
                bus.compressor.threshold.setTargetAtTime(-30, now, 0.1);
                bus.compressor.ratio.setTargetAtTime(8, now, 0.1);
                bus.gain.gain.setTargetAtTime(1.8, now, 0.1);
                bus.noiseGain.gain.setTargetAtTime(0, now, 0.2);
                break;
            default: // Flat/Default
                this.stopVinylCrackle();
                bus.eqLow.gain.setTargetAtTime(0, now, 0.1);
                bus.eqMid.gain.setTargetAtTime(0, now, 0.1);
                bus.eqHigh.gain.setTargetAtTime(0, now, 0.1);
                bus.distortion.curve = this.makeDistortionCurve(0);
                bus.compressor.threshold.setTargetAtTime(-24, now, 0.1);
                bus.compressor.ratio.setTargetAtTime(4, now, 0.1);
                bus.reverbMix.gain.setTargetAtTime(0.15, now, 0.1);
                bus.noiseGain.gain.setTargetAtTime(0, now, 0.2);
        }
    }

    startVinylCrackle() {
        if (this.vinylNode || !this.context) return;
        
        const bufferSize = 2 * this.context.sampleRate;
        const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            // Procedural Crackle: Sharp pulses + Pink noise base
            const p = Math.random();
            if (p > 0.9995) {
                output[i] = Math.random() * 0.5; // Dust pop
            } else {
                output[i] = (Math.random() * 2 - 1) * 0.005; // Surface hiss
            }
        }
        
        this.vinylNode = this.context.createBufferSource();
        this.vinylNode.buffer = noiseBuffer;
        this.vinylNode.loop = true;
        this.vinylNode.connect(this.masterBus.noiseGain);
        this.vinylNode.start();
    }

    stopVinylCrackle() {
        if (this.vinylNode) {
            try {
                this.vinylNode.stop();
                this.vinylNode.disconnect();
            } catch (e) {}
            this.vinylNode = null;
        }
    }

    getCurrentPreset() {
        return this.currentPreset;
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
