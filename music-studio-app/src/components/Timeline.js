import React from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import TrackList from './TrackList';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PIXELS_PER_SECOND = 50;

export default function Timeline() {
    const { isPlaying, currentTime, togglePlayback, stopPlayback, clips } = useProject();

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={togglePlayback}>
                    <Text style={styles.controlText}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={stopPlayback}>
                    <Text style={styles.controlText}>STOP</Text>
                </TouchableOpacity>
                <Text style={styles.timeDisplay}>{formatTime(currentTime)}</Text>
            </View>

            <View style={styles.timelineArea}>
                <TrackList />

                {/* Empty state message */}
                {clips.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No recordings yet</Text>
                        <Text style={styles.emptySubtext}>
                            Switch to Recorder tab to record audio
                        </Text>
                    </View>
                )}

                {/* Playhead Overlay */}
                <View
                    style={[
                        styles.playhead,
                        { left: (currentTime / 1000) * PIXELS_PER_SECOND + 100 } // Offset for track headers
                    ]}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    controlButton: {
        backgroundColor: '#444',
        padding: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    controlText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    timeDisplay: {
        color: '#03dac6',
        fontFamily: 'monospace',
        fontSize: 16,
        marginLeft: 'auto',
    },
    timelineArea: {
        flex: 1,
        position: 'relative',
    },
    playhead: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: 'red',
        zIndex: 10,
    },
    emptyState: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#666',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#444',
        fontSize: 14,
    },
});
