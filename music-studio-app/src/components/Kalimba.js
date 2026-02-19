import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const TINES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];

export default function Kalimba() {
    const [activeTine, setActiveTine] = useState(null);
    const vibrationAnims = useRef(TINES.reduce((acc, note) => {
        acc[note] = new Animated.Value(0);
        return acc;
    }, {})).current;

    const playTine = useCallback((note) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(note, 'kalimba', 0, 0.75);
        setActiveTine(note);

        vibrationAnims[note].setValue(1.5);
        Animated.spring(vibrationAnims[note], {
            toValue: 0,
            friction: 2.5,
            tension: 40,
            useNativeDriver: Platform.OS !== 'web'
        }).start();

        setTimeout(() => setActiveTine(null), 250);
    }, []);

    return (
        <LinearGradient colors={['#1a0d06', '#2d1b10', '#1a0d06']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>CHIMING RESONANCE</Text>
                <Text style={styles.subtitle}>MASTERCLASS KALIMBA • HAND-POLISHED MAHOGANY</Text>
            </View>

            <View style={styles.kalimbaFrame}>
                {/* 1. MASTER MAHOGANY BODY */}
                <View style={styles.premiumBody}>
                    <LinearGradient colors={['#3e2723', '#5d4037', '#3e2723']} style={styles.bodyWood}>
                        <View style={styles.woodGlow} />
                        <View style={styles.soundPort}>
                            <LinearGradient colors={['#000', '#1a0d06']} style={styles.portDepth} />
                            <View style={styles.portRim} />
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. PRECISION TINE ASSEMBLY */}
                <View style={styles.tineAssembly}>
                    {/* Integrated Pressure Bar */}
                    <LinearGradient colors={['#94a3b8', '#f8fafc', '#64748b']} style={styles.pressureHardware}>
                        <View style={styles.screwDetailLeft} />
                        <View style={styles.screwDetailRight} />
                    </LinearGradient>
                    
                    <View style={styles.tinesArray}>
                        {TINES.map((note, index) => {
                            const isActive = activeTine === note;
                            const tH = 260 - Math.abs(index - 4.5) * 35; 
                            return (
                                <View key={note} style={styles.tineStation}>
                                    <TouchableOpacity activeOpacity={1} onPressIn={() => playTine(note)} style={styles.tineTouch}>
                                        <Animated.View style={[styles.pistonTine, { height: tH, transform: [{ translateY: vibrationAnims[note].interpolate({ inputRange: [0, 1.5], outputRange: [0, 6] }) }] }]}>
                                            <LinearGradient colors={isActive ? ['#38bdf8', '#0284c7'] : ['#cbd5e1', '#f8fafc', '#94a3b8']} style={styles.metalLuster}>
                                                <View style={styles.tineReflection} />
                                                <Text style={[styles.pistonLabel, isActive && { color: '#fff' }]}>{note}</Text>
                                            </LinearGradient>
                                        </Animated.View>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.sonicIndicator}>
                    <Text style={styles.sonicText}>STEEL-HARMONIC RESONANCE SYNC • MASTER POLISH</Text>
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
    header: { alignItems: 'center', marginBottom: sc(25) },
    title: { color: '#f8fafc', fontSize: normalize(22), fontWeight: '900', letterSpacing: 8, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }) },
    subtitle: { color: '#fbbf24', fontSize: normalize(10), fontWeight: '900', letterSpacing: 3, marginTop: sc(4), opacity: 0.7 },
    kalimbaFrame: {
        flex: 1,
        width: '94%',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    premiumBody: {
        width: '100%',
        height: '92%',
        zIndex: 1,
        ...createShadow({ color: '#000', radius: sc(30) }),
    },
    bodyWood: {
        flex: 1,
        borderRadius: sc(35),
        borderWidth: 3,
        borderColor: '#2d1b10',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: sc(70),
    },
    woodGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.06)' },
    soundPort: {
        width: sc(140),
        height: sc(140),
        borderRadius: sc(70),
        backgroundColor: '#000',
        borderWidth: 5,
        borderColor: '#1a0d06',
        justifyContent: 'center',
        alignItems: 'center',
    },
    portDepth: { width: '100%', height: '100%', borderRadius: sc(70) },
    portRim: { position: 'absolute', width: '110%', height: '110%', borderRadius: sc(80), borderWidth: 2, borderColor: 'rgba(251,191,36,0.08)' },
    tineAssembly: { position: 'absolute', top: 0, width: '100%', height: '100%', alignItems: 'center', zIndex: 10 },
    pressureHardware: {
        width: '92%',
        height: sc(16),
        marginTop: sc(40),
        borderRadius: sc(8),
        borderWidth: 2,
        borderColor: '#475569',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: sc(20),
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(10) }),
    },
    screwDetailLeft: { width: sc(4), height: sc(4), borderRadius: sc(2), backgroundColor: 'rgba(0,0,0,0.4)' },
    screwDetailRight: { width: sc(4), height: sc(4), borderRadius: sc(2), backgroundColor: 'rgba(0,0,0,0.4)' },
    tinesArray: { flexDirection: 'row', justifyContent: 'space-around', width: '96%', marginTop: sc(-16) },
    tineStation: { alignItems: 'center' },
    tineTouch: { zIndex: 5 },
    pistonTine: { width: sc(42), borderRadius: sc(21), borderBottomLeftRadius: sc(21), borderBottomRightRadius: sc(21), ...createShadow({ color: '#000', radius: sc(12), offsetY: 10 }) },
    metalLuster: { flex: 1, borderRadius: sc(21), borderWidth: 2, borderColor: '#64748b', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: sc(30) },
    tineReflection: { position: 'absolute', top: sc(25), width: sc(14), height: '45%', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: sc(7) },
    pistonLabel: { color: 'rgba(0,0,0,0.4)', fontSize: normalize(11), fontWeight: '900' },
    footer: { marginTop: sc(30), width: '100%', alignItems: 'center' },
    sonicIndicator: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: sc(25), paddingVertical: sc(10), borderRadius: sc(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sonicText: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2.5 },
});
