import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';

const DRUM_PADS = [
    { id: 'kick', label: 'KICK', color: '#ff4444', row: 0, col: 0 },
    { id: 'snare', label: 'SNARE', color: '#44ff44', row: 0, col: 1 },
    { id: 'hihat', label: 'HI-HAT', color: '#4444ff', row: 0, col: 2 },
    { id: 'tom1', label: 'TOM 1', color: '#ffaa44', row: 1, col: 0 },
    { id: 'tom2', label: 'TOM 2', color: '#ff44aa', row: 1, col: 1 },
    { id: 'crash', label: 'CRASH', color: '#44aaff', row: 1, col: 2 },
];

export default function DrumMachine() {
    const { tracks } = useProject();
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    
    // Adaptive Pad Size
    const padSize = isPhone ? Math.min(width * 0.22, sc(85)) : sc(120);

    const track = tracks.find(t => t.name === 'Drums') || { volume: 0.9, pan: 0, muted: false };

    const animValues = useRef(DRUM_PADS.reduce((acc, pad) => {
        acc[pad.id] = new Animated.Value(0);
        return acc;
    }, {})).current;

    const handlePadPress = (pad, evt) => {
        if (track.muted) return;
        UnifiedAudioEngine.activateAudio();

        const { locationX, locationY } = evt.nativeEvent;
        const center = padSize / 2;
        const dx = locationX - center;
        const dy = locationY - center;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const velocity = Math.max(1.0 - (dist / padSize), 0.4);

        UnifiedAudioEngine.playDrumSound(pad.id, 'drums', track.volume * velocity, track.pan);

        Animated.sequence([
            Animated.timing(animValues[pad.id], {
                toValue: 1,
                duration: 50,
                useNativeDriver: false,
            }),
            Animated.timing(animValues[pad.id], {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    };

    return (
        <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={[styles.container, { paddingTop: SAFE_TOP, paddingBottom: SAFE_BOTTOM + sc(10) }]}>
            <View style={[styles.header, isPhone && { marginBottom: sc(10) }]}>
                <View>
                    <Text style={styles.brandTitle}>SOLOCRAFT INDUSTRIAL</Text>
                    <Text style={[styles.modelTitle, isPhone && { fontSize: normalize(12) }]}>PRO-DRUM MK-III</Text>
                </View>
                {!isPhone && (
                    <View style={styles.masterLedContainer}>
                        <View style={styles.ledLabel}><Text style={styles.ledLabelText}>PWR</Text></View>
                        <View style={[styles.led, styles.ledGreen]} />
                        <View style={styles.ledLabel}><Text style={styles.ledLabelText}>SIG</Text></View>
                        <View style={[styles.led, styles.ledRed]} />
                    </View>
                )}
            </View>

            <View style={[styles.grid, { gap: isPhone ? sc(10) : sc(15) }]}>
                {DRUM_PADS.map((pad) => {
                    const glowScale = animValues[pad.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                    });
                    const glowOpacity = animValues[pad.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.6],
                    });

                    return (
                        <TouchableOpacity
                            key={pad.id}
                            style={[styles.padWrapper, { width: padSize, height: padSize }]}
                            onPressIn={(e) => handlePadPress(pad, e)}
                            activeOpacity={0.9}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Drum pad: ${pad.label}`}
                            accessibilityHint={`Plays the ${pad.label} sound`}
                        >
                            <Animated.View style={[
                                styles.padGlow, 
                                { backgroundColor: pad.color, opacity: glowOpacity, transform: [{ scale: glowScale }] }
                            ]} />
                            <LinearGradient
                                colors={['#334155', '#1e293b', '#0f172a']}
                                style={[styles.pad, { width: padSize, height: padSize, borderColor: 'rgba(255,255,255,0.1)' }]}
                            >
                                <View style={[styles.innerSurface, { borderColor: pad.color + '66' }]}>
                                    {/* Texture Overlay */}
                                    <View style={[styles.siliconeTexture, { backgroundColor: pad.color, opacity: 0.05 }]} />
                                    <View style={[styles.padStatusLed, { backgroundColor: pad.color }]} />
                                    <Text style={[styles.padText, { color: '#fff', fontSize: isPhone ? normalize(8) : normalize(10) }]}>{pad.label}</Text>
                                    <View style={[styles.cornerDecorator, { borderTopColor: pad.color, borderLeftColor: pad.color }]} />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.instruction, isPhone && { fontSize: normalize(7) }]}>PRESSURE SENSITIVE SILICONE PADS • CENTER ATK MODE</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: sc(20),
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...createShadow({ color: '#000', offsetY: 20, opacity: 0.8, radius: 30, elevation: 20 }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sc(20),
        paddingHorizontal: sc(10),
    },
    brandTitle: {
        color: '#4a9eff',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
    },
    modelTitle: {
        color: '#fff',
        fontSize: normalize(16),
        fontWeight: '900',
        letterSpacing: 1,
        ...createTextShadow({ color: 'rgba(0,0,0,0.5)', radius: 5 }),
    },
    masterLedContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        borderRadius: 12,
    },
    ledLabel: {
        marginRight: -4,
    },
    ledLabelText: {
        color: '#444',
        fontSize: 8,
        fontWeight: '900',
    },
    led: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    ledGreen: {
        backgroundColor: '#44ff44',
        ...createShadow({ color: '#44ff44', radius: 8, opacity: 0.8 }),
    },
    ledRed: {
        backgroundColor: '#ff4444',
        opacity: 0.3,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        gap: sc(15),
    },
    padWrapper: {
        position: 'relative',
    },
    padGlow: {
        position: 'absolute',
        top: -sc(10),
        left: -sc(10),
        right: -sc(10),
        bottom: -sc(10),
        borderRadius: 30,
        zIndex: -1,
    },
    pad: {
        borderRadius: 20,
        borderWidth: 1.5,
        padding: sc(6),
        ...createShadow({ color: '#000', offsetY: 12, opacity: 0.5, radius: 15, elevation: 12 }),
    },
    innerSurface: {
        flex: 1,
        borderRadius: 14,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        overflow: 'hidden',
    },
    siliconeTexture: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 14,
    },
    padStatusLed: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 6,
        height: 6,
        borderRadius: 3,
        opacity: 0.6,
        ...createShadow({ color: '#fff', radius: 4, opacity: 0.5 }),
    },
    cornerDecorator: {
        position: 'absolute',
        top: 8,
        left: 8,
        width: 15,
        height: 15,
        borderTopWidth: 2,
        borderLeftWidth: 2,
        opacity: 0.4,
    },
    padText: {
        fontSize: normalize(10),
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#f8fafc',
        ...createTextShadow({ color: 'rgba(0, 0, 0, 0.9)', radius: 4, offsetY: 2 }),
    },
    footer: {
        marginTop: sc(20),
        paddingTop: sc(15),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    instruction: {
        color: '#64748b',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});
