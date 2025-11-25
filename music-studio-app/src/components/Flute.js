import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const NOTES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5', 'B5', 'C6'];

export default function Flute() {
    const handleNotePress = (note) => {
        console.log(`Flute note ${note} played`);
        WebAudioEngine.playSound(note);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Flute</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.keysContainer}>
                    {NOTES.map((note, index) => (
                        <TouchableOpacity
                            key={note}
                            style={styles.key}
                            onPress={() => handleNotePress(note)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.keyText}>{note}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
            <Text style={styles.instruction}>Tap keys to play notes</Text>
        </View>
    );
}

const styles = StyleSheet.create({
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
    keysContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    key: {
        width: 60,
        height: 120,
        backgroundColor: '#C0C0C0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#A9A9A9',
    },
    keyText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    instruction: {
        color: '#888',
        fontSize: 14,
        marginTop: 20,
    },
});
