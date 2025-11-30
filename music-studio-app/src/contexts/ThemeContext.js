import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const ThemeContext = createContext();

// Default app themes
const APP_THEMES = [
    {
        id: 'default',
        name: 'Default Gradient',
        type: 'gradient',
        colors: ['#1a1a2e', '#16213e', '#0f3460'],
    },
    {
        id: 'sunset',
        name: 'Sunset',
        type: 'gradient',
        colors: ['#ff6b6b', '#ee5a6f', '#c44569'],
    },
    {
        id: 'ocean',
        name: 'Ocean',
        type: 'gradient',
        colors: ['#0f2027', '#203a43', '#2c5364'],
    },
    {
        id: 'forest',
        name: 'Forest',
        type: 'gradient',
        colors: ['#134e5e', '#71b280', '#134e5e'],
    },
    {
        id: 'purple',
        name: 'Purple Dream',
        type: 'gradient',
        colors: ['#360033', '#0b8793', '#360033'],
    },
    {
        id: 'fire',
        name: 'Fire',
        type: 'gradient',
        colors: ['#f12711', '#f5af19', '#f12711'],
    },
    {
        id: 'blossom_sun_moon',
        name: 'Blossom Sun & Moon',
        type: 'photo',
        source: require('../../assets/blossom_goddess_sun_moon.jpg'),
    },
    {
        id: 'blossom_windy',
        name: 'Blossom Windy',
        type: 'photo',
        source: require('../../assets/blossom_goddess_windy.png'),
    },
    {
        id: 'blossom_goddess',
        name: 'Blossom Goddess',
        type: 'photo',
        source: require('../../assets/blossom_goddess.png'),
    },
    {
        id: 'band_room_3d',
        name: 'Band Room 3D',
        type: 'photo',
        source: require('../../assets/band_room_3d_background.png'),
    },
    {
        id: 'home_bg',
        name: 'Home Background',
        type: 'photo',
        source: require('../../assets/home_bg.png'),
    },
    {
        id: 'evening_loop',
        name: 'Evening Loop',
        type: 'video',
        source: require('../../assets/videos/Evening_Video_Loop_Creation.mp4'),
    },
    {
        id: 'nature_scene',
        name: 'Nature Scene',
        type: 'video',
        source: require('../../assets/videos/Video_Generation_Of_Nature_Scene.mp4'),
    },
];

const THEME_STORAGE_KEY = '@theme_preferences';
const USER_THEMES_STORAGE_KEY = '@user_themes';

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState(APP_THEMES[0]);
    const [userThemes, setUserThemes] = useState([]);
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    // Load saved theme on mount
    useEffect(() => {
        loadTheme();
        loadUserThemes();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme) {
                const theme = JSON.parse(savedTheme);

                // Check if it's a built-in theme and use the fresh definition
                // This fixes the stale require() ID issue for photo themes
                const builtInTheme = APP_THEMES.find(t => t.id === theme.id);
                if (builtInTheme) {
                    setCurrentTheme(builtInTheme);
                    setAnimationsEnabled(builtInTheme.type === 'gradient');
                } else {
                    setCurrentTheme(theme);
                    setAnimationsEnabled(theme.type === 'gradient');
                }
            }
        } catch (error) {
            console.error('Failed to load theme:', error);
        }
    };

    const loadUserThemes = async () => {
        try {
            const saved = await AsyncStorage.getItem(USER_THEMES_STORAGE_KEY);
            if (saved) {
                setUserThemes(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Failed to load user themes:', error);
        }
    };

    const saveTheme = async (theme) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
            setCurrentTheme(theme);
            // Disable animations for custom themes
            setAnimationsEnabled(theme.type === 'gradient');
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const saveUserThemes = async (themes) => {
        try {
            await AsyncStorage.setItem(USER_THEMES_STORAGE_KEY, JSON.stringify(themes));
            setUserThemes(themes);
        } catch (error) {
            console.error('Failed to save user themes:', error);
        }
    };

    const uploadPhotoTheme = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                const newTheme = {
                    id: `user_photo_${Date.now()}`,
                    name: 'Custom Photo',
                    type: 'photo',
                    uri: result.assets[0].uri,
                    createdAt: new Date().toISOString(),
                };

                const updatedUserThemes = [...userThemes, newTheme];
                await saveUserThemes(updatedUserThemes);
                await saveTheme(newTheme);
                return newTheme;
            }
        } catch (error) {
            console.error('Failed to upload photo theme:', error);
            throw error;
        }
    };

    const uploadVideoTheme = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                const newTheme = {
                    id: `user_video_${Date.now()}`,
                    name: 'Custom Video',
                    type: 'video',
                    uri: result.assets[0].uri,
                    createdAt: new Date().toISOString(),
                };

                const updatedUserThemes = [...userThemes, newTheme];
                await saveUserThemes(updatedUserThemes);
                await saveTheme(newTheme);
                return newTheme;
            }
        } catch (error) {
            console.error('Failed to upload video theme:', error);
            throw error;
        }
    };

    const selectTheme = async (theme) => {
        await saveTheme(theme);
    };

    const deleteUserTheme = async (themeId) => {
        const updatedThemes = userThemes.filter(t => t.id !== themeId);
        await saveUserThemes(updatedThemes);

        // If deleted theme was active, switch to default
        if (currentTheme.id === themeId) {
            await saveTheme(APP_THEMES[0]);
        }
    };

    const value = {
        currentTheme,
        userThemes,
        appThemes: APP_THEMES,
        animationsEnabled,
        uploadPhotoTheme,
        uploadVideoTheme,
        selectTheme,
        deleteUserTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
