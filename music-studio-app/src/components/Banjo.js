import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const STRINGS = ['G', 'D', 'G', 'B', 'D_high'];
const NOTE_MAP = ['G3', 'D3', 'G2', 'B2', 'D4'];

export default function Banjo() {
    const [activeStrings, setActiveStrings] = useState([false, false, false, false, false]);
    const stringAnims = useRef(STRINGS.map(() => new Animated.Value(0))).current;

    const pluckString = useCallback((index) => {
        UnifiedAudioEngine.activateAudio();
        const note = NOTE_MAP[index];
        UnifiedAudioEngine.playSound(note, 'banjo', 0, 0.8);
        
        setActiveStrings(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
        });

        // High-velocity vibration animation
        Animated.sequence([
            Animated.timing(stringAnims[index], { toValue: 3, duration: 40, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(stringAnims[index], { toValue: -3, duration: 40, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(stringAnims[index], { toValue: 0, friction: 3, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        setTimeout(() => {
            setActiveStrings(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
        }, 300);
    }, []);

    return (
        <LinearGradient
            colors={['#1e1b4b', '#312e81', '#1a1842']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>BLUEGRASS RESONANCE</Text>
                <Text style={styles.subtitle}>PREMIUM CONCERT BANJO • CHROME & PARCHMENT</Text>
            </View>

            <View style={styles.banjoFrame}>
                {/* 1. MASTER NECK & HEADSTOCK SYSTEM */}
                <View style={styles.neckSystem}>
                    {/* Headstock (Top Piece) */}
                    <View style={styles.headstock}>
                        <LinearGradient colors={['#451a03', '#1a0d06']} style={styles.headstockWood}>
                            <View style={styles.brandBadge} />
                        </LinearGradient>
                        {/* Tuning Pegs */}
                        <View style={styles.tuningPegs}>
                            {[0, 1, 2, 3, 4].map(idx => (
                                <View key={idx} style={[styles.pegContainer, { top: 10 + idx * 15, left: idx % 2 === 0 ? -12 : 52 }]}>
                                    <View style={styles.pegWasher} />
                                    <View style={styles.pegHandle} />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Long Neck (Dandi) */}
                    <LinearGradient colors={['#451a03', '#1a0d06', '#451a03']} style={styles.neckLong}>
                        <View style={styles.neckShine} />
                        {/* Fret Markers */}
                        <View style={styles.fretMarkers}>
                            {[3, 5, 7, 10, 12].map(f => <View key={f} style={[styles.dotMarker, { marginTop: f * 20 }]} />)}
                        </View>
                    </LinearGradient>
                </View>

                {/* 2. THE RESONATOR BODY */}
                <View style={styles.resonatorBody}>
                    <View style={styles.resonatorOuter}>
                        <LinearGradient
                            colors={['#f3f4f6', '#9ca3af', '#6b7280', '#9ca3af', '#f3f4f6']}
                            style={styles.chromeRim}
                        >
                            <LinearGradient
                                colors={['#fffaf0', '#fdf2f8', '#fffaf0']}
                                style={styles.skinHead}
                            >
                                <View style={styles.skinGrain} />
                                
                                {/* Ebony Bridge (Bridge Pins Location) */}
                                <View style={styles.ebonyBridge}>
                                    <View style={styles.bridgeDetail} />
                                </View>
                            </LinearGradient>
                        </LinearGradient>
                        
                        {/* Tension Hooks Around the Rim */}
                        <View style={styles.tensionHooks}>
                            {[...Array(16)].map((_, i) => (
                                <View 
                                    key={i} 
                                    style={[
                                        styles.hook, 
                                        { transform: [{ rotate: `${i * 22.5}deg` }, { translateY: -155 }] }
                                    ]} 
                                >
                                    <LinearGradient colors={['#f3f4f6', '#9ca3af']} style={styles.hookInner} />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* 3. STRINGS SYSTEM (OVERLAY) - Spans full length */}
                    <View style={styles.stringsOverlay}>
                        {STRINGS.map((label, i) => (
                            <View key={i} style={styles.stringCol}>
                                <Animated.View 
                                    style={[
                                        styles.stringLine,
                                        { 
                                            transform: [{ translateX: stringAnims[i] }],
                                            backgroundColor: activeStrings[i] ? '#fff' : '#94a3b8',
                                            opacity: activeStrings[i] ? 1 : 0.6,
                                            width: 1.2 + (i * 0.3)
                                        }
                                    ]}
                                >
                                    <LinearGradient colors={['rgba(255,255,255,0.4)', 'transparent']} style={StyleSheet.absoluteFill} />
                                </Animated.View>
                                <TouchableOpacity
                                    style={styles.pluckZone}
                                    onPress={() => pluckString(i)}
                                    activeOpacity={1}
                                />
                            </View>
                        ))}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.indicatorContainer}>
                    <LinearGradient
                        colors={['transparent', '#f3f4f6', 'transparent']}
                        style={styles.indicatorLine}
                        start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                    />
                    <Text style={styles.instruction}>PARCHMENT RESPONSE • CHROME HARDWARE • TAP STRINGS</Text>
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
        paddingVertical: sc(25),
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.8 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(20),
    },
    title: {
        color: '#f3f4f6',
        fontSize: normalize(18),
        fontWeight: '900',
        letterSpacing: 6,
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 12 }),
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: sc(4),
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    banjoFrame: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        paddingTop: sc(10),
    },
    neckSystem: {
        width: sc(60),
        height: sc(180),
        alignItems: 'center',
        zIndex: 5,
        marginBottom: sc(-30), // Merge into resonator
    },
    headstock: {
        width: sc(50),
        height: sc(70),
        zIndex: 10,
        ...createShadow({ color: '#000', radius: sc(10), opacity: 0.5 }),
    },
    headstockWood: {
        flex: 1,
        borderRadius: sc(8),
        borderWidth: 1.5,
        borderColor: '#0a0a0a',
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandBadge: {
        width: sc(10),
        height: sc(10),
        borderRadius: sc(5),
        backgroundColor: '#fbbf24',
        opacity: 0.6,
    },
    tuningPegs: {
        ...StyleSheet.absoluteFillObject,
    },
    pegContainer: {
        position: 'absolute',
        width: sc(10),
        height: sc(10),
    },
    pegWasher: {
        width: sc(6),
        height: sc(6),
        borderRadius: sc(3),
        backgroundColor: '#9ca3af',
        borderWidth: 1,
        borderColor: '#6b7280',
    },
    pegHandle: {
        width: sc(12),
        height: sc(4),
        borderRadius: sc(2),
        backgroundColor: '#f3f4f6',
        marginTop: -1,
        marginLeft: -3,
        borderWidth: 0.5,
        borderColor: '#9ca3af',
    },
    neckLong: {
        width: sc(45),
        flex: 1,
        borderLeftWidth: 1.5,
        borderRightWidth: 1.5,
        borderColor: '#0a0a0a',
        overflow: 'hidden',
    },
    neckShine: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    fretMarkers: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
    },
    dotMarker: {
        width: sc(6),
        height: sc(6),
        borderRadius: sc(3),
        backgroundColor: '#f1f5f9',
        opacity: 0.8,
    },
    resonatorBody: {
        height: sc(330),
        width: sc(330),
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
    },
    resonatorOuter: {
        width: sc(320),
        height: sc(320),
        borderRadius: sc(160),
        backgroundColor: '#0a0a0a',
        padding: sc(4),
        ...createShadow({ color: '#000', radius: sc(40), offsetY: 20, opacity: 0.9 }),
        justifyContent: 'center',
        alignItems: 'center',
    },
    chromeRim: {
        width: sc(312),
        height: sc(312),
        borderRadius: sc(156),
        padding: sc(12),
        justifyContent: 'center',
        alignItems: 'center',
    },
    skinHead: {
        width: sc(288),
        height: sc(288),
        borderRadius: sc(144),
        overflow: 'hidden',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    skinGrain: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: '#000',
    },
    stringsOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        width: sc(140), // Match neck width + resonator span
        height: '110%', // Extend from headstock down
        marginLeft: sc(95), 
        marginTop: sc(-180), // Start at headstock
        justifyContent: 'space-between',
        zIndex: 20,
    },
    stringCol: {
        width: sc(15),
        height: '100%',
        alignItems: 'center',
    },
    stringLine: {
        borderRadius: 1,
        height: '100%',
        ...createShadow({ color: '#000', radius: 2, opacity: 0.5 }),
    },
    pluckZone: {
        position: 'absolute',
        width: sc(25),
        height: '100%',
    },
    ebonyBridge: {
        position: 'absolute',
        bottom: sc(60),
        width: sc(150),
        height: sc(14),
        backgroundColor: '#171717',
        borderRadius: 2,
        ...createShadow({ color: '#000', radius: sc(10), offsetY: 5, opacity: 0.7 }),
        justifyContent: 'center',
        alignItems: 'center',
    },
    bridgeDetail: {
        width: '94%',
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 1,
    },
    tensionHooks: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hook: {
        position: 'absolute',
        width: sc(5),
        height: sc(18),
    },
    hookInner: {
        flex: 1,
        borderRadius: 2.5,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
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
        width: '60%',
        height: 2,
        marginBottom: sc(10),
    },
    instruction: {
        color: '#475569',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
});
