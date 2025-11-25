import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];

export default function AcousticGuitar() {
    const handleChordPress = (chord) => {
        console.log(`Playing ${chord} chord`);
        // Play root note of chord
        const rootNote = chord.replace('m', '').replace('7', '') + '3';
        WebAudioEngine.playSound(rootNote);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Acoustic Guitar</Text>
            <View style={styles.chordGrid}>
                {CHORDS.map((chord) => (
                    <TouchableOpacity
                        key={chord}
                        style={styles.chordButton}
                        onPress={() => handleChordPress(chord)}
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
