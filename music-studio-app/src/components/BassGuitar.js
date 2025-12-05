import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';
import { createShadow } from '../utils/shadows';

const STRINGS = ['E', 'A', 'D', 'G'];
const FRETS = 12;

// Note mappings defined outside component to prevent recreation
const NOTE_MAP = {
    'E': ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3'],
    'A': ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3'],
    'D': ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4'],
    'G': ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'],
};

export default function BassGuitar() {
    const { width } = useWindowDimensions();
    useInstrumentMixer('bass');

    const getNoteForFret = useCallback((string, fret) => {
        return NOTE_MAP[string][fret];
    }, []);

    const handleFretPress = useCallback((string, fret) => {
        const note = getNoteForFret(string, fret);
        // Defer logging to prevent blocking
        requestAnimationFrame(() => {
            console.log(`Playing ${note}`);
        });
        UnifiedAudioEngine.playSound(note, 'bass');
    }, [getNoteForFret]);

    const handleFretRelease = useCallback((string, fret) => {
        const note = getNoteForFret(string, fret);
        UnifiedAudioEngine.stopSound(note, 'bass');
    }, [getNoteForFret]);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <Text style={styles.title}>Bass Guitar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.horizontalScroll}>
                    <View style={styles.fretboard}>
                        {STRINGS.map((string, sIndex) => (
                            <View key={string} style={styles.stringRow}>
                                <View style={styles.stringLabelContainer}>
                                    <Text style={styles.stringLabel}>{string}</Text>
                                </View>
                                {Array.from({ length: FRETS }).map((_, fret) => (
                                    <TouchableOpacity
                                        key={`${string}-${fret}`}
                                        style={styles.fret}
                                        onPressIn={() => handleFretPress(string, fret)}
                                        onPressOut={() => handleFretRelease(string, fret)}
                                        delayPressIn={0}
                                        delayPressOut={0}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.stringLine, { height: sIndex + 1 }]} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    horizontalScroll: {
        flexGrow: 0,
    },
    fretboard: {
        backgroundColor: '#2a1a10', // Wood-ish
        paddingLeft: 20,
        paddingRight: 20,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3e2723',
    },
    stringRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
    },
    stringLabelContainer: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        height: '100%',
        marginRight: 5,
        borderRadius: 4,
    },
    stringLabel: {
        color: '#d4af37',
        fontWeight: 'bold',
        fontSize: 16,
    },
    fret: {
        width: 70,
        height: '100%',
        borderRightWidth: 2,
        borderRightColor: '#888', // Fret wire
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    stringLine: {
        width: '100%',
        backgroundColor: '#aaa',
        ...createShadow({ offsetY: 1, opacity: 0.5, radius: 1, elevation: 1 }),
    },
});
