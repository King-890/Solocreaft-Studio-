import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import AudioClip from './AudioClip';

export default function Track({ track }) {
    const { updateTrackVolume, clips } = useProject();

    // Get clips for this track
    const trackClips = clips.filter(c => c.trackId === track.id);

    return (
        <View style={styles.container}>
            {/* Track Header */}
            <View style={styles.header}>
                <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                <View style={styles.controls}>
                    <TouchableOpacity style={[styles.button, track.muted && styles.activeMute]}>
                        <Text style={styles.buttonText}>M</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, track.solo && styles.activeSolo]}>
                        <Text style={styles.buttonText}>S</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Track Lane (Timeline) */}
            <View style={styles.lane}>
                <View style={styles.gridLines} />
                {trackClips.map((clip) => (
                    <AudioClip key={clip.id} clip={clip} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 80,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    header: {
        width: 100,
        backgroundColor: '#2a2a2a',
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#333',
        justifyContent: 'space-between',
    },
    trackName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    controls: {
        flexDirection: 'row',
        gap: 5,
    },
    button: {
        width: 20,
        height: 20,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },
    activeMute: {
        backgroundColor: '#cf6679',
    },
    activeSolo: {
        backgroundColor: '#f1c40f',
    },
    buttonText: {
        color: '#fff',
        fontSize: 10,
    },
    lane: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        position: 'relative',
    },
    gridLines: {
        ...StyleSheet.absoluteFillObject,
        // TODO: Add grid background
    },
});
