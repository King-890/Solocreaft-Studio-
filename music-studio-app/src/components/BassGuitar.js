import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const STRINGS = ['E', 'A', 'D', 'G'];
const FRETS = 12;

export default function BassGuitar() {
    const getNoteForFret = (string, fret) => {
        const notes = {
            'E': ['E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3'],
            'A': ['A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3'],
            'D': ['D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4'],
            'G': ['G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4'],
        };
        return notes[string][fret];
    };

    const handleFretPress = (string, fret) => {
        const note = getNoteForFret(string, fret);
        console.log(`Playing ${note}`);
        WebAudioEngine.playSound(note);
    };

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
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
                                    onPress={() => handleFretPress(string, fret)}
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
    );
}

const styles = StyleSheet.create({
    container: {
        height: 200,
        backgroundColor: '#2a1a10', // Wood-ish
        marginTop: 20,
    },
    fretboard: {
        paddingLeft: 20,
        paddingRight: 20,
        justifyContent: 'center',
        height: '100%',
    },
    stringRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
    },
    stringLabelContainer: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stringLabel: {
        color: '#d4af37',
        fontWeight: 'bold',
    },
    fret: {
        width: 60,
        height: '100%',
        borderRightWidth: 2,
        borderRightColor: '#888', // Fret wire
        justifyContent: 'center',
        alignItems: 'center',
    },
    stringLine: {
        width: '100%',
        backgroundColor: '#aaa',
    },
});
