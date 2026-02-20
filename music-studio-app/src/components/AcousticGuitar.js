import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';
import GuitarString from './GuitarString';
import { GUITAR_CHORDS, STRING_COLORS, STRING_THICKNESS } from '../utils/GuitarVoicings';

const CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];

export default function AcousticGuitar({ instrument = 'guitar' }) {
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    
    const [selectedChord, setSelectedChord] = useState('C');
    const selectedChordRef = useRef('C'); // Ref to keep track of latest chord for PanResponder
    const [activeStrings, setActiveStrings] = useState(new Array(6).fill(false));
    const touchedStrings = useRef(new Set());
    const timeoutsRef = useRef({}); // Store timeout IDs by index

    // Keep selectedChordRef in sync
    useEffect(() => {
        selectedChordRef.current = selectedChord;
    }, [selectedChord]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(id => clearTimeout(id));
        };
    }, []);
    
    // Adaptive dimensioning
    const bodyWidth = Math.min(width * 0.6, sc(400));
    const bodyHeight = Math.min(SCREEN_HEIGHT * 0.8, sc(320));
    const stringHeight = bodyHeight / 6.4; // Proportional string spacing

    const playString = useCallback((index, velocity = 0.5) => {
        const currentChord = selectedChordRef.current; // Use ref for latest value
        const notes = GUITAR_CHORDS[currentChord];
        const note = notes[index];
        
        if (note) {
            UnifiedAudioEngine.playSound(note, instrument, 0, velocity);
            setActiveStrings(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            
            // Clear existing timeout for this string if any
            if (timeoutsRef.current[index]) {
                clearTimeout(timeoutsRef.current[index]);
            }

            timeoutsRef.current[index] = setTimeout(() => {
                setActiveStrings(prev => {
                    const next = [...prev];
                    next[index] = false;
                    return next;
                });
                delete timeoutsRef.current[index];
            }, 150);
        }
    }, [instrument]); // Removed selectedChord dependency as we use ref

    const processTouch = useCallback((y, velocity = 0.5) => {
        const stringIndex = Math.floor(y / stringHeight);
        if (stringIndex >= 0 && stringIndex < 6 && !touchedStrings.current.has(stringIndex)) {
            touchedStrings.current.add(stringIndex);
            const v = Math.min(Math.max(Math.abs(velocity) * 1.5, 0.4), 1.0);
            playString(stringIndex, v);
        }
    }, [playString, stringHeight]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                UnifiedAudioEngine.activateAudio();
                touchedStrings.current.clear();
                processTouch(evt.nativeEvent.locationY);
            },
            onPanResponderMove: (evt, gestureState) => {
                processTouch(evt.nativeEvent.locationY, gestureState.vy);
            },
            onPanResponderRelease: () => {
                touchedStrings.current.clear();
            }
        })
    ).current;

    const isStackView = isPhone && !isLandscape;

    return (
        <LinearGradient 
            colors={['#1a0f0a', '#2d1b10', '#0a0a0a']} 
            style={[styles.container, isStackView && { flexDirection: 'column' }, { paddingTop: SAFE_TOP }]}
        >
            {/* Chord Selection Bar */}
            <View style={[styles.sidebar, isStackView && { width: '100%', height: sc(80), borderRightWidth: 0, borderBottomWidth: 2, borderBottomColor: '#2d1b10' }]}>
                {!isPhone && <Text style={styles.sidebarHeader}>CHORD BANK</Text>}
                <View style={[styles.chordGrid, isStackView && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
                    {CHORDS.map((chord) => (
                        <TouchableOpacity
                            key={chord}
                            style={[styles.chordButton, selectedChord === chord && styles.chordButtonActive, isStackView && { width: sc(60), height: sc(32) }]}
                            onPress={() => setSelectedChord(chord)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={selectedChord === chord ? ['#fef3c7', '#fbbf24', '#f59e0b'] : ['#451a03', '#2d1b10']}
                                style={styles.chordGradient}
                            />
                            <Text style={[styles.chordText, selectedChord === chord && styles.chordTextActive, isStackView && { fontSize: normalize(12), lineHeight: sc(28) }]}>{chord}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.guitarFrame}>
                {/* 1. MASTER NECK SYSTEM */}
                {!isPhone && (
                    <View style={styles.masterNeck}>
                        <View style={styles.headstock}>
                            <LinearGradient colors={['#3e2723', '#1a0f0a']} style={styles.headstockMaterial}>
                                <Text style={styles.brandInlay}>SOLOCRAFT</Text>
                            </LinearGradient>
                            <View style={styles.tuningPegs}>
                                {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.peg} />)}
                            </View>
                        </View>
                        <LinearGradient colors={['#2d1b10', '#3e2723', '#2d1b10']} style={styles.rosewoodFretboard}>
                            {[...Array(5)].map((_, i) => <View key={i} style={styles.fretMark} />)}
                        </LinearGradient>
                    </View>
                )}

                {/* 2. PREMIUM RESONATOR BODY */}
                <View style={styles.bodyWrapper}>
                    <LinearGradient 
                        colors={['#8d6e63', '#a1887f', '#d7ccc8', '#a1887f', '#8d6e63']} 
                        style={[styles.spruceBody, { width: bodyWidth, height: bodyHeight, borderRadius: bodyHeight / 2 }]} 
                    >
                        <View style={styles.spruceGrain} />
                        <View style={styles.glossShine} />

                        {/* Artisan Rosette & Soundhole */}
                        <View style={styles.soundHoleCenter}>
                            <View style={[styles.rosette, { width: bodyHeight * 0.6, height: bodyHeight * 0.6, borderRadius: (bodyHeight * 0.6) / 2 }]}>
                                <View style={[styles.rosettePattern, { width: bodyHeight * 0.55, height: bodyHeight * 0.55, borderRadius: (bodyHeight * 0.55) / 2 }]} />
                                <View style={[styles.actualHole, { width: bodyHeight * 0.4, height: bodyHeight * 0.4, borderRadius: (bodyHeight * 0.4) / 2 }]}>
                                    <View style={styles.holeDepth} />
                                </View>
                            </View>
                        </View>

                        {/* Ebony Bridge */}
                        <View style={[styles.ebonyBridge, { height: bodyHeight * 0.5 }]}>
                            <View style={styles.bridgePinsRow}>
                                {[1, 2, 3, 4, 5, 6].map(i => <View key={i} style={styles.ivoryPin} />)}
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* 3. SYNCHRONIZED GUITAR STRINGS */}
                <View 
                    style={[styles.stringsOverlay, { paddingVertical: bodyHeight * 0.125, paddingLeft: width * 0.05 }]} 
                    {...panResponder.panHandlers}
                >
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <GuitarString
                            key={i}
                            thickness={STRING_THICKNESS[i]}
                            color={STRING_COLORS[i]}
                            active={activeStrings[i]}
                            vibrationScale={2.5}
                        />
                    ))}
                </View>
            </View>

            <View style={[styles.footer, { bottom: SAFE_BOTTOM + sc(15) }]}>
                <Text style={styles.footerLabel}>SWIPE THE STRINGS • CONCERT SPRUCE EDITION</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        borderRadius: 40,
        margin: 5,
        ...createShadow({ color: '#000', radius: 40, opacity: 0.8 }),
    },
    sidebar: {
        width: sc(120),
        backgroundColor: '#1a0f0a',
        padding: sc(10),
        zIndex: 30,
    },
    sidebarHeader: {
        color: '#fbbf24',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: sc(15),
        textAlign: 'center',
        opacity: 0.6,
    },
    chordGrid: {
        flex: 1,
        gap: sc(8),
    },
    chordButton: {
        height: sc(38),
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    chordButtonActive: {
        borderColor: '#fbbf24',
        ...createShadow({ color: '#fbbf24', radius: 8 }),
    },
    chordGradient: { ...StyleSheet.absoluteFillObject },
    chordText: {
        color: '#8d6e63',
        fontSize: normalize(14),
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: sc(34),
    },
    chordTextActive: { color: '#1a0f0a' },
    guitarFrame: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    masterNeck: {
        width: sc(120),
        height: '100%',
        backgroundColor: '#000',
        flexDirection: 'row',
    },
    headstock: {
        width: sc(60),
        height: '100%',
        paddingVertical: sc(15),
        alignItems: 'center',
    },
    headstockMaterial: {
        width: sc(45),
        height: '90%',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#1a0f0a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandInlay: {
        color: '#fbbf24',
        fontSize: normalize(7),
        fontWeight: '900',
        transform: [{ rotate: '-90deg' }],
        letterSpacing: 2,
    },
    tuningPegs: {
        position: 'absolute',
        top: sc(30),
        bottom: sc(30),
        justifyContent: 'space-between',
    },
    peg: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#9ca3af',
        borderWidth: 1.5,
        borderColor: '#4b5563',
        ...createShadow({ color: '#000', radius: 4 }),
    },
    rosewoodFretboard: {
        flex: 1,
        height: '100%',
        justifyContent: 'space-around',
        paddingVertical: sc(40),
    },
    fretMark: {
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    bodyWrapper: {
        flex: 1,
        height: '100%',
        marginLeft: sc(-30),
        justifyContent: 'center',
        zIndex: 1,
    },
    spruceBody: {
        borderWidth: 4,
        borderColor: '#3e2723',
        overflow: 'hidden',
        position: 'relative',
        ...createShadow({ color: '#000', radius: 30, offsetY: 15 }),
    },
    spruceGrain: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderLeftWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glossShine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    soundHoleCenter: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: sc(50),
    },
    rosette: {
        borderWidth: 10,
        borderColor: '#3e2723',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: 20 }),
    },
    rosettePattern: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: '#fbbf24',
        opacity: 0.3,
    },
    actualHole: {
        backgroundColor: '#000',
        overflow: 'hidden',
    },
    holeDepth: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 15,
        borderColor: 'rgba(0,0,0,0.5)',
    },
    ebonyBridge: {
        position: 'absolute',
        right: sc(30),
        width: sc(36),
        backgroundColor: '#1a0f0a',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bridgePinsRow: {
        height: sc(130),
        justifyContent: 'space-around',
    },
    ivoryPin: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#fff',
        ...createShadow({ color: '#000', radius: 2 }),
    },
    stringsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        paddingVertical: sc(40),
        paddingLeft: sc(35),
        zIndex: 20,
    },
    footer: {
        position: 'absolute',
        bottom: sc(15),
        right: sc(25),
    },
    footerLabel: {
        color: '#fbbf24',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
        opacity: 0.5,
    },
});
