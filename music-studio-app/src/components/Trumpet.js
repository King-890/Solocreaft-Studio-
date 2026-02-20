import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const VALVES = [1, 2, 3];

export default function Trumpet({ instrument = 'trumpet' }) {
    const [pressedValves, setPressedValves] = useState([]);
    
    const valveAnims = useRef({
        1: new Animated.Value(0),
        2: new Animated.Value(0),
        3: new Animated.Value(0),
    }).current;

    const handleValvePress = (valve) => {
        UnifiedAudioEngine.activateAudio();
        const isCurrentlyPressed = pressedValves.includes(valve);
        const newPressed = isCurrentlyPressed
            ? pressedValves.filter(v => v !== valve)
            : [...pressedValves, valve];

        setPressedValves(newPressed);

        Animated.spring(valveAnims[valve], {
            toValue: isCurrentlyPressed ? 0 : 1,
            friction: 6,
            tension: 100,
            useNativeDriver: Platform.OS !== 'web',
        }).start();

        const note = getNoteFromValves(newPressed);
        if (!isCurrentlyPressed) {
            UnifiedAudioEngine.playSound(note, instrument, 0, 0.82);
        }
    };

    const getNoteFromValves = (valves) => {
        // [REFINEMENT] Sort a copy of the array to avoid mutating React state
        const sorted = [...valves].sort().join('');
        const noteMap = { '': 'C4', '1': 'B3', '2': 'A3', '3': 'G3', '12': 'G#3', '13': 'F#3', '23': 'F3', '123': 'E3' };
        return noteMap[sorted] || 'C4';
    };

    return (
        <LinearGradient colors={['#1a1005', '#2c1e0a', '#1a1005']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MAJESTIC BRASS</Text>
                <Text style={styles.subtitle}>MASTERCLASS CUSTOM TRUMPET • LUMINOUS GOLD</Text>
            </View>

            <View style={styles.trumpetFrame}>
                {/* 1. UNIFIED TUBING SYSTEM */}
                <View style={styles.tubingSystem}>
                    <LinearGradient colors={['#92400e', '#fbbf24', '#b45309', '#fbbf24', '#92400e']} style={styles.mainLeadPipe}>
                        <View style={styles.goldReflect} />
                    </LinearGradient>
                </View>

                {/* 2. PRECISION VALVE BLOCK casing */}
                <View style={styles.valveCasing}>
                    <LinearGradient colors={['#b45309', '#fbbf24', '#b45309']} style={styles.casingMetal}>
                        <View style={styles.casingHighlight} />
                    </LinearGradient>
                    
                    <View style={styles.pistonsRow}>
                        {VALVES.map((valve) => {
                            const slideY = valveAnims[valve].interpolate({ inputRange: [0, 1], outputRange: [0, 20] });
                            return (
                                <View key={valve} style={styles.valveChannel}>
                                    <View style={styles.topCap} />
                                    <Animated.View style={[styles.pistonAssembly, { transform: [{ translateY: slideY }] }]}>
                                        <TouchableOpacity activeOpacity={1} onPress={() => handleValvePress(valve)} style={styles.pistonTouch}>
                                            <LinearGradient colors={['#fff', '#f1f5f9', '#94a3b8']} style={styles.pearlButton}>
                                                <View style={styles.pearlLuster} />
                                            </LinearGradient>
                                            <View style={styles.nickelRod} />
                                        </TouchableOpacity>
                                    </Animated.View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* 3. RESONANT FLARE (Bell) */}
                <View style={styles.bellSection}>
                    <LinearGradient colors={['#92400e', '#fbbf24', '#d97706']} style={styles.bellFlare}>
                        <View style={styles.flareRim} />
                        <View style={styles.bellShadow} />
                    </LinearGradient>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.performanceOverlay}>
                    <Text style={styles.harmonicText}>VALVE STATE: {getNoteFromValves(pressedValves)} • HARMONIC SERIES ACTIVE</Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: sc(40),
        margin: sc(5),
        alignItems: 'center',
        paddingVertical: sc(35),
        ...createShadow({ color: '#000', radius: sc(45), opacity: 0.95 }),
    },
    header: { alignItems: 'center', marginBottom: sc(40) },
    title: { color: '#fbbf24', fontSize: normalize(20), fontWeight: '900', letterSpacing: 8, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 12 }) },
    subtitle: { color: '#94a3b8', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2, marginTop: sc(4), opacity: 0.7 },
    trumpetFrame: {
        flex: 1,
        width: '94%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    tubingSystem: {
        position: 'absolute',
        width: '110%',
        height: sc(80),
        zIndex: 1,
    },
    mainLeadPipe: {
        width: '100%',
        height: sc(25),
        borderRadius: sc(12.5),
        borderWidth: 2,
        borderColor: '#92400e',
        ...createShadow({ color: '#000', radius: sc(15) }),
    },
    goldReflect: { ...StyleSheet.absoluteFillObject, height: sc(6), backgroundColor: 'rgba(255,255,255,0.4)', marginTop: sc(4), borderRadius: sc(10) },
    valveCasing: {
        width: sc(190),
        height: sc(260),
        zIndex: 10,
        ...createShadow({ color: '#000', radius: sc(30) }),
    },
    casingMetal: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: sc(30),
        borderWidth: 3,
        borderColor: '#451a03',
    },
    casingHighlight: { width: sc(40), height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', position: 'absolute', right: sc(20) },
    pistonsRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: sc(15), paddingTop: sc(40) },
    valveChannel: { alignItems: 'center', width: sc(55) },
    topCap: { width: sc(48), height: sc(16), backgroundColor: '#78350f', borderTopLeftRadius: sc(10), borderTopRightRadius: sc(10), borderWidth: 2, borderColor: '#451a03', marginBottom: sc(-4), zIndex: 15 },
    pistonAssembly: { width: '100%', alignItems: 'center' },
    pistonTouch: { width: sc(55), alignItems: 'center' },
    pearlButton: {
        width: sc(54),
        height: sc(54),
        borderRadius: sc(27),
        borderWidth: 3,
        borderColor: '#fbbf24',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(12), offsetY: 6 }),
    },
    pearlLuster: { width: sc(40), height: sc(40), borderRadius: sc(20), backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    nickelRod: { width: sc(18), height: sc(160), marginTop: sc(-10), backgroundColor: '#cbd5e1', borderWidth: 2, borderColor: '#94a3b8', zIndex: -1 },
    bellSection: { marginLeft: sc(-20), zIndex: 5 },
    bellFlare: {
        width: sc(190),
        height: sc(240),
        borderTopRightRadius: sc(120),
        borderBottomRightRadius: sc(120),
        borderWidth: 4,
        borderColor: '#92400e',
        ...createShadow({ color: '#000', radius: sc(40) }),
    },
    flareRim: { ...StyleSheet.absoluteFillObject, borderRightWidth: sc(12), borderColor: 'rgba(255,255,255,0.2)' },
    bellShadow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.05)' },
    footer: { marginTop: sc(40), width: '100%', alignItems: 'center' },
    performanceOverlay: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: sc(25), paddingVertical: sc(8), borderRadius: sc(25), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    harmonicText: { color: '#fbbf24', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2 },
});
