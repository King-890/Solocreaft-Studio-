import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

export default function Saxophone() {
    const handleNotePress = (note) => {
        console.log(`Saxophone note ${note} played`);
        WebAudioEngine.playSound(note);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saxophone</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.keysContainer}>
                    {NOTES.map((note) => (
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
        gap: 8,
    },
    key: {
        width: 55,
        height: 100,
        backgroundColor: '#FFD700',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#DAA520',
    },
    keyText: {
        color: '#000',
        fontSize: 13,
        fontWeight: 'bold',
    },
    instruction: {
        color: '#888',
        fontSize: 14,
        marginTop: 20,
    },
});
