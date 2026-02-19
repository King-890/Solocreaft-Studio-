import React, { useState } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SPACING } from '../constants/UIConfig';
import AudioPlaybackService from '../services/AudioPlaybackService';
import { sc, normalize } from '../utils/responsive';
import { createShadow } from '../utils/shadows';

const SimpleSlider = ({ label, value, min, max, onChange, unit = '' }) => {
    const [sliderWidth, setSliderWidth] = useState(0);

    const handleTouch = (evt) => {
        if (sliderWidth === 0) return;
        const locationX = evt.nativeEvent.locationX;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        const newValue = min + percentage * (max - min);
        onChange(newValue);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleTouch(evt),
        onPanResponderMove: (evt) => handleTouch(evt),
    });

    const percentage = (value - min) / (max - min);

    return (
        <View style={styles.sliderRow}>
            <View style={styles.labelContainer}>
                <Text style={styles.sliderLabel}>{label}</Text>
                <Text style={styles.sliderValue}>{value.toFixed(2)}{unit}</Text>
            </View>
            <View 
                style={styles.sliderTrack}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
            >
                <View style={[styles.sliderFill, { width: `${percentage * 100}%` }]} />
                <View style={[styles.sliderThumb, { left: `${percentage * 100}%` }]} />
            </View>
        </View>
    );
};

const EffectsRack = ({ visible }) => {
    const [distortion, setDistortion] = useState(0);
    const [delayMix, setDelayMix] = useState(0);
    const [delayTime, setDelayTime] = useState(0.4);
    const [delayFeedback, setDelayFeedback] = useState(0.4);
    const [reverbMix, setReverbMix] = useState(0.15);

    const handleDistortionChange = (val) => {
        setDistortion(val);
        AudioPlaybackService.setDistortion(val);
    };

    const handleDelayMixChange = (val) => {
        setDelayMix(val);
        AudioPlaybackService.setDelay(val, delayTime, delayFeedback);
    };

    const handleDelayTimeChange = (val) => {
        setDelayTime(val);
        AudioPlaybackService.setDelay(delayMix, val, delayFeedback);
    };

    const handleDelayFeedbackChange = (val) => {
        setDelayFeedback(val);
        AudioPlaybackService.setDelay(delayMix, delayTime, val);
    };

    const handleReverbChange = (val) => {
        setReverbMix(val);
        AudioPlaybackService.setReverb(val);
    };

    if (!visible) return null;

    return (
        <View style={styles.rackContainer}>
            <Text style={styles.rackTitle}>FX RACK</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DISTORTION</Text>
                <SimpleSlider 
                    label="Drive"
                    value={distortion} 
                    min={0} 
                    max={1} 
                    onChange={handleDistortionChange} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DELAY</Text>
                <SimpleSlider 
                    label="Mix"
                    value={delayMix} 
                    min={0} 
                    max={1} 
                    onChange={handleDelayMixChange} 
                />
                <SimpleSlider 
                    label="Time"
                    value={delayTime} 
                    min={0.1} 
                    max={2.0} 
                    onChange={handleDelayTimeChange} 
                    unit="s"
                />
                <SimpleSlider 
                    label="Feedback"
                    value={delayFeedback} 
                    min={0} 
                    max={0.9} 
                    onChange={handleDelayFeedbackChange} 
                />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>REVERB</Text>
                <SimpleSlider 
                    label="Wet"
                    value={reverbMix} 
                    min={0} 
                    max={1} 
                    onChange={handleReverbChange} 
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    rackContainer: {
        backgroundColor: '#0a0a0f',
        padding: sc(20),
        borderRadius: sc(12),
        borderWidth: 1,
        borderColor: '#ffd70044',
        width: '100%',
        marginVertical: sc(10),
        ...createShadow({
            color: '#000',
            offsetY: 4,
            opacity: 0.5,
            radius: 10,
            elevation: 8,
        }),
    },
    rackTitle: {
        color: '#ffd700',
        fontSize: normalize(14),
        fontWeight: 'bold',
        letterSpacing: 4,
        marginBottom: sc(20),
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: sc(25),
        paddingHorizontal: sc(10),
    },
    sectionTitle: {
        color: '#ffd700aa',
        fontSize: normalize(10),
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: sc(12),
        borderBottomWidth: 1,
        borderBottomColor: '#ffd70022',
        paddingBottom: sc(4),
    },
    sliderRow: {
        marginBottom: sc(15),
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: sc(6),
    },
    sliderLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: normalize(12),
        fontWeight: '500',
    },
    sliderValue: {
        color: '#03dac6',
        fontSize: normalize(11),
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontWeight: 'bold',
    },
    sliderTrack: {
        height: sc(6),
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: sc(3),
        position: 'relative',
        justifyContent: 'center',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#03dac6',
        borderRadius: sc(3),
        position: 'absolute',
    },
    sliderThumb: {
        width: sc(18),
        height: sc(18),
        borderRadius: sc(9),
        backgroundColor: '#fff',
        position: 'absolute',
        marginLeft: sc(-9),
        borderWidth: 2,
        borderColor: '#03dac6',
        ...createShadow({
            color: '#000',
            offsetY: 2,
            opacity: 0.8,
            radius: 3,
            elevation: 4,
        }),
    },
});

export default EffectsRack;
