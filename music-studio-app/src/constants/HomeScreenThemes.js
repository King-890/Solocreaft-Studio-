/**
 * Home Screen Theme Definitions
 * 
 * Professional themes for the home screen
 */

export const HOME_THEMES = {
    darkStudio: {
        id: 'darkStudio',
        name: 'Dark Studio',
        background: '#0a0a0a',
        primary: '#1a1a1a',
        secondary: '#2a2a2a',
        accent: '#007AFF',
        text: '#ffffff',
        textMuted: '#888888',

        // Gradients
        gradient: ['#0a0a0a', '#1a1a1a', '#2a2a2a'],
        cardGradient: ['#1a1a1a', '#2a2a2a'],

        // Shadows
        shadow: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },

        shadowSmall: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
        },
    },

    creativeLight: {
        id: 'creativeLight',
        name: 'Creative Light',
        background: '#f8f9fa',
        primary: '#ffffff',
        secondary: '#f1f3f4',
        accent: '#FF6B6B',
        text: '#2d3436',
        textMuted: '#636e72',

        // Gradients
        gradient: ['#667eea', '#764ba2'],
        cardGradient: ['#ffffff', '#f8f9fa'],

        // Shadows
        shadow: {
            shadowColor: '#2d3436',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
        },

        shadowSmall: {
            shadowColor: '#2d3436',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 2,
        },
    },

    musicProducer: {
        id: 'musicProducer',
        name: 'Music Producer',
        background: '#120458',
        primary: '#1a0878',
        secondary: '#2a1a88',
        accent: '#FFD700',
        text: '#ffffff',
        textMuted: '#b8b8ff',

        // Gradients
        gradient: ['#120458', '#1a0878', '#2a1a88'],
        cardGradient: ['#1a0878', '#2a1a88'],

        // Shadows
        shadow: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 10,
        },

        // Glows
        glow: {
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 10,
        },
    },
};

// Design tokens
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const TYPOGRAPHY = {
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
    },
    body: {
        fontSize: 14,
        fontWeight: '400',
    },
    caption: {
        fontSize: 12,
        fontWeight: '400',
    },
    button: {
        fontSize: 16,
        fontWeight: '600',
    },
};

export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
};

export default HOME_THEMES;
