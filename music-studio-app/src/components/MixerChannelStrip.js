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
        width: 220,
        height: '100%',
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        marginRight: 16,
        borderWidth: 2,
        borderColor: '#3a3a3a',
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        padding: 12,
        borderBottomWidth: 2,
        borderBottomColor: '#4a9eff',
        backgroundColor: '#333',
    },
    instrumentIcon: {
        fontSize: 32,
        textAlign: 'center',
        marginBottom: 6,
    },
    trackName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    trackType: {
        color: '#4a9eff',
        fontSize: 10,
        fontWeight: '600',
    },
    clipCount: {
        color: '#ffaa00',
        fontSize: 10,
        fontWeight: '600',
    },
    controlsScroll: {
        flex: 1,
        padding: 12,
    },
    mutesoloSection: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    muteButton: {
        flex: 1,
        backgroundColor: '#444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#555',
    },
    muteButtonActive: {
        backgroundColor: '#ff4444',
        borderColor: '#ff6666',
    },
    soloButton: {
        flex: 1,
        backgroundColor: '#444',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#555',
    },
    soloButtonActive: {
        backgroundColor: '#ffaa00',
        borderColor: '#ffcc00',
    },
    buttonText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    meterSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    meter: {
        width: 60,
        height: 120,
        backgroundColor: '#0a0a0a',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        borderWidth: 2,
        borderColor: '#333',
        marginVertical: 8,
    },
    meterFill: {
        width: '100%',
    },
    meterLabel: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 4,
    },
    faderSection: {
        marginBottom: 16,
    },
    sectionLabel: {
        color: '#aaa',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 6,
        textAlign: 'center',
    },
    fader: {
        width: '100%',
        height: 40,
    },
    faderValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 4,
    },
    controlSection: {
        marginBottom: 16,
    },
    slider: {
        width: '100%',
        height: 35,
    },
    value: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    expandableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 6,
        marginBottom: 8,
    },
    toggle: {
        color: '#4a9eff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    expandableContent: {
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 6,
        marginBottom: 16,
    },
    eqControl: {
        marginBottom: 12,
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
        color: '#fff',
        fontSize: 11,
        textAlign: 'right',
        marginTop: 2,
    },
    auxControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    auxLabel: {
        color: '#888',
        fontSize: 10,
        width: 60,
        fontWeight: '600',
    },
    auxSlider: {
        flex: 1,
        height: 30,
    },
    auxValue: {
        color: '#fff',
        fontSize: 11,
        width: 40,
        textAlign: 'right',
    },
    compControl: {
        marginBottom: 12,
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
        color: '#fff',
        fontSize: 11,
        textAlign: 'right',
        marginTop: 2,
    },
    powerButton: {
        backgroundColor: '#444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#555',
    },
    powerButtonOn: {
        backgroundColor: '#4a9eff',
        borderColor: '#4a9eff',
    },
    powerButtonText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});
