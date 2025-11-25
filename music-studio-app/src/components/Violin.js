import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const STRINGS = ['G', 'D', 'A', 'E'];

export default function Violin() {
    const handleStringPress = (string) => {
        console.log(`Violin string ${string} played`);
        // Map strings to notes
        const noteMap = { 'G': 'G3', 'D': 'D4', 'A': 'A4', 'E': 'E5' };
        WebAudioEngine.playSound(noteMap[string]);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Violin</Text>
            <View style={styles.stringsContainer}>
                {STRINGS.map((string) => (
                    <TouchableOpacity
                        key={string}
                        style={styles.string}
                        onPress={() => handleStringPress(string)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.stringText}>{string}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.bowArea}>
                <Text style={styles.instruction}>Tap strings to play</Text>
            </View>
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
    stringsContainer: {
        width: '100%',
        maxWidth: 300,
    },
    string: {
        height: 60,
        backgroundColor: '#8B4513',
        marginVertical: 8,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#D2691E',
    },
    stringText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    bowArea: {
        marginTop: 40,
    },
    instruction: {
        color: '#888',
        fontSize: 14,
    },
});
