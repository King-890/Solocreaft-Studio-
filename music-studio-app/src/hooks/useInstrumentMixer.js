import { useEffect } from 'react';
import { useMixer } from '../contexts/MixerContext';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';

/**
 * Hook to sync mixer settings with UnifiedAudioEngine for an instrument
 * @param {string} instrumentId - The instrument ID (e.g., 'trumpet', 'piano')
 */
export function useInstrumentMixer(instrumentId) {
    const { getInstrumentSettings } = useMixer();
    const settings = getInstrumentSettings(instrumentId);

    // Sync mixer settings to audio engine whenever they change
    useEffect(() => {
        UnifiedAudioEngine.setMixerSettings(instrumentId, {
            volume: settings.volume,
            pan: settings.pan,
            mute: settings.mute,
            solo: settings.solo,
        });
    }, [instrumentId, settings.volume, settings.pan, settings.mute, settings.solo]);

    return settings;
}
