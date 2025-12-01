import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, PanResponder, Platform, useWindowDimensions } from 'react-native';
import { COLORS, SPACING } from '../constants/UIConfig';

// Custom Slider component to avoid dependency issues on web
const SimpleSlider = ({ value, minimumValue, maximumValue, onValueChange, step = 0.01 }) => {
    const [sliderWidth, setSliderWidth] = useState(0);

    const handleTouch = (evt) => {
        if (sliderWidth === 0) return;

        const locationX = evt.nativeEvent.locationX;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        const newValue = minimumValue + percentage * (maximumValue - minimumValue);

        // Apply step
        const steppedValue = Math.round(newValue / step) * step;
        onValueChange(steppedValue);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (evt) => handleTouch(evt),
        onPanResponderMove: (evt) => handleTouch(evt),
    });

    const percentage = (value - minimumValue) / (maximumValue - minimumValue);

    return (
        <View
            style={styles.sliderContainer}
            onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
            {...panResponder.panHandlers}
        >
            <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${percentage * 100}%` }]} />
            </View>
            <View style={[styles.sliderThumb, { left: `${percentage * 100}%` }]} />
        </View>
    );
};

const defaultSettings = {
    volume: 0.7, tune: 0, reverb: 0.3, bass: 0.5, treble: 0.5,
    detune: 0, attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5,
    lfoRate: 5, lfoDepth: 0, operaVowel: 0, distortion: 0
};

const InstrumentSettings = ({ visible, onClose, instrumentName, instrumentId, onSettingsChange, currentSettings }) => {
    const { width } = useWindowDimensions();
    const [settings, setSettings] = useState({ ...defaultSettings, ...currentSettings });

    useEffect(() => {
        if (currentSettings) {
            setSettings({ ...defaultSettings, ...currentSettings });
        }
    }, [currentSettings]);

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        if (onSettingsChange) {
            onSettingsChange(newSettings);
        }
    };

    const handleReset = () => {
        setSettings(defaultSettings);
        if (onSettingsChange) {
            onSettingsChange(defaultSettings);
        }
    };

    const applyPreset = (presetName) => {
        const presets = getPresetsForInstrument(instrumentName);
        if (presets[presetName]) {
            const newSettings = { ...settings, ...presets[presetName] };
            setSettings(newSettings);
            if (onSettingsChange) {
                onSettingsChange(newSettings);
            }
        }
    };

    const getPresetsForInstrument = (instrument) => {
        const presets = {
            guitar: {
                clean: { distortion: 0, chorus: 0.1, reverb: 0.2, bass: 0.5, treble: 0.6 },
                rock: { distortion: 0.7, chorus: 0.2, reverb: 0.3, bass: 0.8, treble: 0.7 },
                jazz: { distortion: 0.1, chorus: 0.4, reverb: 0.6, bass: 0.4, treble: 0.5 },
            },
            piano: {
                classical: { attack: 0.01, release: 2, sustain: 0.9, reverb: 0.5, bass: 0.5, treble: 0.6 },
                jazz: { attack: 0.05, release: 1.5, sustain: 0.7, reverb: 0.4, bass: 0.6, treble: 0.5 },
                bright: { attack: 0.005, release: 1, sustain: 0.6, reverb: 0.2, bass: 0.4, treble: 0.8 },
            },
            drums: {
                tight: { decay: 0.2, punch: 0.8, resonance: 0.3, reverb: 0.1 },
                roomy: { decay: 0.6, punch: 0.5, resonance: 0.6, reverb: 0.7 },
                punchy: { decay: 0.3, punch: 0.9, resonance: 0.4, reverb: 0.2 },
            },
        };
        return presets[instrument?.toLowerCase()] || {};
    };

    const getInstrumentSpecificControls = () => {
        const name = instrumentName?.toLowerCase();

        if (name === 'guitar') {
            return [
                { key: 'distortion', label: '⚡ Distortion', min: 0, max: 1 },
                { key: 'chorus', label: '🌊 Chorus', min: 0, max: 1 },
                { key: 'pluckIntensity', label: '🎸 Pluck', min: 0, max: 1 },
            ];
        } else if (name === 'piano' || name === 'synthesizer') {
            return [
                { key: 'attack', label: '⚡ Attack', min: 0.001, max: 0.5 },
                { key: 'release', label: '🔊 Release', min: 0.1, max: 3 },
                { key: 'sustain', label: '📊 Sustain', min: 0, max: 1 },
            ];
        } else if (name === 'drums' || name === 'tabla' || name === 'dholak') {
            return [
                { key: 'decay', label: '⏱️ Decay', min: 0.1, max: 1 },
                { key: 'punch', label: '👊 Punch', min: 0, max: 1 },
                { key: 'resonance', label: '🔔 Resonance', min: 0, max: 1 },
            ];
        } else if (name === 'flute' || name === 'saxophone') {
            return [
                { key: 'vibratoSpeed', label: '🎵 Vibrato Speed', min: 1, max: 10 },
                { key: 'vibratoDepth', label: '🌊 Vibrato Depth', min: 0, max: 30 },
                { key: 'breathNoise', label: '💨 Breath', min: 0, max: 0.3 },
            ];
        } else if (name === 'violin' || name === 'veena') {
            return [
                { key: 'bowPressure', label: '🎻 Bow Pressure', min: 0, max: 1 },
                { key: 'vibratoSpeed', label: '🎵 Vibrato Speed', min: 1, max: 10 },
                { key: 'stringResonance', label: '🔔 Resonance', min: 0, max: 1 },
            ];
        }
        return [];
    };

    const renderSlider = (label, key, min, max, step = 0.01) => {
        const value = settings[key] !== undefined ? settings[key] : (min + max) / 2;
        const percentage = Math.round(((value - min) / (max - min)) * 100);

        return (
            <View key={key} style={styles.settingRow}>
                <View style={styles.sliderHeader}>
                    <Text style={styles.sliderLabel}>{label}</Text>
                    <Text style={styles.sliderValue}>
                        {key === 'tune' ? `${value > 0 ? '+' : ''}${value.toFixed(0)}` : `${percentage}%`}
                    </Text>
                </View>
                <SimpleSlider
                    minimumValue={min}
                    maximumValue={max}
                    step={step}
                    value={value}
                    onValueChange={(val) => handleSettingChange(key, val)}
                />
            </View>
        );
    };

    const presetNames = Object.keys(getPresetsForInstrument(instrumentName));

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>⚙️ {instrumentName} Settings</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Universal Controls */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Universal Controls</Text>
                            {renderSlider('🔊 Volume', 'volume', 0, 1)}
                            {renderSlider('🎵 Tune', 'tune', -12, 12, 1)}
                            {renderSlider('🔊 Reverb', 'reverb', 0, 1)}
                            {renderSlider('🎛️ Bass', 'bass', 0, 1)}
                            {renderSlider('🎛️ Treble', 'treble', 0, 1)}
                        </View>

                        {/* Oscillator & Envelope */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Oscillator & Envelope</Text>
                            {renderSlider('🌊 Detune', 'detune', -100, 100, 1)}
                            {renderSlider('⚡ Attack', 'attack', 0.001, 2)}
                            {renderSlider('⏱️ Decay', 'decay', 0.1, 2)}
                            {renderSlider('📊 Sustain', 'sustain', 0, 1)}
                            {renderSlider('🔊 Release', 'release', 0.1, 3)}
                        </View>

                        {/* Modulation */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Modulation (Oscillations)</Text>
                            {renderSlider('⚡ LFO Rate', 'lfoRate', 0.1, 20)}
                            {renderSlider('🌊 LFO Depth', 'lfoDepth', 0, 100)}
                        </View>

                        {/* Effects & Opera */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Effects & Opera</Text>
                            {renderSlider('🎭 Opera Vowel', 'operaVowel', 0, 4, 1)}
                            {renderSlider('⚡ Distortion', 'distortion', 0, 1)}
                        </View>

                        {/* Instrument-Specific Controls */}
                        {getInstrumentSpecificControls().length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>{instrumentName}-Specific</Text>
                                {getInstrumentSpecificControls().map(control =>
                                    renderSlider(control.label, control.key, control.min, control.max)
                                )}
                            </View>
                        )}

                        {/* Presets */}
                        {presetNames.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Presets</Text>
                                <View style={styles.presetButtons}>
                                    {presetNames.map(preset => (
                                        <TouchableOpacity
                                            key={preset}
                                            style={styles.presetButton}
                                            onPress={() => applyPreset(preset)}
                                        >
                                            <Text style={styles.presetButtonText}>
                                                {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Reset Button */}
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>🔄 Reset to Defaults</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#16213e',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        color: COLORS.textGold,
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: SPACING.sm,
    },
    closeButtonText: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    section: {
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    sectionTitle: {
        color: COLORS.textGold,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    settingRow: {
        marginBottom: SPACING.md,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    sliderLabel: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '600',
    },
    sliderValue: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    // Custom Slider Styles
    sliderContainer: {
        height: 40,
        justifyContent: 'center',
    },
    sliderTrack: {
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    sliderFill: {
        height: 4,
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    sliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        marginLeft: -10, // Center thumb
        top: 10,
        elevation: 5,
        ...Platform.select({
            web: {
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }
        })
    },
    presetButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    presetButton: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        minWidth: 80,
    },
    presetButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    resetButton: {
        margin: SPACING.lg,
        padding: SPACING.md,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        borderWidth: 2,
        borderColor: '#ff3b30',
    },
    resetButtonText: {
        color: '#ff3b30',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default InstrumentSettings;
