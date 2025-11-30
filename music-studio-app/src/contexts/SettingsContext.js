import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { saveFileToLocal, getFileFromLocal } from '../utils/webStorage';

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
    const [currentTheme, setCurrentTheme] = useState('default');
    const [customVideoUri, setCustomVideoUri] = useState(null);
    const [instrumentSettings, setInstrumentSettings] = useState({});

    // Load settings from storage on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const audio = await AsyncStorage.getItem('audioEnabled');
            const animations = await AsyncStorage.getItem('animationsEnabled');
            const theme = await AsyncStorage.getItem('currentTheme');
            let videoUri = await AsyncStorage.getItem('customVideoUri');
            const instruments = await AsyncStorage.getItem('instrumentSettings');

            // On Web, try to recover the blob URL from IndexedDB if we have a custom theme
            if (Platform.OS === 'web' && theme === 'custom') {
                const savedBlobUri = await getFileFromLocal('custom_theme_video');
                if (savedBlobUri) {
                    videoUri = savedBlobUri;
                }
            }

            if (audio !== null) setAudioEnabled(JSON.parse(audio));
            if (animations !== null) setAnimationsEnabled(JSON.parse(animations));
            if (theme !== null) setCurrentTheme(theme);
            if (videoUri !== null) setCustomVideoUri(videoUri);
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

    const setTheme = async (theme) => {
        setCurrentTheme(theme);
        try {
            await AsyncStorage.setItem('currentTheme', theme);
        } catch (error) {
            console.log('Error saving theme setting:', error);
        }
    };

    const saveCustomVideo = async (uri) => {
        try {
            // Save to persistent storage (IDB on Web, or just return URI on Native)
            const persistentUri = await saveFileToLocal(uri, 'custom_theme_video');

            setCustomVideoUri(persistentUri);
            await AsyncStorage.setItem('customVideoUri', persistentUri);
            console.log('✅ Theme video saved locally:', persistentUri);
        } catch (error) {
            console.log('Error saving custom video:', error);
            alert('Failed to save video setting.');
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
                currentTheme,
                toggleAudio,
                toggleAnimations,
                setTheme,
                customVideoUri,
                saveCustomVideo,
                instrumentSettings,
                getInstrumentSettings,
                updateInstrumentSettings,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
