import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useProject } from '../contexts/ProjectContext';

export default function AudioClip({ clip, pixelsPerSecond, trackColor }) {
    const { selectedClipId, setSelectedClipId, deleteClip } = useProject();

    const isSelected = selectedClipId === clip.id;
    const clipWidth = Math.max(0, (clip.duration / 1000) * pixelsPerSecond) || 0;
    const clipLeft = Math.max(0, (clip.startTime / 1000) * pixelsPerSecond) || 0;

    const handlePress = () => {
        setSelectedClipId(clip.id);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Clip',
            'Are you sure you want to delete this clip?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteClip(clip.id) }
            ]
        );
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    left: clipLeft,
                    width: clipWidth,
                    backgroundColor: trackColor || '#6200ee',
                    borderColor: isSelected ? '#03dac6' : 'transparent',
                }
            ]}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            {/* Clip Content */}
            <View style={styles.content}>
                <Text style={styles.clipName} numberOfLines={1}>
                    {clip.type === 'audio' ? '🎤' : '🎵'} Clip
                </Text>

                {/* Waveform placeholder */}
                <View style={styles.waveform}>
                    {clipWidth > 0 && Array.from({ length: Math.min(Math.floor(clipWidth / 4), 50) }).map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.waveformBar,
                                { height: `${20 + Math.random() * 60}%` }
                            ]}
                        />
                    ))}
                </View>
            </View>

            {/* Selection Border */}
            {isSelected && (
                <>
                    <View style={styles.selectionBorder} />
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <Text style={styles.deleteButtonText}>×</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Trim Handles (for future implementation) */}
            {isSelected && (
                <>
                    <View style={[styles.trimHandle, styles.trimHandleLeft]} />
                    <View style={[styles.trimHandle, styles.trimHandleRight]} />
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 10,
        height: 80,
        borderRadius: 6,
        borderWidth: 2,
        overflow: 'hidden',
        opacity: 0.9,
    },
    content: {
        flex: 1,
        padding: 6,
    },
    clipName: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    waveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    waveformBar: {
        width: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 1,
    },
    selectionBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: '#03dac6',
        borderRadius: 6,
        pointerEvents: 'none',
    },
    deleteButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        width: 24,
        height: 24,
        backgroundColor: '#cf6679',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1a1a1a',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: -2,
    },
    trimHandle: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 8,
        backgroundColor: '#03dac6',
        opacity: 0.8,
    },
    trimHandleLeft: {
        left: 0,
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
    },
    trimHandleRight: {
        right: 0,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
    },
});
