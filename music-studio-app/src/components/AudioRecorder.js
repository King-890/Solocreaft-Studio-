import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useAudioRecorder } from 'expo-audio';
import { requestAudioPermissions } from '../utils/audioHelpers';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { supabase } from '../services/supabase';
import { saveFileToLocal } from '../utils/webStorage';

export default function AudioRecorder({ onRecordingSaved, tracks }) {
    const [duration, setDuration] = useState(0);
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const { addClip, addRecording } = useProject();

    const [localIsRecording, setLocalIsRecording] = useState(false);
    const [starting, setStarting] = useState(false);

    // useAudioRecorder hook handles the recording state and logic
    const audioRecorder = useAudioRecorder({
        onStatusUpdate: (status) => {
            setDuration(status.durationMillis);
        }
    });

    // Use local state for Web reliability, fallback to hook state for others
    const isRecording = Platform.OS === 'web' ? localIsRecording : audioRecorder.isRecording;

    // Timer effect for Web
    useEffect(() => {
        let interval;
        if (isRecording && Platform.OS === 'web') {
            interval = setInterval(() => {
                setDuration(prev => prev + 1000);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRecording]);

    // Cleanup effect on unmount
    useEffect(() => {
        return () => {
            if (audioRecorder.isRecording) {
                audioRecorder.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        if (starting || isRecording) return;

        try {
            setStarting(true);
            const hasPermission = await requestAudioPermissions();
            if (!hasPermission) {
                console.error('Audio permission denied');
                alert('Microphone permission is required to record audio. Please enable it in your device settings.');
                setStarting(false);
                return;
            }

            console.log('Starting recording...');
            await audioRecorder.prepareToRecordAsync({
                android: {
                    extension: '.wav',
                    outputFormat: 'mpeg_4',
                    audioEncoder: 'aac',
                },
                ios: {
                    extension: '.wav',
                    audioQuality: 'high',
                    sampleRate: 44100,
                    numberOfChannels: 2,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm', // Changed to webm for better browser support
                    bitsPerSecond: 128000,
                },
            });

            audioRecorder.record();
            setLocalIsRecording(true);
            setDuration(0);
            console.log('Recording started');
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert(`Failed to start recording: ${error.message || 'Unknown error'}`);
            setLocalIsRecording(false);
        } finally {
            setStarting(false);
        }
    };

    const stopRecording = async () => {
        if (starting) return;

        try {
            setUploading(true); // Start loading state
            await audioRecorder.stop();
            setLocalIsRecording(false);
            const localUri = audioRecorder.uri;

            if (!localUri) {
                console.error('Recording stopped but no URI returned');
                alert('Recording failed to save. Please try again.');
                setUploading(false);
                return;
            }

            console.log('Recording stopped. Local URI:', localUri, 'Duration:', duration);

            let finalUri = localUri;

            // Upload to Supabase if user is logged in
            // REVERTED: User requested local storage only for now
            /*
            if (user) {
                try {
                    // ... upload logic removed ...
                } catch (uploadError) {
                    console.error('Failed to upload recording:', uploadError);
                }
            }
            */

            // Use local URI directly
            console.log('Saving recording locally:', localUri);

            // Persist on Web
            let savedUri = finalUri;
            const recordingId = `recording_${Date.now()}`; // Generate ID here

            if (Platform.OS === 'web') {
                savedUri = await saveFileToLocal(finalUri, recordingId);
                console.log('Web persistent URI:', savedUri);
            }

            // Add to recordings library (auto-save)
            // Pass the ID so we can rehydrate it later
            const savedRecording = addRecording(savedUri, duration, recordingId);
            console.log('✅ Recording auto-saved to library:', savedRecording.name);

            // Also add clip to timeline if vocals track exists
            const vocalsTrack = tracks?.find(t => t.name === 'Lead Vocals' || t.name === 'Vocals');
            if (vocalsTrack && finalUri && duration > 0) {
                addClip(vocalsTrack.id, savedUri, duration, recordingId);
                console.log('✅ Clip added to timeline');
            }

            // Show success feedback
            if (onRecordingSaved) {
                onRecordingSaved({ uri: finalUri, duration, recording: savedRecording });
            }

            // Reset duration
            setDuration(0);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            alert(`Failed to save recording: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
            setLocalIsRecording(false);
        }
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Simple visualizer based on recording state
    const visualizerHeight = isRecording ? 50 : 0;

    return (
        <View style={styles.container}>
            <View style={styles.visualizerContainer}>
                <View style={[styles.visualizerBar, { height: `${visualizerHeight}%` }]} />
            </View>

            <Text style={styles.timer}>{formatTime(duration)}</Text>

            <View style={styles.controls}>
                {uploading ? (
                    <ActivityIndicator size="large" color="#03dac6" />
                ) : (
                    <TouchableOpacity
                        style={[styles.recordButton, isRecording && styles.recordingButton]}
                        onPress={isRecording ? stopRecording : startRecording}
                    >
                        <View style={isRecording ? styles.stopIcon : styles.recordIcon} />
                    </TouchableOpacity>
                )}
            </View>
            <Text style={styles.statusText}>
                {isRecording ? 'Recording...' : uploading ? 'Saving...' : 'Tap to record'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
    },
    visualizerContainer: {
        height: 100,
        width: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        justifyContent: 'flex-end',
        marginBottom: 20,
        overflow: 'hidden',
    },
    visualizerBar: {
        backgroundColor: '#03dac6',
        width: '100%',
    },
    timer: {
        color: '#fff',
        fontSize: 24,
        fontFamily: 'monospace',
        marginBottom: 20,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#e0e0e0',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
        elevation: 8,
    },
    recordingButton: {
        borderColor: '#ff0000',
    },
    recordIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff0000',
    },
    stopIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#ff0000',
    },
    statusText: {
        color: '#888',
        marginTop: 15,
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
    },
});
