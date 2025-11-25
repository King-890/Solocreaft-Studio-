import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

const PADS = Array.from({ length: 16 }, (_, i) => i + 1);

export default function DrumMachine() {
    const handlePadPress = (padId) => {
        console.log(`Drum Pad ${padId} pressed`);
        WebAudioEngine.playDrumSound(padId);
    };

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {PADS.map((pad) => (
                    <TouchableOpacity
                        key={pad}
                        style={styles.pad}
                        onPress={() => handlePadPress(pad)}
                        activeOpacity={0.6}
                    >
                        <Text style={styles.padText}>{pad}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 340, // 4 * 80 + margins
    },
    pad: {
        width: 70,
        height: 70,
        backgroundColor: '#333',
        margin: 5,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#444',
    },
    padText: {
        color: '#666',
        fontSize: 12,
    },
});
