import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';

const STRINGS = ['G', 'D', 'A', 'E'];
const NOTE_MAP = { 'G': 'G3', 'D': 'D4', 'A': 'A4', 'E': 'E5' };

export default function Violin({ instrument = 'violin' }) {
    const { height } = useWindowDimensions();
    useInstrumentMixer(instrument);
    const [activeString, setActiveString] = useState(null);
    const lastPlayedRef = useRef(null);

    const handleStringPress = useCallback(async (string) => {
        // Stop previous sound if any
        if (lastPlayedRef.current && lastPlayedRef.current !== string) {
            await UnifiedAudioEngine.stopSound(NOTE_MAP[lastPlayedRef.current], instrument);
        }

        lastPlayedRef.current = string;
        setActiveString(string);

        // Defer logging to prevent blocking
        requestAnimationFrame(() => {
            console.log(`${instrument} string ${string} played`);
        });

        UnifiedAudioEngine.playSound(NOTE_MAP[string], instrument);
    }, [instrument]);

    const handleStringRelease = useCallback((string) => {
        setActiveString(null);
        UnifiedAudioEngine.stopSound(NOTE_MAP[string], instrument);
    }, [instrument]);

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={[styles.container, { minHeight: height - 150 }]}>
                <Text style={styles.title}>Violin</Text>
                <View style={styles.stringsContainer}>
                    {STRINGS.map((string) => (
                        <TouchableOpacity
                            key={string}
                            style={[
                                styles.string,
                                activeString === string && styles.activeString
                            ]}
                            onPressIn={() => handleStringPress(string)}
                            onPressOut={() => handleStringRelease(string)}
                            delayPressIn={0}
                            delayPressOut={0}
                            activeOpacity={0.7}
                        >
                            <View style={styles.stringLine} />
                            <Text style={styles.stringText}>{string}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.bowArea}>
                    <Text style={styles.instruction}>Hold to play, release to stop</Text>
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
    stringsContainer: {
        width: '100%',
        maxWidth: 300,
        gap: 15,
    },
    string: {
        height: 70,
        backgroundColor: '#3e2723', // Dark wood
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#5d4037',
        position: 'relative',
        elevation: 5,
    },
    activeString: {
        borderColor: '#d7ccc8',
        backgroundColor: '#4e342e',
    },
    stringLine: {
        position: 'absolute',
        width: '90%',
        height: 2,
        backgroundColor: '#bcaaa4', // String color
        zIndex: 1,
    },
    stringText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
        zIndex: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    bowArea: {
        marginTop: 40,
    },
    instruction: {
        color: '#888',
        fontSize: 14,
    },
});
