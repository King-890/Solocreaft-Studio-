import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';

import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const width = SCREEN_WIDTH;

// Real concert harp strings: C is Red/Purple, F is Blue/Black, others are Natural/Gold
const STRINGS = [
    { note: 'C4', color: '#9333ea', label: 'C' }, 
    { note: 'D4', color: '#fbbf24', label: 'D' },
    { note: 'E4', color: '#fbbf24', label: 'E' },
    { note: 'F4', color: '#0f172a', label: 'F' }, 
    { note: 'G4', color: '#fbbf24', label: 'G' },
    { note: 'A4', color: '#fbbf24', label: 'A' },
    { note: 'B4', color: '#fbbf24', label: 'B' },
    { note: 'C5', color: '#9333ea', label: 'C' },
    { note: 'D5', color: '#fbbf24', label: 'D' },
    { note: 'E5', color: '#fbbf24', label: 'E' },
    { note: 'F5', color: '#0f172a', label: 'F' },
    { note: 'G5', color: '#fbbf24', label: 'G' },
    { note: 'A5', color: '#fbbf24', label: 'A' },
    { note: 'B5', color: '#fbbf24', label: 'B' },
    { note: 'C6', color: '#9333ea', label: 'C' },
];

const HARP_CONFIG = {
    NECK_ROTATION: 5.2,
    NECK_HEIGHT: sc(40),
    NECK_TRANSLATE_Y: sc(6),
    FIELD_MARGIN_TOP: sc(-28),
    STRING_FIELD_HEIGHT: sc(350), // Shared height constant
};

const HarpString = React.memo(({ str, index, isActive, vibrationAnim, playString }) => {
    // Structural synchronization: Lock strings to the rotated neck bar
    const containerWidth = SCREEN_WIDTH * 0.85; // Use real screen width for calculation
    const stringGap = (containerWidth - sc(20)) / (STRINGS.length - 1);
    const radians = HARP_CONFIG.NECK_ROTATION * Math.PI / 180;
    
    // Exact center alignment: Neck center relative to stringField top
    // (NECK_TRANSLATE_Y + NECK_HEIGHT/2) - (NECK_HEIGHT + FIELD_MARGIN_TOP)
    const pinOffset = (HARP_CONFIG.NECK_TRANSLATE_Y + (HARP_CONFIG.NECK_HEIGHT / 2)) - (HARP_CONFIG.NECK_HEIGHT + HARP_CONFIG.FIELD_MARGIN_TOP);
    const pinY = pinOffset + (index * stringGap * Math.tan(radians));
    
    const stringBottomY = HARP_CONFIG.STRING_FIELD_HEIGHT - (sc(75) + (index * sc(11)));
    
    // Physics Calibration: String starts at EXACT pin center (+2.5 for 5x5 peg)
    const stringTop = pinY + sc(2.5); 
    // Absolute Zero-Gap: Strings vanish into metallic rings in the timber
    const stringLength = (stringBottomY - stringTop) + sc(6);

    return (
        <View style={styles.stringCol}>
            {/* Tuning Hardware - Artisanal Gold Peg */}
            <View style={[styles.tuningPin, { top: pinY }]}>
                <LinearGradient 
                    colors={['#fde68a', '#d97706', '#92400e']} 
                    style={StyleSheet.absoluteFill} 
                    start={{x:0, y:0}} end={{x:1, y:1}}
                />
                <View style={styles.pegShine} />
            </View>

            {/* The String - Professional Grade Shimmer */}
            <Animated.View 
                style={[
                    styles.stringLine,
                    { 
                        top: stringTop,
                        height: stringLength,
                        backgroundColor: str.color,
                        width: 1.2 + (index * 0.05),
                        transform: [{ 
                            translateX: vibrationAnim.interpolate({
                                inputRange: [-1, 1],
                                outputRange: [sc(-4), sc(4)]
                            }) 
                        }],
                        opacity: isActive ? 1 : 0.7,
                        ...createShadow({ color: str.color, radius: isActive ? sc(15) : sc(2), opacity: isActive ? 0.9 : 0.2 })
                    }
                ]}
            >
                <LinearGradient colors={['rgba(255,255,255,0.4)', 'transparent']} style={StyleSheet.absoluteFill} />
            </Animated.View>

            {/* Soundboard Entry Eye (Artisanal Detail) */}
            <View style={[styles.stringEye, { top: stringBottomY }]}>
                <LinearGradient colors={['#fbbf24', '#92400e']} style={StyleSheet.absoluteFill} />
            </View>

            {/* Note Rail - Premium Interface */}
            <View style={[styles.labelPill, { bottom: 8 }, isActive && styles.activeLabelPill]}>
                <LinearGradient 
                    colors={isActive ? ['#fef3c7', '#fbbf24'] : ['#f8fafc', '#cbd5e1']} 
                    style={StyleSheet.absoluteFill} 
                />
                <Text style={[styles.labelText, isActive && styles.activeLabelText]}>{str.label}</Text>
            </View>
        </View>
    );
});

export default function Harp() {
    const [activeStrings, setActiveStrings] = useState({});
    const lastStrummedIndex = useRef(-1);
    
    const vibrationAnims = useRef(STRINGS.reduce((acc, s) => {
        acc[s.note] = new Animated.Value(0);
        return acc;
    }, {})).current;

    const timeoutsRef = useRef({});

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(clearTimeout);
        };
    }, []);

    const playString = useCallback((note, velocity = 0.7) => {
        UnifiedAudioEngine.activateAudio();
        setActiveStrings(prev => ({ ...prev, [note]: true }));
        UnifiedAudioEngine.playSound(note, 'harp', 0, velocity);
        
        // Trigger vibration
        vibrationAnims[note].setValue(1);
        Animated.sequence([
            Animated.timing(vibrationAnims[note], {
                toValue: -1,
                duration: 50,
                useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.spring(vibrationAnims[note], {
                toValue: 0,
                friction: 3,
                tension: 40,
                useNativeDriver: Platform.OS !== 'web'
            })
        ]).start();

        if (timeoutsRef.current[note]) clearTimeout(timeoutsRef.current[note]);
        timeoutsRef.current[note] = setTimeout(() => {
            setActiveStrings(prev => ({ ...prev, [note]: false }));
            delete timeoutsRef.current[note];
        }, 800);
    }, []);

    const handleTouch = (pageX) => {
        const containerWidth = width * 0.85; 
        const leftPadding = (width - containerWidth) / 2;
        const relativeX = pageX - leftPadding;
        const stringWidth = containerWidth / STRINGS.length;
        const index = Math.floor(relativeX / stringWidth);

        if (index >= 0 && index < STRINGS.length && index !== lastStrummedIndex.current) {
            lastStrummedIndex.current = index;
            playString(STRINGS[index].note, 0.7);
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                lastStrummedIndex.current = -1;
                handleTouch(evt.nativeEvent.pageX);
            },
            onPanResponderMove: (evt) => {
                handleTouch(evt.nativeEvent.pageX);
            },
            onPanResponderRelease: () => {
                lastStrummedIndex.current = -1;
            }
        })
    ).current;

    return (
        <LinearGradient
            colors={['#0f172a', '#1e293b', '#0f172a']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>ANGELIC RESONANCE</Text>
                <Text style={styles.subtitle}>CONCERT GRAND HARP • ULTRA-PREMIUM EDITION</Text>
            </View>

            <View style={styles.harpFrame} {...panResponder.panHandlers}>
                {/* 1. Ornate Golden Pillar - Ultra Premium */}
                <View style={styles.pillarSection}>
                    <View style={styles.pillarCrown}>
                        <LinearGradient colors={['#fbbf24', '#d97706', '#fbbf24']} style={StyleSheet.absoluteFill} />
                        <View style={styles.crownLip} />
                    </View>
                    <LinearGradient
                        colors={['#78350f', '#fbbf24', '#78350f']}
                        style={styles.pillar}
                    >
                        <View style={styles.fluteContainer}>
                            {[1, 2, 3, 4, 5, 6, 7].map(i => <View key={i} style={styles.pillarFlute} />)}
                        </View>
                        <LinearGradient colors={['rgba(255,255,255,0.15)', 'transparent']} style={StyleSheet.absoluteFill} start={{x:0,y:0}} end={{x:1,y:0}} />
                    </LinearGradient>
                    <View style={styles.pillarBase}>
                        <LinearGradient colors={['#d97706', '#fbbf24', '#d97706']} style={StyleSheet.absoluteFill} />
                    </View>
                </View>

                {/* 2. Main Instrument Body (Physics-Correct) */}
                <View style={styles.mainBody}>
                    {/* NECK SYSTEM */}
                    <View style={styles.neckWrapper}>
                        <LinearGradient
                            colors={['#451a03', '#78350f', '#451a03']}
                            style={styles.neckBar}
                        >
                            <View style={styles.neckGloss} />
                            <Text style={styles.brandText}>SOLO STUDIO CONCERT GRAND</Text>
                        </LinearGradient>
                    </View>

                    {/* STRINGS & PINS CONTAINER - Fixed height field */}
                    <View style={styles.stringField}>
                        {/* TAPERED SOUNDBOARD (Solid Artisan Wood) */}
                        <View style={styles.taperedSoundboardArea}>
                            <View style={styles.soundboardBackplate} />
                            {STRINGS.map((_, index) => {
                                const soundboardH = 80 + (index * 12);
                                return (
                                    <View key={`taper-${index}`} style={styles.soundboardCol}>
                                        <LinearGradient
                                            colors={['#451a03', '#2d1b10']}
                                            style={[styles.soundboardSection, { height: soundboardH }]}
                                        >
                                            <LinearGradient colors={['rgba(255,255,255,0.1)', 'transparent']} style={StyleSheet.absoluteFill} />
                                        </LinearGradient>
                                    </View>
                                );
                            })}
                        </View>

                        {/* STRINGS & PINS (The Foreground) */}
                        {STRINGS.map((str, index) => (
                            <HarpString 
                                key={str.note}
                                str={str}
                                index={index}
                                isActive={activeStrings[str.note]}
                                vibrationAnim={vibrationAnims[str.note]}
                                playString={playString}
                            />
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.indicatorArea}>
                    <View style={styles.indicatorLine} />
                    <Text style={styles.indicatorText}>GLISSANDO MODE ACTIVE</Text>
                    <View style={styles.indicatorDot} />
                </View>
                <Text style={styles.bottomText}>CONCERT HARP • PHYSICS-BASED RESONANCE ENGINE</Text>
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
        paddingVertical: sc(15),
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.95 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(8),
    },
    title: {
        color: '#fbbf24',
        fontSize: normalize(18),
        fontWeight: '900',
        letterSpacing: 6,
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }),
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: sc(4),
        textTransform: 'uppercase',
    },
    harpFrame: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        paddingHorizontal: sc(15),
    },
    pillarSection: {
        width: sc(30),
        height: '90%',
        alignItems: 'center',
        marginRight: sc(-4),
        zIndex: 100,
    },
    pillarCrown: {
        width: sc(40),
        height: sc(14),
        borderRadius: sc(4),
        marginBottom: sc(-4),
        borderWidth: 1.5,
        borderColor: '#92400e',
        zIndex: 110,
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: sc(6), opacity: 0.4 }),
    },
    crownLip: {
        width: '110%',
        height: sc(2),
        backgroundColor: 'rgba(255,255,255,0.3)',
        position: 'absolute',
        top: sc(2),
    },
    pillar: {
        width: '100%',
        flex: 1,
        borderRadius: sc(15),
        borderWidth: 2,
        borderColor: '#92400e',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: sc(15), opacity: 0.3 }),
    },
    fluteContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: sc(2),
    },
    pillarFlute: {
        width: sc(1.5),
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        opacity: 0.6,
    },
    pillarBase: {
        width: sc(50),
        height: sc(16),
        borderRadius: sc(6),
        marginTop: sc(-6),
        borderWidth: 2,
        borderColor: '#92400e',
        zIndex: 110,
        ...createShadow({ color: '#000', radius: sc(8), opacity: 0.5 }),
    },
    mainBody: {
        flex: 1,
        zIndex: 50,
    },
    neckWrapper: {
        width: '98%',
        height: HARP_CONFIG.NECK_HEIGHT,
        marginLeft: sc(-10),
        transform: [{ rotate: `${HARP_CONFIG.NECK_ROTATION}deg` }, { translateY: HARP_CONFIG.NECK_TRANSLATE_Y }], 
        zIndex: 80,
    },
    neckBar: {
        flex: 1,
        borderRadius: sc(12),
        borderWidth: 2,
        borderColor: '#1a0f0a',
        backgroundColor: '#451a03',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        borderTopWidth: 4,
        borderTopColor: '#78350f', 
    },
    neckGloss: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    brandText: {
        color: '#fbbf24',
        fontSize: normalize(6),
        fontWeight: '900',
        letterSpacing: 2,
        opacity: 0.35,
        textTransform: 'uppercase',
        ...createTextShadow({ color: '#000', radius: 1 }),
    },
    stringField: {
        height: HARP_CONFIG.STRING_FIELD_HEIGHT,
        flexDirection: 'row',
        paddingHorizontal: sc(10),
        marginTop: HARP_CONFIG.FIELD_MARGIN_TOP,
        position: 'relative',
    },
    taperedSoundboardArea: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        alignItems: 'flex-end',
        zIndex: 5,
        paddingHorizontal: sc(1), 
    },
    soundboardBackplate: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#2d1b10',
        borderRadius: sc(15),
        opacity: 0.7,
        borderWidth: 1.5,
        borderColor: '#451a03',
        ...createShadow({ color: '#000', radius: sc(20), opacity: 0.6 }),
    },
    soundboardCol: {
        flex: 1,
    },
    soundboardSection: {
        width: '102%', // Overlap to remove gaps
        marginLeft: '-1%', 
        borderTopLeftRadius: sc(4),
        borderTopRightRadius: sc(4),
        borderWidth: 1,
        borderBottomWidth: 0,
        borderColor: '#1a0f0a',
        backgroundColor: '#451a03',
        ...createShadow({ color: '#000', radius: sc(10), opacity: 0.5 }),
    },
    stringCol: {
        flex: 1,
        alignItems: 'center',
        zIndex: 20,
    },
    tuningPin: {
        width: sc(6),
        height: sc(6),
        borderRadius: sc(3),
        position: 'absolute',
        zIndex: 95,
        borderWidth: 1,
        borderColor: '#92400e',
        ...createShadow({ color: '#000', radius: sc(3), opacity: 0.7 }),
    },
    pegShine: {
        width: sc(2.5),
        height: sc(1.5),
        borderRadius: sc(1),
        backgroundColor: 'rgba(255,255,255,0.6)',
        position: 'absolute',
        top: sc(0.8),
        left: sc(0.8),
        transform: [{ rotate: '-45deg' }],
    },
    stringEye: {
        width: sc(5),
        height: sc(2.5),
        borderRadius: sc(1.5),
        position: 'absolute',
        zIndex: 15,
        borderWidth: 0.8,
        borderColor: '#78350f',
        ...createShadow({ color: '#000', radius: sc(2), opacity: 0.8 }),
    },
    stringLine: {
        position: 'absolute',
        zIndex: 10,
    },
    labelPill: {
        position: 'absolute',
        width: sc(18),
        height: sc(18),
        borderRadius: sc(4), // Square-ish "Note Rail" feel
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        zIndex: 100,
        ...createShadow({ color: '#000', radius: sc(5), opacity: 0.5 }),
    },
    activeLabelPill: {
        borderColor: '#d97706',
        transform: [{ scale: 1.25 }, { translateY: sc(-2) }],
        ...createShadow({ color: '#fbbf24', radius: sc(15), opacity: 0.8 }),
    },
    labelText: {
        color: '#1e293b',
        fontSize: normalize(9),
        fontWeight: '900',
        ...createTextShadow({ color: 'rgba(0,0,0,0.1)', radius: 1 }),
    },
    activeLabelText: {
        color: '#78350f',
    },
    footer: {
        marginTop: sc(8),
        alignItems: 'center',
    },
    indicatorArea: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sc(8),
        marginBottom: sc(2),
    },
    indicatorLine: {
        width: sc(25),
        height: sc(1.5),
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
    },
    indicatorText: {
        color: '#fbbf24',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 2,
    },
    indicatorDot: {
        width: sc(5),
        height: sc(5),
        borderRadius: sc(2.5),
        backgroundColor: '#fbbf24',
    },
    bottomText: {
        color: '#64748b',
        fontSize: normalize(7),
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
});
