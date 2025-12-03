import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';

const DRUM_PADS = [
    { id: 'kick', label: 'Kick', color: '#ff4444' },
    { id: 'snare', label: 'Snare', color: '#44ff44' },
    { id: 'hihat', label: 'Hi-Hat', color: '#4444ff' },
    { id: 'tom1', label: 'Tom 1', color: '#ffaa44' },
    { id: 'tom2', label: 'Tom 2', color: '#ff44aa' },
    { id: 'crash', label: 'Crash', color: '#44aaff' },
    { id: 'ride', label: 'Ride', color: '#aaff44' },
];

export default function DrumMachine() {
    const { tracks } = useProject();

    // Find the Drums track
    const track = tracks.find(t => t.name === 'Drums') || { volume: 0.9, pan: 0, muted: false };

    const handlePadPress = (pad) => {
        if (track.muted) return;
        console.log(`Drum Pad ${pad.label} pressed`);
        // Map to note names expected by UnifiedAudioEngine for drums
        // Kick -> C1, Snare -> D1, etc. if using MIDI mapping
        // Or pass the ID directly if UnifiedAudioEngine handles it
        UnifiedAudioEngine.playDrumSound(pad.id, track.volume, track.pan);
    };

    return (
        <View style={styles.container}>
            <View style={styles.grid}>
                {DRUM_PADS.map((pad) => (
                    <TouchableOpacity
                        key={pad.id}
                        style={[styles.pad, { borderColor: pad.color }]}
                        onPressIn={() => handlePadPress(pad)}
                        activeOpacity={0.6}
                    >
                        <Text style={[styles.padText, { color: pad.color }]}>{pad.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 25,
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 20,
        margin: 10,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
        elevation: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 360,
        gap: 16,
    },
    pad: {
        width: 100,
        height: 100,
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 8,
    },
    padText: {
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
