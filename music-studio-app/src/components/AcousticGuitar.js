import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';

const CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];

export default function AcousticGuitar({ instrument = 'guitar' }) {
    const handleChordPress = (chord) => {
        console.log(`Playing ${chord} chord (${instrument})`);
        // Play root note of chord
        const rootNote = chord.replace('m', '').replace('7', '') + '3';
        UnifiedAudioEngine.playSound(rootNote, instrument);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Acoustic Guitar</Text>
            <View style={styles.chordGrid}>
                {CHORDS.map((chord) => (
                    <TouchableOpacity
                        key={chord}
                        style={styles.chordButton}
                        onPressIn={() => handleChordPress(chord)}
                        onPressOut={() => {
                            const rootNote = chord.replace('m', '').replace('7', '') + '3';
                            UnifiedAudioEngine.stopSound(rootNote, instrument);
                        }}
                    >
                        <Text style={styles.chordText}>{chord}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.strumArea}>
                <Text style={styles.instruction}>Tap chord to strum</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 20,
    },
    chordGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    chordButton: {
        width: 80,
        height: 80,
        backgroundColor: '#5d4037',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8d6e63',
    },
    chordText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    strumArea: {
        marginTop: 30,
    },
    instruction: {
        color: '#888',
    },
});
