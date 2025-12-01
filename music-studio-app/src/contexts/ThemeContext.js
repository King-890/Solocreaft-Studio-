import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

// App themes with portrait/landscape variants
const APP_THEMES = [
    {
        id: 'studio_neon',
        name: 'Neon Studio',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'concert_lights',
        name: 'Concert Vibes',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'vinyl_record',
        name: 'Retro Vinyl',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'mixing_console',
        name: 'Pro Mixer',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'guitar_closeup',
        name: 'Acoustic Soul',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1510915361149-ffad69ad6452?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'piano_mood',
        name: 'Midnight Piano',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'abstract_waves',
        name: 'Sound Waves',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'city_night',
        name: 'Urban Focus',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'nature_mountains',
        name: 'Calm Peaks',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'cyberpunk_city',
        name: 'Cyberpunk',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1535868463750-c78d9543614f?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'studio_mic',
        name: 'Vocal Booth',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1525026198548-4baa812f1183?auto=format&fit=crop&w=1080&q=80',
    },
    {
        id: 'synthwave',
        name: 'Synthwave',
        type: 'photo',
        uri: 'https://images.unsplash.com/photo-1558591714-0320d7d8c425?auto=format&fit=crop&w=1080&q=80',
    },
    // Local Asset Themes
    {
        id: 'home_bg',
        name: 'Default Studio',
        type: 'photo',
        source: require('../../assets/home_bg.jpg'),
    },
    {
        id: 'blossom_goddess',
        name: 'Blossom Goddess',
        type: 'photo',
        source: require('../../assets/blossom_goddess.jpg'),
    },
    {
        id: 'blossom_goddess_sun_moon',
        name: 'Blossom Sun & Moon',
        type: 'photo',
        source: require('../../assets/blossom_goddess_sun_moon.jpg'),
    },
    {
        id: 'blossom_goddess_windy',
        name: 'Blossom Windy',
        type: 'photo',
        source: require('../../assets/blossom_goddess_windy.jpg'),
    },
    {
        id: 'band_room_3d',
        name: '3D Band Room',
        type: 'photo',
        source: require('../../assets/band_room_3d_background.jpg'),
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
            const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (saved) {
                const themeId = JSON.parse(saved);
                const theme = [...APP_THEMES, ...userThemes].find(t => t.id === themeId);
                if (theme) {
                    setCurrentTheme(theme);
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

    const selectTheme = async (theme) => {
        try {
            setCurrentTheme(theme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme.id));
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    const uploadPhotoTheme = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant photo library access');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Images,
                allowsEditing: true,
                aspect: [9, 16], // Prefer portrait aspect ratio
                quality: 0.8, // Balance quality and file size
            });

            if (!result.canceled && result.assets[0]) {
                // Create permanent directory for theme photos
                const themeDir = `${FileSystem.documentDirectory}themes/photos/`;
                await FileSystem.makeDirectoryAsync(themeDir, { intermediates: true });

                // Copy file to permanent storage
                const fileName = `photo_${Date.now()}.jpg`;
                const permanentUri = `${themeDir}${fileName}`;
                await FileSystem.copyAsync({
                    from: result.assets[0].uri,
                    to: permanentUri
                });

                const newTheme = {
                    id: `user_photo_${Date.now()}`,
                    name: 'My Photo',
                    type: 'photo',
                    uri: permanentUri, // Use permanent URI instead of blob
                    isUserTheme: true,
                };

                const updated = [...userThemes, newTheme];
                setUserThemes(updated);
                await AsyncStorage.setItem(USER_THEMES_STORAGE_KEY, JSON.stringify(updated));
                await selectTheme(newTheme);
            }
        } catch (error) {
            console.error('Photo upload failed:', error);
            Alert.alert('Upload failed', 'Could not upload photo');
        }
    };

    const uploadVideoTheme = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant photo library access');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaType.Videos,
                allowsEditing: false,
                quality: 0.7, // Compress for mobile
                videoMaxDuration: 15, // Limit to 15 seconds
            });

            if (!result.canceled && result.assets[0]) {
                // Create permanent directory for theme videos
                const themeDir = `${FileSystem.documentDirectory}themes/videos/`;
                await FileSystem.makeDirectoryAsync(themeDir, { intermediates: true });

                // Copy file to permanent storage
                const fileName = `video_${Date.now()}.mp4`;
                const permanentUri = `${themeDir}${fileName}`;
                await FileSystem.copyAsync({
                    from: result.assets[0].uri,
                    to: permanentUri
                });

                const newTheme = {
                    id: `user_video_${Date.now()}`,
                    name: 'My Video',
                    type: 'video',
                    uri: permanentUri, // Use permanent URI instead of blob
                    isUserTheme: true,
                };

                const updated = [...userThemes, newTheme];
                setUserThemes(updated);
                await AsyncStorage.setItem(USER_THEMES_STORAGE_KEY, JSON.stringify(updated));
                await selectTheme(newTheme);
            }
        } catch (error) {
            console.error('Video upload failed:', error);
            Alert.alert('Upload failed', 'Could not upload video');
        }
    };

    const deleteUserTheme = async (themeId) => {
        try {
            const updated = userThemes.filter(t => t.id !== themeId);
            setUserThemes(updated);
            await AsyncStorage.setItem(USER_THEMES_STORAGE_KEY, JSON.stringify(updated));

            // If deleted theme was active, switch to default
            if (currentTheme.id === themeId) {
                await selectTheme(APP_THEMES[0]);
            }
        } catch (error) {
            console.error('Failed to delete theme:', error);
        }
    };

    const value = {
        currentTheme,
        userThemes,
        appThemes: APP_THEMES,
        selectTheme,
        uploadPhotoTheme,
        uploadVideoTheme,
        deleteUserTheme,
        animationsEnabled,
        setAnimationsEnabled,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
