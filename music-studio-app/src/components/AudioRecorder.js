import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import { RECORDING_OPTIONS_HIGH_QUALITY, requestAudioPermissions } from '../utils/audioHelpers';
import { supabase, uploadAudioFile } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';

export default function AudioRecorder({ onRecordingSaved, tracks }) {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [metering, setMetering] = useState(-160); // Initial low value
    const [uploading, setUploading] = useState(false);
    const { user } = useAuth();
    const { addClip, addRecording } = useProject();

    useEffect(() => {
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, []);

    const startRecording = async () => {
        const hasPermission = await requestAudioPermissions();
        if (!hasPermission) return;

        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                RECORDING_OPTIONS_HIGH_QUALITY,
                (status) => {
                    setDuration(status.durationMillis);
                    if (status.metering) {
                        setMetering(status.metering);
                    }
                },
                100 // Update interval
            );

            setRecording(recording);
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            console.log('Recording stopped. URI:', uri, 'Duration:', duration);
            console.log('Available tracks:', tracks);

            // Add clip to timeline immediately (for local playback)
            const vocalsTrack = tracks?.find(t => t.name === 'Vocals');
            console.log('Found Vocals track:', vocalsTrack);

            if (vocalsTrack && uri && duration > 0) {
                console.log('Adding clip to timeline...');
                addClip(vocalsTrack.id, uri, duration);

                // Also add to recordings library
                addRecording(uri, duration);
            } else {
                console.warn('Cannot add clip:', { vocalsTrack, uri, duration });
            }

            // Auto-upload logic (optional, for cloud storage)
            if (user && uri) {
                setUploading(true);
                const projectId = 'temp-project';
                const { data, error } = await uploadAudioFile(uri, user.id, projectId);
                setUploading(false);

                if (error) {
                    console.error('Upload failed:', error);
                }

                if (onRecordingSaved) {
                    onRecordingSaved({ uri, duration, ...data });
                }
            }
        } catch (error) {
            console.error('Failed to stop recording', error);
            setUploading(false);
        }
    };

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Simple visualizer based on metering (dB)
    // Metering range is typically -160 to 0
    const visualizerHeight = Math.max(0, (metering + 160) / 160) * 100;

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
                {isRecording ? 'Recording...' : uploading ? 'Saving...' : 'Ready'}
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
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#ccc',
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
        marginTop: 10,
        fontSize: 12,
    },
});
