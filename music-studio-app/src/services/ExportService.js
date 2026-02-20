import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

/**
 * ExportService
 * Handles multi-track mixing and audio file generation across platforms.
 */
const ExportService = {
    /**
     * Web-only: Mixes all clips into a single WAV file using OfflineAudioContext.
     */
    exportAsWAV: async (clips, tracks, tempo) => {
        if (Platform.OS !== 'web') return null;

        const duration = Math.max(...clips.map(c => c.startTime + c.duration), 1);
        const sampleRate = 44100;
        const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
            2, sampleRate * duration, sampleRate
        );

        // Render each clip into the offline context
        for (const clip of clips) {
            try {
                const response = await fetch(clip.audioUri);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);
                
                const source = offlineCtx.createBufferSource();
                source.buffer = audioBuffer;
                
                const gain = offlineCtx.createGain();
                const track = tracks.find(t => t.id === clip.trackId);
                gain.gain.value = track ? track.volume : 1.0;
                
                source.connect(gain);
                gain.connect(offlineCtx.destination);
                
                source.start(clip.startTime);
            } catch (e) {
                console.error('Error rendering clip for export:', e);
            }
        }

        const renderedBuffer = await offlineCtx.startRendering();
        const wavBlob = bufferToWav(renderedBuffer);
        
        const url = URL.createObjectURL(wavBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `StudioProject_${Date.now()}.wav`;
        link.click();
        
        return { success: true };
    },

    /**
     * Web-only: Placeholder for MP3 export.
     * Implementing full MP3 encoding on web without external libraries is 
     * limited to WAV headers; for true MP3, libraries like lamejs are recommended.
     */
    exportAsMP3: async (clips, tracks, tempo) => {
        if (Platform.OS !== 'web') return null;
        console.warn('MP3 export on web is currently using WAV format fallback.');
        return ExportService.exportAsWAV(clips, tracks, tempo);
    },

    /**
     * Native: Shares the first available recording via system share sheet.
     */
    exportNative: async (recordings, format = 'wav') => {
        if (Platform.OS === 'web') return null;

        if (!recordings || recordings.length === 0) {
            throw new Error('No recordings found to export. Please record something first.');
        }

        const recording = recordings[0];
        if (!(await Sharing.isAvailableAsync())) {
            throw new Error('Sharing is not available on this device');
        }

        await Sharing.shareAsync(recording.uri, {
            mimeType: format === 'mp3' ? 'audio/mpeg' : 'audio/m4a',
            dialogTitle: `Export project as ${format.toUpperCase()}`,
            UTI: format === 'mp3' ? 'public.mp3' : 'public.mpeg-4-audio'
        });

        return { success: true };
    }
};

/**
 * Helper: Converts AudioBuffer to WAV Blob
 */
function bufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i;
    let sample;
    let offset = 0;
    let pos = 0;

    const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8);
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt "
    setUint32(16);
    setUint16(1); // PCM
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4);

    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
        offset++;
    }

    return new Blob([bufferArray], { type: 'audio/wav' });
}

export default ExportService;
