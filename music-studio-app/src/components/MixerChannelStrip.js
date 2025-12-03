import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';

// Instrument icon mapping
const INSTRUMENT_ICONS = {
    'audio': '🎤',
    'midi': '🎹',
    'Lead Vocals': '🎤',
    'Piano': '🎹',
    'Drums': '🥁',
    'Tabla': '🪘',
    'Bass Guitar': '🎸',
    'Electric Guitar': '🎸',
    'Synth Pad': '🎛️',
    'Strings': '🎻',
    'Backing Vocals': '🎤',
};

export default function MixerChannelStrip({
    track,
    clips,
    onVolumeChange,
    onPanChange,
    onEQChange,
    onGainChange,
    onMuteToggle,
    onSoloToggle,
    onAuxSendChange,
    onCompressorChange
}) {
    const [showEQ, setShowEQ] = useState(false);
    const [showCompressor, setShowCompressor] = useState(false);
    const [pulseAnim] = useState(new Animated.Value(1));

    const trackClips = clips.filter(c => c.trackId === track.id);
    const clipCount = trackClips.length;

    // Calculate VU meter level (0-1)
    const meterLevel = track.muted ? 0 : track.volume * track.gain;

    // Get instrument icon
    const instrumentIcon = INSTRUMENT_ICONS[track.name] || INSTRUMENT_ICONS[track.type] || '🎵';

    // Pulse animation for active meters
    useEffect(() => {
        if (!track.muted && track.volume > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.05,
                        duration: 800,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [track.muted, track.volume]);

    return (
        <View style={styles.channelStrip}>
            {/* Track Header */}
            <View style={styles.header}>
                <Text style={styles.instrumentIcon}>{instrumentIcon}</Text>
                <Text style={styles.trackName} numberOfLines={2}>{track.name}</Text>
                <View style={styles.headerInfo}>
                    <Text style={styles.trackType}>{track.type.toUpperCase()}</Text>
                    <Text style={styles.clipCount}>{clipCount} clips</Text>
                </View>
            </View>

            <ScrollView style={styles.controlsScroll} showsVerticalScrollIndicator={false}>
                {/* Mute/Solo Buttons */}
                <View style={styles.mutesoloSection}>
                    <TouchableOpacity
                        style={[styles.muteButton, track.muted && styles.muteButtonActive]}
                        onPress={() => onMuteToggle(track.id, !track.muted)}
                    >
                        <Text style={styles.buttonText}>MUTE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.soloButton, track.solo && styles.soloButtonActive]}
                        onPress={() => onSoloToggle(track.id, !track.solo)}
                    >
                        <Text style={styles.buttonText}>SOLO</Text>
                    </TouchableOpacity>
                </View>

                {/* VU Meter */}
                <View style={styles.meterSection}>
                    <Text style={styles.sectionLabel}>LEVEL</Text>
                    <Animated.View style={[styles.meter, { transform: [{ scale: pulseAnim }] }]}>
                        <View style={[
                            styles.meterFill,
                            {
                                height: `${meterLevel * 100}%`,
                                backgroundColor: meterLevel > 0.9 ? '#ff4444' : meterLevel > 0.7 ? '#ffaa00' : '#4a9eff'
                            }
                        ]} />
                    </Animated.View>
                    <Text style={styles.meterLabel}>
                        {track.muted ? 'MUTE' : `${(meterLevel * 100).toFixed(0)}%`}
                    </Text>
                </View>

                {/* Volume Fader */}
                <View style={styles.faderSection}>
                    <Text style={styles.sectionLabel}>VOLUME</Text>
                    <Slider
                        style={styles.fader}
                        minimumValue={0}
                        maximumValue={1}
                        value={track.volume}
                        onValueChange={(value) => onVolumeChange(track.id, value)}
                        minimumTrackTintColor="#4a9eff"
                        maximumTrackTintColor="#444"
                        thumbTintColor="#4a9eff"
                    />
                    <Text style={styles.faderValue}>{(track.volume * 100).toFixed(0)}%</Text>
                </View>

                {/* Gain Control */}
                <View style={styles.controlSection}>
                    <Text style={styles.sectionLabel}>GAIN</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={2}
                        value={track.gain}
                        onValueChange={(value) => onGainChange(track.id, value)}
                        minimumTrackTintColor="#4a9eff"
                        maximumTrackTintColor="#444"
                        thumbTintColor="#4a9eff"
                    />
                    <Text style={styles.value}>{(track.gain * 100).toFixed(0)}%</Text>
                </View>

                {/* Pan Control */}
                <View style={styles.controlSection}>
                    <Text style={styles.sectionLabel}>PAN</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={-1}
                        maximumValue={1}
                        value={track.pan}
                        onValueChange={(value) => onPanChange(track.id, value)}
                        minimumTrackTintColor="#4a9eff"
                        maximumTrackTintColor="#444"
                        thumbTintColor="#4a9eff"
                    />
                    <Text style={styles.value}>
                        {track.pan === 0 ? 'CENTER' : track.pan < 0 ? `L ${Math.abs(track.pan * 100).toFixed(0)}` : `R ${(track.pan * 100).toFixed(0)}`}
                    </Text>
                </View>

                {/* EQ Section */}
                <TouchableOpacity
                    style={styles.expandableHeader}
                    onPress={() => setShowEQ(!showEQ)}
                >
                    <Text style={styles.sectionLabel}>EQUALIZER</Text>
                    <Text style={styles.toggle}>{showEQ ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {showEQ && (
                    <View style={styles.expandableContent}>
                        <View style={styles.eqControl}>
                            <Text style={styles.eqLabel}>HIGH</Text>
                            <Slider
                                style={styles.eqSlider}
                                minimumValue={-12}
                                maximumValue={12}
                                value={track.eq.high}
                                onValueChange={(value) => onEQChange(track.id, { high: value })}
                                minimumTrackTintColor="#4a9eff"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#4a9eff"
                            />
                            <Text style={styles.eqValue}>{track.eq.high.toFixed(1)}dB</Text>
                        </View>

                        <View style={styles.eqControl}>
                            <Text style={styles.eqLabel}>MID</Text>
                            <Slider
                                style={styles.eqSlider}
                                minimumValue={-12}
                                maximumValue={12}
                                value={track.eq.mid}
                                onValueChange={(value) => onEQChange(track.id, { mid: value })}
                                minimumTrackTintColor="#4a9eff"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#4a9eff"
                            />
                            <Text style={styles.eqValue}>{track.eq.mid.toFixed(1)}dB</Text>
                        </View>

                        <View style={styles.eqControl}>
                            <Text style={styles.eqLabel}>LOW</Text>
                            <Slider
                                style={styles.eqSlider}
                                minimumValue={-12}
                                maximumValue={12}
                                value={track.eq.low}
                                onValueChange={(value) => onEQChange(track.id, { low: value })}
                                minimumTrackTintColor="#4a9eff"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#4a9eff"
                            />
                            <Text style={styles.eqValue}>{track.eq.low.toFixed(1)}dB</Text>
                        </View>
                    </View>
                )}

                {/* Aux Sends */}
                <View style={styles.controlSection}>
                    <Text style={styles.sectionLabel}>AUX SENDS</Text>
                    <View style={styles.auxControl}>
                        <Text style={styles.auxLabel}>REVERB</Text>
                        <Slider
                            style={styles.auxSlider}
                            minimumValue={0}
                            maximumValue={1}
                            value={track.auxSends[0]}
                            onValueChange={(value) => onAuxSendChange(track.id, 0, value)}
                            minimumTrackTintColor="#4a9eff"
                            maximumTrackTintColor="#444"
                            thumbTintColor="#4a9eff"
                        />
                        <Text style={styles.auxValue}>{(track.auxSends[0] * 100).toFixed(0)}%</Text>
                    </View>
                    <View style={styles.auxControl}>
                        <Text style={styles.auxLabel}>DELAY</Text>
                        <Slider
                            style={styles.auxSlider}
                            minimumValue={0}
                            maximumValue={1}
                            value={track.auxSends[1]}
                            onValueChange={(value) => onAuxSendChange(track.id, 1, value)}
                            minimumTrackTintColor="#4a9eff"
                            maximumTrackTintColor="#444"
                            thumbTintColor="#4a9eff"
                        />
                        <Text style={styles.auxValue}>{(track.auxSends[1] * 100).toFixed(0)}%</Text>
                    </View>
                </View>

                {/* Compressor */}
                <TouchableOpacity
                    style={styles.expandableHeader}
                    onPress={() => setShowCompressor(!showCompressor)}
                >
                    <Text style={styles.sectionLabel}>COMPRESSOR</Text>
                    <TouchableOpacity
                        style={[styles.powerButton, track.compressor.enabled && styles.powerButtonOn]}
                        onPress={() => onCompressorChange(track.id, { enabled: !track.compressor.enabled })}
                    >
                        <Text style={styles.powerButtonText}>{track.compressor.enabled ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                {showCompressor && (
                    <View style={styles.expandableContent}>
                        <View style={styles.compControl}>
                            <Text style={styles.compLabel}>THRESHOLD</Text>
                            <Slider
                                style={styles.compSlider}
                                minimumValue={-60}
                                maximumValue={0}
                                value={track.compressor.threshold}
                                onValueChange={(value) => onCompressorChange(track.id, { threshold: value })}
                                minimumTrackTintColor="#4a9eff"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#4a9eff"
                            />
                            <Text style={styles.compValue}>{track.compressor.threshold.toFixed(0)}dB</Text>
                        </View>
                        <View style={styles.compControl}>
                            <Text style={styles.compLabel}>RATIO</Text>
                            <Slider
                                style={styles.compSlider}
                                minimumValue={1}
                                maximumValue={20}
                                value={track.compressor.ratio}
                                onValueChange={(value) => onCompressorChange(track.id, { ratio: value })}
                                minimumTrackTintColor="#4a9eff"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#4a9eff"
                            />
                            <Text style={styles.compValue}>{track.compressor.ratio.toFixed(1)}:1</Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    channelStrip: {
        width: 200,
        height: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#222',
        alignItems: 'center',
    },
    instrumentIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    trackName: {
        color: '#e0e0e0',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    headerInfo: {
        flexDirection: 'row',
        gap: 8,
    },
    trackType: {
        color: '#6200ee',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    clipCount: {
        color: '#888',
        fontSize: 10,
    },
    controlsScroll: {
        flex: 1,
        padding: 16,
    },
    mutesoloSection: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    muteButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    muteButtonActive: {
        backgroundColor: '#cf6679', // Muted red
        borderColor: '#ff4444',
    },
    soloButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    soloButtonActive: {
        backgroundColor: '#ffb74d', // Muted orange
        borderColor: '#ffaa00',
    },
    buttonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    meterSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    meter: {
        width: 40,
        height: 140,
        backgroundColor: '#0a0a0a',
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        borderWidth: 1,
        borderColor: '#222',
        marginVertical: 8,
    },
    meterFill: {
        width: '100%',
    },
    meterLabel: {
        color: '#888',
        fontSize: 10,
        fontFamily: 'monospace',
        marginTop: 4,
    },
    faderSection: {
        marginBottom: 24,
    },
    sectionLabel: {
        color: '#666',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 1,
    },
    fader: {
        width: '100%',
        height: 40,
    },
    faderValue: {
        color: '#e0e0e0',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 4,
    },
    controlSection: {
        marginBottom: 24,
    },
    slider: {
        width: '100%',
        height: 30,
    },
    value: {
        color: '#bbb',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 2,
    },
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    toggle: {
        color: '#6200ee',
        fontSize: 12,
    },
    expandableContent: {
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    eqControl: {
        marginBottom: 16,
    },
    eqLabel: {
        color: '#888',
        fontSize: 10,
        marginBottom: 4,
        fontWeight: '600',
    },
    eqSlider: {
        width: '100%',
        height: 30,
    },
    eqValue: {
        color: '#bbb',
        fontSize: 10,
        textAlign: 'right',
        marginTop: 2,
    },
    auxControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    auxLabel: {
        color: '#888',
        fontSize: 10,
        width: 50,
        fontWeight: '600',
    },
    auxSlider: {
        flex: 1,
        height: 30,
    },
    auxValue: {
        color: '#bbb',
        fontSize: 10,
        width: 30,
        textAlign: 'right',
    },
    compControl: {
        marginBottom: 16,
    },
    compLabel: {
        color: '#888',
        fontSize: 10,
        marginBottom: 4,
        fontWeight: '600',
    },
    compSlider: {
        width: '100%',
        height: 30,
    },
    compValue: {
        color: '#bbb',
        fontSize: 10,
        textAlign: 'right',
        marginTop: 2,
    },
    powerButton: {
        backgroundColor: '#2a2a2a',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#444',
    },
    powerButtonOn: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    powerButtonText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: '700',
    },
});
