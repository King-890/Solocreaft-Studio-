/**
 * NativeMixerService.js
 * 
 * Service to handle mixing and exporting of multi-track audio on native platforms (Android/iOS).
 * 
 * Current Strategy (Phase 9):
 * - Mobile: Export individual tracks or simple mix via expo-sharing (ExportService.js).
 * - Future: Use ffmpeg-kit-react-native to combine audio files offline.
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

class NativeMixerService {
    
    /**
     * Checks if native mixing capabilities (FFmpeg) are available.
     * @returns {boolean}
     */
    isMixingAvailable() {
        // Placeholder for ffmpeg-kit availability check
        return false; 
    }

    /**
     * Estimates the size of the exported project.
     * @param {Array} clips - List of audio clips
     * @returns {Promise<number>} - Size in bytes
     */
    async estimateExportSize(clips) {
        let totalSize = 0;
        try {
            for (const clip of clips) {
                const fileInfo = await FileSystem.getInfoAsync(clip.audioUri);
                if (fileInfo.exists) {
                    totalSize += fileInfo.size;
                }
            }
        } catch (e) {
            console.warn('Failed to estimate export size', e);
        }
        return totalSize;
    }

    /**
     * Prepares audio files for native sharing/export.
     * Ensures all files are locally available and cached.
     * @param {Array} clips 
     * @returns {Promise<Array>} - List of valid local URIs
     */
    async prepareFilesForExport(clips) {
        const validUris = [];
        for (const clip of clips) {
            const info = await FileSystem.getInfoAsync(clip.audioUri);
            if (info.exists) {
                validUris.push(clip.audioUri);
            }
        }
        return validUris;
    }
}

export default new NativeMixerService();
