import React, { useCallback, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Animated, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useProject } from '../contexts/ProjectContext';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';

const PERCUSSION = [
    { id: 1, name: 'CONGA HIGH', id_str: 'conga high', note: 'C4', color: '#8d6e63' },
    { id: 2, name: 'CONGA LOW', id_str: 'conga low', note: 'C3', color: '#5d4037' },
    { id: 3, name: 'BONGO HIGH', id_str: 'bongo high', note: 'D4', color: '#a1887f' },
    { id: 4, name: 'BONGO LOW', id_str: 'bongo low', note: 'D3', color: '#795548' },
    { id: 5, name: 'DJEMBE', id_str: 'djembe', note: 'E3', color: '#4e342e' },
    { id: 6, name: 'TABLA', id_str: 'tabla', note: 'F3', color: '#d7ccc8' },
    { id: 7, name: 'SHAKER', id_str: 'shaker', note: 'G4', color: '#bdbdbd' },
    { id: 8, name: 'COWBELL', id_str: 'cowbell', note: 'A4', color: '#616161' },
];

export default function WorldPercussion() {
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    const { tracks } = useProject();
    const track = tracks.find(t => t.name === 'World Percussion') || { volume: 0.8, pan: 0, muted: false };

    // Impact animations
    const impactAnims = useRef(PERCUSSION.reduce((acc, p) => {
        acc[p.id] = new Animated.Value(0);
        return acc;
    }, {})).current;

    const handlePadPress = useCallback((percussion) => {
        UnifiedAudioEngine.activateAudio();
        if (track.muted) return;

        // Use id_str for consistent engine mapping
        UnifiedAudioEngine.playDrumSound(percussion.id_str, 'world', track.volume, track.pan);

        Animated.sequence([
            Animated.timing(impactAnims[percussion.id], {
                toValue: 1,
                duration: 50,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(impactAnims[percussion.id], {
                toValue: 0,
                duration: 200,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    }, [track.muted, track.volume, track.pan]);

    const padWidth = isPhone ? (width - sc(80)) / 2 : sc(180);

    return (
        <LinearGradient colors={['#1a120f', '#0a0805']} style={[styles.container, { paddingTop: SAFE_TOP, paddingBottom: SAFE_BOTTOM + sc(10) }]}>
            <View style={[styles.header, isPhone && { height: sc(60), marginBottom: sc(15) }]}>
                <View style={styles.brandContainer}>
                    <Text style={styles.brandTitle}>SOLOCRAFT STUDIO</Text>
                    <Text style={[styles.modelTitle, isPhone && { fontSize: normalize(16) }]}>GLOBAL RHYTHMS</Text>
                </View>
                {!isPhone && (
                    <View style={[styles.regionBadge, { borderColor: '#8d6e63' + '44' }]}>
                        <View style={styles.badgeIndicator} />
                        <Text style={styles.regionText}>WORLD PERCUSSION PRO</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {PERCUSSION.map((perc) => {
                        const ringScale = impactAnims[perc.id].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.9, 1.3],
                        });
                        const ringOpacity = impactAnims[perc.id].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.6],
                        });

                        return (
                            <TouchableOpacity
                                key={perc.id}
                                style={[styles.padWrapper, { width: padWidth }]}
                                onPress={() => handlePadPress(perc)}
                                activeOpacity={0.9}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel={`${perc.name} percussion pad`}
                                accessibilityHint={`Plays the ${perc.name} sound`}
                            >
                                <Animated.View style={[
                                    styles.impactRing,
                                    { borderColor: perc.color, opacity: ringOpacity, transform: [{ scale: ringScale }] }
                                ]} />
                                
                                <LinearGradient
                                    colors={['#4e342e', '#2a1a15', '#1a0f0a']}
                                    style={styles.padBase}
                                >
                                    <LinearGradient
                                        colors={[perc.color + '22', 'transparent']}
                                        style={styles.padGlow}
                                    />
                                    <View style={[styles.skin, { backgroundColor: perc.color + '33' }]}>
                                        <View style={styles.textureOverlay} />
                                        <Text style={styles.padText}>{perc.name}</Text>
                                        <View style={[styles.accentBar, { backgroundColor: perc.color }]} />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Text style={[styles.instruction, isPhone && { fontSize: normalize(7) }]}>AUTHENTIC GLOBAL INSTRUMENT SAMPLES • 24-BIT STUDIO DEPTH</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: sc(30),
        margin: sc(5),
        padding: sc(25),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...createShadow({ color: '#000', radius: sc(25), opacity: 0.6 }),
    },
    header: {
        height: sc(80),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sc(25),
        paddingHorizontal: sc(10),
    },
    brandContainer: {
        gap: sc(2),
    },
    brandTitle: {
        color: '#8d6e63',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 2,
    },
    modelTitle: {
        color: '#fff',
        fontSize: normalize(22),
        fontWeight: '900',
        letterSpacing: 1,
        ...createTextShadow({ color: 'rgba(0,0,0,0.6)', radius: 6 }),
    },
    regionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: sc(14),
        paddingVertical: sc(8),
        borderRadius: sc(15),
        borderWidth: 1,
        gap: sc(10),
    },
    badgeIndicator: {
        width: sc(6),
        height: sc(6),
        borderRadius: sc(3),
        backgroundColor: '#8d6e63',
        ...createShadow({ color: '#8d6e63', radius: sc(5), opacity: 0.8 }),
    },
    regionText: {
        color: '#94a3b8',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    scrollContainer: {
        paddingBottom: sc(20),
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: sc(24),
        width: '100%',
    },
    padWrapper: {
        height: sc(110),
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    impactRing: {
        position: 'absolute',
        width: '115%',
        height: '115%',
        borderWidth: 3,
        borderRadius: sc(28),
    },
    padBase: {
        width: '100%',
        height: '100%',
        borderRadius: sc(24),
        padding: sc(4),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        ...createShadow({ color: '#000', offsetY: 12, radius: sc(10), opacity: 0.6 }),
    },
    padGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: sc(24),
        opacity: 0.5,
    },
    skin: {
        flex: 1,
        borderRadius: sc(20),
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    textureOverlay: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.05,
        backgroundColor: '#fff',
    },
    padText: {
        color: '#fff',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
        ...createTextShadow({ color: 'rgba(0,0,0,1)', radius: 4 }),
    },
    accentBar: {
        position: 'absolute',
        bottom: 0,
        width: '40%',
        height: sc(3),
        borderRadius: sc(2),
        opacity: 0.8,
    },
    footer: {
        marginTop: sc(25),
        alignItems: 'center',
        paddingTop: sc(15),
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    instruction: {
        color: '#475569',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 1,
    },
});
