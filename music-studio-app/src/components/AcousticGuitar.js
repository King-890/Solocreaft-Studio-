import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';

const CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];

export default function AcousticGuitar({ instrument = 'guitar' }) {
    useInstrumentMixer(instrument);
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
        backgroundColor: '#2d1b15', // Dark wood color
        borderRadius: 20,
        margin: 10,
        borderWidth: 4,
        borderColor: '#5d4037',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    title: {
        color: '#d7ccc8',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    chordGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
    },
    chordButton: {
        width: 85,
        height: 85,
        backgroundColor: '#8d6e63',
        borderRadius: 42.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#bcaaa4',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    chordText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    strumArea: {
        marginTop: 30,
        padding: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
    },
    instruction: {
        color: '#a1887f',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 1,
    },
});
