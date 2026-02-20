import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';

export default function Tabla() {
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    const [activeHit, setActiveHit] = useState(null);
    const { tracks } = useProject();

    // Impact scaling
    const dayanScale = useRef(new Animated.Value(1)).current;
    const bayanScale = useRef(new Animated.Value(1)).current;

    // Adaptive sizes
    const bayanSize = Math.min(width * 0.45, sc(260));
    const dayanSize = bayanSize * 0.85;
    const gapSize = isPhone ? sc(20) : sc(60);
    const dayanGlow = useRef(new Animated.Value(0)).current;
    const bayanGlow = useRef(new Animated.Value(0)).current;
    const hitTimeoutRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hitTimeoutRef.current) clearTimeout(hitTimeoutRef.current);
        };
    }, []);

    const track = tracks.find(t => t.name === 'Tabla') || { volume: 0.8, pan: 0, muted: false };

    const playSound = (soundName, drum) => {
        if (track.muted) return;
        UnifiedAudioEngine.activateAudio();
        setActiveHit(soundName);
        const scale = drum === 'dayan' ? dayanScale : bayanScale;
        const glow = drum === 'dayan' ? dayanGlow : bayanGlow;

        scale.setValue(0.96);
        glow.setValue(1);
        
        Animated.parallel([
            Animated.spring(scale, { toValue: 1, friction: 3, tension: 45, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(glow, { toValue: 0, duration: 250, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        if (hitTimeoutRef.current) clearTimeout(hitTimeoutRef.current);
        hitTimeoutRef.current = setTimeout(() => {
            setActiveHit(null);
            hitTimeoutRef.current = null;
        }, 150);
        UnifiedAudioEngine.playDrumSound(soundName, 'tabla', track.volume, track.pan);
    };

    return (
        <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={[styles.container, { paddingTop: SAFE_TOP }]}>
            <View style={styles.header}>
                <Text style={styles.brandTitle}>SOLOCRAFT CLASSIC</Text>
                <Text style={[styles.modelTitle, isPhone && { fontSize: normalize(18) }]}>MAHARAJA CONCERT TABLA</Text>
            </View>

            <View style={[styles.tablaSet, { gap: gapSize }]}>
                {/* 1. BAYAN (Bass Drum - Copper Body) */}
                <View style={styles.drumCol}>
                    <Animated.View style={[styles.glowRing, { opacity: bayanGlow, borderColor: '#fbbf24' }]} />
                    <Animated.View style={{ transform: [{ scale: bayanScale }] }}>
                        <TouchableOpacity 
                            activeOpacity={0.9} 
                            onPressIn={() => playSound('bayan_ga', 'bayan')}
                            style={[styles.bayanPot, { width: bayanSize, height: bayanSize, borderRadius: bayanSize / 2 }]}
                        >
                            <LinearGradient colors={['#92400e', '#78350f', '#451a03']} style={styles.copperSurface} />
                            <View style={styles.leatherStraps}>
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <View key={i} style={[styles.strap, { transform: [{ rotate: `${i * 22.5}deg` }] }]} />
                                ))}
                            </View>
                            <View style={styles.skinAssembly}>
                                <TouchableOpacity style={styles.maidan} onPress={() => playSound('ge', 'bayan')} activeOpacity={0.9}>
                                    <View style={styles.parchmentGrain} />
                                    <Text style={styles.bolLabel}>GE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.syahi} onPress={() => playSound('ke', 'bayan')} activeOpacity={0.9}>
                                    <LinearGradient colors={['#171717', '#000', '#171717']} style={styles.syahiInner} />
                                    <Text style={styles.bolLabelSyahi}>KE</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                    <Text style={styles.partLabel}>CHROME COPPER BAYAN</Text>
                </View>

                {/* 2. DAYAN (Treble Drum - Sheesham Wood) */}
                <View style={[styles.drumCol, { width: dayanSize, height: dayanSize }]}>
                    <Animated.View style={[styles.glowRing, { opacity: dayanGlow, borderColor: '#3b82f6', width: dayanSize * 1.05, height: dayanSize * 1.05, borderRadius: (dayanSize * 1.05) / 2 }]} />
                    <Animated.View style={{ transform: [{ scale: dayanScale }] }}>
                        <TouchableOpacity 
                            activeOpacity={0.9} 
                            onPressIn={() => playSound('dayan_na', 'dayan')}
                            style={[styles.dayanPot, { width: dayanSize, height: dayanSize, borderRadius: dayanSize / 2 }]}
                        >
                            <LinearGradient colors={['#451a03', '#78350f', '#451a03']} style={styles.woodSurface} />
                            <View style={styles.gatteRing}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <View key={i} style={[styles.gatteBlock, { transform: [{ rotate: `${i * 45}deg` }, { translateY: dayanSize * 0.43 }] }]} />
                                ))}
                            </View>
                            <View style={styles.skinAssemblyDayan}>
                                <TouchableOpacity style={styles.kinar} onPress={() => playSound('na', 'dayan')} activeOpacity={0.9}>
                                    <View style={styles.parchmentGrain} />
                                    <View style={[styles.parchmentSkin, { borderRadius: (dayanSize * 0.8) / 2 }]} />
                                    <Text style={styles.bolLabelDayan}>NA</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.maidanDayan} onPress={() => playSound('tin', 'dayan')} activeOpacity={0.9}>
                                    <Text style={styles.bolLabelDayan}>TIN</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.syahiDayan} onPress={() => playSound('te', 'dayan')} activeOpacity={0.9}>
                                    <LinearGradient colors={['#171717', '#000', '#171717']} style={styles.syahiInner} />
                                    <Text style={styles.bolLabelSyahi}>TE</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                    <Text style={styles.partLabel}>DARK SHEESHAM DAYAN</Text>
                </View>
            </View>

            <View style={styles.bolGrid}>
                {['tun', 'kat'].map(bol => (
                    <TouchableOpacity key={bol} style={styles.bolAnchor} onPress={() => playSound(bol, bol === 'kat' ? 'bayan' : 'dayan')}>
                        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.bolCapsule}>
                            <Text style={styles.bolText}>{bol}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <View style={styles.guide}>
                    <View style={styles.line} />
                    <Text style={styles.guideText}>TAP SYAHI OR MAIDAN FOR PITCHED BOLS • PRO EDITION</Text>
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
        paddingVertical: sc(30),
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.9 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(30),
    },
    brandTitle: {
        color: '#fff',
        fontSize: normalize(20),
        fontWeight: '900',
        letterSpacing: 4,
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }),
    },
    modelTitle: {
        color: '#fbbf24',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: sc(4),
        opacity: 0.6,
    },
    tablaSet: {
        flexDirection: 'row',
        gap: sc(60),
        alignItems: 'center',
        paddingHorizontal: sc(40),
    },
    drumCol: {
        alignItems: 'center',
        position: 'relative',
    },
    glowRing: {
        position: 'absolute',
        top: sc(-10),
        width: sc(270),
        height: sc(270),
        borderRadius: sc(135),
        borderWidth: 1.5,
    },
    bayanPot: {
        backgroundColor: '#b0bec5',
        borderWidth: 4,
        borderColor: '#455a64',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(30), offsetY: 15 }),
    },
    dayanPot: {
        backgroundColor: '#5d4037',
        borderWidth: 4,
        borderColor: '#3e2723',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(25), offsetY: 15 }),
    },
    copperSurface: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: sc(130),
        borderWidth: 4,
    },
    woodSurface: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: sc(110),
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    leatherStraps: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    strap: {
        position: 'absolute',
        width: sc(2),
        height: sc(290),
        backgroundColor: '#2d1b10',
        opacity: 0.8,
    },
    gatteRing: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    gatteBlock: {
        position: 'absolute',
        width: sc(14),
        height: sc(35),
        backgroundColor: '#1a0d06',
        borderRadius: sc(4),
        borderWidth: 1.5,
        borderColor: '#000',
    },
    skinAssembly: {
        width: '85%',
        height: '85%',
        borderRadius: sc(110),
        backgroundColor: '#fef3c7',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#d7ccc8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    skinAssemblyDayan: {
        width: '82%',
        height: '82%',
        backgroundColor: '#fef3c7',
        overflow: 'hidden',
        borderWidth: 3,
        borderColor: '#d7ccc8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    parchmentGrain: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: '#8d6e63',
    },
    parchmentSkin: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fef3c7',
        opacity: 0.1,
    },
    maidan: {
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: sc(40),
    },
    syahi: {
        position: 'absolute',
        width: sc(110),
        height: sc(110),
        bottom: sc(20),
        right: sc(20),
        borderRadius: sc(55),
        borderWidth: 4,
        borderColor: '#000',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(10) }),
    },
    kinar: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: sc(90),
        borderWidth: sc(25),
        borderColor: '#fff',
        zIndex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: sc(5),
    },
    maidanDayan: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
    },
    syahiDayan: {
        position: 'absolute',
        width: sc(100),
        height: sc(100),
        borderRadius: sc(50),
        borderWidth: 4,
        borderColor: '#000',
        zIndex: 2,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    syahiInner: { ...StyleSheet.absoluteFillObject },
    bolLabel: { color: '#92400e', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2 },
    bolLabelDayan: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2 },
    bolLabelSyahi: { color: 'rgba(255,255,255,0.4)', fontSize: normalize(12), fontWeight: '900' },
    partLabel: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', marginTop: sc(30), letterSpacing: 2 },
    bolGrid: { flexDirection: 'row', gap: sc(20), marginTop: sc(40) },
    bolAnchor: { width: sc(90), height: sc(45), borderRadius: sc(12), ...createShadow({ color: '#000', radius: sc(8) }) },
    bolCapsule: { flex: 1, borderRadius: sc(12), justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#334155' },
    bolText: { color: '#fff', fontSize: normalize(14), fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' },
    footer: { marginTop: sc(30), width: '100%', alignItems: 'center' },
    guide: { alignItems: 'center', width: '100%' },
    line: { width: '60%', height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: sc(10) },
    guideText: { color: '#475569', fontSize: normalize(10), fontWeight: '900', letterSpacing: 1.5 },
});
