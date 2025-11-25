import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const PERCUSSION = [
    { id: 1, name: 'Conga High', note: 'C4' },
    { id: 2, name: 'Conga Low', note: 'C3' },
    { id: 3, name: 'Bongo High', note: 'D4' },
    { id: 4, name: 'Bongo Low', note: 'D3' },
    { id: 5, name: 'Djembe', note: 'E3' },
    { id: 6, name: 'Tabla', note: 'F3' },
    { id: 7, name: 'Shaker', note: 'G4' },
    { id: 8, name: 'Cowbell', note: 'A4' },
];

export default function WorldPercussion() {
    const handlePadPress = (percussion) => {
        console.log(`${percussion.name} played`);
        WebAudioEngine.playDrumSound(percussion.id);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>World Percussion</Text>
            <View style={styles.grid}>
                {PERCUSSION.map((perc) => (
                    <TouchableOpacity
                        key={perc.id}
                        style={styles.pad}
                        onPress={() => handlePadPress(perc)}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.padText}>{perc.name}</Text>
                    </TouchableOpacity>
                ))}
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        maxWidth: 360,
    },
    pad: {
        width: 160,
        height: 80,
        backgroundColor: '#8B4513',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#D2691E',
    },
    padText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
