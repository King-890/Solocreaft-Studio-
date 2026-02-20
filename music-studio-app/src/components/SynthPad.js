import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';

const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'];

export default function SynthPad() {
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    const [waveform, setWaveform] = useState('sine');
    const [params, setParams] = useState({ cutoff: 50, res: 20, lfo: 0 });

    // Animation values
    const padScale = useRef(new Animated.Value(1)).current;
    const padGlow = useRef(new Animated.Value(0)).current;

    const handlePressIn = useCallback(() => {
        UnifiedAudioEngine.activateAudio();
        Animated.parallel([
            Animated.spring(padScale, { toValue: 0.98, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(padGlow, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
        
        // Note: Waveform is managed by the internal synth state when instrument='synth' is used
        UnifiedAudioEngine.playSound('C4', 'synth'); 
    }, []);

    const handlePressOut = useCallback(() => {
        Animated.parallel([
            Animated.spring(padScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(padGlow, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
        
        UnifiedAudioEngine.stopSound('C4', 'synth');
    }, []);

    const toggleParam = useCallback((param) => {
        setParams(prev => ({
            ...prev,
            [param]: (prev[param] + 25) % 100
        }));
    }, []);

    return (
        <LinearGradient colors={['#020617', '#0f172a']} style={[styles.container, { paddingTop: SAFE_TOP }]}>
            <View style={[styles.header, isPhone && { marginBottom: sc(20) }]}>
                <View>
                    <Text style={styles.brandTitle}>NEURAL SYNTHETICS</Text>
                    <Text style={[styles.modelTitle, isPhone && { fontSize: normalize(16) }]}>CYBER-PAD X1</Text>
                </View>
                {!isPhone && (
                    <View style={styles.statusLed}>
                        <View style={styles.ledRing}>
                            <View style={styles.ledCore} />
                        </View>
                        <Text style={styles.statusText}>SYNC OK</Text>
                    </View>
                )}
            </View>

            <View style={[styles.waveformHUD, isPhone && { marginBottom: sc(20) }]}>
                {WAVEFORMS.map(w => (
                    <TouchableOpacity
                        key={w}
                        style={[
                            styles.waveformBtn,
                            waveform === w && styles.waveformBtnActive
                        ]}
                        onPress={() => setWaveform(w)}
                    >
                        <Text style={[
                            styles.waveformText,
                            waveform === w && styles.waveformTextActive
                        ]}>
                            {w.toUpperCase()}
                        </Text>
                        {waveform === w && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                ))}
            </View>

            <Animated.View style={[styles.mainPadContainer, { transform: [{ scale: padScale }], height: isPhone ? sc(160) : sc(200) }]}>
                <TouchableOpacity
                    style={styles.pad}
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    delayPressIn={0}
                >
                    <LinearGradient
                        colors={['rgba(98, 0, 238, 0.4)', 'rgba(3, 218, 198, 0.1)']}
                        style={styles.padGradient}
                    />
                    <Animated.View style={[styles.padPulse, { opacity: padGlow }]} />
                    <View style={styles.padContent}>
                        <Text style={[styles.padMainText, isPhone && { fontSize: normalize(18) }]}>NEURAL TRIGGER</Text>
                        <Text style={styles.padSubText}>{waveform.toUpperCase()} MODE active</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            <View style={[styles.controlsGrid, isLandscape && { alignSelf: 'center', width: '80%' }]}>
                {Object.entries(params).map(([key, value]) => (
                    <TouchableOpacity
                        key={key}
                        style={styles.paramCard}
                        onPress={() => toggleParam(key)}
                    >
                        <View style={styles.dialContainer}>
                            <View style={[styles.dialTrack, { borderTopColor: value > 50 ? '#03dac6' : '#6200ee' }]}>
                                <Text style={styles.dialValue}>{value}%</Text>
                            </View>
                        </View>
                        <Text style={styles.paramLabel}>{key.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={[styles.footer, { paddingBottom: SAFE_BOTTOM + sc(10) }]}>
                <Text style={styles.versionLabel}>V.2.0.4 • ANALOG CORE</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: sc(40),
        margin: sc(5),
        padding: sc(30),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        ...createShadow({ color: '#000', radius: sc(25), opacity: 0.6 }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sc(35),
    },
    brandTitle: {
        color: '#6200ee',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 2,
    },
    modelTitle: {
        color: '#fff',
        fontSize: normalize(20),
        fontWeight: '900',
        letterSpacing: 1,
        ...createTextShadow({ color: 'rgba(0,0,0,0.5)', radius: 5 }),
    },
    statusLed: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sc(8),
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: sc(8),
        borderRadius: sc(12),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    ledRing: {
        width: sc(12),
        height: sc(12),
        borderRadius: sc(6),
        borderWidth: 1,
        borderColor: '#03dac6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ledCore: {
        width: sc(4),
        height: sc(4),
        borderRadius: sc(2),
        backgroundColor: '#03dac6',
        ...createShadow({ color: '#03dac6', radius: sc(5) }),
    },
    statusText: {
        color: '#03dac6',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 1,
    },
    waveformHUD: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: sc(15),
        padding: sc(4),
        marginBottom: sc(30),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    waveformBtn: {
        flex: 1,
        paddingVertical: sc(12),
        alignItems: 'center',
        borderRadius: sc(12),
    },
    waveformBtnActive: {
        backgroundColor: 'rgba(98, 0, 238, 0.2)',
    },
    waveformText: {
        color: '#64748b',
        fontSize: normalize(10),
        fontWeight: '900',
        letterSpacing: 1,
    },
    waveformTextActive: {
        color: '#fff',
    },
    activeDot: {
        width: sc(4),
        height: sc(4),
        borderRadius: sc(2),
        backgroundColor: '#6200ee',
        marginTop: sc(4),
    },
    mainPadContainer: {
        width: '100%',
        marginBottom: sc(40),
        ...createShadow({ color: '#6200ee', radius: sc(15), opacity: 0.3 }),
    },
    pad: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: sc(25),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(98, 0, 238, 0.3)',
    },
    padGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    padPulse: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(98, 0, 238, 0.2)',
    },
    padContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    padMainText: {
        color: '#fff',
        fontSize: normalize(22),
        fontWeight: '900',
        letterSpacing: 2,
        ...createTextShadow({ color: '#6200ee', radius: 10 }),
    },
    padSubText: {
        color: '#94a3b8',
        fontSize: normalize(10),
        fontWeight: 'bold',
        marginTop: sc(8),
        textTransform: 'uppercase',
    },
    controlsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: sc(20),
    },
    paramCard: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: sc(15),
        borderRadius: sc(20),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    dialContainer: {
        width: sc(50),
        height: sc(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: sc(10),
    },
    dialTrack: {
        width: sc(44),
        height: sc(44),
        borderRadius: sc(22),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialValue: {
        color: '#fff',
        fontSize: normalize(11),
        fontWeight: 'bold',
    },
    paramLabel: {
        color: '#475569',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 1,
    },
    footer: {
        marginTop: sc(40),
        alignItems: 'center',
    },
    versionLabel: {
        color: '#1e293b',
        fontSize: normalize(9),
        fontWeight: '900',
        letterSpacing: 2,
    },
});
