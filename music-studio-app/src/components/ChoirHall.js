import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const VOCAL_RANGES = [
    { id: 'soprano', label: 'SOPRANO', color: '#64b5f6', notes: ['C5', 'D5', 'E5', 'F5', 'G5', 'A5'] },
    { id: 'alto', label: 'ALTO', color: '#4fc3f7', notes: ['G4', 'A4', 'B4', 'C5', 'D5', 'E5'] },
    { id: 'tenor', label: 'TENOR', color: '#29b6f6', notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'] },
    { id: 'bass', label: 'BASS', color: '#039be5', notes: ['E3', 'F3', 'G3', 'A3', 'B3', 'C4'] },
];

export default function ChoirHall() {
    const [activeNotes, setActiveNotes] = useState({});
    
    const pulseAnims = useRef(VOCAL_RANGES.reduce((acc, range) => {
        range.notes.forEach(note => {
            acc[note] = new Animated.Value(1);
        });
        return acc;
    }, {})).current;

    const playVocal = useCallback((note, velocity = 0.8) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(note, 'choir', 0, velocity);
        setActiveNotes(prev => ({ ...prev, [note]: true }));
        
        Animated.sequence([
            Animated.timing(pulseAnims[note], { toValue: 1.3, duration: 150, useNativeDriver: Platform.OS !== 'web' }),
            Animated.spring(pulseAnims[note], { toValue: 1, friction: 3, tension: 40, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
    }, []);

    const stopVocal = useCallback((note) => {
        UnifiedAudioEngine.stopSound(note, 'choir');
        setActiveNotes(prev => ({ ...prev, [note]: false }));
    }, []);

    return (
        <LinearGradient colors={['#020617', '#0f172a', '#020617']} style={styles.container}>
            <View style={styles.hallHeader}>
                <Text style={styles.hallTitle}>CATHEDRAL OF VOICES</Text>
                <Text style={styles.hallSubtitle}>MASTERCLASS CHOIR ENSEMBLE • CELESTIAL AURA</Text>
            </View>

            <View style={styles.ensembleContainer}>
                {VOCAL_RANGES.map((range) => (
                    <View key={range.id} style={styles.vocalSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>{range.label}</Text>
                            <View style={[styles.glowBar, { backgroundColor: range.color }]} />
                        </View>
                        
                        <View style={styles.voiceGems}>
                            {range.notes.map((note) => {
                                const isActive = activeNotes[note];
                                return (
                                    <TouchableOpacity
                                        key={note}
                                        style={styles.voiceGemWrapper}
                                        onPressIn={() => playVocal(note)}
                                        onPressOut={() => stopVocal(note)}
                                        activeOpacity={1}
                                        delayPressIn={0}
                                    >
                                        <View style={styles.gemBase}>
                                            <Animated.View 
                                                style={[
                                                    styles.voiceGem,
                                                    isActive && styles.voiceGemActive,
                                                    { 
                                                        borderColor: isActive ? '#fff' : 'rgba(255,255,255,0.05)',
                                                        transform: [{ scale: pulseAnims[note] }]
                                                    }
                                                ]}
                                            >
                                                <LinearGradient
                                                    colors={isActive ? ['#fff', range.color, '#1d4ed8'] : ['rgba(255,255,255,0.05)', 'transparent']}
                                                    style={StyleSheet.absoluteFill}
                                                />
                                                {isActive && <View style={styles.spectralHighlight} />}
                                            </Animated.View>
                                            
                                            {isActive && (
                                                <Animated.View 
                                                    style={[
                                                        styles.aura,
                                                        { 
                                                            borderColor: range.color,
                                                            transform: [{ scale: pulseAnims[note].interpolate({ inputRange: [1, 1.3], outputRange: [1, 2.5] }) }]
                                                        }
                                                    ]} 
                                                />
                                            )}
                                        </View>
                                        <Text style={[styles.noteId, isActive && { color: '#fff', ...createTextShadow({ color: range.color, radius: 10 }) }]}>
                                            {note}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <View style={styles.atmosphericBadge}>
                    <Text style={styles.badgeText}>HARMONIC SPECTRAL SYNCHRONIZATION ACTIVE</Text>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: sc(45),
        margin: sc(5),
        padding: sc(30),
        ...createShadow({ color: '#000', radius: sc(50), opacity: 0.95 }),
    },
    hallHeader: { alignItems: 'center', marginBottom: sc(40) },
    hallTitle: { color: '#fff', fontSize: normalize(20), fontWeight: '900', letterSpacing: 12, ...createTextShadow({ color: 'rgba(56, 189, 248, 0.8)', radius: 20 }) },
    hallSubtitle: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', marginTop: sc(8), letterSpacing: 4, textTransform: 'uppercase' },
    ensembleContainer: { flex: 1, justifyContent: 'space-between' },
    vocalSection: { flexDirection: 'row', alignItems: 'center', marginVertical: sc(15) },
    sectionHeader: { width: sc(110), alignItems: 'flex-end', marginRight: sc(30) },
    sectionLabel: { color: '#94a3b8', fontSize: normalize(11), fontWeight: '900', letterSpacing: 3, opacity: 0.8 },
    glowBar: { height: sc(2), width: sc(40), marginTop: sc(6), borderRadius: sc(1), opacity: 0.5 },
    voiceGems: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    voiceGemWrapper: { alignItems: 'center' },
    gemBase: { width: sc(64), height: sc(64), justifyContent: 'center', alignItems: 'center', position: 'relative' },
    voiceGem: { width: sc(50), height: sc(50), borderRadius: sc(25), backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', zIndex: 10 },
    voiceGemActive: { ...createShadow({ color: '#fff', radius: sc(20), opacity: 0.7 }) },
    spectralHighlight: { position: 'absolute', top: '10%', left: '10%', width: '30%', height: '30%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: sc(15) },
    aura: { position: 'absolute', width: sc(60), height: sc(60), borderRadius: sc(30), borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', zIndex: 5 },
    noteId: { color: '#334155', fontSize: normalize(10), fontWeight: '900', marginTop: sc(12), letterSpacing: 2 },
    footer: { marginTop: sc(30), alignItems: 'center' },
    atmosphericBadge: { backgroundColor: 'rgba(56,189,248,0.05)', paddingHorizontal: sc(30), paddingVertical: sc(12), borderRadius: sc(25), borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },
    badgeText: { color: '#334155', fontSize: normalize(9), fontWeight: '900', letterSpacing: 2.5 },
});
