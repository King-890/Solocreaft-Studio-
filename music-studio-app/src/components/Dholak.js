import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Platform } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';
import { useProject } from '../contexts/ProjectContext';

export default function Dholak() {
    const { width } = useWindowDimensions();
    useInstrumentMixer('dholak');
    const [activeHit, setActiveHit] = useState(null);
    const [leftAnim] = useState(new Animated.Value(1));
    const [rightAnim] = useState(new Animated.Value(1));
    const { tracks } = useProject();

    // Find the Dholak track
    const track = tracks.find(t => t.name === 'Dholak') || { volume: 0.8, pan: 0, muted: false };

    const playSound = (soundName, side) => {
        if (track.muted) return;

        setActiveHit(soundName);
        const anim = side === 'left' ? leftAnim : rightAnim;

        Animated.sequence([
            Animated.timing(anim, { toValue: 0.95, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();

        setTimeout(() => setActiveHit(null), 200);
        UnifiedAudioEngine.playDrumSound(soundName, track.volume, track.pan);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Dholak</Text>
                <Text style={styles.subtitle}>Folk Percussion</Text>
            </View>

            <View style={styles.dholakContainer}>
                {/* Left Head (Bass) */}
                <View style={styles.headWrapper}>
                    <Animated.View style={[styles.head, styles.leftHead, { transform: [{ scale: leftAnim }] }]}>
                        <TouchableOpacity
                            style={styles.hitZone}
                            onPress={() => playSound('dha', 'left')}
                        >
                            <Text style={styles.hitLabel}>Dha</Text>
                        </TouchableOpacity>
                    </Animated.View>
                    <Text style={styles.label}>Bass (Dha)</Text>
                </View>

                {/* Barrel Body (Visual) */}
                <View style={styles.barrel}>
                    <View style={styles.rope} />
                    <View style={styles.rope} />
                    <View style={styles.rope} />
                </View>

                {/* Right Head (Treble) */}
                <View style={styles.headWrapper}>
                    <Animated.View style={[styles.head, styles.rightHead, { transform: [{ scale: rightAnim }] }]}>
                        <TouchableOpacity
                            style={styles.hitZone}
                            onPress={() => playSound('ta', 'right')}
                        >
                            <Text style={styles.hitLabel}>Ta</Text>
                        </TouchableOpacity>
                    </Animated.View>
                    <Text style={styles.label}>Treble (Ta)</Text>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.extraBtn} onPress={() => playSound('ge', 'left')}>
                    <Text style={styles.btnText}>Ge</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.extraBtn} onPress={() => playSound('na', 'right')}>
                    <Text style={styles.btnText}>Na</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        color: '#e0e0e0',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
        letterSpacing: 1,
    },
    dholakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 20,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#333',
    },
    headWrapper: {
        alignItems: 'center',
        zIndex: 2,
    },
    head: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#3e2723', // Dark wood ring
        backgroundColor: '#d7ccc8', // Skin color
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    leftHead: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#efebe9',
    },
    rightHead: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#d7ccc8',
    },
    hitZone: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hitLabel: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#3e2723',
        opacity: 0.8,
    },
    label: {
        color: '#bdbdbd',
        marginTop: 15,
        fontWeight: '600',
        fontSize: 14,
    },
    barrel: {
        width: 90,
        height: 100,
        backgroundColor: '#5d4037', // Wood barrel
        marginHorizontal: -15,
        zIndex: 1,
        justifyContent: 'space-evenly',
        paddingVertical: 10,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderColor: '#3e2723',
    },
    rope: {
        height: 6,
        backgroundColor: '#ffcc80', // Rope color
        width: '100%',
        opacity: 0.8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 1,
    },
    controls: {
        flexDirection: 'row',
        gap: 25,
    },
    extraBtn: {
        backgroundColor: '#2c2c2c',
        paddingHorizontal: 35,
        paddingVertical: 18,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#ffab00',
        elevation: 5,
        shadowColor: '#ffab00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    btnText: {
        color: '#ffab00',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
