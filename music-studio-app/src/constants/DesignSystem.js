import { Dimensions, Platform } from 'react-native';

// Lazy dimension getter to avoid web platform issues
const getDimensions = () => {
    try {
        return Dimensions.get('window');
    } catch (e) {
        return { width: 375, height: 667 }; // fallback dimensions
    }
};

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
    get width() { return getDimensions().width; },
    get height() { return getDimensions().height; },
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
        elevation: 2,
        ...Platform.select({
            web: {
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
            }
        })
    },
    medium: {
        elevation: 5,
        ...Platform.select({
            web: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }
        })
    },
    glow: {
        elevation: 10,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            }
        })
    },
};

export const ASSETS = {
    // We will use require() in the components, but keys here for reference
    homeBackground: require('../../assets/blossom_goddess.jpg'),
};

export default {
    COLORS,
    FONTS,
    SIZES,
    SHADOWS,
    ASSETS,
};
