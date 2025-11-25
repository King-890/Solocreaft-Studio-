import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
    // Core Palette
    primary: '#6200ee',
    secondary: '#03dac6',

    // Blossom Theme Palette
    background: '#0a0e17', // Deep dark blue/black for contrast
    surface: 'rgba(30, 30, 40, 0.8)',
    surfaceLight: 'rgba(255, 255, 255, 0.1)',

    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textGold: '#ffd700',

    petal: '#ffb7b2',
    petalDark: '#ff80ab',

    leaf: '#69f0ae',
    water: '#40c4ff',

    // Functional
    error: '#cf6679',
    success: '#00c853',
    warning: '#ffd600',

    // Gradients (for reference in styles)
    gradientStart: '#1a237e',
    gradientEnd: '#000000',
};

export const FONTS = {
    regular: Platform.select({ ios: 'System', android: 'Roboto', web: 'System' }),
    bold: Platform.select({ ios: 'System', android: 'Roboto', web: 'System' }),
    medium: Platform.select({ ios: 'System', android: 'Roboto', web: 'System' }),
    // In a real app, we would load a fantasy font here
};

export const SIZES = {
    width,
    height,
    padding: 20,
    radius: 16,
    iconSize: 24,
    h1: 32,
    h2: 24,
    h3: 18,
    body: 14,
};

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

export const ASSETS = {
    // We will use require() in the components, but keys here for reference
    homeBackground: require('../../assets/blossom_goddess.png'),
};

export default {
    COLORS,
    FONTS,
    SIZES,
    SHADOWS,
    ASSETS,
};
