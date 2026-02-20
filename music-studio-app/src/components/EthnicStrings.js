import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions, ScrollView, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const STRINGS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];
const NOTES = ['G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6'];

const StringStation = React.memo(({ index, label, instrument, isShamisen, isActive, stringAnim, pluckString }) => {
    const bridgeTop = sc(35) + (index * sc(12) * (isShamisen ? 0.3 : 0.8));
    
    return (
        <View style={styles.stringStation}>
            <View style={styles.stringAnchorTop} />
            
            <Animated.View style={[
                styles.silkString, 
                { 
                    transform: [{ translateX: stringAnim }], 
                    backgroundColor: isActive ? '#fff' : '#fcd34d', 
                    opacity: isActive ? 1 : 0.9, 
                }
            ]}>
                <LinearGradient 
                    colors={['rgba(255,255,255,0.4)', 'transparent', 'rgba(0,0,0,0.1)']} 
                    style={StyleSheet.absoluteFill} 
                />
            </Animated.View>

            <View style={[styles.artisanalBridge, { top: bridgeTop }]}>
                <LinearGradient colors={['#fffaf0', '#f5f5f5', '#cbd5e1']} style={styles.ivoryFinish}>
                    <View style={styles.bridgeNotch} />
                </LinearGradient>
                <View style={styles.bridgeShadow} />
            </View>

            <View style={styles.stringAnchorBottom} />
            
            <TouchableOpacity 
                style={styles.pluckActionZone} 
                onPressIn={() => pluckString(index)} 
                activeOpacity={1} 
            />
            <View style={[styles.indexPill, isActive && styles.activeIndexPill]}>
                <Text style={[styles.stringIndex, isActive && { color: '#fbbf24' }]}>{label}</Text>
            </View>
        </View>
    );
});

export default function EthnicStrings({ instrument = 'koto' }) {
    const [activeStrings, setActiveStrings] = useState(new Set());
    const lastStrummedIndex = useRef(-1);
    const stringAnims = useRef(STRINGS.map(() => new Animated.Value(0))).current;
    const activeTimeouts = useRef({});

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(activeTimeouts.current).forEach(clearTimeout);
        };
    }, []);

    const pluckString = useCallback((index, velocity = 0.75) => {
        UnifiedAudioEngine.activateAudio();
        const note = NOTES[index];
        UnifiedAudioEngine.playSound(note, instrument, 0, velocity);
        
        setActiveStrings(prev => {
            const next = new Set(prev);
            next.add(index);
            return next;
        });

        // Elite physics-based vibration sequence
        Animated.sequence([
            Animated.timing(stringAnims[index], { toValue: sc(4), duration: 40, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(stringAnims[index], { toValue: sc(-4), duration: 40, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(stringAnims[index], { toValue: sc(2.5), duration: 50, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(stringAnims[index], { toValue: 0, friction: 3, tension: 50, useNativeDriver: Platform.OS !== 'web' })
        ]).start();

        if (activeTimeouts.current[index]) clearTimeout(activeTimeouts.current[index]);
        activeTimeouts.current[index] = setTimeout(() => {
            setActiveStrings(prev => {
                const next = new Set(prev);
                next.delete(index);
                return next;
            });
            delete activeTimeouts.current[index];
        }, 500);
    }, [instrument]);

    const contentRef = useRef(null);
    const layoutInfo = useRef({ x: 0, width: 0 }).current;

    const measureLayout = useCallback(() => {
        if (contentRef.current && contentRef.current.measure) {
            contentRef.current.measure((x, y, width, height, pageX, pageY) => {
                if (pageX !== undefined) {
                    layoutInfo.x = pageX;
                    layoutInfo.width = width;
                }
            });
        }
    }, [layoutInfo]);
    
    const handleTouch = useCallback((pageX) => {
        // Precise string detection for glissando
        const STRING_GAP = sc(45);
        const relativeX = pageX - layoutInfo.x - sc(80) + sc(20); // x - startX - padding + half-gap approx
        
        const index = Math.floor(relativeX / STRING_GAP); 

        if (index >= 0 && index < STRINGS.length && index !== lastStrummedIndex.current) {
            lastStrummedIndex.current = index;
            pluckString(index, 0.65);
        }
    }, [pluckString, layoutInfo]);

    const handleTouchRef = useRef(handleTouch);
    useEffect(() => {
        handleTouchRef.current = handleTouch;
    }, [handleTouch]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                lastStrummedIndex.current = -1;
                measureLayout(); // Ensure fresh layout on start
                handleTouchRef.current(evt.nativeEvent.pageX);
            },
            onPanResponderMove: (evt) => {
                handleTouchRef.current(evt.nativeEvent.pageX);
            },
            onPanResponderRelease: () => {
                lastStrummedIndex.current = -1;
            }
        })
    ).current;

    const isShamisen = instrument === 'shamisen';

    return (
        <LinearGradient colors={['#1a1005', '#2c1e0a', '#1a1005']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>EASTERN SERENITY</Text>
                <Text style={styles.subtitle}>MASTERCLASS {instrument.toUpperCase()} • {isShamisen ? 'SATIN WOOD' : 'IMPERIAL ROSEWOOD'}</Text>
            </View>

            <View style={styles.masterFrame} {...panResponder.panHandlers}>
                {/* 1. STRUCTURAL FRAME (Ryukaku & Kashira) */}
                <View style={styles.ryukakuTop} />
                
                {/* 2. UNIFIED INSTRUMENT BODY (Soundboard) */}
                <View style={styles.instrumentBody}>
                    <LinearGradient
                        colors={['#451a03', '#78350f', '#451a03']}
                        style={styles.grainBase}
                    >
                        <View style={styles.woodLuster} />
                        {/* Decorative Inlays */}
                        <View style={styles.decorativeInlayTop} />
                        <View style={styles.decorativeInlayBottom} />
                        <View style={styles.bodyEdge} />
                    </LinearGradient>
                </View>

                {/* 3. IMPERIAL STRING SYSTEM */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.stringsLayout}
                    scrollEventThrottle={16}
                    onScroll={measureLayout}
                    onContentSizeChange={measureLayout}
                >
                    <View 
                        ref={(ref) => {
                            contentRef.current = ref;
                            measureLayout();
                        }}
                        style={{ flexDirection: 'row' }}
                    >
                        {STRINGS.map((label, i) => (
                            <StringStation
                                key={i}
                                index={i}
                                label={label}
                                instrument={instrument}
                                isShamisen={isShamisen}
                                isActive={activeStrings.has(i)}
                                stringAnim={stringAnims[i]}
                                pluckString={pluckString}
                            />
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.kashiraBottom} />
            </View>

            <View style={styles.footer}>
                <View style={styles.aestheticOverlay}>
                    <Text style={styles.harmonicMode}>AUTHENTIC HARMONIC SCALE ACTIVE • GLISSANDO SUPPORTED</Text>
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
        borderWidth: 1.5,
        borderColor: 'rgba(251, 191, 36, 0.1)',
    },
    header: { alignItems: 'center', marginBottom: sc(25) },
    title: { color: '#fbbf24', fontSize: normalize(24), fontWeight: '900', letterSpacing: 8, ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }) },
    subtitle: { color: '#94a3b8', fontSize: normalize(10), fontWeight: '900', letterSpacing: 3, marginTop: sc(6), opacity: 0.6 },
    masterFrame: {
        flex: 1,
        width: '98%',
        justifyContent: 'center',
        position: 'relative',
    },
    ryukakuTop: {
        position: 'absolute',
        top: '8%',
        left: '2%',
        right: '2%',
        height: sc(12),
        backgroundColor: '#1a0d06',
        borderRadius: sc(6),
        zIndex: 20,
        borderWidth: 1,
        borderColor: '#451a03',
        ...createShadow({ color: '#000', radius: sc(10) }),
    },
    kashiraBottom: {
        position: 'absolute',
        bottom: '8%',
        left: '2%',
        right: '2%',
        height: sc(12),
        backgroundColor: '#1a0d06',
        borderRadius: sc(6),
        zIndex: 20,
        borderWidth: 1,
        borderColor: '#451a03',
        ...createShadow({ color: '#000', radius: sc(10) }),
    },
    instrumentBody: {
        position: 'absolute',
        top: '10%',
        bottom: '10%',
        left: 0,
        right: 0,
        zIndex: 1,
        ...createShadow({ color: '#000', radius: sc(40), offsetY: 10 }),
    },
    grainBase: { 
        flex: 1, 
        borderRadius: sc(30), 
        borderWidth: 4, 
        borderColor: '#2d1b10', 
        overflow: 'hidden',
    },
    woodLuster: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(255,255,255,0.03)',
        zIndex: 2,
    },
    decorativeInlayTop: {
        position: 'absolute',
        top: sc(20),
        left: '5%',
        right: '5%',
        height: 1,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        zIndex: 3,
    },
    decorativeInlayBottom: {
        position: 'absolute',
        bottom: sc(20),
        left: '5%',
        right: '5%',
        height: 1,
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        zIndex: 3,
    },
    bodyEdge: { 
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        right: 0, 
        width: sc(30), 
        backgroundColor: 'rgba(0,0,0,0.25)',
        zIndex: 4,
    },
    stringsLayout: { 
        paddingHorizontal: sc(80), 
        gap: sc(45), 
        alignItems: 'center', 
        zIndex: 30,
        height: '100%',
    },
    stringStation: { 
        width: sc(4), 
        height: '100%', 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    artisanalBridge: { 
        position: 'absolute', 
        width: sc(22), 
        height: sc(36), 
        zIndex: 45, 
        marginLeft: sc(-9),
    },
    ivoryFinish: { 
        flex: 1, 
        borderRadius: sc(5), 
        borderWidth: 1.5, 
        borderColor: '#e5e7eb', 
        ...createShadow({ color: '#000', radius: sc(6), opacity: 0.5 }),
    },
    bridgeNotch: {
        position: 'absolute',
        top: 0,
        left: '40%',
        width: '20%',
        height: sc(4),
        backgroundColor: '#374151',
        borderBottomLeftRadius: sc(2),
        borderBottomRightRadius: sc(2),
    },
    bridgeShadow: { 
        position: 'absolute', 
        bottom: sc(-12), 
        width: '140%', 
        marginLeft: '-20%',
        height: sc(8), 
        backgroundColor: 'rgba(0,0,0,0.4)', 
        borderRadius: sc(10),
    },
    stringAnchorTop: { 
        position: 'absolute', 
        top: sc(25), 
        width: sc(12), 
        height: sc(12), 
        borderRadius: sc(6), 
        backgroundColor: '#1a0d06', 
        borderWidth: 1.5, 
        borderColor: '#fbbf24',
        zIndex: 40,
    },
    silkString: { 
        position: 'absolute',
        top: sc(30),
        bottom: sc(30),
        width: sc(2),
        borderRadius: sc(1),
        // Disable heavy shadow on web
        ...(Platform.OS !== 'web' ? createShadow({ color: '#fbbf24', radius: sc(8), opacity: 0.3 }) : {}),
    },
    silkReflect: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: 'rgba(255,255,255,0.2)', 
    },
    stringAnchorBottom: { 
        position: 'absolute', 
        bottom: sc(25), 
        width: sc(12), 
        height: sc(12), 
        borderRadius: sc(6), 
        backgroundColor: '#1a0d06', 
        borderWidth: 1.5, 
        borderColor: '#fbbf24',
        zIndex: 40,
    },
    pluckActionZone: { 
        position: 'absolute', 
        width: sc(70), 
        height: '100%', 
        zIndex: 60,
    },
    indexPill: {
        position: 'absolute',
        bottom: sc(25),
        backgroundColor: 'rgba(69, 26, 3, 0.4)',
        paddingHorizontal: sc(8),
        paddingVertical: sc(2),
        borderRadius: sc(10),
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.1)',
    },
    activeIndexPill: {
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        borderColor: '#fbbf24',
    },
    stringIndex: { 
        color: '#fbbf24', 
        fontSize: normalize(12), 
        fontWeight: '900', 
        opacity: 0.8,
    },
    footer: { marginTop: sc(35), width: '100%', alignItems: 'center' },
    aestheticOverlay: { 
        backgroundColor: 'rgba(255,255,255,0.04)', 
        paddingHorizontal: sc(30), 
        paddingVertical: sc(12), 
        borderRadius: sc(25), 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)',
    },
    harmonicMode: { color: '#94a3b8', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2 },
});
