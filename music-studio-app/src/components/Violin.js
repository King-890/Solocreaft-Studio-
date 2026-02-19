import React, { useState, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const width = SCREEN_WIDTH;
const STRINGS = ['G', 'D', 'A', 'E'];
const NOTE_MAP = { 'G': 'G3', 'D': 'D4', 'A': 'A4', 'E': 'E5' };

export default function Violin({ instrument = 'violin' }) {
    const [activeStrings, setActiveStrings] = useState({});
    
    const vibrationAnims = useRef(STRINGS.reduce((acc, str) => {
        acc[str] = new Animated.Value(0);
        return acc;
    }, {})).current;

    const playString = useCallback((str, evt) => {
        UnifiedAudioEngine.activateAudio();
        const note = NOTE_MAP[str];
        const locationY = evt?.nativeEvent?.locationY || 100;
        const velocity = Math.min(Math.max((locationY / 400) + 0.3, 0.4), 1.0);
        
        UnifiedAudioEngine.playSound(note, instrument, 0, velocity);
        setActiveStrings(prev => ({ ...prev, [str]: true }));

        vibrationAnims[str].setValue(1);
        Animated.sequence([
            Animated.timing(vibrationAnims[str], { toValue: -1, duration: 50, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(vibrationAnims[str], { toValue: 0, friction: 3, tension: 40, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
    }, [instrument]);

    const stopString = useCallback((str) => {
        setActiveStrings(prev => ({ ...prev, [str]: false }));
    }, []);

    return (
        <LinearGradient
            colors={['#1a0f0a', '#2d1b10', '#1a0f0a']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.brandTitle}>STRADIVARIUS SERIES</Text>
                <Text style={styles.modelTitle}>CONCERT VIOLIN • HIGH-GLOSS EDITION</Text>
            </View>

            <View style={styles.violinFrame}>
                <View style={styles.masterNeck}>
                    <View style={styles.pegbox}>
                        <LinearGradient colors={['#3e2723', '#2d1b10', '#1a0f0a']} style={styles.scrollHead}>
                            <View style={styles.scrollShine} />
                        </LinearGradient>
                        <View style={styles.pegsLayout}>
                            {[1, 2, 3, 4].map(i => (
                                <View key={i} style={styles.pegAssembly}>
                                    <LinearGradient colors={['#111', '#000']} style={styles.pegPin} />
                                </View>
                            ))}
                        </View>
                    </View>
                    <LinearGradient colors={['#050505', '#1a1a1a', '#050505']} style={styles.ebonyFingerboard}>
                        <View style={styles.ebonyGrain} />
                    </LinearGradient>
                </View>

                <View style={styles.bodyWrapper}>
                    <LinearGradient colors={['#5d4037', '#8d6e63', '#a1887f', '#8d6e63', '#5d4037']} style={styles.varnishedBody}>
                        <View style={styles.varnishHighlight} />
                        <View style={styles.fHoleArray}>
                            <View style={[styles.fHoleCut, styles.fHoleRotateLeft]}><View style={styles.fHoleShadow} /></View>
                            <View style={[styles.fHoleCut, styles.fHoleRotateRight]}><View style={styles.fHoleShadow} /></View>
                        </View>
                        <View style={styles.mapleBridge}>
                            <LinearGradient colors={['#e5e7eb', '#d1d5db', '#9ca3af']} style={styles.bridgeStructure} />
                        </View>
                    </LinearGradient>
                </View>

                <View style={styles.stringsOverlay} pointerEvents="box-none">
                    {STRINGS.map((str, i) => {
                        const isActive = activeStrings[str];
                        return (
                            <View key={str} style={styles.stringAssembly}>
                                <TouchableOpacity
                                    style={styles.vocalTouchZone}
                                    onPressIn={(evt) => playString(str, evt)}
                                    onPressOut={() => stopString(str)}
                                    activeOpacity={1}
                                    delayPressIn={0}
                                />
                                <Animated.View 
                                    style={[
                                        styles.harmonicString,
                                        {
                                            width: 1.2 + (i * 0.4),
                                            backgroundColor: isActive ? '#fff' : '#c0c0c0',
                                            transform: [{ 
                                                translateX: vibrationAnims[str].interpolate({
                                                    inputRange: [-1, 1],
                                                    outputRange: [-2.5, 2.5]
                                                }) 
                                            }]
                                        }
                                    ]}
                                >
                                    <LinearGradient
                                        colors={['rgba(255,255,255,0.7)', 'rgba(0,0,0,0.3)', 'rgba(255,255,255,0.5)']}
                                        style={StyleSheet.absoluteFill}
                                        start={{x:0, y:0}} end={{x:1, y:0}}
                                    />
                                </Animated.View>
                                {isActive && <View style={styles.stringVibrationGlow} />}
                            </View>
                        );
                    })}
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.performanceZone}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                        style={styles.bowLine}
                    />
                    <View style={styles.glassLabel}><Text style={styles.labelSmall}>ARTICULATION ZONE</Text></View>
                </View>
                <Text style={styles.instruction}>SWIPE OR TAP THE CONCERT STRINGS • MASTERCLASS SERIES</Text>
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
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.95 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(25),
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
        letterSpacing: 2,
        marginTop: sc(4),
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }),
    },
    violinFrame: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: sc(20),
    },
    masterNeck: {
        width: sc(120),
        height: '55%',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
    },
    pegbox: {
        width: sc(60),
        height: sc(80),
        alignItems: 'center',
        marginBottom: sc(-5),
    },
    scrollHead: {
        width: sc(50),
        height: sc(40),
        borderRadius: sc(20),
        borderWidth: 2,
        borderColor: '#1a0f0a',
        ...createShadow({ color: '#000', radius: sc(10) }),
    },
    scrollShine: {
        width: '60%',
        height: '30%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: sc(20),
        marginTop: sc(5),
        marginLeft: '20%',
    },
    pegsLayout: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: sc(80),
        gap: sc(15),
        justifyContent: 'center',
        marginTop: sc(-10),
    },
    pegAssembly: {
        width: sc(12),
        height: sc(24),
        ...createShadow({ color: '#000', radius: sc(4) }),
    },
    pegPin: {
        flex: 1,
        borderRadius: sc(6),
        borderWidth: 1.5,
        borderColor: '#050505',
    },
    ebonyFingerboard: {
        width: sc(80),
        flex: 1,
        borderRadius: sc(5),
        borderWidth: 2,
        borderColor: '#050505',
        marginTop: sc(-5),
        ...createShadow({ color: '#000', radius: sc(20), opacity: 0.7 }),
    },
    ebonyGrain: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    bodyWrapper: {
        width: SCREEN_WIDTH * 0.85,
        height: sc(180),
        marginTop: sc(-60),
        zIndex: 1,
    },
    varnishedBody: {
        flex: 1,
        borderRadius: sc(90),
        borderWidth: 3,
        borderColor: '#3e2723',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: sc(40), offsetY: 15, opacity: 0.9 }),
    },
    varnishHighlight: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)',
        opacity: 0.5,
    },
    fHoleArray: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: sc(60),
        alignItems: 'center',
    },
    fHoleCut: {
        width: sc(20),
        height: sc(120),
        backgroundColor: '#0a0a0a',
        borderRadius: sc(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...createShadow({ color: '#000', radius: sc(5) }),
    },
    fHoleRotateLeft: { transform: [{ rotate: '18deg' }] },
    fHoleRotateRight: { transform: [{ rotate: '-18deg' }] },
    fHoleShadow: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: sc(20),
    },
    mapleBridge: {
        width: sc(140),
        height: sc(35),
        marginTop: sc(40),
        ...createShadow({ color: '#000', radius: sc(10), offsetY: 5 }),
    },
    bridgeStructure: {
        flex: 1,
        borderRadius: sc(10),
        borderWidth: 1.5,
        borderColor: '#9ca3af',
    },
    stringsOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: sc(40),
        zIndex: 20,
    },
    stringAssembly: {
        width: sc(35),
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    vocalTouchZone: {
        position: 'absolute',
        width: sc(50),
        height: '100%',
        zIndex: 25,
    },
    harmonicString: {
        height: '85%',
        borderRadius: 1,
        ...createShadow({ color: '#fff', radius: sc(3), opacity: 0.3 }),
    },
    stringVibrationGlow: {
        position: 'absolute',
        top: '10%',
        bottom: '5%',
        width: sc(20),
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: sc(10),
    },
    performanceZone: {
        alignItems: 'center',
        width: '100%',
        marginBottom: sc(20),
    },
    bowLine: {
        width: '80%',
        height: sc(3),
        marginBottom: sc(10),
    },
    glassLabel: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: sc(20),
        paddingVertical: sc(6),
        borderRadius: sc(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    labelSmall: {
        color: '#fff',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 3,
    },
    instruction: {
        color: '#fbbf24',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
});
