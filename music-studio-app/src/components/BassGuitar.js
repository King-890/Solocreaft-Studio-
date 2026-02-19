import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';
import GuitarString from './GuitarString';

const width = SCREEN_WIDTH;

const STRINGS = ['E', 'A', 'D', 'G'];
const FRETS = 5; // Simplified for desktop/performance view
const STRING_THICKNESS = [7, 6, 5, 4];
const STRING_COLORS = ['#fbbf24', '#e5e7eb', '#e5e7eb', '#e5e7eb'];

const NOTE_MAP = {
    'E': ['E1', 'F1', 'F#1', 'G1', 'G#1', 'A1'],
    'A': ['A1', 'A#1', 'B1', 'C2', 'C#2', 'D2'],
    'D': ['D2', 'D#2', 'E2', 'F2', 'F#2', 'G2'],
    'G': ['G2', 'G#2', 'A2', 'A#2', 'B2', 'C3'],
};

export default function BassGuitar() {
    const [frettedIndex, setFrettedIndex] = useState([0, 0, 0, 0]);
    const [activeStrings, setActiveStrings] = useState([false, false, false, false]);
    const touchedStrings = useRef(new Set());

    const playString = useCallback((index, velocity = 0.5) => {
        const stringName = STRINGS[index];
        const fret = frettedIndex[index];
        const note = NOTE_MAP[stringName][fret];
        
        if (note) {
            UnifiedAudioEngine.playSound(note, 'bass', 0, velocity);
            setActiveStrings(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            setTimeout(() => {
                setActiveStrings(prev => {
                    const next = [...prev];
                    next[index] = false;
                    return next;
                });
            }, 150);
        }
    }, [frettedIndex]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                UnifiedAudioEngine.activateAudio();
                touchedStrings.current.clear();
                processPluck(evt.nativeEvent.locationY);
            },
            onPanResponderMove: (evt, gestureState) => {
                processPluck(evt.nativeEvent.locationY, gestureState.vy);
            },
            onPanResponderRelease: () => {
                touchedStrings.current.clear();
            }
        })
    ).current;

    const processPluck = (y, velocity = 0.5) => {
        const stringIndex = Math.floor(y / 70);
        if (stringIndex >= 0 && stringIndex < 4 && !touchedStrings.current.has(stringIndex)) {
            touchedStrings.current.add(stringIndex);
            const v = Math.min(Math.max(Math.abs(velocity) * 2.0, 0.4), 1.2);
            playString(stringIndex, v);
        }
    };

    return (
        <LinearGradient colors={['#0a0a0a', '#1e293b', '#0a0a0a']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.brandTitle}>SOLOCRAFT INDUSTRIAL • PRECISION BASS</Text>
                <Text style={styles.modelTitle}>SUB-BASS MK-II • SLATE & CHROME EDITION</Text>
            </View>

            <View style={styles.bassFrame}>
                {/* 1. MASTER NECK SYSTEM */}
                <View style={styles.masterNeck}>
                    <View style={styles.headstock}>
                        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.slateHead}>
                            <View style={styles.chromeLogo}>
                                <Text style={styles.logoText}>SLATE</Text>
                            </View>
                        </LinearGradient>
                        <View style={styles.tunersRow}>
                            {[1, 2, 3, 4].map(i => <View key={i} style={styles.chromeTuner} />)}
                        </View>
                    </View>
                    <LinearGradient colors={['#050505', '#1a1a1a', '#050505']} style={styles.ebonyFretboard}>
                        {[...Array(FRETS)].map((_, i) => (
                            <View key={i} style={styles.fretAssembly}>
                                <View style={styles.fretWire} />
                                <View style={styles.fretDotsRow}>
                                    {STRINGS.map((_, sIdx) => (
                                        <TouchableOpacity
                                            key={sIdx}
                                            style={[styles.fretZone, frettedIndex[sIdx] === (i+1) && styles.activeFretZone]}
                                            onPress={() => {
                                                const next = [...frettedIndex];
                                                next[sIdx] = i + 1;
                                                setFrettedIndex(next);
                                            }}
                                        >
                                            {frettedIndex[sIdx] === (i+1) && <View style={styles.neonDot} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))}
                    </LinearGradient>
                </View>

                {/* 2. INDUSTRIAL HIGH-MASS BODY */}
                <View style={styles.bodyResonator}>
                    <LinearGradient
                        colors={['#1e293b', '#334155', '#1e293b']}
                        style={styles.slateBody}
                    >
                        <View style={styles.industrialShine} />
                        
                        {/* High-Mass Pickups */}
                        <View style={styles.pickupBank}>
                            <View style={styles.jPickup}>
                                <View style={styles.poleSet}>
                                    {[1, 2, 3, 4].map(p => <View key={p} style={styles.chromePole} />)}
                                </View>
                            </View>
                        </View>

                        {/* Chrome High-Mass Bridge */}
                        <View style={styles.chromeBridge}>
                            <View style={styles.saddlesRow}>
                                {[1, 2, 3, 4].map(i => <View key={i} style={styles.chromeSaddle} />)}
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* 3. SYNCHRONIZED BASS STRINGS */}
                <View style={styles.stringsOverlay} {...panResponder.panHandlers}>
                    {STRINGS.map((_, i) => (
                        <GuitarString
                            key={i}
                            thickness={STRING_THICKNESS[i]}
                            color={STRING_COLORS[i]}
                            active={activeStrings[i]}
                            vibrationScale={3.5}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.statusPanel}>
                    <Text style={styles.indicatorText}>HIGH-MASS SUSTAIN ACTIVE • INDUSTRIAL DRIVE</Text>
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
        marginBottom: sc(20),
    },
    brandTitle: {
        color: '#fbbf24',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 4,
        opacity: 0.7,
    },
    modelTitle: {
        color: '#fff',
        fontSize: normalize(18),
        fontWeight: '900',
        letterSpacing: 1,
        marginTop: sc(4),
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }),
    },
    bassFrame: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        width: '95%',
        position: 'relative',
    },
    masterNeck: {
        width: sc(150),
        height: '100%',
        backgroundColor: '#000',
        flexDirection: 'row',
        zIndex: 5,
        ...createShadow({ color: '#000', radius: sc(15) }),
    },
    headstock: {
        width: sc(60),
        height: '100%',
        alignItems: 'center',
        paddingVertical: sc(30),
    },
    slateHead: {
        width: sc(50),
        height: '80%',
        borderRadius: sc(8),
        borderWidth: 2,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    chromeLogo: {
        transform: [{ rotate: '-90deg' }],
        borderWidth: 1,
        borderColor: '#fbbf24',
        paddingHorizontal: sc(5),
        borderRadius: sc(4),
    },
    logoText: {
        color: '#fbbf24',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
    },
    tunersRow: {
        position: 'absolute',
        top: sc(60),
        bottom: sc(60),
        justifyContent: 'space-between',
    },
    chromeTuner: {
        width: sc(14),
        height: sc(14),
        borderRadius: sc(7),
        backgroundColor: '#94a3b8',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
    },
    ebonyFretboard: {
        flex: 1,
        height: '100%',
    },
    fretAssembly: {
        flex: 1,
        borderRightWidth: 3,
        borderColor: '#334155',
        position: 'relative',
    },
    fretWire: {
        position: 'absolute',
        right: sc(-3),
        top: 0,
        bottom: 0,
        width: sc(4),
        backgroundColor: '#64748b',
        borderRadius: sc(2),
    },
    fretDotsRow: {
        flex: 1,
        justifyContent: 'space-around',
        paddingVertical: sc(10),
    },
    fretZone: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeFretZone: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: sc(4),
    },
    neonDot: {
        width: sc(6),
        height: sc(6),
        borderRadius: sc(3),
        backgroundColor: '#3b82f6',
        ...createShadow({ color: '#3b82f6', radius: sc(10) }),
    },
    bodyResonator: {
        flex: 1,
        height: '100%',
        marginLeft: sc(-30),
        justifyContent: 'center',
        zIndex: 1,
    },
    slateBody: {
        width: sc(420),
        height: sc(380),
        borderRadius: sc(120),
        borderWidth: 4,
        borderColor: '#0f172a',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: sc(40), offsetY: 20 }),
    },
    industrialShine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    pickupBank: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: sc(40),
    },
    jPickup: {
        width: sc(30),
        height: sc(220),
        backgroundColor: '#0a0a0a',
        borderRadius: sc(8),
        borderWidth: 2,
        borderColor: '#334155',
        justifyContent: 'center',
        ...createShadow({ color: '#000', radius: sc(15) }),
    },
    poleSet: {
        height: sc(180),
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    chromePole: {
        width: sc(14),
        height: sc(14),
        borderRadius: sc(7),
        backgroundColor: '#94a3b8',
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
    },
    chromeBridge: {
        position: 'absolute',
        right: sc(40),
        width: sc(50),
        height: sc(180),
        backgroundColor: '#475569',
        borderRadius: sc(10),
        borderWidth: 2,
        borderColor: '#94a3b8',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(10) }),
    },
    saddlesRow: {
        height: sc(150),
        justifyContent: 'space-around',
    },
    chromeSaddle: {
        width: sc(20),
        height: sc(12),
        backgroundColor: '#cbd5e1',
        borderRadius: sc(3),
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    stringsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        paddingVertical: sc(45),
        paddingLeft: sc(30),
        zIndex: 20,
    },
    footer: {
        marginTop: sc(20),
    },
    statusPanel: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        paddingHorizontal: sc(25),
        paddingVertical: sc(8),
        borderRadius: sc(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    indicatorText: {
        color: '#64748b',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
