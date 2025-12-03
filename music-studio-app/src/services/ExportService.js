// Simple export service for web-based audio export
// For production, consider using libraries like lamejs for MP3 encoding

import { Platform } from 'react-native';

class ExportService {
    constructor() {
        this.audioContext = null;
    }

    init() {
        if (Platform.OS !== 'web') {
            return;
        }
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Export current timeline as WAV (simple implementation)
    async exportAsWAV(projectName = 'export') {
        if (Platform.OS !== 'web') {
            alert('Export is currently only supported on the web version. Mobile export coming soon!');
            return;
        }

        this.init();

        // For MVP: Create a simple beep as placeholder
        // In production, this would mix all tracks from the timeline
        const duration = 5; // 5 seconds
        const sampleRate = this.audioContext.sampleRate;
        const numChannels = 2;
        const length = sampleRate * duration;

        const audioBuffer = this.audioContext.createBuffer(numChannels, length, sampleRate);

        // Fill with silence (in production, mix actual tracks here)
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = audioBuffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = 0;
            }
        }

        // Convert to WAV
        const wavBlob = this.audioBufferToWav(audioBuffer);
        this.downloadBlob(wavBlob, `${projectName}.wav`);
    }

    // Convert AudioBuffer to WAV blob
    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const data = this.interleave(buffer);
        const dataLength = data.length * bytesPerSample;
        const headerLength = 44;
        const totalLength = headerLength + dataLength;

        const arrayBuffer = new ArrayBuffer(totalLength);
        const view = new DataView(arrayBuffer);

        // Write WAV header
        this.writeString(view, 0, 'RIFF');
        view.setUint32(4, totalLength - 8, true);
        this.writeString(view, 8, 'WAVE');
        this.writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        this.writeString(view, 36, 'data');
        view.setUint32(40, dataLength, true);

        // Write audio data
        this.floatTo16BitPCM(view, 44, data);

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    interleave(buffer) {
        const numChannels = buffer.numberOfChannels;
        const length = buffer.length * numChannels;
        const result = new Float32Array(length);

        let offset = 0;
        for (let i = 0; i < buffer.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                result[offset++] = buffer.getChannelData(channel)[i];
            }
        }
        return result;
    }

    floatTo16BitPCM(view, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, input[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    // Placeholder for MP3 export (requires lamejs or similar)
    async exportAsMP3(projectName = 'export') {
        // For now, export as WAV
        // In production, use lamejs to encode to MP3
        console.warn('MP3 export not yet implemented, exporting as WAV instead');
        await this.exportAsWAV(projectName);
    }
}

export default new ExportService();
