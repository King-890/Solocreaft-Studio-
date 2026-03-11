import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * HapticService
 * Provides a unified interface for haptic feedback across the app.
 * Automatically handles platform differences and user settings.
 */
class HapticService {
    /**
     * Trigger a light impact (e.g., small key press, toggle)
     */
    static light() {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    /**
     * Trigger a medium impact (e.g., drum hit, main button)
     */
    static medium() {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }

    /**
     * Trigger a heavy impact (e.g., error, major action)
     */
    static heavy() {
        if (Platform.OS === 'web') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }

    /**
     * Success notification (e.g., recording saved)
     */
    static success() {
        if (Platform.OS === 'web') return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }

    /**
     * Selection feedback (e.g., scrolling carousel)
     */
    static selection() {
        if (Platform.OS === 'web') return;
        Haptics.selectionAsync().catch(() => {});
    }
}

export default HapticService;
