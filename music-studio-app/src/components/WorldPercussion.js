import React, { useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';
import { useProject } from '../contexts/ProjectContext';

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
    const { width } = useWindowDimensions();
    useInstrumentMixer('world');
    const { tracks } = useProject();

    // Find the World Percussion track
    const track = tracks.find(t => t.name === 'World Percussion') || { volume: 0.8, pan: 0, muted: false };

    const handlePadPress = useCallback((percussion) => {
        if (track.muted) return;

        // Defer logging to prevent blocking
        requestAnimationFrame(() => {
            console.log(`${percussion.name} played`);
        });

        UnifiedAudioEngine.playDrumSound(percussion.id, track.volume, track.pan);
    }, [track.muted, track.volume, track.pan]);

    const padWidth = width < 400 ? (width - 60) / 2 : 160;

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={styles.container}>
                <Text style={styles.title}>World Percussion</Text>
                <View style={styles.grid}>
                    {PERCUSSION.map((perc) => (
                        <TouchableOpacity
                            key={perc.id}
                            style={[styles.pad, { width: padWidth }]}
                            onPress={() => handlePadPress(perc)}
                            delayPressIn={0}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.padText}>{perc.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        maxWidth: 600,
        width: '100%',
    },
    pad: {
        height: 80,
        backgroundColor: '#8B4513',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#D2691E',
        elevation: 4,
    },
    padText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
