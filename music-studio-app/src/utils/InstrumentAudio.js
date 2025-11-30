// Web Audio API based instrument sound generator
class InstrumentAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeOscillators = new Map();
        this.panner = null;
        this.instrumentSettings = new Map(); // Store settings per instrument
    }

    async initialize() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.audioContext.destination);
        }

        // Resume context on user interaction
        await this.resumeContext();
    }

    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
                console.log('✅ InstrumentAudio context resumed');
            } catch (error) {
                console.error('❌ Failed to resume InstrumentAudio context:', error);
            }
        }
    }

    // Get settings for an instrument
    getSettings(instrumentId) {
        return this.instrumentSettings.get(instrumentId) || this.getDefaultSettings();
    }

    // Update settings for an instrument
    updateSettings(instrumentId, settings) {
        this.instrumentSettings.set(instrumentId, settings);
    }

    // Get default settings
    getDefaultSettings() {
        return {
            volume: 0.7,
            tune: 0,
            reverb: 0.3,
            bass: 0.5,
            treble: 0.5,
        };
    }

    // Play instrument sound based on type with spatial positioning and settings
    async playInstrument(instrumentName, duration = 1.5, spatialPosition = null, instrumentId = null) {
        await this.initialize();

        const now = this.audioContext.currentTime;
        const settings = instrumentId ? this.getSettings(instrumentId) : this.getDefaultSettings();

        // Create stereo panner for spatial audio if position provided
        if (spatialPosition && this.audioContext.createStereoPanner) {
            this.panner = this.audioContext.createStereoPanner();
            const panValue = (spatialPosition.x * 2) - 1;
            this.panner.pan.value = panValue;
        }

        switch (instrumentName.toLowerCase()) {
            case 'guitar':
                this.playGuitar(now, duration, settings);
                break;
            case 'piano':
                this.playPiano(now, duration, settings);
                break;
            case 'tabla':
                this.playTabla(now, duration, settings);
                break;
            case 'drums':
                this.playDrums(now, duration, settings);
                break;
            case 'flute':
                this.playFlute(now, duration, settings);
                break;
            case 'violin':
                this.playViolin(now, duration, settings);
                break;
            case 'saxophone':
                this.playSaxophone(now, duration, settings);
                break;
            case 'trumpet':
                this.playTrumpet(now, duration, settings);
                break;
            default:
                this.playGeneric(now, duration, settings);
        }
    }

    // Helper to apply common settings (Envelope, Detune, Opera, LFO)
    applyCommonSettings(osc, gain, startTime, duration, settings) {
        // Detune
        if (settings.detune) {
            osc.detune.value = settings.detune;
        }

        // Tune (Semitones)
        if (settings.tune) {
            osc.detune.value += settings.tune * 100;
        }

        // Envelope (ADSR) - overrides default duration if specific envelope settings exist
        if (settings.attack !== undefined) {
            const attack = settings.attack || 0.01;
            const decay = settings.decay || 0.1;
            const sustain = settings.sustain || 0.5;
            const release = settings.release || 0.5;

            gain.gain.cancelScheduledValues(startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(settings.volume || 0.5, startTime + attack);
            gain.gain.exponentialRampToValueAtTime((settings.volume || 0.5) * sustain, startTime + attack + decay);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration + release);

            // Extend oscillator stop time to account for release
            osc.stop(startTime + duration + release);
        } else {
            // Default simple envelope if no advanced settings
            gain.gain.setValueAtTime(settings.volume || 0.5, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.stop(startTime + duration);
        }

        // LFO (Modulation)
        if (settings.lfoDepth > 0) {
            const lfo = this.audioContext.createOscillator();
            const lfoGain = this.audioContext.createGain();

            lfo.frequency.value = settings.lfoRate || 5;
            lfoGain.gain.value = settings.lfoDepth * 10; // Scale depth

            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency); // FM Synthesis / Vibrato
            lfo.start(startTime);
            lfo.stop(startTime + duration + (settings.release || 0));
        }

        // Opera / Formant Filter
        let outputNode = gain;
        if (settings.operaVowel !== undefined) {
            const formant = this.audioContext.createBiquadFilter();
            formant.type = 'bandpass';
            formant.Q.value = 5;

            // Simple vowel formants (approximate)
            const vowels = [
                { f1: 730, f2: 1090 }, // A
                { f1: 530, f2: 1840 }, // E
                { f1: 270, f2: 2290 }, // I
                { f1: 570, f2: 840 },  // O
                { f1: 300, f2: 870 }   // U
            ];

            const vowelIndex = Math.floor(settings.operaVowel) % vowels.length;
            const selectedVowel = vowels[vowelIndex];

            formant.frequency.value = selectedVowel.f1;

            gain.connect(formant);
            outputNode = formant;
        }

        return outputNode;
    }

    playGuitar(startTime, duration, settings = {}) {
        // Guitar - plucked string sound with harmonics
        const frequencies = [329.63, 246.94, 196.00]; // E4, B3, G3 chord

        frequencies.forEach((freq, index) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            // Pluck envelope & Settings
            const outputNode = this.applyCommonSettings(osc, gain, startTime, duration, settings);

            if (this.panner) {
                outputNode.connect(this.panner);
                this.panner.connect(this.masterGain);
            } else {
                outputNode.connect(this.masterGain);
            }

            osc.start(startTime + index * 0.05);
            // Stop handled in applyCommonSettings
        });
    }

    playPiano(startTime, duration, settings = {}) {
        // Piano - C major chord
        const frequencies = [261.63, 329.63, 392.00]; // C4, E4, G4

        frequencies.forEach((freq) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            // Piano envelope & Settings
            const outputNode = this.applyCommonSettings(osc, gain, startTime, duration, settings);

            if (this.panner) {
                outputNode.connect(this.panner);
                this.panner.connect(this.masterGain);
            } else {
                outputNode.connect(this.masterGain);
            }

            osc.start(startTime);
            // Stop handled in applyCommonSettings
        });
    }

    playTabla(startTime, duration) {
        // Tabla - percussive sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, startTime);
        osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.1);

        filter.type = 'lowpass';
        filter.frequency.value = 800;

        gain.gain.setValueAtTime(0.5, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
    }

    playDrums(startTime, duration) {
        // Kick drum
        const kick = this.audioContext.createOscillator();
        const kickGain = this.audioContext.createGain();

        kick.frequency.setValueAtTime(150, startTime);
        kick.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        kickGain.gain.setValueAtTime(0.7, startTime);
        kickGain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        kick.connect(kickGain);
        kickGain.connect(this.masterGain);

        kick.start(startTime);
        kick.stop(startTime + 0.5);
    }

    playFlute(startTime, duration, settings = {}) {
        // Flute - pure sine wave
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 523.25; // C5

        // Flute envelope & Settings
        const outputNode = this.applyCommonSettings(osc, gain, startTime, duration, settings);

        if (this.panner) {
            outputNode.connect(this.panner);
            this.panner.connect(this.masterGain);
        } else {
            outputNode.connect(this.masterGain);
        }

        osc.start(startTime);
        // Stop handled in applyCommonSettings
    }

    playViolin(startTime, duration) {
        // Violin - sawtooth wave with vibrato
        const osc = this.audioContext.createOscillator();
        const vibrato = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 440; // A4

        vibrato.frequency.value = 5; // 5Hz vibrato
        vibratoGain.gain.value = 10;

        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.2);
        gain.gain.setValueAtTime(0.25, startTime + duration - 0.2);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        vibrato.start(startTime);
        osc.start(startTime);
        vibrato.stop(startTime + duration);
        osc.stop(startTime + duration);
    }

    playSaxophone(startTime, duration) {
        // Saxophone - square wave with filter
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();

        osc.type = 'square';
        osc.frequency.value = 293.66; // D4

        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        filter.Q.value = 5;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
        gain.gain.setValueAtTime(0.2, startTime + duration - 0.1);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playTrumpet(startTime, duration) {
        // Trumpet - bright sawtooth
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sawtooth';
        osc.frequency.value = 349.23; // F4

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gain.gain.setValueAtTime(0.3, startTime + duration - 0.1);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playGeneric(startTime, duration) {
        // Generic pleasant sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 440;

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    stopAll() {
        this.activeOscillators.forEach(osc => {
            try {
                osc.stop();
            } catch (e) {
                // Oscillator already stopped
            }
        });
        this.activeOscillators.clear();
    }
}

export default new InstrumentAudio();
