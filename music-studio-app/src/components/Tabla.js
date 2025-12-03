import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Platform, ScrollView } from 'react-native';
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
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={[styles.container, { minHeight: width > 500 ? 400 : 'auto' }]}>
                <View style={styles.header}>
                    <Text style={styles.title}>Tabla</Text>
                    <Text style={styles.subtitle}>Indian Percussion</Text>
                </View>

                <View style={styles.drumsContainer}>
                    {/* Bayan (Left / Bass) */}
                    <View style={styles.drumWrapper}>
                        <Animated.View style={[
                            styles.bayan,
                            {
                                transform: [{ scale: bayanAnim }],
                                width: width < 400 ? 160 : 220,
                                height: width < 400 ? 160 : 220,
                                borderRadius: width < 400 ? 80 : 110
                            }
                        ]}>
                            <View style={styles.bayanOuterRing}>
                                <TouchableOpacity
                                    style={[styles.bayanSyahi, {
                                        top: width < 400 ? 50 : 70,
                                        left: width < 400 ? 50 : 70,
                                        width: width < 400 ? 60 : 80,
                                        height: width < 400 ? 60 : 80,
                                        borderRadius: width < 400 ? 30 : 40
                                    }]}
                                    onPress={() => playSound('ke', 'bayan')}
                                >
                                    <Text style={styles.hitLabel}>Ke</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.bayanMaidan, {
                                        top: width < 400 ? 30 : 40,
                                        left: width < 400 ? 30 : 40,
                                        right: width < 400 ? 30 : 40,
                                        bottom: width < 400 ? 30 : 40,
                                    }]}
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
                        <Animated.View style={[
                            styles.dayan,
                            {
                                transform: [{ scale: dayanAnim }],
                                width: width < 400 ? 140 : 180,
                                height: width < 400 ? 140 : 180,
                                borderRadius: width < 400 ? 70 : 90
                            }
                        ]}>
                            <View style={styles.dayanOuterRing}>
                                <TouchableOpacity
                                    style={[styles.dayanKinar, {
                                        borderRadius: width < 400 ? 70 : 90,
                                        borderWidth: width < 400 ? 20 : 25
                                    }]}
                                    onPress={() => playSound('na', 'dayan')}
                                >
                                    <Text style={styles.hitLabel}>Na</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dayanMaidan, {
                                        top: width < 400 ? 20 : 25,
                                        left: width < 400 ? 20 : 25,
                                        right: width < 400 ? 20 : 25,
                                        bottom: width < 400 ? 20 : 25,
                                        borderRadius: width < 400 ? 50 : 70
                                    }]}
                                    onPress={() => playSound('tin', 'dayan')}
                                >
                                    <Text style={styles.hitLabel}>Tin</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.dayanSyahi, {
                                        top: width < 400 ? 45 : 55,
                                        left: width < 400 ? 45 : 55,
                                        width: width < 400 ? 50 : 70,
                                        height: width < 400 ? 50 : 70,
                                        borderRadius: width < 400 ? 25 : 35
                                    }]}
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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        paddingVertical: 30,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    title: {
        color: '#e0e0e0',
        fontSize: 34,
        fontWeight: 'bold',
        marginBottom: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        color: '#aaa',
        fontSize: 16,
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    drumsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        marginBottom: 50,
        flexWrap: 'wrap',
    },
    drumWrapper: {
        alignItems: 'center',
    },
    bayan: {
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#bcaaa4', // Copper/Clay base
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: '#5d4037',
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
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
        backgroundColor: '#efebe9', // Skin
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        borderWidth: 1,
        borderColor: '#d7ccc8',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
    },
    dayan: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#e0e0e0', // Wood
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 6,
        borderColor: '#424242',
        elevation: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
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
        borderColor: '#f5f5f5', // Rim
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
        backgroundColor: '#fafafa',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
    },
    hitLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 15,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    drumLabel: {
        color: '#bdbdbd',
        marginTop: 20,
        fontSize: 18,
        fontWeight: '600',
    },
    controls: {
        flexDirection: 'row',
        gap: 25,
    },
    bolButton: {
        backgroundColor: '#2c2c2c',
        paddingHorizontal: 35,
        paddingVertical: 18,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#4a9eff',
        elevation: 5,
        shadowColor: '#4a9eff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    bolText: {
        color: '#4a9eff',
        fontSize: 18,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
