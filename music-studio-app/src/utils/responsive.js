import { Dimensions, Platform, PixelRatio } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Based on iPhone 13 scale (390px width)
const scale = SCREEN_WIDTH / 390;

/**
 * Normalize size for fonts and icons
 * Scales based on screen width and pixel density
 */
export function normalize(size) {
    const newSize = size * scale;

    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
}

/**
 * Custom hook for responsive design
 */
export function useResponsive() {
    const isPhone = SCREEN_WIDTH < 768;
    const isTablet = SCREEN_WIDTH >= 768;
    const isSmallDevice = SCREEN_WIDTH < 375;

    return {
        wp,              // Width percentage
        hp,              // Height percentage
        normalize,       // For fonts and icons
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        isPhone,
        isTablet,
        isSmallDevice,
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

/**
 * Platform-specific responsive adjustments
 */
export function usePlatformResponsive() {
    const responsive = useResponsive();

    // Platform-specific adjustments
    const platformAdjust = (value, platformModifier = 1) => {
        if (Platform.OS === 'ios') {
            return value * platformModifier;
        }
        return value;
    };

    // Responsive with platform awareness
    const rwp = (percentage) => platformAdjust(wp(percentage));
    const rhp = (percentage) => platformAdjust(hp(percentage));

    return {
        ...responsive,
        wp: rwp,
        hp: rhp,
    };
}

export default {
    wp,
    hp,
    normalize,
    useResponsive,
    usePlatformResponsive,
    getResponsiveColumns,
};
