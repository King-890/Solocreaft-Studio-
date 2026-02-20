import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';

export default function Dholak() {
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    const { tracks } = useProject();

    const leftScale = useRef(new Animated.Value(1)).current;
    const rightScale = useRef(new Animated.Value(1)).current;
    const barrelShake = useRef(new Animated.Value(0)).current;

    // Adaptive dimensioning
    const barrelWidth = Math.min(width * 0.4, sc(160));
    const barrelHeight = barrelWidth * 1.125;
    const bassPlateSize = Math.min(width * 0.45, sc(180));
    const treblePlateSize = bassPlateSize * 0.83;

    const track = tracks.find(t => t.name === 'Dholak') || { volume: 0.8, pan: 0, muted: false };

    const playSound = (soundName, side) => {
        UnifiedAudioEngine.activateAudio();
        if (track.muted) return;
        const scale = side === 'left' ? leftScale : rightScale;

        scale.setValue(0.94);
        barrelShake.setValue(side === 'left' ? -4 : 4);
        
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 3, tension: 50, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(barrelShake, { toValue: 0, friction: 4, tension: 40, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        UnifiedAudioEngine.playDrumSound(soundName, 'dholak', track.volume, track.pan);
    };

    return (
        <LinearGradient colors={['#1e1b4b', '#312e81', '#1e1b4b']} style={[styles.container, { paddingTop: SAFE_TOP }]}>
            <View style={styles.header}>
                <Text style={styles.title}>FOLK DRIVE</Text>
                <Text style={[styles.subtitle, isPhone && { fontSize: normalize(8) }]}>PREMIUM STUDIO DHOLAK • DEEP TEAK & GOATSKIN</Text>
            </View>

            <Animated.View style={[styles.dholakFrame, { transform: [{ translateX: barrelShake }], height: bassPlateSize * 1.5 }]}>
                {/* 1. MASTER BARREL (Teak Wood) */}
                <View style={[styles.barrelResonator, { width: barrelWidth, height: barrelHeight }]}>
                    <LinearGradient colors={['#451a03', '#92400e', '#7c2d12', '#92400e', '#451a03']} style={[styles.teakShell, { borderRadius: barrelWidth * 0.3 }]}>
                        <View style={styles.shellGrain} />
                        <View style={styles.shellGloss} />
                        
                        {/* Woven Rope System (Structural Bond) */}
                        <View style={styles.ropeNetwork}>
                            {Array.from({ length: 14 }).map((_, i) => (
                                <View key={i} style={[styles.ropeLine, { top: 18 + (i * 12) }]} />
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. DUAL HEADS (Aligned to Barrel) */}
                <View style={styles.headsLayout}>
                    {/* Bass Head (Left) */}
                    <View style={styles.headColumn}>
                        <Animated.View style={[styles.headPlate, styles.bassPlate, { transform: [{ scale: leftScale }], width: bassPlateSize, height: bassPlateSize, borderRadius: bassPlateSize / 2 }]}>
                            <View style={[styles.pardaRing, { borderRadius: bassPlateSize / 2 }]} />
                            <TouchableOpacity style={styles.hitSurface} onPress={() => playSound('dha', 'left')} activeOpacity={0.9}>
                                <View style={styles.skinTexture} />
                                <Text style={[styles.hitLabel, { marginTop: bassPlateSize * 0.22 }]}>DHA</Text>
                            </TouchableOpacity>
                        </Animated.View>
                        <Text style={styles.labelSub}>RESONANT BASS</Text>
                    </View>

                    {/* Treble Head (Right) */}
                    <View style={styles.headColumn}>
                        <Animated.View style={[styles.headPlate, styles.treblePlate, { transform: [{ scale: rightScale }], width: treblePlateSize, height: treblePlateSize, borderRadius: treblePlateSize / 2 }]}>
                            <View style={[styles.pardaRing, { borderRadius: treblePlateSize / 2 }]} />
                            <TouchableOpacity style={styles.hitSurface} onPress={() => playSound('ta', 'right')} activeOpacity={0.9}>
                                <View style={styles.skinTexture} />
                                <View style={styles.masalaPatch} />
                                <Text style={[styles.hitLabel, { marginTop: treblePlateSize * 0.22 }]}>TA</Text>
                            </TouchableOpacity>
                        </Animated.View>
                        <Text style={styles.labelSub}>TREBLE SNAP</Text>
                    </View>
                </View>
            </Animated.View>

            <View style={styles.bolTray}>
                <TouchableOpacity style={styles.bolLink} onPress={() => playSound('ge', 'left')}>
                    <LinearGradient colors={['#b45309', '#78350f']} style={styles.bolBtn}>
                        <Text style={styles.bolLabel}>GE</Text>
                    </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bolLink} onPress={() => playSound('na', 'right')}>
                    <LinearGradient colors={['#b45309', '#78350f']} style={styles.bolBtn}>
                        <Text style={styles.bolLabel}>NA</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={[styles.footer, { bottom: SAFE_BOTTOM + sc(20) }]}>
                <View style={styles.decorLine} />
                <Text style={[styles.instruction, isPhone && { fontSize: normalize(8) }]}>DUAL-ZONE MASALA HEADS • ADAPTIVE DYNAMIC SENSITIVITY</Text>
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
        paddingVertical: sc(30),
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.9 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(20),
    },
    title: {
        color: '#fff',
        fontSize: normalize(20),
        fontWeight: '900',
        letterSpacing: 4,
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }),
    },
    subtitle: {
        color: '#fbbf24',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: sc(4),
        opacity: 0.7,
    },
    dholakFrame: {
        flexDirection: 'row',
        alignItems: 'center',
        height: sc(280),
        width: '90%',
        justifyContent: 'center',
    },
    barrelResonator: {
        width: sc(160),
        height: sc(180),
        position: 'absolute',
        zIndex: 1,
    },
    teakShell: {
        flex: 1,
        borderRadius: sc(50),
        borderWidth: 3,
        borderColor: '#451a03',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: sc(30) }),
    },
    shellGrain: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
        backgroundColor: '#000',
    },
    shellGloss: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    ropeNetwork: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    ropeLine: {
        width: '100%',
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.12)',
    },
    headsLayout: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    headColumn: {
        alignItems: 'center',
    },
    headPlate: {
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(20), offsetY: 10 }),
    },
    bassPlate: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    treblePlate: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pardaRing: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: sc(12),
        borderColor: 'rgba(0,0,0,0.5)',
    },
    hitSurface: {
        width: '88%',
        height: '88%',
        borderRadius: sc(90),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fef3c7',
        borderWidth: 2,
        borderColor: '#d7ccc8',
    },
    skinTexture: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: '#8d6e63',
    },
    masalaPatch: {
        width: sc(35),
        height: sc(35),
        borderRadius: sc(17.5),
        backgroundColor: 'rgba(23,23,23,0.85)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    hitLabel: { color: 'rgba(69, 26, 3, 0.4)', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2, marginTop: sc(40) },
    labelSub: { color: '#92400e', fontSize: normalize(10), fontWeight: '900', marginTop: sc(15), letterSpacing: 2 },
    bolTray: { flexDirection: 'row', gap: sc(25), marginTop: sc(40) },
    bolLink: { width: sc(85), height: sc(45), borderRadius: sc(12), ...createShadow({ color: '#000', radius: sc(8) }) },
    bolBtn: { flex: 1, borderRadius: sc(12), justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#b45309' },
    bolLabel: { color: '#fbbf24', fontSize: normalize(14), fontWeight: '900', letterSpacing: 3 },
    footer: { position: 'absolute', width: '100%', alignItems: 'center' },
    decorLine: { width: '60%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: sc(12) },
    instruction: { color: '#475569', fontSize: normalize(10), fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
});
