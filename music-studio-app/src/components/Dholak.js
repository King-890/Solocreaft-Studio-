import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Platform } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';

export default function Dholak() {
    const { width } = useWindowDimensions();
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
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
    },
    dholakContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
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
        borderColor: '#5d4037',
        backgroundColor: '#d7ccc8',
        elevation: 5,
    },
    leftHead: {
        width: 140,
        height: 140,
        borderRadius: 70,
    },
    rightHead: {
        width: 110,
        height: 110,
        borderRadius: 55,
    },
    hitZone: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    hitLabel: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3e2723',
    },
    label: {
        color: '#aaa',
        marginTop: 10,
        fontWeight: 'bold',
    },
    barrel: {
        width: 100,
        height: 80,
        backgroundColor: '#8d6e63',
        marginHorizontal: -10,
        zIndex: 1,
        justifyContent: 'space-evenly',
        paddingVertical: 10,
    },
    rope: {
        height: 4,
        backgroundColor: '#d7ccc8',
        width: '100%',
        opacity: 0.7,
    },
    controls: {
        flexDirection: 'row',
        gap: 20,
    },
    extraBtn: {
        backgroundColor: '#333',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ffab00',
    },
    btnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
