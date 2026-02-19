import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const BARS = [
    { note: 'C4', width: sc(250), color: '#451a03' },
    { note: 'D4', width: sc(235), color: '#451a03' },
    { note: 'E4', width: sc(220), color: '#451a03' },
    { note: 'F4', width: sc(205), color: '#451a03' },
    { note: 'G4', width: sc(190), color: '#451a03' },
    { note: 'A4', width: sc(175), color: '#451a03' },
    { note: 'B4', width: sc(160), color: '#451a03' },
    { note: 'C5', width: sc(145), color: '#451a03' },
    { note: 'D5', width: sc(130), color: '#451a03' },
    { note: 'E5', width: sc(115), color: '#451a03' },
];

export default function Marimba() {
    const [activeBar, setActiveBar] = useState(null);
    const vibrationAnims = useRef(BARS.reduce((acc, bar) => {
        acc[bar.note] = new Animated.Value(0);
        return acc;
    }, {})).current;

    const playBar = useCallback((note) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(note, 'marimba', 0, 0.9);
        setActiveBar(note);

        Animated.sequence([
            Animated.timing(vibrationAnims[note], { toValue: 1.5, duration: 60, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(vibrationAnims[note], { toValue: 0, friction: 3, tension: 50, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        setTimeout(() => setActiveBar(null), 200);
    }, []);

    return (
        <LinearGradient colors={['#1a0d06', '#2d1b10', '#1a0d06']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>WOODEN RESONANCE</Text>
                <Text style={styles.subtitle}>MASTERCLASS MARIMBA PRO • POLISHED ROSEWOOD & GOLD</Text>
            </View>

            <View style={styles.marimbaFrame}>
                {/* 1. MASTER INSTRUMENT CHASSIS */}
                <View style={styles.mainChassis}>
                    <View style={styles.railTop} />
                    <View style={styles.railBottom} />
                </View>

                {/* 2. ROSEWOOD BARS & GOLD RESONATORS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.masterScroll}>
                    {BARS.map((bar) => {
                        const isActive = activeBar === bar.note;
                        return (
                            <View key={bar.note} style={styles.columnUnit}>
                                {/* Rosewood Harmonic Bar */}
                                <TouchableOpacity activeOpacity={1} onPressIn={() => playBar(bar.note)} style={styles.barTouch}>
                                    <Animated.View style={[styles.rosewoodBar, { height: bar.width, transform: [{ translateY: vibrationAnims[bar.note].interpolate({ inputRange: [0, 1.5], outputRange: [0, 4] }) }] }]}>
                                        <LinearGradient colors={isActive ? ['#d97706', '#b45309'] : ['#5d4037', '#3e2723', '#2d1b10']} style={styles.barMaterial}>
                                            <View style={styles.grainGlow} />
                                            <View style={styles.barRimDetail} />
                                            <Text style={[styles.barNoteText, isActive && { color: '#fbbf24' }]}>{bar.note}</Text>
                                        </LinearGradient>
                                    </Animated.View>
                                </TouchableOpacity>

                                {/* Luminous Gold Resonator Pipe */}
                                <View style={styles.resonatorHanger}>
                                    <LinearGradient colors={['#92400e', '#fbbf24', '#f59e0b', '#fbbf24', '#92400e']} style={[styles.goldPipe, { height: bar.width * 0.95 }]}>
                                        <View style={styles.pipeReflect} />
                                        <View style={styles.pipeCapTop} />
                                    </LinearGradient>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>

            <View style={styles.footer}>
                <View style={styles.harmonicBadge}>
                    <Text style={styles.badgeText}>ROSEWOOD-HARMONIC RESONANCE ACTIVE • 440HZ CONCERT CALIBRATION</Text>
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
    title: { color: '#fbbf24', fontSize: normalize(24), fontWeight: '900', letterSpacing: 8, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 12 }) },
    subtitle: { color: '#94a3b8', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2.5, marginTop: sc(4), opacity: 0.7 },
    marimbaFrame: {
        flex: 1,
        width: '100%',
        position: 'relative',
        justifyContent: 'center',
    },
    mainChassis: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
    railTop: { position: 'absolute', top: '22%', left: 0, right: 0, height: sc(14), backgroundColor: '#3e2723', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#1a0d06', ...createShadow({ color: '#000', radius: sc(10) }) },
    railBottom: { position: 'absolute', bottom: '22%', left: 0, right: 0, height: sc(14), backgroundColor: '#3e2723', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#1a0d06', ...createShadow({ color: '#000', radius: sc(10) }) },
    masterScroll: { alignItems: 'center', paddingHorizontal: sc(60), gap: sc(18), zIndex: 10 },
    columnUnit: { alignItems: 'center', height: '100%', justifyContent: 'center' },
    barTouch: { zIndex: 20 },
    rosewoodBar: { width: sc(56), borderRadius: sc(8), ...createShadow({ color: '#000', radius: sc(15), offsetY: 8 }) },
    barMaterial: { flex: 1, borderRadius: sc(8), borderWidth: 2, borderColor: '#1a0d06', justifyContent: 'space-between', alignItems: 'center', paddingVertical: sc(25), overflow: 'hidden' },
    grainGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.04)' },
    barRimDetail: { width: '70%', height: sc(6), backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: sc(3) },
    barNoteText: { color: 'rgba(255,255,255,0.25)', fontSize: normalize(13), fontWeight: '900', letterSpacing: 1 },
    resonatorHanger: { marginTop: sc(25), zIndex: 5 },
    goldPipe: { width: sc(44), borderRadius: sc(22), borderWidth: 2, borderColor: '#92400e', alignItems: 'center', ...createShadow({ color: '#000', radius: sc(15), opacity: 0.6 }) },
    pipeReflect: { width: sc(10), height: '80%', backgroundColor: 'rgba(255,255,255,0.2)', position: 'absolute', left: sc(10), borderRadius: sc(5), marginTop: '10%' },
    pipeCapTop: { width: '100%', height: sc(12), backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: sc(22) },
    footer: { marginTop: sc(35), width: '100%', alignItems: 'center' },
    harmonicBadge: { backgroundColor: 'rgba(251,191,36,0.04)', paddingHorizontal: sc(30), paddingVertical: sc(10), borderRadius: sc(25), borderWidth: 1, borderColor: 'rgba(251,191,36,0.15)' },
    badgeText: { color: '#475569', fontSize: normalize(10), fontWeight: '900', letterSpacing: 1.5 },
});
