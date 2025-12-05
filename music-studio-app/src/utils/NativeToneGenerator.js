// Utility to generate WAV headers and PCM data for simple tones on native
// This allows us to have "synthesis" without external assets or complex native modules

// import { encode } from 'base-64';

const SAMPLE_RATE = 44100;
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

export const generateTone = (frequency, durationMs = 500, waveform = 'sine', volume = 0.5) => {
    const numSamples = Math.floor((SAMPLE_RATE * durationMs) / 1000);
    const blockAlign = (NUM_CHANNELS * BITS_PER_SAMPLE) / 8;
    const byteRate = SAMPLE_RATE * blockAlign;
    const dataSize = numSamples * blockAlign;
    const fileSize = 36 + dataSize;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File size
    view.setUint32(4, fileSize, true);
    // WAVE identifier
    writeString(view, 8, 'WAVE');
    // fmt chunk identifier
    writeString(view, 12, 'fmt ');
    // Chunk size
    view.setUint32(16, 16, true);
    // Audio format (1 = PCM)
    view.setUint16(20, 1, true);
    // Number of channels
    view.setUint16(22, NUM_CHANNELS, true);
    // Sample rate
    view.setUint32(24, SAMPLE_RATE, true);
    // Byte rate
    view.setUint32(28, byteRate, true);
    // Block align
    view.setUint16(32, blockAlign, true);
    // Bits per sample
    view.setUint16(34, BITS_PER_SAMPLE, true);
    // data chunk identifier
    writeString(view, 36, 'data');
    // Data size
    view.setUint32(40, dataSize, true);

    // Generate PCM data with improved synthesis
    const dataOffset = 44;
    const durationSec = durationMs / 1000;

    for (let i = 0; i < numSamples; i++) {
        const t = i / SAMPLE_RATE;
        let sample = 0;

        switch (waveform) {
            case 'sine':
                // Add harmonics for richer piano-like sound
                sample = Math.sin(2 * Math.PI * frequency * t);
                sample += 0.3 * Math.sin(4 * Math.PI * frequency * t); // 2nd harmonic
                sample += 0.15 * Math.sin(6 * Math.PI * frequency * t); // 3rd harmonic
                sample /= 1.45; // Normalize
                break;
            case 'square':
                // Softer square wave with limited harmonics
                sample = Math.sin(2 * Math.PI * frequency * t);
                sample += (1 / 3) * Math.sin(6 * Math.PI * frequency * t);
                sample += (1 / 5) * Math.sin(10 * Math.PI * frequency * t);
                sample /= 1.5;
                break;
            case 'sawtooth':
                // Richer sawtooth with controlled harmonics
                sample = 0;
                for (let h = 1; h <= 8; h++) {
                    sample += (1 / h) * Math.sin(2 * Math.PI * frequency * h * t);
                }
                sample /= 2;
                break;
            case 'triangle':
                // Smoother triangle wave
                sample = 0;
                for (let h = 1; h <= 7; h += 2) {
                    const sign = (h % 4 === 1) ? 1 : -1;
                    sample += sign * (1 / (h * h)) * Math.sin(2 * Math.PI * frequency * h * t);
                }
                sample *= 8 / (Math.PI * Math.PI);
                break;
            case 'noise':
                sample = Math.random() * 2 - 1;
                break;
            default:
                sample = Math.sin(2 * Math.PI * frequency * t);
        }

        // Improved ADSR envelope for more natural sound
        const attackTime = 0.02;  // Quick attack
        const decayTime = 0.05;   // Short decay
        const sustainLevel = 0.7; // Sustain level
        const releaseTime = 0.15; // Smooth release

        let envelope = 1;
        if (t < attackTime) {
            // Attack phase - exponential curve
            envelope = Math.pow(t / attackTime, 0.5);
        } else if (t < attackTime + decayTime) {
            // Decay phase
            const decayProgress = (t - attackTime) / decayTime;
            envelope = 1 - (1 - sustainLevel) * decayProgress;
        } else if (t < durationSec - releaseTime) {
            // Sustain phase
            envelope = sustainLevel;
        } else {
            // Release phase - exponential curve
            const releaseProgress = (durationSec - t) / releaseTime;
            envelope = sustainLevel * Math.pow(releaseProgress, 2);
        }

        sample *= volume * envelope;

        // Convert to 16-bit PCM with soft clipping
        const s = Math.max(-1, Math.min(1, sample));
        view.setInt16(dataOffset + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    // Convert ArrayBuffer to Base64 string
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return `data:audio/wav;base64,${btoa(binary)}`;
};

// Polyfill btoa if not available (React Native might need it)
const btoa = (input) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = chars;
        str.charAt(i | 0) || (map = '=', i % 1);
        output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

        charCode = str.charCodeAt(i += 3 / 4);

        if (charCode > 0xFF) {
            throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }

        block = block << 8 | charCode;
    }

    return output;
};

const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};
