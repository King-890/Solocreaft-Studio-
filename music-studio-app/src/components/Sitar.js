import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';

import { sc, normalize, useResponsive } from '../utils/responsive';

const STRINGS = ['Ma', 'Sa', 'Pa', 'Sa_low'];
const NOTE_MAP = {
    'Ma': ['F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4'],
    'Sa': ['C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3'],
    'Pa': ['G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3'],
    'Sa_low': ['C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2'],
};

export default function Sitar({ instrument = 'sitar' }) {
    const { isLandscape, isPhone } = useResponsive();
    const [activeFret, setActiveFret] = useState([0, 0, 0, 0]);
    const [activeStrings, setActiveStrings] = useState([false, false, false, false]);
    
    const vibrationAnims = useRef(STRINGS.map(() => new Animated.Value(0))).current;
    const stringTimeoutsRef = useRef({});

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(stringTimeoutsRef.current).forEach(clearTimeout);
        };
    }, []);

    const playString = useCallback((stringIndex, velocity = 0.6, explicitFret = null) => {
        UnifiedAudioEngine.activateAudio();
        const stringName = STRINGS[stringIndex];
        // [REFINEMENT] Use explicitFret if provided to avoid stale closure state
        const fret = explicitFret !== null ? explicitFret : activeFret[stringIndex];
        const note = NOTE_MAP[stringName][fret];
        
        if (note) {
            UnifiedAudioEngine.playSound(note, instrument, 0, velocity);
            setActiveStrings(prev => {
                const next = [...prev];
                next[stringIndex] = true;
                return next;
            });

            vibrationAnims[stringIndex].setValue(1);
            Animated.sequence([
                Animated.timing(vibrationAnims[stringIndex], { toValue: -1, duration: 40, useNativeDriver: Platform.OS !== 'web' }),
                Animated.spring(vibrationAnims[stringIndex], { toValue: 0, friction: 3, tension: 40, useNativeDriver: Platform.OS !== 'web' })
            ]).start();
            
            if (stringTimeoutsRef.current[stringIndex]) {
                clearTimeout(stringTimeoutsRef.current[stringIndex]);
            }

            stringTimeoutsRef.current[stringIndex] = setTimeout(() => {
                setActiveStrings(prev => {
                    const next = [...prev];
                    next[stringIndex] = false;
                    return next;
                });
                delete stringTimeoutsRef.current[stringIndex];
            }, 400);
        }
    }, [activeFret, instrument]);

    const handleFretPress = (stringIndex, fretIndex) => {
        setActiveFret(prev => {
            const next = [...prev];
            next[stringIndex] = fretIndex;
            return next;
        });
        // [REFINEMENT] Pass fretIndex directly to playString to ensure immediate sound feedback
        playString(stringIndex, 0.6, fretIndex);
    };

    return (
        <LinearGradient
            colors={['#1a0d06', '#2d1b10', '#1a0d06']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>{instrument === 'veena' ? 'DIVINE VIBRATION' : 'MYSTICAL RESONANCE'}</Text>
                <Text style={styles.subtitle}>CONCERT {instrument.toUpperCase()} PRO • MAHOGANY & IVORY</Text>
            </View>

            <View style={[styles.sitarFrame, { justifyContent: 'center' }]}>
                {/* 1. MASTER DANDI (Neck) */}
                <View style={styles.masterDandi}>
                    <LinearGradient
                        colors={['#3e2723', '#5d4037', '#3e2723']}
                        style={styles.woodNeck}
                    >
                        <View style={styles.woodGrain} />
                    </LinearGradient>
                    
                    <View style={styles.pardasLayer}>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((fret) => (
                            <View key={fret} style={styles.pardaAssembly}>
                                <LinearGradient colors={['#e5e7eb', '#9ca3af', '#e5e7eb']} style={styles.brassParda} />
                                <View style={styles.pardaShadow} />
                                <View style={styles.pardaTouchRow}>
                                    {STRINGS.map((_, sIdx) => (
                                        <TouchableOpacity
                                            key={`${fret}-${sIdx}`}
                                            style={[styles.pardaZone, activeFret[sIdx] === fret && styles.activePardaZone]}
                                            onPress={() => handleFretPress(sIdx, fret)}
                                            activeOpacity={0.7}
                                        >
                                            {activeFret[sIdx] === fret && <View style={styles.pardaGlow} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 2. MASTER TUMBA (Body) */}
                <View style={styles.tumbaWrapper}>
                    <LinearGradient
                        colors={['#451a03', '#78350f', '#451a03']}
                        style={styles.polishedGourd}
                    >
                        <View style={styles.gourdShine} />
                        <View style={styles.ivoryInlay}>
                            <View style={styles.floralMedallion}>
                                <View style={styles.ivoryPetal} />
                            </View>
                        </View>
                        <View style={styles.tabkhiBridge}>
                            <LinearGradient colors={['#f8fafc', '#cbd5e1', '#f8fafc']} style={styles.ivoryBase} />
                            <View style={styles.bridgeShadow} />
                        </View>
                    </LinearGradient>
                </View>

                {/* 3. SYNCHRONIZED SITAR STRINGS */}
                <View style={[styles.stringsOverlay, { left: 0 }]} pointerEvents="none">
                    {STRINGS.map((_, i) => (
                        <Animated.View 
                            key={i} 
                            style={[
                                styles.mysticalString, 
                                { 
                                    // Align strings with the neck. Neck is 120 wide. Strings need to spread across it.
                                    // If frame is centered, we need to calculate offset relative to the Neck.
                                    // Since stringsOverlay is absoluteFill of sitarFrame, and Neck is the first child...
                                    // We need to account for paddingHorizontal: sc(15) of sitarFrame.
                                    left: sc(15) + sc(20) + (i * sc(25)), // sc(15) padding + sc(20) margin/inset
                                    backgroundColor: activeStrings[i] ? '#fff' : '#fcd34d',
                                    width: 1.2 + (i * 0.4),
                                    transform: [{ 
                                        translateX: vibrationAnims[i].interpolate({
                                            inputRange: [-1, 1],
                                            outputRange: [-2.5, 2.5]
                                        }) 
                                    }]
                                }
                            ]} 
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.indicatorContainer}>
                    <LinearGradient
                        colors={['transparent', '#fcd34d', 'transparent']}
                        style={styles.indicatorLine}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    />
                    <Text style={styles.instruction}>TAP PARDAS FOR MYSTICAL PLUCKS • PRO SERIES</Text>
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
        paddingVertical: sc(20),
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.85 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(15),
    },
    title: {
        color: '#fcd34d',
        fontSize: normalize(18),
        fontWeight: '900',
        letterSpacing: 6,
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 12 }),
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: sc(4),
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    sitarFrame: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        paddingHorizontal: sc(15),
    },
    masterDandi: {
        width: sc(120),
        height: '95%',
        position: 'relative',
        zIndex: 5,
    },
    woodNeck: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: sc(15),
        borderWidth: 2,
        borderColor: '#451a03',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: sc(15) }),
    },
    woodGrain: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    pardasLayer: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: sc(25),
    },
    pardaAssembly: {
        height: sc(40),
        alignItems: 'center',
        justifyContent: 'center',
    },
    brassParda: {
        width: sc(110),
        height: sc(8),
        borderRadius: sc(4),
        borderWidth: 1.5,
        borderColor: '#f3f4f6',
    },
    pardaShadow: {
        position: 'absolute',
        bottom: sc(14),
        width: sc(110),
        height: sc(3),
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: sc(1),
    },
    pardaTouchRow: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: sc(15),
    },
    pardaZone: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activePardaZone: {
        backgroundColor: 'rgba(252, 211, 77, 0.15)',
        borderRadius: sc(4),
    },
    pardaGlow: {
        width: sc(6),
        height: sc(6),
        borderRadius: sc(3),
        backgroundColor: '#fcd34d',
        ...createShadow({ color: '#fcd34d', radius: sc(10), opacity: 1 }),
    },
    tumbaWrapper: {
        flex: 1,
        marginLeft: sc(-30),
        height: '100%',
        justifyContent: 'center',
        zIndex: 1,
    },
    polishedGourd: {
        width: sc(220),
        height: sc(280),
        borderRadius: sc(110),
        borderWidth: 3,
        borderColor: '#451a03',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: sc(40), offsetY: 20, opacity: 0.9 }),
    },
    gourdShine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
        opacity: 0.5,
    },
    ivoryInlay: {
        position: 'absolute',
        top: '10%',
        alignItems: 'center',
    },
    floralMedallion: {
        width: sc(70),
        height: sc(70),
        borderRadius: sc(35),
        borderWidth: 2,
        borderColor: 'rgba(255,255,200,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ivoryPetal: {
        width: sc(20),
        height: sc(20),
        backgroundColor: 'rgba(255,255,240,0.1)',
        transform: [{ rotate: '45deg' }],
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    tabkhiBridge: {
        marginTop: sc(50),
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(10), offsetY: 5 }),
    },
    ivoryBase: {
        width: sc(90),
        height: sc(22),
        borderRadius: sc(6),
        borderWidth: 2,
        borderColor: '#f1f5f9',
    },
    bridgeShadow: {
        width: sc(80),
        height: sc(4),
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: sc(2),
        marginTop: sc(2),
    },
    stringsOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 20,
    },
    mysticalString: {
        position: 'absolute',
        top: '5%',
        bottom: '30%',
        borderRadius: 1,
        ...createShadow({ color: '#fcd34d', radius: sc(3), opacity: 0.4 }),
    },
    footer: {
        marginTop: sc(15),
        width: '100%',
        alignItems: 'center',
    },
    indicatorContainer: {
        alignItems: 'center',
        width: '100%',
    },
    indicatorLine: {
        width: '70%',
        height: sc(3),
        marginBottom: sc(10),
    },
    instruction: {
        color: '#fcd34d',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
