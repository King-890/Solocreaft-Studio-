import { AudioModule } from 'expo-audio';
import { Platform } from 'react-native';

// expo-audio uses presets, so we don't need complex configuration objects anymore.
// We'll keep this for backward compatibility if needed, but AudioRecorder should use presets.
export const RECORDING_OPTIONS_HIGH_QUALITY = 'HighQuality';

export const requestAudioPermissions = async () => {
    try {
        if (Platform.OS === 'web') {
            // Web uses browser permissions
            return true;
        }
        const status = await AudioModule.requestRecordingPermissionsAsync();
        return status.granted;
    } catch (error) {
        console.error('Error requesting audio permissions:', error);
        return false;
    }
};
