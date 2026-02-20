import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';

import { sc, normalize, useResponsive } from '../utils/responsive';

const RIGHT_KEYS = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5', 'F5', 'G5'];
const LEFT_CHORDS = ['C', 'G', 'D', 'A', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'B', 'E'];

export default function Accordion() {
    const { isPhone, SCREEN_HEIGHT, SCREEN_WIDTH, sc, normalize, contain, isLandscape, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    const [activeRight, setActiveRight] = useState({});
    const [activeLeft, setActiveLeft] = useState({});
    const bellowsScale = useRef(new Animated.Value(1)).current;

    // [ADAPTIVE] Board dimensions to avoid overflow
    const boardHeight = isPhone && isLandscape ? SCREEN_HEIGHT * 0.55 : sc(350);
    const bassWidth = contain(140, 0.25);
    const trebleWidth = contain(180, 0.35);

    const animateBellows = (type) => {
        Animated.sequence([
            Animated.timing(bellowsScale, { toValue: type === 'squeeze' ? 1.08 : 0.92, duration: 80, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(bellowsScale, { toValue: 1, duration: 150, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
    };

    const rightTimeoutRef = useRef(null);
    const leftTimeoutRef = useRef(null);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
            if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
        };
    }, []);

    const playRightKey = useCallback((note) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(note, 'accordion', 0, 0.75);
        setActiveRight(prev => ({ ...prev, [note]: true }));
        animateBellows('squeeze');
        
        if (rightTimeoutRef.current) clearTimeout(rightTimeoutRef.current);
        rightTimeoutRef.current = setTimeout(() => {
            setActiveRight(prev => ({ ...prev, [note]: false }));
            rightTimeoutRef.current = null;
        }, 150);
    }, []);

    const playLeftChord = useCallback((chord) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(`${chord}3`, 'accordion', 0, 0.65);
        setActiveLeft(prev => ({ ...prev, [chord]: true }));
        animateBellows('expand');

        if (leftTimeoutRef.current) clearTimeout(leftTimeoutRef.current);
        leftTimeoutRef.current = setTimeout(() => {
            setActiveLeft(prev => ({ ...prev, [chord]: false }));
            leftTimeoutRef.current = null;
        }, 150);
    }, []);

    return (
        <LinearGradient colors={['#1e1b4b', '#312e81', '#1e1b4b']} style={[styles.container, { paddingTop: SAFE_TOP }]}>
            <View style={styles.header}>
                <Text style={[styles.title, isPhone && { fontSize: normalize(16) }]}>ALPINE RESONANCE</Text>
                <Text style={[styles.subtitle, isPhone && { fontSize: normalize(8) }]}>MASTERCLASS CONCERT ACCORDION • PEARLOID MAHOGANY</Text>
            </View>

            <View style={styles.accordionFrame}>
                {/* 1. LEFT BUTTON BOARD (Bass) */}
                <View style={[styles.bassBoard, { width: bassWidth, height: boardHeight }]}>
                    <LinearGradient colors={['#3e2723', '#5d4037', '#3e2723']} style={styles.mahoganyFrame}>
                        <View style={styles.pearloidInlay} />
                        <View style={styles.buttonsPanel}>
                            {LEFT_CHORDS.map((chord) => (
                                <TouchableOpacity key={chord} style={[styles.bassAnchor, { width: sc(32), height: sc(32) }, activeLeft[chord] && styles.activeBass]} onPressIn={() => playLeftChord(chord)}>
                                    <LinearGradient colors={activeLeft[chord] ? ['#3b82f6', '#1d4ed8'] : ['#f8fafc', '#cbd5e1']} style={styles.bassKey}>
                                        <Text style={[styles.chordText, activeLeft[chord] && { color: '#fff' }]}>{chord}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. CONCERT BELLOWS (Central) */}
                <Animated.View style={[styles.bellowsChain, { transform: [{ scaleX: bellowsScale }] }]}>
                    {Array.from({ length: isPhone ? 8 : 12 }).map((_, i) => (
                        <View key={i} style={styles.bellowFold}>
                            <LinearGradient colors={['#7f1d1d', '#991b1b', '#7f1d1d']} style={styles.leatherFold}>
                                <View style={styles.foldSteel} />
                            </LinearGradient>
                        </View>
                    ))}
                </Animated.View>

                {/* 3. RIGHT KEYBOARD (Treble) */}
                <View style={[styles.trebleBoard, { width: trebleWidth, height: boardHeight }]}>
                    <LinearGradient colors={['#3e2723', '#5d4037', '#3e2723']} style={styles.mahoganyFrame}>
                        <View style={styles.pearloidInlay} />
                        <View style={styles.keysPanel}>
                            {RIGHT_KEYS.map((note) => (
                                <TouchableOpacity key={note} style={[styles.pianoKeyLink, activeRight[note] && styles.activePiano]} onPressIn={() => playRightKey(note)}>
                                    <LinearGradient colors={activeRight[note] ? ['#3b82f6', '#1d4ed8'] : ['#fffaf0', '#f8fafc']} style={styles.ivoryKey}>
                                        <View style={styles.ivoryShine} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </LinearGradient>
                </View>
            </View>

            <View style={[styles.footer, { marginBottom: SAFE_BOTTOM }]}>
                <View style={styles.airflowMonitor}>
                    <Text style={styles.airflowText}>CONCERT-PITCH REED ARRAY ACTIVE • BELLOWS PRESSURE SYNCED</Text>
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
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: 45, opacity: 0.95 }),
    },
    header: { alignItems: 'center', marginVertical: sc(10) },
    title: { color: '#fff', fontSize: normalize(20), fontWeight: '900', letterSpacing: 6, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }) },
    subtitle: { color: '#fbbf24', fontSize: normalize(9), fontWeight: '900', letterSpacing: 2, marginTop: 4, opacity: 0.7 },
    accordionFrame: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: sc(10),
    },
    bassBoard: { zIndex: 10 },
    trebleBoard: { zIndex: 10 },
    mahoganyFrame: {
        flex: 1,
        borderRadius: 15,
        borderWidth: 4,
        borderColor: '#1a0d06',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: 15 }),
    },
    pearloidInlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)', opacity: 0.1, zIndex: 1 },
    buttonsPanel: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: sc(5), padding: sc(5), zIndex: 5 },
    bassAnchor: { borderRadius: 100, backgroundColor: '#000', padding: 2, ...createShadow({ color: '#000', radius: 6, offsetY: 3 }) },
    activeBass: { transform: [{ scale: 0.9 }] },
    bassKey: { flex: 1, borderRadius: 100, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
    chordText: { fontSize: normalize(10), fontWeight: '900', color: '#1e293b' },
    bellowsChain: { flex: 1, height: '80%', flexDirection: 'row', zIndex: 5, marginHorizontal: sc(-8), ...createShadow({ color: '#000', radius: 25 }) },
    bellowFold: { flex: 1, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderColor: 'rgba(0,0,0,0.9)' },
    leatherFold: { flex: 1, alignItems: 'center' },
    foldSteel: { width: 3, height: '85%', backgroundColor: 'rgba(255,255,255,0.1)', marginTop: '7%', borderRadius: 2 },
    keysPanel: { flex: 1, paddingVertical: sc(10), paddingHorizontal: sc(10), justifyContent: 'space-around', zIndex: 5 },
    pianoKeyLink: { height: sc(18), backgroundColor: '#000', borderRadius: 4, padding: 1 },
    activePiano: { transform: [{ scale: 0.96 }] },
    ivoryKey: { flex: 1, borderRadius: 3, borderWidth: 1, borderColor: '#fff' },
    ivoryShine: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.05)' },
    footer: { marginTop: sc(10), width: '100%', alignItems: 'center' },
    airflowMonitor: { backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: sc(20), paddingVertical: sc(6), borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    airflowText: { color: '#64748b', fontSize: normalize(9), fontWeight: '900', letterSpacing: 2 },
});
