import React, { useState, useCallback, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH, useResponsive } from '../utils/responsive';
import HapticService from '../services/HapticService';
import InstrumentContainer from './InstrumentContainer';

const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'];

export default function SynthPad() {
    const { isPhone, isLandscape, SCREEN_WIDTH: width, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    
    // Desktop scaling clamp
    const s = (val) => (Platform.OS === 'web' || !isPhone) ? Math.min(sc(val), val * 2) : sc(val);
    const n = (val) => (Platform.OS === 'web' || !isPhone) ? Math.min(normalize(val), val * 1.5) : normalize(val);

    const [waveform, setWaveform] = useState('sine');
    const [params, setParams] = useState({ cutoff: 50, res: 20, lfo: 0 });
    const [octave, setOctave] = useState(4);
    const [noteIndex, setNoteIndex] = useState(0); // 0 = C

    const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const currentPitch = `${NOTES[noteIndex]}${octave}`;

    // Animation values
    const padScale = useRef(new Animated.Value(1)).current;
    const padGlow = useRef(new Animated.Value(0)).current;

    const handlePressIn = useCallback(() => {
        UnifiedAudioEngine.activateAudio();
        Animated.parallel([
            Animated.spring(padScale, { toValue: 0.98, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(padGlow, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
        
        // The unified engine now parses these for true mathematical synthesis
        UnifiedAudioEngine.playSound(currentPitch, 'synth', 0, 0.85, waveform, params); 
        HapticService.heavy();
    }, [currentPitch, waveform, params]);

    const handlePressOut = useCallback(() => {
        Animated.parallel([
            Animated.spring(padScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(padGlow, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' })
        ]).start();
        UnifiedAudioEngine.stopSound(currentPitch, 'synth');
    }, [currentPitch]);

    const decreaseTune = useCallback(() => {
        setNoteIndex(prev => {
            if (prev === 0) {
                if (octave > 1) setOctave(o => o - 1);
                return 11;
            }
            return prev - 1;
        });
        HapticService.selection();
    }, [octave]);

    const increaseTune = useCallback(() => {
        setNoteIndex(prev => {
            if (prev === 11) {
                if (octave < 7) setOctave(o => o + 1);
                return 0;
            }
            return prev + 1;
        });
        HapticService.selection();
    }, [octave]);

    const toggleParam = useCallback((param) => {
        setParams(prev => ({
            ...prev,
            [param]: (prev[param] + 25) % 100
        }));
        HapticService.selection();
    }, []);

    return (
        <InstrumentContainer>
            <View style={{ flex: 1, width: '100%', maxWidth: 1000, alignSelf: 'center' }}>
            <LinearGradient colors={['#050508', '#0a0b12']} style={styles.container}>
            <View style={[styles.header, isPhone && { marginBottom: 20 }]}>
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

            <Animated.View style={[styles.mainPadContainer, { transform: [{ scale: padScale }], height: isPhone ? sc(100) : sc(120) }]}>
                <View style={styles.tuneHUD}>
                    <TouchableOpacity style={styles.tuneBtn} onPress={decreaseTune}>
                        <Text style={styles.tuneBtnText}>- TUNE</Text>
                    </TouchableOpacity>
                    <View style={styles.tuneDisplay}>
                        <Text style={styles.tuneDisplayText}>{currentPitch}</Text>
                    </View>
                    <TouchableOpacity style={styles.tuneBtn} onPress={increaseTune}>
                        <Text style={styles.tuneBtnText}>TUNE +</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.pad}
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    delayPressIn={0}
                >
                    <LinearGradient
                        colors={['#1e114f', '#10132b']}
                        style={styles.padGradient}
                    />
                    <Animated.View style={[styles.padPulse, { opacity: padGlow }]} />
                    <View style={styles.padContent}>
                        <Text style={[styles.padMainText, isPhone && { fontSize: normalize(20) }]}>NEURAL TRIGGER</Text>
                        <Text style={styles.padSubText}>{waveform.toUpperCase()} MODE ACTIVE • {currentPitch}</Text>
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

                <View style={[styles.footer, { paddingBottom: 20 }]}>
                <Text style={styles.versionLabel}>V.2.0.4 • ANALOG CORE</Text>
            </View>
            </LinearGradient>
            </View>
        </InstrumentContainer>
    );
}

// Bounded responsive sizing to prevent desktop bloat
const r = (val) => Platform.OS === 'web' ? Math.min(val * 1.5, val) : val;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 24,
        margin: 10,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
        ...createShadow({ color: '#000', radius: 40, opacity: 0.9 }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: sc(12),
        paddingHorizontal: sc(10),
    },
    brandTitle: {
        color: '#7c3aed',
        fontSize: normalize(6),
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: sc(2)
    },
    modelTitle: {
        color: '#ffffff',
        fontSize: normalize(12),
        fontWeight: '900',
        letterSpacing: 2,
        ...createTextShadow({ color: 'rgba(124, 58, 237, 0.4)', radius: 8 }),
    },
    statusLed: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: sc(4),
        backgroundColor: '#050a10',
        paddingVertical: sc(4),
        paddingHorizontal: sc(8),
        borderRadius: sc(8),
        borderWidth: sc(1),
        borderColor: '#064e3b',
    },
    ledRing: {
        width: sc(8),
        height: sc(8),
        borderRadius: sc(4),
        borderWidth: sc(1),
        borderColor: 'rgba(16, 185, 129, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ledCore: {
        width: sc(3),
        height: sc(3),
        borderRadius: sc(1.5),
        backgroundColor: '#10b981',
        ...createShadow({ color: '#10b981', radius: sc(4) }),
    },
    statusText: {
        color: '#10b981',
        fontSize: normalize(6),
        fontWeight: '900',
        letterSpacing: 1,
    },
    waveformHUD: {
        flexDirection: 'row',
        backgroundColor: '#0a0b10',
        borderRadius: sc(8),
        padding: sc(1),
        marginBottom: sc(8),
        borderWidth: sc(1),
        borderColor: 'rgba(255,255,255,0.04)',
    },
    waveformBtn: {
        flex: 1,
        paddingVertical: sc(8),
        alignItems: 'center',
        borderRadius: sc(6),
        marginHorizontal: sc(2),
    },
    waveformBtnActive: {
        backgroundColor: '#1b0e40',
        ...createShadow({ color: '#7c3aed', radius: 8, opacity: 0.3 }),
    },
    waveformText: {
        color: '#475569',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    waveformTextActive: {
        color: '#ffffff',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#c084fc',
        marginTop: 6,
        ...createShadow({ color: '#c084fc', radius: 4, opacity: 0.8 }),
    },
    mainPadContainer: {
        width: '100%',
        marginBottom: 20,
        ...createShadow({ color: '#7c3aed', radius: 25, opacity: 0.2 }),
    },
    tuneHUD: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#050a10',
        borderRadius: 12,
        padding: 6,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.3)',
    },
    tuneBtn: {
        backgroundColor: '#1b0e40',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(192, 132, 252, 0.4)',
    },
    tuneBtnText: {
        color: '#c084fc',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    tuneDisplay: {
        flex: 1,
        alignItems: 'center',
    },
    tuneDisplayText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
        ...createTextShadow({ color: '#c084fc', radius: 10 }),
    },
    pad: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(124, 58, 237, 0.15)',
        borderTopColor: 'rgba(124, 58, 237, 0.5)',
    },
    padGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.95,
    },
    padPulse: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(124, 58, 237, 0.15)',
    },
    padContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    padMainText: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 5,
        ...createTextShadow({ color: 'rgba(192, 132, 252, 1)', radius: 30 }),
    },
    padSubText: {
        color: '#a5a6cd',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 12,
        letterSpacing: 1.5,
    },
    controlsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    paramCard: {
        flex: 1,
        backgroundColor: '#0a0b10',
        padding: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        ...createShadow({ color: '#000', radius: 10, opacity: 0.5 }),
    },
    dialContainer: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    dialTrack: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialValue: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    paramLabel: {
        color: '#475569',
        fontSize: 8,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    versionLabel: {
        color: '#1e293b',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
});
