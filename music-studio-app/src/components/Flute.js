import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';
import { createShadow } from '../utils/shadows';

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

export default function Flute() {
    const { height } = useWindowDimensions();
    useInstrumentMixer('flute');

    const handleNotePress = useCallback((note) => {
        // Defer logging to prevent blocking
        requestAnimationFrame(() => {
            console.log(`Flute note ${note} played`);
        });
        UnifiedAudioEngine.playSound(note, 'flute');
    }, []);

    const handleNoteRelease = useCallback((note) => {
        UnifiedAudioEngine.stopSound(note, 'flute');
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={[styles.container, { minHeight: height - 150 }]}>
                <Text style={styles.title}>Flute</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.keysScroll}>
                    <View style={styles.keysContainer}>
                        {NOTES.map((note, index) => (
                            <TouchableOpacity
                                key={note}
                                style={styles.key}
                                onPressIn={() => handleNotePress(note)}
                                onPressOut={() => handleNoteRelease(note)}
                                delayPressIn={0}
                                activeOpacity={0.7}
                            >
                                <View style={styles.hole} />
                                <Text style={styles.keyText}>{note}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <Text style={styles.instruction}>Tap keys to play notes</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    keysScroll: {
        flexGrow: 0,
    },
    keysContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    key: {
        width: 60,
        height: 200,
        backgroundColor: '#C0C0C0', // Silver
        borderRadius: 30,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        borderWidth: 2,
        borderColor: '#A9A9A9',
        ...createShadow({ offsetY: 2, opacity: 0.3, radius: 3, elevation: 5 }),
    },
    hole: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#333',
        borderWidth: 2,
        borderColor: '#666',
        ...createShadow({ offsetY: 1, opacity: 0.8, radius: 2, elevation: 2 }),
    },
    keyText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    instruction: {
        color: '#888',
        fontSize: 14,
        marginTop: 20,
    },
});
