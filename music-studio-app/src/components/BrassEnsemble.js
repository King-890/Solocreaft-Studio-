import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';

import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const BRASS_SECTIONS = [
    { id: 'trumpets', label: 'TRUMPETS', note: 'C4', color: '#fbbf24', flex: 1 },
    { id: 'horns', label: 'FRENCH HORNS', note: 'E3', color: '#f59e0b', flex: 1.2 },
    { id: 'trombones', label: 'TROMBONES', note: 'G2', color: '#d97706', flex: 1.3 },
    { id: 'tuba', label: 'TUBA', note: 'C2', color: '#b45309', flex: 1.5 },
];

export default function BrassEnsemble({ instrument = 'brass' }) {
    const [activeSection, setActiveSection] = useState(null);
    
    // Mechanical swell animations
    const swellAnims = useRef(BRASS_SECTIONS.reduce((acc, s) => {
        acc[s.id] = new Animated.Value(0);
        return acc;
    }, {})).current;

    // Assuming handleNotePress is a new function to be added,
    // and the subsequent lines in the instruction were meant to be part of playSection.
    // The instruction specifically asks to add activateAudio() to handleNotePress.
    // The `setActiveNotes` state variable is not defined in the original code,
    // so it's commented out to avoid errors. If it's intended to be added,
    // it should be defined with `useState`.
    const playSection = useCallback((section) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(section.note, instrument, 0, 0.9);
        setActiveSection(section.id);

        Animated.sequence([
            Animated.timing(swellAnims[section.id], { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(swellAnims[section.id], { toValue: 0, duration: 400, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        setTimeout(() => setActiveSection(null), 500);
    }, []);

    return (
        <LinearGradient colors={['#1a0d06', '#2d1b10', '#1a0d06']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>SYMPHONIC BRASS</Text>
                <Text style={styles.subtitle}>MASTERCLASS ENSEMBLE • BURNISHED GOLD SECTION</Text>
            </View>

            <View style={styles.orchestralV}>
                {BRASS_SECTIONS.map((section, idx) => {
                    const isActive = activeSection === section.id;
                    const scale = swellAnims[section.id].interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
                    const glow = swellAnims[section.id].interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] });

                    return (
                        <Animated.View key={section.id} style={[styles.sectionWrapper, { flex: section.flex, transform: [{ scale }] }]}>
                            <TouchableOpacity activeOpacity={1} onPress={() => playSection(section)} style={styles.sectionTouch}>
                                <LinearGradient
                                    colors={isActive ? ['#fbbf24', '#f59e0b', '#d97706'] : ['#92400e', '#78350f', '#451a03']}
                                    style={styles.brassBox}
                                >
                                    <View style={styles.metallicGlitter} />
                                    <View style={styles.brushedShine} />
                                    <Animated.View style={[styles.activeGlow, { opacity: glow, backgroundColor: section.color }]} />
                                    
                                    <View style={styles.labelZone}>
                                        <Text style={[styles.sectionLabel, isActive && { color: '#fff' }]}>{section.label}</Text>
                                        <View style={[styles.mechanicalValve, { backgroundColor: isActive ? '#fff' : 'rgba(0,0,0,0.3)' }]} />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <View style={styles.symphonicBadge}>
                    <Text style={styles.badgeText}>ORCHESTRAL SWELL DYNAMICS ACTIVE • 32-BIT HIGH-MASS TIMBRE</Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 40,
        margin: 5,
        padding: sc(20),
        ...createShadow({ color: '#000', radius: 45, opacity: 0.9 }),
    },
    header: { alignItems: 'center', marginBottom: sc(25) },
    title: { color: '#fbbf24', fontSize: normalize(18), fontWeight: '900', letterSpacing: 6, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 15 }) },
    subtitle: { color: '#94a3b8', fontSize: normalize(9), fontWeight: '900', marginTop: 6, letterSpacing: 2, opacity: 0.7 },
    orchestralV: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: sc(15),
        gap: sc(10),
    },
    sectionWrapper: { height: '85%', minWidth: sc(70) },
    sectionTouch: { flex: 1 },
    brassBox: { flex: 1, borderRadius: 15, borderWidth: 2, borderColor: '#451a03', padding: sc(12), justifyContent: 'flex-end', overflow: 'hidden' },
    metallicGlitter: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.03)' },
    brushedShine: { position: 'absolute', top: 0, left: '10%', width: '30%', height: '100%', backgroundColor: 'rgba(255,255,255,0.08)', transform: [{ skewX: '-20deg' }] },
    activeGlow: { ...StyleSheet.absoluteFillObject },
    labelZone: { alignItems: 'center', gap: 8 },
    sectionLabel: { color: 'rgba(255,252,243,0.5)', fontSize: normalize(10), fontWeight: '900', letterSpacing: 1.2, textAlign: 'center' },
    mechanicalValve: { width: 10, height: 10, borderRadius: 5, borderWidth: 1, borderColor: '#1a0d06' },
    footer: { marginTop: sc(20), alignItems: 'center' },
    symphonicBadge: { backgroundColor: 'rgba(251,191,36,0.04)', paddingHorizontal: sc(20), paddingVertical: sc(8), borderRadius: 20, borderWidth: 1, borderColor: 'rgba(251,191,36,0.15)' },
    badgeText: { color: '#475569', fontSize: normalize(8), fontWeight: '900', letterSpacing: 2 },
});
