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
    primary: '#6200ee',
    secondary: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    error: '#cf6679',
    success: '#00c853',
    warning: '#ffd600',

    // Artistic Palette
    petalPink: '#ffb7b2',
    leafGreen: '#4caf50',
    riverBlue: '#2196f3',
    gold: '#ffd700',
};

export const FONTS = {
    regular: 'System',
    bold: 'System', // In a real app, we'd load custom fonts
    medium: 'System',
};

export const SIZES = {
    get width() { return getDimensions().width; },
    get height() { return getDimensions().height; },
    padding: 20,
    radius: 12,
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
};

export default {
    COLORS,
    FONTS,
    SIZES,
    SHADOWS,
};
