import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [instrumentSettings, setInstrumentSettings] = useState({});

    // Load settings from storage on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const audio = await AsyncStorage.getItem('audioEnabled');
            const animations = await AsyncStorage.getItem('animationsEnabled');
            const instruments = await AsyncStorage.getItem('instrumentSettings');

            if (audio !== null) setAudioEnabled(JSON.parse(audio));
            if (animations !== null) setAnimationsEnabled(JSON.parse(animations));
            if (instruments !== null) setInstrumentSettings(JSON.parse(instruments));
        } catch (error) {
            console.log('Error loading settings:', error);
        }
    };

    const toggleAudio = async (value) => {
        setAudioEnabled(value);
        try {
            await AsyncStorage.setItem('audioEnabled', JSON.stringify(value));
        } catch (error) {
            console.log('Error saving audio setting:', error);
        }
    };

    const toggleAnimations = async (value) => {
        setAnimationsEnabled(value);
        try {
            await AsyncStorage.setItem('animationsEnabled', JSON.stringify(value));
        } catch (error) {
            console.log('Error saving animations setting:', error);
        }
    };

    const getInstrumentSettings = (instrumentId) => {
        return instrumentSettings[instrumentId] || {
            volume: 1.0,
            reverb: false,
            echo: false,
            pan: 0, // -1 (left) to 1 (right)
        };
    };

    const updateInstrumentSettings = async (instrumentId, settings) => {
        const newSettings = {
            ...instrumentSettings,
            [instrumentId]: {
                ...getInstrumentSettings(instrumentId),
                ...settings,
            },
        };
        setInstrumentSettings(newSettings);
        try {
            await AsyncStorage.setItem('instrumentSettings', JSON.stringify(newSettings));
        } catch (error) {
            console.log('Error saving instrument settings:', error);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                audioEnabled,
                animationsEnabled,
                toggleAudio,
                toggleAnimations,
                instrumentSettings,
                getInstrumentSettings,
                updateInstrumentSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
