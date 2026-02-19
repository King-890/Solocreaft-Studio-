import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

export default function Saxophone({ instrument = 'saxophone' }) {
    const { height } = useWindowDimensions();
    const [activeKey, setActiveKey] = useState(null);

    const handleNotePress = useCallback((note) => {
        UnifiedAudioEngine.activateAudio();
        setActiveKey(note);
        UnifiedAudioEngine.playSound(note, instrument, 0, 0.85);
    }, [instrument]);

    const handleNoteRelease = useCallback(() => {
        setActiveKey(null);
    }, []);

    return (
        <LinearGradient colors={['#1a1005', '#2c1e0a', '#1a1005']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>VINTAGE SOUL</Text>
                <Text style={styles.subtitle}>MASTERCLASS ALTO SAXOPHONE • PATINA BRASS</Text>
            </View>

            <View style={styles.saxFrame}>
                {/* 1. CURVED BODY ASSEMBLY */}
                <View style={styles.mainTubing}>
                    <LinearGradient
                        colors={['#b45309', '#fbbf24', '#f59e0b', '#fbbf24', '#b45309']}
                        style={styles.lacqueredShell}
                    >
                        <View style={styles.patinaGlow} />
                        <View style={styles.etchings}>
                            {[1, 2, 3, 4].map(i => <View key={i} style={styles.ornamentLine} />)}
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. ARTISANAL PEARL KEYS */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.keysLayout}>
                    {NOTES.map((note) => {
                        const isActive = activeKey === note;
                        return (
                            <View key={note} style={styles.keyStation}>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPressIn={() => handleNotePress(note)}
                                    onPressOut={handleNoteRelease}
                                    style={[styles.keyTouch, isActive && styles.keyEngaged]}
                                >
                                    <View style={styles.keyLever} />
                                    <LinearGradient
                                        colors={isActive ? ['#3b82f6', '#1d4ed8'] : ['#fef3c7', '#fbbf24', '#f59e0b']}
                                        style={styles.keyCup}
                                    >
                                        <View style={styles.pearlInlay}>
                                            <LinearGradient colors={['#fff', '#f1f5f9', '#e2e8f0']} style={styles.pearlFace}>
                                                <View style={styles.pearlShine} />
                                            </LinearGradient>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <Text style={[styles.keyNote, isActive && { color: '#fbbf24' }]}>{note}</Text>
                            </View>
                        );
                    })}
                </ScrollView>

                {/* 3. RESONANT BELL */}
                <View style={styles.bellRegion}>
                    <LinearGradient colors={['#92400e', '#fbbf24', '#d97706']} style={styles.altoBell}>
                        <View style={styles.bellRim} />
                        <View style={styles.bellInterior} />
                    </LinearGradient>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.reedPulse}>
                    <Text style={styles.pulseText}>AIR-REED VIBRATION SYNC ACTIVE • VINTAGE HARMONICS</Text>
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
    header: { alignItems: 'center', marginBottom: sc(30) },
    title: { color: '#fbbf24', fontSize: normalize(22), fontWeight: '900', letterSpacing: 8, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }) },
    subtitle: { color: '#94a3b8', fontSize: normalize(10), fontWeight: '900', letterSpacing: 3, marginTop: sc(4), opacity: 0.7 },
    saxFrame: {
        flex: 1,
        width: '96%',
        justifyContent: 'center',
        position: 'relative',
    },
    mainTubing: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: sc(140),
        zIndex: 1,
    },
    lacqueredShell: {
        flex: 1,
        borderRadius: sc(70),
        borderWidth: 3,
        borderColor: '#92400e',
        ...createShadow({ color: '#000', radius: sc(30) }),
    },
    patinaGlow: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.08)' },
    etchings: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', paddingLeft: sc(60), gap: sc(12) },
    ornamentLine: { width: sc(140), height: 1.5, backgroundColor: 'rgba(0,0,0,0.1)', opacity: 0.3 },
    keysLayout: { alignItems: 'center', paddingHorizontal: sc(100), gap: sc(40), zIndex: 10 },
    keyStation: { alignItems: 'center', gap: sc(20) },
    keyTouch: { alignItems: 'center', justifyContent: 'center' },
    keyEngaged: { transform: [{ scale: 0.94 }] },
    keyLever: { position: 'absolute', bottom: sc(-40), width: sc(6), height: sc(45), backgroundColor: '#d97706', borderLeftWidth: 1, borderColor: '#92400e' },
    keyCup: {
        width: sc(130),
        height: sc(130),
        borderRadius: sc(65),
        borderWidth: 3,
        borderColor: '#92400e',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(15), offsetY: 10 }),
    },
    pearlInlay: { width: '85%', height: '85%', borderRadius: sc(55), overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.1)' },
    pearlFace: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    pearlShine: { width: '70%', height: '40%', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: sc(20), marginTop: sc(-30) },
    keyNote: { color: '#fbbf24', fontSize: normalize(13), fontWeight: '900', opacity: 0.8 },
    bellRegion: { position: 'absolute', right: sc(-30), top: '10%', zIndex: 5 },
    altoBell: {
        width: sc(180),
        height: sc(240),
        borderTopLeftRadius: sc(90),
        borderBottomLeftRadius: sc(90),
        borderWidth: 4,
        borderColor: '#92400e',
        ...createShadow({ color: '#000', radius: sc(40) }),
    },
    bellRim: { ...StyleSheet.absoluteFillObject, borderLeftWidth: sc(10), borderColor: 'rgba(255,255,255,0.2)' },
    bellInterior: { position: 'absolute', right: 0, width: sc(40), height: '100%', backgroundColor: 'rgba(0,0,0,0.1)' },
    footer: { marginTop: sc(40), width: '100%', alignItems: 'center' },
    reedPulse: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: sc(30), paddingVertical: sc(10), borderRadius: sc(25), borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    pulseText: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2 },
});
