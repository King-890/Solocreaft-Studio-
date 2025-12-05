import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { useInstrumentMixer } from '../hooks/useInstrumentMixer';

const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'];

export default function SynthPad() {
    useInstrumentMixer('synth');
    const [waveform, setWaveform] = useState('sine');
    const [params, setParams] = useState({ cutoff: 50, res: 20, lfo: 0 });

    const handlePressIn = useCallback(() => {
        // Defer logging to prevent blocking
        requestAnimationFrame(() => {
            console.log(`Synth playing ${waveform}`);
        });
        UnifiedAudioEngine.playSound('C4', 'synth'); // In real app, pass waveform
    }, [waveform]);

    const handlePressOut = useCallback(() => {
        requestAnimationFrame(() => {
            console.log('Synth Pad Press Out');
        });
        UnifiedAudioEngine.stopSound('C4', 'synth');
    }, []);

    const toggleParam = useCallback((param) => {
        setParams(prev => ({
            ...prev,
            [param]: (prev[param] + 25) % 100
        }));
    }, []);

    const handleWaveformChange = useCallback((w) => {
        setWaveform(w);
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.waveformContainer}>
                {WAVEFORMS.map(w => (
                    <TouchableOpacity
                        key={w}
                        style={[
                            styles.waveformBtn,
                            waveform === w && styles.waveformBtnActive
                        ]}
                        onPress={() => handleWaveformChange(w)}
                    >
                        <Text style={[
                            styles.waveformText,
                            waveform === w && styles.waveformTextActive
                        ]}>
                            {w.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.pad}
                activeOpacity={0.8}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                delayPressIn={0}
                delayPressOut={0}
            >
                <Text style={styles.text}>HOLD TO PLAY</Text>
                <Text style={styles.subtext}>{waveform.toUpperCase()} WAVE</Text>
            </TouchableOpacity>

            <View style={styles.controls}>
                {Object.entries(params).map(([key, value]) => (
                    <TouchableOpacity
                        key={key}
                        style={styles.knobContainer}
                        onPress={() => toggleParam(key)}
                    >
                        <View style={styles.knob}>
                            <Text style={styles.knobValue}>{value}</Text>
                        </View>
                        <Text style={styles.knobText}>{key.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        width: '100%',
    },
    waveformContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#333',
        borderRadius: 8,
        padding: 4,
    },
    waveformBtn: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    waveformBtnActive: {
        backgroundColor: '#6200ee',
    },
    waveformText: {
        color: '#888',
        fontSize: 12,
        fontWeight: 'bold',
    },
    waveformTextActive: {
        color: '#fff',
    },
    pad: {
        width: '100%',
        height: 180,
        backgroundColor: '#6200ee',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 24,
        letterSpacing: 2,
    },
    subtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
        marginTop: 5,
    },
    controls: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 30,
    },
    knobContainer: {
        alignItems: 'center',
    },
    knob: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#03dac6',
        marginBottom: 8,
    },
    knobValue: {
        color: '#03dac6',
        fontWeight: 'bold',
    },
    knobText: {
        color: '#aaa',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
