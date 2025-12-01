import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INSTRUMENT_IDS } from '../constants/InstrumentConfig';

const MixerContext = createContext();

const STORAGE_KEY = '@mixer_settings';

// Default mixer settings for each instrument
const DEFAULT_INSTRUMENT_SETTINGS = {
    volume: 0.8,        // 0.0 to 1.0
    pan: 0,             // -1.0 (left) to 1.0 (right)
    mute: false,
    solo: false,
    effects: {
        reverb: 0,      // 0.0 to 1.0
        delay: 0,       // 0.0 to 1.0
        chorus: 0,      // 0.0 to 1.0
        distortion: 0,  // 0.0 to 1.0
    },
    eq: {
        low: 0,         // -12 to +12 dB
        mid: 0,         // -12 to +12 dB
        high: 0,        // -12 to +12 dB
    },
};

// Initialize default settings for all instruments
const createDefaultMixerState = () => {
    const state = {
        masterVolume: 0.8,
        masterMute: false,
        instruments: {},
    };

    INSTRUMENT_IDS.forEach(instrument => {
        state.instruments[instrument] = { ...DEFAULT_INSTRUMENT_SETTINGS };
    });

    return state;
};

export function MixerProvider({ children }) {
    const [mixerState, setMixerState] = useState(createDefaultMixerState());
    const [loading, setLoading] = useState(true);

    // Load mixer settings from storage
    useEffect(() => {
        loadMixerSettings();
    }, []);

    // Save mixer settings whenever they change
    useEffect(() => {
        if (!loading) {
            saveMixerSettings();
        }
    }, [mixerState]);

    const loadMixerSettings = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setMixerState(parsed);
            }
        } catch (error) {
            console.error('Failed to load mixer settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveMixerSettings = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mixerState));
        } catch (error) {
            console.error('Failed to save mixer settings:', error);
        }
    };

    // Update master volume
    const setMasterVolume = (volume) => {
        setMixerState(prev => ({
            ...prev,
            masterVolume: Math.max(0, Math.min(1, volume)),
        }));
    };

    // Toggle master mute
    const toggleMasterMute = () => {
        setMixerState(prev => ({
            ...prev,
            masterMute: !prev.masterMute,
        }));
    };

    // Update instrument volume
    const setInstrumentVolume = (instrument, volume) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    volume: Math.max(0, Math.min(1, volume)),
                },
            },
        }));
    };

    // Update instrument pan
    const setInstrumentPan = (instrument, pan) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    pan: Math.max(-1, Math.min(1, pan)),
                },
            },
        }));
    };

    // Toggle instrument mute
    const toggleInstrumentMute = (instrument) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    mute: !prev.instruments[instrument].mute,
                },
            },
        }));
    };

    // Toggle instrument solo
    const toggleInstrumentSolo = (instrument) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    solo: !prev.instruments[instrument].solo,
                },
            },
        }));
    };

    // Update instrument effect
    const setInstrumentEffect = (instrument, effect, value) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    effects: {
                        ...prev.instruments[instrument].effects,
                        [effect]: Math.max(0, Math.min(1, value)),
                    },
                },
            },
        }));
    };

    // Update instrument EQ
    const setInstrumentEQ = (instrument, band, value) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: {
                    ...prev.instruments[instrument],
                    eq: {
                        ...prev.instruments[instrument].eq,
                        [band]: Math.max(-12, Math.min(12, value)),
                    },
                },
            },
        }));
    };

    // Reset instrument to default settings
    const resetInstrument = (instrument) => {
        setMixerState(prev => ({
            ...prev,
            instruments: {
                ...prev.instruments,
                [instrument]: { ...DEFAULT_INSTRUMENT_SETTINGS },
            },
        }));
    };

    // Reset all instruments
    const resetAllInstruments = () => {
        setMixerState(createDefaultMixerState());
    };

    // Get effective volume for an instrument (considering master volume, mute, solo)
    const getEffectiveVolume = (instrument) => {
        const instrumentSettings = mixerState.instruments[instrument];
        if (!instrumentSettings) return 0;

        // Check if master is muted
        if (mixerState.masterMute) return 0;

        // Check if instrument is muted
        if (instrumentSettings.mute) return 0;

        // Check if any instrument is soloed
        const anySolo = Object.values(mixerState.instruments).some(inst => inst.solo);
        if (anySolo && !instrumentSettings.solo) return 0;

        // Calculate effective volume
        return mixerState.masterVolume * instrumentSettings.volume;
    };

    // Get all settings for an instrument
    const getInstrumentSettings = (instrument) => {
        return mixerState.instruments[instrument] || DEFAULT_INSTRUMENT_SETTINGS;
    };

    const value = {
        mixerState,
        loading,

        // Master controls
        setMasterVolume,
        toggleMasterMute,

        // Instrument controls
        setInstrumentVolume,
        setInstrumentPan,
        toggleInstrumentMute,
        toggleInstrumentSolo,
        setInstrumentEffect,
        setInstrumentEQ,
        resetInstrument,
        resetAllInstruments,

        // Getters
        getEffectiveVolume,
        getInstrumentSettings,
    };

    return (
        <MixerContext.Provider value={value}>
            {children}
        </MixerContext.Provider>
    );
}

export function useMixer() {
    const context = useContext(MixerContext);
    if (!context) {
        throw new Error('useMixer must be used within MixerProvider');
    }
    return context;
}
