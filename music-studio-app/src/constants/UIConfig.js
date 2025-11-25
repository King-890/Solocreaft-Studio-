/**
 * UI/UX Configuration File
 * Centralized configuration for all UI/UX elements across the app
 */

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// ==================== COLORS ====================
export const COLORS = {
    // Core Palette
    primary: '#6200ee',
    secondary: '#03dac6',

    // Blossom Theme Palette
    background: '#0a0e17',
    surface: 'rgba(30, 30, 40, 0.8)',
    surfaceLight: 'rgba(255, 255, 255, 0.1)',

    // Text Colors
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textGold: '#ffd700',

    // Nature Colors
    petal: '#ffb7b2',
    petalDark: '#ff80ab',
    leaf: '#69f0ae',
    water: '#40c4ff',

    // Functional
    error: '#cf6679',
    success: '#00c853',
    warning: '#ffd600',

    // Gradients
    gradientStart: '#1a237e',
    gradientEnd: '#000000',
};

// ==================== TYPOGRAPHY ====================
export const FONTS = {
    regular: Platform.select({ ios: 'System', android: 'Roboto', web: 'System' }),
    bold: Platform.select({ ios: 'System', android: 'Roboto', web: 'System' }),
    medium: Platform.select({ ios: 'System', android: 'Roboto', web: 'System' }),
};

export const FONT_SIZES = {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    body: 16,
    bodySmall: 14,
    caption: 12,
};

// ==================== SPACING ====================
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// ==================== SIZES ====================
export const SIZES = {
    width,
    height,
    padding: 20,
    radius: 16,
    radiusSmall: 8,
    radiusLarge: 24,
    iconSize: 24,
    iconSizeLarge: 32,
};

// ==================== SHADOWS ====================
export const SHADOWS = {
    light: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    glow: {
        shadowColor: COLORS.petal,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 10,
    },
};

// ==================== ANIMATIONS ====================
export const ANIMATIONS = {
    // Timing
    duration: {
        fast: 200,
        normal: 300,
        slow: 500,
        verySlow: 1000,
    },

    // Particle System
    particles: {
        petalCount: 50,
        petalFallDuration: 12000, // 12 seconds
        petalDriftRange: 400,
        noteFloatDuration: 4000,
    },

    // Wind Effect (removed rotation, keeping for reference)
    wind: {
        enabled: false, // Disabled rotation
        duration: 6000,
        intensity: 1.5,
    },
};

// ==================== AUDIO ====================
export const AUDIO_CONFIG = {
    river: {
        enabled: true,
        volume: 0.3,
        loop: true,
        // You'll need to add: assets/sounds/river_flow.mp3
    },
    wind: {
        enabled: true,
        volume: 0.2,
        loop: true,
        // You'll need to add: assets/sounds/wind_breeze.mp3
    },
    instrument: {
        enabled: true,
        volume: 0.4,
        loop: true,
        // You'll need to add: assets/sounds/instrument_ambient.mp3
    },
};

// ==================== LAYOUT ====================
export const LAYOUT = {
    // Home Screen specific
    homeScreen: {
        noteSourcePosition: {
            top: height * 0.55,
            left: width * 0.35,
        },
        profileOrbPosition: {
            top: 60,
            right: 30,
        },
        overlayOpacity: 0.05,
    },

    // Modal
    modal: {
        cardWidth: width * 0.85,
        cardPadding: 30,
        cardRadius: 24,
    },
};

// ==================== INSTRUMENT CATEGORIES ====================
export const INSTRUMENT_CATEGORIES = {
    strings: {
        name: 'Strings',
        icon: '🎸',
        color: '#ff6b9d',
        instruments: [
            { id: 'guitar', name: 'Guitar', icon: '🎸' },
            { id: 'sitar', name: 'Sitar', icon: '🪕' },
            { id: 'veena', name: 'Veena', icon: '🎻' },
        ],
    },
    percussion: {
        name: 'Percussion',
        icon: '🥁',
        color: '#ffd93d',
        instruments: [
            { id: 'tabla', name: 'Tabla', icon: '🥁' },
            { id: 'drums', name: 'Drums', icon: '🥁' },
            { id: 'dholak', name: 'Dholak', icon: '🪘' },
        ],
    },
    keys: {
        name: 'Keys',
        icon: '🎹',
        color: '#6bcf7f',
        instruments: [
            { id: 'piano', name: 'Piano', icon: '🎹' },
            { id: 'synthesizer', name: 'Synthesizer', icon: '🎛️' },
        ],
    },
    wind: {
        name: 'Wind',
        icon: '🎺',
        color: '#4d9de0',
        instruments: [
            { id: 'flute', name: 'Flute', icon: '🪈' },
            { id: 'saxophone', name: 'Saxophone', icon: '🎷' },
        ],
    },
};

// ==================== ASSETS ====================
export const ASSETS = {
    homeBackground: require('../../assets/blossom_goddess_sun_moon.jpg'),
    // Add more assets here as needed
};

// ==================== EXPORT ALL ====================
export default {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    SIZES,
    SHADOWS,
    ANIMATIONS,
    AUDIO_CONFIG,
    LAYOUT,
    ASSETS,
    INSTRUMENT_CATEGORIES,
};
