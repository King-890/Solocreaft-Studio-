import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as Audio from 'expo-audio';
import { requestAudioPermissions } from '../utils/audioHelpers';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { saveFileToLocal } from '../utils/webStorage';
import MetronomeService from '../services/MetronomeService';

export default function AudioRecorder({ onRecordingSaved, tracks }) {
    const [duration, setDuration] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isCountingIn, setIsCountingIn] = useState(false);
    const [countInRemaining, setCountInRemaining] = useState(0);
    
    // In SDK 54, we use the useAudioRecorder hook
    const recorder = Audio.useAudioRecorder({
        extension: '.m4a',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    });

    const durationIntervalRef = useRef(null);

    const { user } = useAuth();
    const { addClip, addRecording } = useProject();

    // Sync recorder status to local state for UI
    useEffect(() => {
        setIsRecording(recorder.isRecording);
        setIsPaused(recorder.isPaused);
    }, [recorder.isRecording, recorder.isPaused]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recorder.isRecording) {
                recorder.stop();
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, [recorder]);

    const startRecording = async () => {
        if (recorder.isRecording) return;

        try {
            const hasPermission = await requestAudioPermissions();
            if (!hasPermission) {
                alert('Microphone permission is required to record audio.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: true,
            });

            console.log('Starting count-in...');
            setIsCountingIn(true);
            setCountInRemaining(4);

            const tempo = 120; // Default tempo
            MetronomeService.start(tempo, (beat) => {
                setCountInRemaining(prev => Math.max(0, 4 - beat));
            }, true, async () => {
                // Count-in complete, start recording
                setIsCountingIn(false);
                await recorder.prepare();
                recorder.record();
                
                setDuration(0);

                // Start timer
                durationIntervalRef.current = setInterval(() => {
                    setDuration(prev => prev + 1000);
                }, 1000);

                console.log('Recording started after count-in');
            });

        } catch (error) {
            console.error('Failed to start recording flow:', error);
            alert(`Failed: ${error.message}`);
            setIsCountingIn(false);
        }
    };

    const startRecordingDirect = async () => {
        try {
            const hasPermission = await requestAudioPermissions();
            if (!hasPermission) return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                staysActiveInBackground: true,
            });

            await recorder.prepare();
            recorder.record();
            setDuration(0);
            durationIntervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1000);
            }, 1000);
        } catch (error) {
            console.error('Direct recording failed:', error);
        }
    };

    const pauseRecording = async () => {
        if (!recorder.isRecording || recorder.isPaused) return;
        try {
            recorder.pause();
            clearInterval(durationIntervalRef.current);
        } catch (error) {
            console.error('Failed to pause recording:', error);
        }
    };

    const resumeRecording = async () => {
        if (!recorder.isRecording || !recorder.isPaused) return;
        try {
            recorder.record();
            durationIntervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1000);
            }, 1000);
        } catch (error) {
            console.error('Failed to resume recording:', error);
        }
    };

    const stopRecording = async () => {
        if (!recorder.isRecording) return;

        try {
            setUploading(true);
            clearInterval(durationIntervalRef.current);

            console.log('Stopping recording...');
            await recorder.stop();
            const uri = recorder.uri;

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

            // Add to library with source metadata
            try {
                const savedRecording = await addRecording(savedUri, duration, 'voice', null);
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
                ) : !isRecording ? (
                    <View style={styles.recordOptions}>
                        <TouchableOpacity
                            style={styles.recordButton}
                            onPress={startRecordingDirect}
                        >
                            <View style={styles.recordIcon} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.countInButton}
                            onPress={startRecording}
                            disabled={isCountingIn}
                        >
                            <Text style={styles.countInText}>
                                {isCountingIn ? `Get Ready: ${countInRemaining}` : 'Record with Count-in'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.recordingControls}>
                        {isPaused ? (
                            <TouchableOpacity
                                style={[styles.controlButton, styles.resumeButton]}
                                onPress={resumeRecording}
                            >
                                <Text style={styles.controlIcon}>▶</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.controlButton, styles.pauseButton]}
                                onPress={pauseRecording}
                            >
                                <Text style={styles.controlIcon}>⏸</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[styles.controlButton, styles.stopButton]}
                            onPress={stopRecording}
                        >
                            <View style={styles.stopIcon} />
                        </TouchableOpacity>
                    </View>
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
    recordIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff4444',
    },
    recordOptions: {
        alignItems: 'center',
    },
    countInButton: {
        marginTop: 15,
        backgroundColor: 'rgba(3, 218, 198, 0.1)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#03dac6',
    },
    countInText: {
        color: '#03dac6',
        fontSize: 14,
        fontWeight: 'bold',
    },
    recordingControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 160,
        alignItems: 'center',
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    pauseButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#fbbf24',
    },
    resumeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#34d399',
    },
    stopButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#ff4444',
    },
    controlIcon: {
        fontSize: 24,
        color: '#fff',
    },
    stopIcon: {
        width: 20,
        height: 20,
        backgroundColor: '#ff4444',
        borderRadius: 4,
    },
    statusText: {
        color: '#888',
        marginTop: 15,
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
    },
});

