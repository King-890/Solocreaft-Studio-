
import { Dimensions, Platform, PixelRatio, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

// Initial dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Update dimensions on change for non-hook callers
Dimensions.addEventListener('change', ({ window }) => {
    SCREEN_WIDTH = window.width;
    SCREEN_HEIGHT = window.height;
});

/**
 * Normalizes size based on screen width
 */
export const normalize = (size) => {
    const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
    const isPhone = SCREEN_WIDTH < 768;
    const BASE_DIM = isLandscape ? (isPhone ? 920 : 812) : 390;
    const scale = SCREEN_WIDTH / BASE_DIM;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Standard scaling relative to screen width
 */
export const sc = (size) => {
    const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
    const isPhone = SCREEN_WIDTH < 768;
    const BASE_DIM = isLandscape ? (isPhone ? 920 : 812) : 390;
    const scale = SCREEN_WIDTH / BASE_DIM;
    return size * scale;
};

/**
 * Scale relative to screen size but contained within screen bounds
 */
export function contain(size, percent = 0.8) {
    const isLandscape = SCREEN_WIDTH > SCREEN_HEIGHT;
    const isPhone = SCREEN_WIDTH < 768;
    const BASE_DIM = isLandscape ? (isPhone ? 920 : 812) : 390;
    const scale = SCREEN_WIDTH / BASE_DIM;
    
    const scaled = size * scale;
    const max = isLandscape ? SCREEN_HEIGHT * percent : SCREEN_WIDTH * percent;
    return Math.min(scaled, max);
}

// Safe Area Helpers (approximate if not wrapped in provider)
export const SAFE_TOP = Platform.OS === 'ios' ? 44 : 0;
export const SAFE_BOTTOM = Platform.OS === 'ios' ? 34 : 0;

/**
 * Custom hook for responsive design - ALWAYS PREFER THIS IN COMPONENTS
 */
export function useResponsive() {
    const { width, height } = useWindowDimensions();
    const insets = useSafeAreaInsets(); // Hook for accurate safe areas
    
    const isLandscape = width > height;
    const isPhone = width < 768;
    const isTablet = width >= 768;
    const isSmallDevice = width < 375;
    const isTallDevice = height / width > 2;

    const BASE_DIM = isLandscape ? (isPhone ? 920 : 812) : 390;
    const scale = width / BASE_DIM;

    const normalizeLocal = (size) => {
        const newSize = size * scale;
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    };

    const scLocal = (size) => size * scale;

    const containLocal = (size, percent = 0.8) => {
        const scaled = size * scale;
        const max = isLandscape ? height * percent : width * percent;
        return Math.min(scaled, max);
    };

    return {
        wp,              // Width percentage
        hp,              // Height percentage
        normalize: normalizeLocal,
        contain: containLocal,
        sc: scLocal,
        SCREEN_WIDTH: width,
        SCREEN_HEIGHT: height,
        isPhone,
        isTablet,
        isSmallDevice,
        isTallDevice,
        SAFE_TOP: insets.top,       // Dynamic safe area top
        SAFE_BOTTOM: insets.bottom, // Dynamic safe area bottom
        insets,                     // Expose full insets object if needed
        isLandscape,
    };
}

/**
 * Get responsive grid columns based on screen size
 */
export function getResponsiveColumns(small = 1, medium = 2, large = 3) {
    if (SCREEN_WIDTH < 375) return small;
    if (SCREEN_WIDTH < 768) return medium;
    return large;
}

export { SCREEN_WIDTH, SCREEN_HEIGHT };

export default {
    wp,
    hp,
    normalize,
    sc,
    contain,
    useResponsive,
    getResponsiveColumns,
    SCREEN_WIDTH,
    SCREEN_HEIGHT
};

