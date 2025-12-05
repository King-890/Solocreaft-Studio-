import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';

const VALVES = [1, 2, 3];

export default function Trumpet() {
    const [pressedValves, setPressedValves] = useState([]);

    // Connect to mixer
    useInstrumentMixer('trumpet');

    const handleValvePress = (valve) => {
        const newPressed = pressedValves.includes(valve)
            ? pressedValves.filter(v => v !== valve)
            : [...pressedValves, valve];

        setPressedValves(newPressed);

        // Play note based on valve combination
        const note = getNoteFromValves(newPressed);
        console.log(`Trumpet playing ${note} with valves:`, newPressed);
        UnifiedAudioEngine.playSound(note, 'trumpet');
    };

    const getNoteFromValves = (valves) => {
        // Simplified valve-to-note mapping
        const sorted = valves.sort().join('');
        const noteMap = {
            '': 'C4',
            '1': 'B3',
            '2': 'A3',
            '3': 'G3',
            '12': 'G#3',
            '13': 'F#3',
            '23': 'F3',
            '123': 'E3',
        };
        return noteMap[sorted] || 'C4';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trumpet</Text>
            <View style={styles.valvesContainer}>
                {VALVES.map((valve) => (
                    <TouchableOpacity
                        key={valve}
                        style={[
                            styles.valve,
                            pressedValves.includes(valve) && styles.valvePressed
                        ]}
                        onPress={() => handleValvePress(valve)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.valveText}>{valve}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.instruction}>Press valves to play notes</Text>
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
    valvesContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    valve: {
        width: 80,
        height: 120,
        backgroundColor: '#FFD700',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#DAA520',
    },
    valvePressed: {
        backgroundColor: '#FFA500',
        transform: [{ translateY: 10 }],
    },
    valveText: {
        color: '#000',
        fontSize: 32,
        fontWeight: 'bold',
    },
    instruction: {
        color: '#888',
        fontSize: 14,
        marginTop: 40,
    },
});
