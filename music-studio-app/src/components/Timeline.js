import React, { useRef, useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Alert, Platform, Animated } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import Track from './Track';

const PIXELS_PER_SECOND = 50;
const TRACK_HEADER_WIDTH = 150;

// Performance-optimized Playhead component
const Playhead = memo(({ pixelsPerSecond, headerWidth }) => {
    const { timeAnimatedValue } = useProject();
    
    const playheadTranslateX = timeAnimatedValue.interpolate({
        inputRange: [0, 1000],
        outputRange: [0, pixelsPerSecond],
        extrapolate: 'extend'
    });
    
    return (
        <Animated.View
            style={[
                styles.playhead,
                {
                    left: headerWidth,
                    transform: [{ translateX: playheadTranslateX }],
                    pointerEvents: 'none',
                }
            ]}
        >
            <View style={styles.playheadHead} />
            <View style={styles.playheadLine} />
        </Animated.View>
    );
});

export default function Timeline() {
    const {
        tracks,
        clips,
        isPlaying,
        currentTime,
        togglePlayback,
        stopPlayback,
        tempo,
        zoomLevel,
        setZoomLevel,
        getProjectDuration,
        loopRegion,
        toggleLoopRegion,
        addTrack,
    } = useProject();

    const rulerScrollRef = useRef(null);
    const trackScrollRefs = useRef([]);
    const isScrolling = useRef(false);
    
    // PERFORMANCE: Use Animated.Value for scroll to avoid re-rendering entire timeline
    const scrollX = useRef(new Animated.Value(0)).current;

    const projectDuration = getProjectDuration();
    const pixelsPerSecond = PIXELS_PER_SECOND * zoomLevel;
    const timelineWidth = Math.max((projectDuration / 1000) * pixelsPerSecond, 3000);

    const formatTime = (millis) => {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleZoomIn = () => {
        const newZoom = Math.min(zoomLevel * 1.5, 4);
        if (isFinite(newZoom)) {
            setZoomLevel(newZoom);
        }
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoomLevel / 1.5, 0.5);
        if (isFinite(newZoom)) {
            setZoomLevel(newZoom);
        }
    };

    // Synchronize all track scrolls with ruler scroll
    const handleScroll = (event) => {
        // PERFORMANCE: Prevent recursive scroll events
        if (isScrolling.current) return;
        isScrolling.current = true;

        const newScrollX = event.nativeEvent.contentOffset.x;
        
        // Update animated value for playhead
        scrollX.setValue(newScrollX);

        // Sync ruler
        if (rulerScrollRef.current) {
            rulerScrollRef.current.scrollTo({ x: newScrollX, animated: false });
        }

        // Sync all tracks
        trackScrollRefs.current.forEach(ref => {
            if (ref && ref.scrollTo) {
                ref.scrollTo({ x: newScrollX, animated: false });
            }
        });

        // Reset guard after short delay or next frame
        if (Platform.OS === 'web') {
            window.requestAnimationFrame(() => {
                isScrolling.current = false;
            });
        } else {
            setTimeout(() => {
                isScrolling.current = false;
            }, 10);
        }
    };

    return (
        <View style={styles.container}>
            {/* Controls Bar */}
            <View style={styles.controls}>
                <View style={styles.controlsLeft}>
                    <TouchableOpacity style={styles.controlButton} onPress={togglePlayback}>
                        <Text style={styles.controlText}>{isPlaying ? '⏸' : '▶'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlButton} onPress={stopPlayback}>
                        <Text style={styles.controlText}>⏹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.controlButton, loopRegion?.enabled && styles.activeButton]}
                        onPress={toggleLoopRegion}
                    >
                        <Text style={styles.controlText}>🔁</Text>
                    </TouchableOpacity>
                    <Text style={styles.timeDisplay}>{formatTime(currentTime)}</Text>
                </View>

                <View style={styles.controlsRight}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            addTrack('audio');
                            // Simple feedback
                            if (Platform.OS === 'web') {
                                console.log('Vocal track added');
                            } else {
                                Alert.alert('Success', 'Vocal track added');
                            }
                        }}
                    >
                        <Text style={styles.actionButtonText}>+ Vocal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            addTrack('midi');
                            if (Platform.OS === 'web') {
                                console.log('Instrument track added');
                            } else {
                                Alert.alert('Success', 'Instrument track added');
                            }
                        }}
                    >
                        <Text style={styles.actionButtonText}>+ Inst</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Timeline Area */}
            <View style={styles.timelineArea}>
                {/* Time Ruler */}
                <View style={styles.rulerContainer}>
                    <View style={[styles.rulerSpacer, { width: TRACK_HEADER_WIDTH }]} />
                    <ScrollView
                        ref={rulerScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                        style={styles.rulerScroll}
                    >
                        <View style={[styles.ruler, { width: timelineWidth }]}>
                            {Array.from({ length: Math.ceil(timelineWidth / (pixelsPerSecond * 5)) }).map((_, i) => {
                                const seconds = i * 5;
                                return (
                                    <View key={i} style={[styles.rulerMark, { left: seconds * pixelsPerSecond }]}>
                                        <Text style={styles.rulerText}>{formatTime(seconds * 1000)}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                </View>

                {/* Tracks Container */}
                <ScrollView
                    style={styles.tracksScrollView}
                    contentContainerStyle={{ flexGrow: 1 }}
                >
                    {tracks && tracks.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>No tracks yet</Text>
                            <Text style={styles.emptySubtext}>
                                Record audio or add instruments to get started
                            </Text>
                        </View>
                    ) : (
                        tracks && tracks.map((track, index) => (
                            <Track
                                key={track.id}
                                track={track}
                                clips={clips ? clips.filter(c => c.trackId === track.id) : []}
                                zoomLevel={zoomLevel}
                                pixelsPerSecond={pixelsPerSecond}
                                timelineWidth={timelineWidth}
                                headerWidth={TRACK_HEADER_WIDTH}
                                scrollRef={(ref) => trackScrollRefs.current[index] = ref}
                                onScroll={handleScroll}
                            />
                        ))
                    )}
                </ScrollView>

                {/* Playhead Overlay */}
                <Playhead 
                    pixelsPerSecond={pixelsPerSecond}
                    headerWidth={TRACK_HEADER_WIDTH}
                />

                {/* Empty state for clips */}
                {clips && clips.length === 0 && tracks && tracks.length > 0 && (
                    <View style={styles.emptyClipsState}>
                        <Text style={styles.emptyText}>No recordings yet</Text>
                        <Text style={styles.emptySubtext}>
                            Switch to Recorder tab to record audio
                        </Text>
                    </View>
                )}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    controlsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    controlButton: {
        backgroundColor: '#444',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: '#03dac6',
    },
    controlText: {
        color: '#fff',
        fontSize: 18,
    },
    timeDisplay: {
        color: '#03dac6',
        fontFamily: 'monospace',
        fontSize: 16,
        marginLeft: 8,
        minWidth: 60,
    },
    actionButton: {
        backgroundColor: '#6200ee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginLeft: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    timelineArea: {
        flex: 1,
        position: 'relative',
    },
    rulerContainer: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: '#2a2a2a',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    rulerSpacer: {
        backgroundColor: '#2a2a2a',
        borderRightWidth: 1,
        borderRightColor: '#333',
    },
    rulerScroll: {
        flex: 1,
    },
    ruler: {
        height: 30,
        position: 'relative',
    },
    rulerMark: {
        position: 'absolute',
        top: 0,
        height: '100%',
        paddingLeft: 4,
        justifyContent: 'center',
    },
    rulerText: {
        color: '#888',
        fontSize: 10,
        fontFamily: 'monospace',
    },
    tracksScrollView: {
        flex: 1,
    },
    playhead: {
        position: 'absolute',
        top: 30,
        bottom: 0,
        zIndex: 1000,
    },
    playheadHead: {
        width: 12,
        height: 12,
        backgroundColor: '#ff0000',
        borderRadius: 6,
        marginLeft: -6,
        marginTop: -6,
    },
    playheadLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#ff0000',
        marginLeft: -1,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyClipsState: {
        position: 'absolute',
        top: '50%',
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
