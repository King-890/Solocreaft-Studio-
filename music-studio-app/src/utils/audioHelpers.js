import { Audio } from 'expo-av';
import { Alert, Platform } from 'react-native';

// High-quality recording options
// Note: Web browsers typically don't support WAV via MediaRecorder
// Using WebM for web, WAV for native
export const RECORDING_OPTIONS_HIGH_QUALITY = Platform.select({
    web: {
        android: {
            extension: '.webm',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WEBM,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_OPUS,
            sampleRate: 48000,
            numberOfChannels: 2,
            bitRate: 128000,
        },
        ios: {
            extension: '.webm',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 48000,
            numberOfChannels: 2,
            bitRate: 128000,
        },
    },
    default: {
        android: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
        },
        ios: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
        },
    },
});

export const requestAudioPermissions = async () => {
    try {
        const { status } = await Audio.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.error('Error requesting audio permissions:', error);
        return false;
    }
};
