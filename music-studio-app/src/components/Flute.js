import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const HOLES = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

export default function Flute({ instrument = 'flute' }) {
    const [activeHoles, setActiveHoles] = useState({});

    const playNote = useCallback((note) => {
        UnifiedAudioEngine.activateAudio();
        UnifiedAudioEngine.playSound(note, instrument, 0, 0.7);
        setActiveHoles(prev => ({ ...prev, [note]: true }));
        setTimeout(() => setActiveHoles(prev => ({ ...prev, [note]: false })), 300);
    }, []);

    return (
        <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{instrument.toUpperCase()}</Text>
                <Text style={styles.subtitle}>MASTERCLASS {instrument.toUpperCase()} • CONCERT SERIES</Text>
            </View>

            <View style={styles.fluteFrame}>
                {/* 1. MASTER TUBE BODY */}
                <View style={styles.masterTube}>
                    <LinearGradient
                        colors={['#cbd5e1', '#f8fafc', '#e2e8f0', '#94a3b8']}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                        style={styles.polishedSilver}
                    >
                        <View style={styles.tubeHighlight} />
                        <View style={styles.jointRings}>
                            {[1, 2, 3].map(i => <View key={i} style={styles.jointRing} />)}
                        </View>
                    </LinearGradient>

                    {/* 2. PRECISION KEY SYSTEM */}
                    <View style={styles.keyOverlay}>
                        {HOLES.map((note, index) => {
                            const isActive = activeHoles[note];
                            return (
                                <View key={note} style={styles.keyStation}>
                                    <TouchableOpacity
                                        activeOpacity={0.8}
                                        onPress={() => playNote(note)}
                                        style={styles.keyTouch}
                                    >
                                        <LinearGradient
                                            colors={isActive ? ['#38bdf8', '#0284c7'] : ['#f1f5f9', '#cbd5e1']}
                                            style={styles.keyPad}
                                        >
                                            <View style={styles.keyCenter} />
                                        </LinearGradient>
                                        {isActive && <View style={styles.resonantGlow} />}
                                    </TouchableOpacity>
                                    <Text style={[styles.keyText, isActive && { color: '#38bdf8' }]}>{note}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* 3. EMBOUCHURE JOINT */}
                <View style={styles.headJoint}>
                    <LinearGradient colors={['#f8fafc', '#94a3b8']} style={styles.lipPlate}>
                        <View style={styles.embouchureHole} />
                    </LinearGradient>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.statusBox}>
                    <Text style={styles.statusText}>PHASE-COHERENT AIRFLOW ENGINE ACTIVE</Text>
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
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.9 }),
    },
    header: { alignItems: 'center', marginBottom: sc(50) },
    title: {
        color: '#f8fafc',
        fontSize: normalize(20),
        fontWeight: '900',
        letterSpacing: 6,
        ...createTextShadow({ color: 'rgba(0,0,0,0.8)', radius: 10 }),
    },
    subtitle: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', letterSpacing: 2, marginTop: sc(4), opacity: 0.7 },
    fluteFrame: {
        flex: 1,
        width: '95%',
        justifyContent: 'center',
        position: 'relative',
    },
    masterTube: {
        width: '100%',
        height: sc(60),
        justifyContent: 'center',
        position: 'relative',
    },
    polishedSilver: {
        width: '100%',
        height: sc(40),
        borderRadius: sc(20),
        borderWidth: 1,
        borderColor: '#94a3b8',
        ...createShadow({ color: '#000', radius: sc(15), offsetY: 8 }),
    },
    tubeHighlight: {
        ...StyleSheet.absoluteFillObject,
        height: sc(12),
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: sc(20),
    },
    jointRings: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: sc(20),
    },
    jointRing: {
        width: sc(8),
        height: '110%',
        top: '-5%',
        backgroundColor: '#cbd5e1',
        borderWidth: 1,
        borderColor: '#94a3b8',
        borderRadius: 2,
    },
    keyOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: sc(50),
    },
    keyStation: { alignItems: 'center', gap: sc(20) },
    keyTouch: { width: sc(55), height: sc(55), justifyContent: 'center', alignItems: 'center' },
    keyPad: {
        width: sc(44),
        height: sc(44),
        borderRadius: sc(22),
        borderWidth: 2,
        borderColor: '#94a3b8',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: 8, offsetY: 4 }),
    },
    keyCenter: { width: sc(30), height: sc(30), borderRadius: sc(15), backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    resonantGlow: { position: 'absolute', width: sc(60), height: sc(60), borderRadius: sc(30), backgroundColor: 'rgba(56,189,248,0.1)', zIndex: -1 },
    keyText: { color: '#64748b', fontSize: normalize(10), fontWeight: '900', letterSpacing: 1 },
    headJoint: { position: 'absolute', left: sc(20), top: sc(-20) },
    lipPlate: {
        width: sc(70),
        height: sc(35),
        borderRadius: sc(18),
        borderWidth: 1.5,
        borderColor: '#cbd5e1',
        justifyContent: 'center',
        alignItems: 'center',
        ...createShadow({ color: '#000', radius: 10, opacity: 0.3 }),
    },
    embouchureHole: { width: sc(18), height: sc(12), borderRadius: sc(6), backgroundColor: '#000' },
    footer: { marginTop: sc(40), width: '100%', alignItems: 'center' },
    statusBox: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: sc(20),
        paddingVertical: sc(6),
        borderRadius: sc(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statusText: { color: '#475569', fontSize: normalize(9), fontWeight: '900', letterSpacing: 2 },
});
