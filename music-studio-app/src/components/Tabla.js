import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Platform } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';

// Tabla sounds mapping
const TABLA_SOUNDS = {
    // Dayan (Right Drum) - High pitched
    'na': { type: 'treble' },
    'tin': { type: 'treble' },
    'tun': { type: 'treble' },
    'te': { type: 'treble' },

    // Bayan (Left Drum) - Bass
    'ge': { type: 'bass' },
    'ke': { type: 'bass' },
    'kat': { type: 'bass' },
};

export default function Tabla() {
    const { width } = useWindowDimensions();
    const [activeHit, setActiveHit] = useState(null);
    const [dayanAnim] = useState(new Animated.Value(1));
    const [bayanAnim] = useState(new Animated.Value(1));
    const { tracks } = useProject();

    // Find the Tabla track
    const track = tracks.find(t => t.name === 'Tabla') || { volume: 0.8, pan: 0, muted: false };

    const playSound = (soundName, drum) => {
        if (track.muted) return;

        // Visual feedback
        setActiveHit(soundName);
        const anim = drum === 'dayan' ? dayanAnim : bayanAnim;

        Animated.sequence([
            Animated.timing(anim, { toValue: 0.95, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(anim, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        ]).start();

        setTimeout(() => setActiveHit(null), 200);

        // Play sound using UnifiedAudioEngine
        UnifiedAudioEngine.playDrumSound(soundName, track.volume, track.pan);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tabla</Text>
                <Text style={styles.subtitle}>Indian Percussion</Text>
            </View>

            <View style={styles.drumsContainer}>
                {/* Bayan (Left / Bass) */}
                <View style={styles.drumWrapper}>
                    <Animated.View style={[styles.bayan, { transform: [{ scale: bayanAnim }] }]}>
                        <View style={styles.bayanOuterRing}>
                            <TouchableOpacity
                                style={styles.bayanSyahi}
                                onPress={() => playSound('ke', 'bayan')}
                            >
                                <Text style={styles.hitLabel}>Ke</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.bayanMaidan}
                                onPress={() => playSound('ge', 'bayan')}
                            >
                                <Text style={styles.hitLabel}>Ge</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                    <Text style={styles.drumLabel}>Bayan (Bass)</Text>
                </View>

                {/* Dayan (Right / Treble) */}
                <View style={styles.drumWrapper}>
                    <Animated.View style={[styles.dayan, { transform: [{ scale: dayanAnim }] }]}>
                        <View style={styles.dayanOuterRing}>
                            <TouchableOpacity
                                style={styles.dayanKinar}
                                onPress={() => playSound('na', 'dayan')}
                            >
                                <Text style={styles.hitLabel}>Na</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dayanMaidan}
                                onPress={() => playSound('tin', 'dayan')}
                            >
                                <Text style={styles.hitLabel}>Tin</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.dayanSyahi}
                                onPress={() => playSound('te', 'dayan')}
                            >
                                <Text style={styles.hitLabel}>Te</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                    <Text style={styles.drumLabel}>Dayan (Treble)</Text>
                </View>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.bolButton} onPress={() => playSound('tun', 'dayan')}>
                    <Text style={styles.bolText}>Tun</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bolButton} onPress={() => playSound('kat', 'bayan')}>
                    <Text style={styles.bolText}>Kat</Text>
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
    drumsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 40,
        marginBottom: 40,
        flexWrap: 'wrap',
    },
    drumWrapper: {
        alignItems: 'center',
    },
    bayan: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#d4a373', // Copper/Clay color
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#8d6e63',
        elevation: 10,
    },
    bayanOuterRing: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    bayanMaidan: {
        position: 'absolute',
        top: 40,
        left: 40,
        right: 40,
        bottom: 40,
        borderRadius: 100,
        backgroundColor: '#f5f5f5', // Skin color
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    bayanSyahi: {
        position: 'absolute',
        top: 70,
        left: 70,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#212121', // Black spot
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayan: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#e0e0e0', // Wood color
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 6,
        borderColor: '#616161',
        elevation: 10,
    },
    dayanOuterRing: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    dayanKinar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 90,
        borderWidth: 25,
        borderColor: '#eeeeee', // Rim
        zIndex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 5,
    },
    dayanMaidan: {
        position: 'absolute',
        top: 25,
        left: 25,
        right: 25,
        bottom: 25,
        borderRadius: 70,
        backgroundColor: '#f5f5f5',
        zIndex: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayanSyahi: {
        position: 'absolute',
        top: 55,
        left: 55,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#212121',
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hitLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: 'bold',
    },
    drumLabel: {
        color: '#fff',
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold',
    },
    controls: {
        flexDirection: 'row',
        gap: 20,
    },
    bolButton: {
        backgroundColor: '#333',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#4a9eff',
    },
    bolText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
