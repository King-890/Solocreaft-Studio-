import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { requestAudioPermissions } from '../utils/audioHelpers';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { saveFileToLocal } from '../utils/webStorage';

export default function AudioRecorder({ onRecordingSaved, tracks }) {
    const [duration, setDuration] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const recordingRef = useRef(null);
    const durationIntervalRef = useRef(null);

    const { user } = useAuth();
    const { addClip, addRecording } = useProject();

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    const startRecording = async () => {
        if (isRecording) return;

        try {
            const hasPermission = await requestAudioPermissions();
            if (!hasPermission) {
                alert('Microphone permission is required to record audio.');
                return;
            }

            console.log('Starting recording...');

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            recordingRef.current = recording;
            setIsRecording(true);
            setDuration(0);

            // Start timer
            durationIntervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1000);
            }, 1000);

            console.log('Recording started');
        } catch (error) {
            console.error('Failed to start recording:', error);
            alert(`Failed to start recording: ${error.message}`);
        }
    };

    const stopRecording = async () => {
        if (!isRecording || !recordingRef.current) return;

        try {
            setUploading(true);
            clearInterval(durationIntervalRef.current);

            console.log('Stopping recording...');
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();

            setIsRecording(false);
            recordingRef.current = null;

            if (!uri) {
                throw new Error('No URI returned from recording');
            }

            console.log('Recording stopped. URI:', uri);

            // Save locally
            const recordingId = `recording_${Date.now()}`;
            let savedUri = uri;

            if (Platform.OS === 'web') {
                savedUri = await saveFileToLocal(uri, recordingId);
            }

            // Add to library
            try {
                const savedRecording = await addRecording(savedUri, duration);
                console.log('✅ Recording saved:', savedRecording.name);

                // Add to timeline if vocals track exists
                const vocalsTrack = tracks?.find(t => t.name === 'Lead Vocals' || t.name === 'Vocals');
                if (vocalsTrack && duration > 0) {
                    addClip(vocalsTrack.id, savedRecording.uri, duration, recordingId);
                }

                if (onRecordingSaved) {
                    onRecordingSaved({ uri: savedUri, duration, recording: savedRecording });
                }
            } catch (dbError) {
                console.error('Database save failed:', dbError);
                alert('Recording saved locally but failed to add to library.');
            }

            setDuration(0);
        } catch (error) {
            console.error('Failed to stop recording:', error);
            alert(`Failed to save recording: ${error.message}`);
        } finally {
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
            setUploading(false);
            setIsRecording(false);
        }
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

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
