import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useProject } from '../contexts/ProjectContext';

const PIXELS_PER_SECOND = 50;

export default function AudioClip({ clip }) {
    const { currentTime } = useProject();

    const left = (clip.startTime / 1000) * PIXELS_PER_SECOND;
    const width = (clip.duration / 1000) * PIXELS_PER_SECOND;

    // Highlight if playhead is over this clip
    const isPlaying = currentTime >= clip.startTime && currentTime <= (clip.startTime + clip.duration);

    return (
        <TouchableOpacity
            style={[
                styles.clip,
                { left, width },
                isPlaying && styles.clipPlaying
            ]}
            activeOpacity={0.8}
        >
            <Text style={styles.clipText} numberOfLines={1}>
                Recording
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    clip: {
        position: 'absolute',
        height: 60,
        backgroundColor: '#03dac6',
        borderRadius: 4,
        justifyContent: 'center',
        paddingHorizontal: 8,
        top: 10,
        borderWidth: 1,
        borderColor: '#05f5db',
    },
    clipPlaying: {
        backgroundColor: '#05f5db',
        borderColor: '#fff',
    },
    clipText: {
        color: '#000',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
