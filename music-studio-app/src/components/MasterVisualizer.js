import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Svg, Rect, G, LinearGradient, Stop, Defs } from 'react-native-svg';
import UnifiedAudioContext from '../services/UnifiedAudioContext';
import { COLORS } from '../constants/UIConfig';

const VISUALIZER_WIDTH = Dimensions.get('window').width - 40;
const VISUALIZER_HEIGHT = 100;
const BARS = 40;

const MasterVisualizer = ({ active = true }) => {
    const [data, setData] = useState(new Uint8Array(BARS).fill(0));
    const [peakL, setPeakL] = useState(0);
    const [peakR, setPeakR] = useState(0);
    const animationRef = useRef();
    const analyserRef = useRef(null);
    const prevDataRef = useRef(new Float32Array(BARS).fill(0)); // For physics decay
    const [presetColors, setPresetColors] = useState(['#6200ee', '#BA55D3']);

    useEffect(() => {
        const masterBus = UnifiedAudioContext.getMasterBus();
        if (masterBus && masterBus.analyser) {
            analyserRef.current = masterBus.analyser;
            if (active) {
                startAnimation();
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [active]);

    const getColorsForPreset = (preset) => {
        switch (preset) {
            case 'Lo-Fi': return ['#ff9800', '#f44336']; // Warm Orange/Red
            case 'Cinematic': return ['#00bcd4', '#3f51b5']; // Cyan/Blue
            case 'Radio Ready': return ['#00e676', '#03dac6']; // Green/Teal
            default: return ['#6200ee', '#BA55D3']; // Purple (Flat)
        }
    };

    const startAnimation = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const update = () => {
            analyserRef.current.getByteFrequencyData(dataArray);
            
            // Sync colors with preset
            const currentPreset = UnifiedAudioContext.getCurrentPreset();
            setPresetColors(getColorsForPreset(currentPreset));

            // Downsample to BARS
            const step = Math.floor(bufferLength / BARS);
            const downsampled = new Uint8Array(BARS);
            const gravity = 1.5; // Physics fall-off

            for (let i = 0; i < BARS; i++) {
                let val = 0;
                for (let j = 0; j < step; j++) {
                    val += dataArray[i * step + j];
                }
                const currentVal = (val / step) * 1.2; // Increase sensitivity
                
                // Physics-based decay: Use the higher of (current value) or (previous - gravity)
                const decayedVal = Math.max(currentVal, prevDataRef.current[i] - gravity);
                downsampled[i] = decayedVal;
                prevDataRef.current[i] = decayedVal;
            }

            // Enhanced Peak Calculation
            let sumL = 0;
            let sumR = 0;
            for (let i = 0; i < BARS / 2; i++) sumL += downsampled[i];
            for (let i = BARS / 2; i < BARS; i++) sumR += downsampled[i];

            setData(downsampled);
            setPeakL(Math.min(100, (sumL / (BARS / 2)) * 1.8));
            setPeakR(Math.min(100, (sumR / (BARS / 2)) * 1.8));

            animationRef.current = requestAnimationFrame(update);
        };

        update();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MASTER ANALYZER ({UnifiedAudioContext.getCurrentPreset().toUpperCase()})</Text>
                <View style={styles.peakContainer}>
                    <View style={styles.peakChannel}>
                        <Text style={styles.peakLabel}>L</Text>
                        <View style={styles.peakBg}>
                            <View style={[styles.peakFill, { width: `${peakL}%`, backgroundColor: peakL > 85 ? '#ff4b2b' : presetColors[0] }]} />
                        </View>
                    </View>
                    <View style={styles.peakChannel}>
                        <Text style={styles.peakLabel}>R</Text>
                        <View style={styles.peakBg}>
                            <View style={[styles.peakFill, { width: `${peakR}%`, backgroundColor: peakR > 85 ? '#ff4b2b' : presetColors[0] }]} />
                        </View>
                    </View>
                </View>
            </View>

            <Svg width={VISUALIZER_WIDTH} height={VISUALIZER_HEIGHT} viewBox={`0 0 ${VISUALIZER_WIDTH} ${VISUALIZER_HEIGHT}`}>
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <Stop offset="0%" stopColor={presetColors[0]} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={presetColors[1]} stopOpacity="1" />
                    </LinearGradient>
                </Defs>
                <G>
                    {Array.from(data).map((val, i) => {
                        const barWidth = (VISUALIZER_WIDTH / BARS) - 2;
                        const barHeight = (val / 255) * VISUALIZER_HEIGHT;
                        return (
                            <Rect
                                key={i}
                                x={i * (VISUALIZER_WIDTH / BARS)}
                                y={VISUALIZER_HEIGHT - barHeight}
                                width={barWidth}
                                height={Math.max(2, barHeight)}
                                fill="url(#grad)"
                                rx={2}
                            />
                        );
                    })}
                </G>
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 15,
        borderRadius: 16,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...Platform.select({
            web: {
                backdropFilter: 'blur(10px)',
            }
        })
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        color: '#aaa',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    peakContainer: {
        flex: 1,
        marginLeft: 20,
        gap: 4,
    },
    peakChannel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    peakLabel: {
        color: '#666',
        fontSize: 8,
        fontWeight: 'bold',
        width: 10,
    },
    peakBg: {
        flex: 1,
        height: 4,
        backgroundColor: '#222',
        borderRadius: 2,
        overflow: 'hidden',
    },
    peakFill: {
        height: '100%',
        borderRadius: 2,
    }
});

export default MasterVisualizer;
