import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';

import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';

export default function Piano({ instrument = 'piano' }) {
    const { isPhone, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM, isLandscape } = useResponsive();

    // [REFINEMENT] Auto-calculate key dimensions based on screen height
    // Reducing from 0.5 to 0.45 to save more vertical space for the toolbar
    const whiteKeyHeight = Math.min(SCREEN_HEIGHT * 0.45, sc(180));
    const whiteKeyWidth = (whiteKeyHeight / 180) * 55;
    const blackKeyHeight = whiteKeyHeight * 0.6;
    const blackKeyWidth = whiteKeyWidth * 0.6;

    const [zoomLevel, setZoomLevel] = useState(isPhone ? 0.75 : 1.0); // Slightly more zoomed out on phones
    const [pressedKeys, setPressedKeys] = useState(new Set());
    const [sustain, setSustain] = useState(false);
    const pedalAnim = useRef(new Animated.Value(0)).current;

    // Use fewer octaves on very small screens to maintain touchability
    const octavesToRender = isPhone && !isLandscape ? 2 : (SCREEN_WIDTH > 800 ? 4 : 3);
    const startOctave = 3;

    const handleNotePress = useCallback((note, evt) => {
        UnifiedAudioEngine.activateAudio();
        const { locationY } = evt.nativeEvent;
        // Velocity based on vertical position (lower part of key is louder)
        const velocity = Math.min(Math.max((locationY / whiteKeyHeight) + 0.3, 0.6), 1.0);
        
        setPressedKeys(prev => new Set(prev).add(note));
        UnifiedAudioEngine.playSound(note, instrument, 0, velocity);
    }, [instrument, whiteKeyHeight]);

    const handleNoteRelease = useCallback((note) => {
        setPressedKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(note);
            return newSet;
        });
        UnifiedAudioEngine.stopSound(note, instrument);
    }, [instrument]);

    const toggleSustain = () => {
        const newState = !sustain;
        setSustain(newState);
        UnifiedAudioEngine.setSustain(newState);
        
        Animated.spring(pedalAnim, {
            toValue: newState ? 1 : 0,
            friction: 5,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
    };

    const whiteKeys = useMemo(() => {
        const keys = [];
        const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

        for (let i = 0; i < octavesToRender; i++) {
            const octave = startOctave + i;
            whiteNotes.forEach((note) => {
                const noteName = `${note}${octave}`;
                const isPressed = pressedKeys.has(noteName);
                keys.push(
                    <View key={noteName} style={styles.keyWrapper}>
                        <TouchableOpacity
                            style={[styles.whiteKey, { width: whiteKeyWidth, height: whiteKeyHeight }, isPressed && styles.whiteKeyPressed]}
                            onPressIn={(e) => handleNotePress(noteName, e)}
                            onPressOut={() => handleNoteRelease(noteName)}
                            delayPressIn={0}
                            activeOpacity={1}
                        >
                            {/* Ivory Textured Base */}
                            <LinearGradient
                                colors={isPressed ? ['#e5e7eb', '#d1d5db', '#cbd5e1'] : ['#fffff8', '#fffdf0', '#fcfaf0', '#f3f1e5']}
                                style={styles.whiteKeyGradient}
                            />
                            
                            <View style={styles.ivoryGrainEffect} />

                            {/* High-Gloss Surface Reflection */}
                            <LinearGradient
                                colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0.15 }}
                                style={styles.keyGloss}
                            />
                            
                            <View style={styles.keyBackShadow} />
                            <Text style={styles.keyLabelText}>{note}{octave}</Text>
                        </TouchableOpacity>
                    </View>
                );
            });
        }
        return keys;
    }, [handleNotePress, handleNoteRelease, pressedKeys]);

    const blackKeys = useMemo(() => {
        const keys = [];
        const blackNotes = [
            { note: 'C#', offset: 55 },
            { note: 'D#', offset: 110 },
            { note: 'F#', offset: 220 },
            { note: 'G#', offset: 275 },
            { note: 'A#', offset: 330 }
        ];

        for (let i = 0; i < octavesToRender; i++) {
            const octave = startOctave + i;
            const octaveOffset = i * 7 * whiteKeyWidth;

            blackNotes.forEach(({ note, offset }) => {
                const noteName = `${note}${octave}`;
                // Recalculate black key offset based on dynamic whiteKeyWidth
                const ratio = whiteKeyWidth / sc(55);
                const left = octaveOffset + (sc(offset) * ratio) - (blackKeyWidth / 2);
                const isPressed = pressedKeys.has(noteName);

                keys.push(
                    <TouchableOpacity
                        key={noteName}
                        style={[styles.blackKey, { left, width: blackKeyWidth, height: blackKeyHeight }, isPressed && styles.blackKeyPressed]}
                        onPressIn={(e) => handleNotePress(noteName, e)}
                        onPressOut={() => handleNoteRelease(noteName)}
                        delayPressIn={0}
                        activeOpacity={1}
                    >
                        <LinearGradient
                            colors={isPressed ? ['#050505', '#1a1a1a', '#222'] : ['#222', '#0a0a0a', '#050505']}
                            style={styles.blackKeyGradient}
                        />
                        {/* Polished Lacquer Highlight */}
                        <LinearGradient
                            colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 0.1 }}
                            style={StyleSheet.absoluteFill}
                        />
                        <View style={styles.blackKeyIndentation} />
                    </TouchableOpacity>
                );
            });
        }
        return keys;
    }, [handleNotePress, handleNoteRelease, pressedKeys]);

    return (
        <View style={[styles.container, { paddingTop: SAFE_TOP }]}>
            {/* Ultra-Premium Ebony Top Panel */}
            <View style={[styles.topPanel, isPhone && { height: sc(70) }]}>
                <LinearGradient
                    colors={['#0a121e', '#1e293b', '#0a121e']}
                    style={StyleSheet.absoluteFill}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                />
                <View style={styles.goldTrim} />
                <View style={styles.panelContent}>
                    <View style={styles.branding}>
                        {!isPhone && <Text style={styles.brandTitle}>SOLOCRAFT MASTERPIECE</Text>}
                        <Text style={[styles.modelTitle, isPhone && { fontSize: normalize(14) }]}>EBONY CONCERT GRAND</Text>
                    </View>

                    <View style={[styles.controls, isPhone && { marginRight: sc(20) }]}>
                        <View style={styles.zoomUnitWrapper}>
                            <TouchableOpacity onPress={() => setZoomLevel(Math.max(0.4, zoomLevel - 0.1))} style={styles.zoomBtn}>
                                <Text style={styles.zoomText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.zoomValue}>{Math.round(zoomLevel * 100)}%</Text>
                            <TouchableOpacity onPress={() => setZoomLevel(Math.min(1.8, zoomLevel + 0.1))} style={styles.zoomBtn}>
                                <Text style={styles.zoomText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            onPress={toggleSustain} 
                            style={[styles.pedalBtn, sustain && styles.pedalBtnActive, isPhone && { minWidth: sc(100), paddingHorizontal: sc(10) }]}
                            activeOpacity={0.8}
                        >
                            <Animated.View style={[styles.ledIndicator, { opacity: pedalAnim }]} />
                            <Text style={[styles.pedalLabel, sustain && styles.pedalLabelActive, isPhone && { fontSize: normalize(7) }]}>SUSTAIN</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.pianoScroll, { paddingBottom: SAFE_BOTTOM + sc(20) }]}
            >
                <View style={[styles.pianoEngine, { transform: [{ scale: zoomLevel }] }]}>
                    <View style={styles.keysBed}>
                        {whiteKeys}
                    </View>
                    <View style={styles.sharpsBed}>
                        {blackKeys}
                    </View>
                </View>
            </ScrollView>
            
            {/* Premium Status Bar */}
            <View style={styles.footerPanel}>
                <Text style={styles.statusText}>ULTRA-LOW LATENCY ENGINE • 32-BIT FLOATING POINT AUDIO</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 40,
        margin: 5,
        backgroundColor: '#050505',
        borderWidth: 2,
        borderColor: '#1a1a1a',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: 45, opacity: 0.9 }),
    },
    topPanel: {
        height: sc(100),
        paddingHorizontal: sc(30),
        borderBottomWidth: 4,
        borderBottomColor: '#000',
        position: 'relative',
    },
    panelContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    goldTrim: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1.5,
        backgroundColor: '#fbbf24',
        opacity: 0.4,
    },
    branding: {
        flex: 1,
        justifyContent: 'center',
    },
    brandTitle: {
        color: '#fbbf24', // Gold
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 4,
        opacity: 0.8,
    },
    modelTitle: {
        color: '#f8fafc',
        fontSize: normalize(18),
        fontWeight: '900',
        marginTop: 2,
        letterSpacing: 1,
        ...createTextShadow({ color: 'rgba(0,0,0,0.9)', radius: 10 }),
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sc(20),
        marginRight: sc(140), // Make room for the recording pill
    },
    zoomUnitWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 25,
        padding: 4,
        borderWidth: 1.5,
        borderColor: '#1e293b',
    },
    zoomBtn: {
        width: sc(32),
        height: sc(32),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        borderRadius: sc(16),
        borderWidth: 1,
        borderColor: '#334155',
    },
    zoomText: {
        color: '#fff',
        fontSize: normalize(16),
        fontWeight: '900',
    },
    zoomValue: {
        color: '#fbbf24',
        fontSize: normalize(11),
        fontWeight: '900',
        paddingHorizontal: sc(12),
    },
    pedalBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        paddingHorizontal: sc(20),
        paddingVertical: sc(8),
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#1a1a1a',
        minWidth: sc(130),
        justifyContent: 'center',
        ...createShadow({ color: '#000', radius: 8 }),
    },
    pedalBtnActive: {
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.05)',
    },
    ledIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fbbf24',
        marginRight: 10,
        ...createShadow({ color: '#fbbf24', radius: 10, opacity: 0.8 }),
    },
    pedalLabel: {
        color: '#475569',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    pedalLabelActive: {
        color: '#fff',
    },
    pianoScroll: {
        paddingVertical: sc(20),
        paddingHorizontal: sc(40),
        alignItems: 'center',
    },
    pianoEngine: {
        position: 'relative',
    },
    keysBed: {
        flexDirection: 'row',
    },
    keyWrapper: {
        marginHorizontal: 0,
    },
    whiteKey: {
        borderWidth: 0.8,
        borderColor: '#d1d5db',
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: sc(15),
        ...createShadow({ color: '#000', offsetY: 15, opacity: 0.4, radius: 10 }),
    },
    whiteKeyPressed: {
        transform: [{ translateY: sc(10) }],
        ...createShadow({ color: '#000', offsetY: 4, opacity: 0.2, radius: 4 }),
    },
    whiteKeyGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 6,
    },
    ivoryGrainEffect: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: '#000',
    },
    keyGloss: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 6,
        zIndex: 1,
    },
    keyBackShadow: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
    },
    keyLabelText: {
        color: '#64748b',
        fontSize: normalize(9),
        fontWeight: '900',
        opacity: 0.5,
    },
    sharpsBed: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    blackKey: {
        position: 'absolute',
        zIndex: 10,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        padding: 2,
        ...createShadow({ color: '#000', offsetY: 10, opacity: 0.8, radius: 8, elevation: 12 }),
    },
    blackKeyGradient: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#111',
    },
    blackKeyPressed: {
        transform: [{ translateY: sc(8) }],
        ...createShadow({ color: '#000', offsetY: 4, opacity: 0.5, radius: 4 }),
    },
    blackKeyIndentation: {
        width: 12,
        height: '40%',
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignSelf: 'center',
        marginTop: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    footerPanel: {
        height: sc(40),
        justifyContent: 'center',
        alignItems: 'center',
        borderTopWidth: 2,
        borderTopColor: '#000',
        backgroundColor: '#050505',
    },
    statusText: {
        color: '#475569',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
