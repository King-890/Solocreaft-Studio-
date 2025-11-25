import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
    width,
    height,
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
};

export default {
    COLORS,
    FONTS,
    SIZES,
    SHADOWS,
};
