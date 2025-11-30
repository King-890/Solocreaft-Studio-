import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import AudioClip from './AudioClip';
import TimelineGrid from './TimelineGrid';

// Track color palette
const TRACK_COLORS = {
    'Lead Vocals': '#4A90E2',
    'Vocals': '#4A90E2',
    'Backing Vocals': '#5BA3F5',
    'Drums': '#7ED321',
    'Piano': '#50E3C2',
    'Bass Guitar': '#BD10E0',
    'Electric Guitar': '#F5A623',
    'Synth Pad': '#F8E71C',
    'Strings': '#9B59B6',
    'default': '#9B9B9B',
};

export default function Track({ track, zoomLevel, pixelsPerSecond, timelineWidth, headerWidth, scrollRef, onScroll }) {
    const { updateTrackMute, updateTrackSolo, updateTrackVolume, clips, tempo, getProjectDuration } = useProject();

    // Get clips for this track
    const trackClips = clips ? clips.filter(c => c.trackId === track.id) : [];

    // Get track color
    const trackColor = TRACK_COLORS[track.name] || TRACK_COLORS.default;

    const handleMuteToggle = () => {
        updateTrackMute(track.id, !track.muted);
    };

    const handleSoloToggle = () => {
        updateTrackSolo(track.id, !track.solo);
    };

    const handleVolumeChange = (delta) => {
        const newVolume = Math.max(0, Math.min(1, track.volume + delta));
        updateTrackVolume(track.id, newVolume);
    };

    const projectDuration = getProjectDuration();

    return (
        <View style={styles.container}>
            {/* Track Header */}
            <View style={[styles.header, { width: headerWidth, backgroundColor: trackColor + '20' }]}>
                <View style={styles.headerTop}>
                    <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                    <View style={[styles.colorIndicator, { backgroundColor: trackColor }]} />
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.button, track.muted && styles.activeMute]}
                        onPress={handleMuteToggle}
                    >
                        <Text style={styles.buttonText}>M</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, track.solo && styles.activeSolo]}
                        onPress={handleSoloToggle}
                    >
                        <Text style={styles.buttonText}>S</Text>
                    </TouchableOpacity>
                </View>

                {/* Volume Control */}
                <View style={styles.volumeControl}>
                    <TouchableOpacity
                        style={styles.volumeButton}
                        onPress={() => handleVolumeChange(-0.1)}
                    >
                        <Text style={styles.volumeButtonText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.volumeBar}>
                        <View
                            style={[
                                styles.volumeFill,
                                {
                                    width: `${track.volume * 100}%`,
                                    backgroundColor: trackColor,
                                }
                            ]}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.volumeButton}
                        onPress={() => handleVolumeChange(0.1)}
                    >
                        <Text style={styles.volumeButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Track Lane (Timeline) */}
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                style={styles.laneScrollView}
            >
                <View style={[styles.lane, { width: timelineWidth }]}>
                    {/* Grid Background */}
                    {tempo && zoomLevel && projectDuration ? (
                        <TimelineGrid
                            tempo={tempo}
                            zoomLevel={zoomLevel}
                            duration={projectDuration}
                        />
                    ) : null}

                    {/* Clips */}
                    {trackClips.map((clip) => (
                        <AudioClip
                            key={clip.id}
                            clip={clip}
                            pixelsPerSecond={pixelsPerSecond}
                            trackColor={trackColor}
                        />
                    ))}

                    {/* Drop zone indicator */}
                    {trackClips.length === 0 && (
                        <View style={styles.emptyLane}>
                            <Text style={styles.emptyLaneText}>Drop clips here or record audio</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 100,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    header: {
        padding: 8,
        borderRightWidth: 1,
        borderRightColor: '#333',
        justifyContent: 'space-between',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    trackName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        flex: 1,
    },
    colorIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 4,
    },
    controls: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 8,
    },
    button: {
        width: 24,
        height: 24,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
    activeMute: {
        backgroundColor: '#cf6679',
    },
    activeSolo: {
        backgroundColor: '#f1c40f',
    },
    buttonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    volumeControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    volumeButton: {
        width: 20,
        height: 20,
        backgroundColor: '#444',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    volumeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    volumeBar: {
        flex: 1,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    volumeFill: {
        height: '100%',
        borderRadius: 3,
    },
    laneScrollView: {
        flex: 1,
    },
    lane: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        position: 'relative',
        minHeight: 100,
    },
    emptyLane: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.3,
    },
    emptyLaneText: {
        color: '#666',
        fontSize: 11,
        fontStyle: 'italic',
    },
});
