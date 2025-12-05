import { Platform } from 'react-native';

/**
 * Creates platform-specific shadow styles
 * On web: uses boxShadow
 * On native: uses shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
 * 
 * @param {Object} config - Shadow configuration
 * @param {string} config.color - Shadow color (hex or rgba)
 * @param {number} config.offsetX - Horizontal offset (default: 0)
 * @param {number} config.offsetY - Vertical offset (default: 4)
 * @param {number} config.opacity - Shadow opacity 0-1 (default: 0.3)
 * @param {number} config.radius - Blur radius (default: 8)
 * @param {number} config.elevation - Android elevation (default: 5)
 * @returns {Object} Platform-specific shadow styles
 */
export function createShadow({
    color = '#000',
    offsetX = 0,
    offsetY = 4,
    opacity = 0.3,
    radius = 8,
    elevation = 5,
}) {
    if (Platform.OS === 'web') {
        // Convert to rgba if hex color
        let shadowColor = color;
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            shadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }

        return {
            boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${shadowColor}`,
        };
    }

    // Native platforms (iOS, Android)
    return {
        shadowColor: color,
        shadowOffset: { width: offsetX, height: offsetY },
        shadowOpacity: opacity,
        shadowRadius: radius,
        elevation, // Android only
    };
}

/**
 * Creates platform-specific text shadow styles
 * On web: uses textShadow
 * On native: uses textShadowColor, textShadowOffset, textShadowRadius
 * 
 * @param {Object} config - Text shadow configuration
 * @param {string} config.color - Shadow color (hex or rgba)
 * @param {number} config.offsetX - Horizontal offset (default: 0)
 * @param {number} config.offsetY - Vertical offset (default: 2)
 * @param {number} config.radius - Blur radius (default: 4)
 * @returns {Object} Platform-specific text shadow styles
 */
export function createTextShadow({
    color = 'rgba(0, 0, 0, 0.3)',
    offsetX = 0,
    offsetY = 2,
    radius = 4,
}) {
    if (Platform.OS === 'web') {
        return {
            textShadow: `${offsetX}px ${offsetY}px ${radius}px ${color}`,
        };
    }

    // Native platforms (iOS, Android)
    return {
        textShadowColor: color,
        textShadowOffset: { width: offsetX, height: offsetY },
        textShadowRadius: radius,
    };
}

/**
 * Predefined shadow presets
 */
export const ShadowPresets = {
    small: {
        offsetY: 2,
        radius: 4,
        opacity: 0.2,
        elevation: 2,
    },
    medium: {
        offsetY: 4,
        radius: 8,
        opacity: 0.3,
        elevation: 5,
    },
    large: {
        offsetY: 8,
        radius: 16,
        opacity: 0.4,
        elevation: 10,
    },
};
