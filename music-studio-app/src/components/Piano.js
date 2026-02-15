import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';
import { createShadow } from '../utils/shadows';

const OCTAVES = 4; // Reduced for performance/demo
const START_OCTAVE = 3;
const WHITE_KEY_WIDTH = 50;

export default function Piano({ instrument = 'piano' }) {
    // Connect to mixer
    useInstrumentMixer(instrument);

    // Zoom state
    const [zoomLevel, setZoomLevel] = useState(1);
    const [pressedKeys, setPressedKeys] = useState(new Set());

    // Memoized handler to prevent recreation on every render
    const handleNotePress = useCallback((note) => {
        setPressedKeys(prev => new Set(prev).add(note));
        // Use requestAnimationFrame to defer non-critical work
        requestAnimationFrame(() => {
            console.log(`Playing ${note} (${instrument})`);
        });
        // Play sound immediately for responsiveness
        UnifiedAudioEngine.playSound(note, instrument);
    }, [instrument]);

    const handleNoteRelease = useCallback((note) => {
        setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(note);
            return newSet;
        });
        UnifiedAudioEngine.stopSound(note, instrument);
    }, [instrument]);

    // Memoize white keys rendering
    const whiteKeys = useMemo(() => {
        const keys = [];
        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        for (let i = 0; i < OCTAVES; i++) {
            const octave = START_OCTAVE + i;

            whiteNotes.forEach((note) => {
                const noteName = `${note}${octave}`;
                const isPressed = pressedKeys.has(noteName);
                keys.push(
                    <TouchableOpacity
                        key={noteName}
                        style={[styles.whiteKey, isPressed && styles.whiteKeyPressed]}
                        onPressIn={() => handleNotePress(noteName)}
                        onPressOut={() => handleNoteRelease(noteName)}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.keyLabel}>{note}{octave}</Text>
                    </TouchableOpacity>
                );
            });
        }
        return keys;
    }, [handleNotePress, handleNoteRelease, pressedKeys]);

    // Memoize black keys rendering
    const blackKeys = useMemo(() => {
        const keys = [];
        const blackNotes = [
            { note: 'C#', offset: 35 },
            { note: 'D#', offset: 85 },
            { note: 'F#', offset: 185 },
            { note: 'G#', offset: 235 },
            { note: 'A#', offset: 285 }
        ];

        for (let i = 0; i < OCTAVES; i++) {
            const octave = START_OCTAVE + i;
            const octaveOffset = i * 7 * WHITE_KEY_WIDTH;

            blackNotes.forEach(({ note, offset }) => {
                const noteName = `${note}${octave}`;
                const left = octaveOffset + offset;
                const isPressed = pressedKeys.has(noteName);

                keys.push(
                    <TouchableOpacity
                        key={noteName}
                        style={[styles.blackKey, { left }, isPressed && styles.blackKeyPressed]}
                        onPressIn={() => handleNotePress(noteName)}
                        onPressOut={() => handleNoteRelease(noteName)}
                        delayPressIn={0}
                        delayPressOut={0}
                        activeOpacity={0.9}
                    />
                );
            });
        }
        return keys;
    }, [handleNotePress, handleNoteRelease, pressedKeys]);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(0.5, prev - 0.25));
    }, []);

    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(2, prev + 0.25));
    }, []);

    return (
        <View style={styles.container}>
            {/* Zoom Controls */}
            <View style={styles.zoomControls}>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={handleZoomOut}
                >
                    <Text style={styles.zoomButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.zoomText}>{Math.round(zoomLevel * 100)}%</Text>
                <TouchableOpacity
                    style={styles.zoomButton}
                    onPress={handleZoomIn}
                >
                    <Text style={styles.zoomButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={[styles.scrollContent, { transform: [{ scale: zoomLevel }] }]}
                scrollEnabled={true}
                nestedScrollEnabled={true}
            >
                <View style={styles.keysContainer}>
                    {whiteKeys}
                    {blackKeys}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 280,
        backgroundColor: '#1a1a1a',
        marginTop: 20,
        borderRadius: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    zoomControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 8,
        backgroundColor: '#2a2a2a',
        borderRadius: 10,
    },
    zoomButton: {
        width: 40,
        height: 40,
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#4a4a4a',
    },
    zoomButtonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    zoomText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        minWidth: 60,
        textAlign: 'center',
    },
    scrollContent: {
        paddingHorizontal: 10,
    },
    keysContainer: {
        flexDirection: 'row',
        height: 200,
        position: 'relative',
    },
    whiteKey: {
        width: WHITE_KEY_WIDTH,
        height: 200,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 15,
        marginRight: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    blackKey: {
        width: 34,
        height: 130,
        backgroundColor: '#111',
        position: 'absolute',
        top: 0,
        zIndex: 10,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderWidth: 1,
        borderColor: '#333',
        ...createShadow({ offsetX: 2, offsetY: 4, opacity: 0.6, radius: 4, elevation: 5 }),
    },
    whiteKeyPressed: {
        backgroundColor: '#d0d0d0',
        transform: [{ scale: 0.98 }],
    },
    blackKeyPressed: {
        backgroundColor: '#333',
        transform: [{ scale: 0.95 }],
    },
    keyLabel: {
        color: '#888',
        fontSize: 10,
        fontWeight: '600',
    },
});
