import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
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
                <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                <Text style={styles.trackType}>{track.type.toUpperCase()}</Text>
                <Text style={styles.clipCount}>{clipCount} clips</Text>
            </View>

            {/* Gain Control */}
            <View style={styles.section}>
                <Text style={styles.label}>GAIN</Text>
                <Slider
                    style={styles.knob}
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

            {/* EQ Section */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setShowEQ(!showEQ)}
                >
                    <Text style={styles.label}>EQ</Text>
                    <Text style={styles.toggle}>{showEQ ? '▼' : '▶'}</Text>
                </TouchableOpacity>

                {showEQ && (
                    <>
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
                    </>
                )}
            </View>

            {/* Pan Control */}
            <View style={styles.section}>
                <Text style={styles.label}>PAN</Text>
                <Slider
                    style={styles.knob}
                    minimumValue={-1}
                    maximumValue={1}
                    value={track.pan}
                    onValueChange={(value) => onPanChange(track.id, value)}
                    minimumTrackTintColor="#4a9eff"
                    maximumTrackTintColor="#444"
                    thumbTintColor="#4a9eff"
                />
                <Text style={styles.value}>
                    {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(track.pan * 100).toFixed(0)}` : `R${(track.pan * 100).toFixed(0)}`}
                </Text>
            </View>

            {/* Aux Sends */}
            <View style={styles.section}>
                <Text style={styles.label}>AUX SENDS</Text>
                <View style={styles.auxControl}>
                    <Text style={styles.auxLabel}>REV</Text>
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
                    <Text style={styles.auxValue}>{(track.auxSends[0] * 100).toFixed(0)}</Text>
                </View>
                <View style={styles.auxControl}>
                    <Text style={styles.auxLabel}>DLY</Text>
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
                    <Text style={styles.auxValue}>{(track.auxSends[1] * 100).toFixed(0)}</Text>
                </View>
            </View>

            {/* Compressor */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => setShowCompressor(!showCompressor)}
                >
                    <Text style={styles.label}>COMP</Text>
                    <TouchableOpacity
                        style={[styles.powerButton, track.compressor.enabled && styles.powerButtonOn]}
                        onPress={() => onCompressorChange(track.id, { enabled: !track.compressor.enabled })}
                    >
                        <Text style={styles.powerButtonText}>{track.compressor.enabled ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                </TouchableOpacity>

                {showCompressor && (
                    <>
                        <View style={styles.compControl}>
                            <Text style={styles.compLabel}>THR</Text>
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
                    </>
                )}
            </View>

            {/* Mute/Solo Buttons */}
            <View style={styles.mutesoloSection}>
                <TouchableOpacity
                    style={[styles.muteButton, track.muted && styles.muteButtonActive]}
                    onPress={() => onMuteToggle(track.id, !track.muted)}
                >
                    <Text style={styles.buttonText}>M</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.soloButton, track.solo && styles.soloButtonActive]}
                    onPress={() => onSoloToggle(track.id, !track.solo)}
                >
                    <Text style={styles.buttonText}>S</Text>
                </TouchableOpacity>
            </View>

            {/* VU Meter */}
            <View style={styles.meterSection}>
                <Animated.View style={[styles.meter, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={[styles.meterFill, { height: `${meterLevel * 100}%` }]} />
                </Animated.View>
                <Text style={styles.meterLabel}>
                    {track.muted ? 'MUTE' : `${(meterLevel * 100).toFixed(0)}%`}
                </Text>
            </View>

            {/* Volume Fader */}
            <View style={styles.faderSection}>
                <Text style={styles.label}>VOLUME</Text>
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
        </View>
    );
}

const styles = StyleSheet.create({
    channelStrip: {
        width: 150,
        backgroundColor: '#2a2a2a',
        borderRadius: 12,
        padding: 8,
        marginRight: 10,
        borderWidth: 2,
        borderColor: '#3a3a3a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    header: {
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#4a9eff',
        backgroundColor: '#333',
        padding: 6,
        borderRadius: 6,
        marginHorizontal: -2,
    },
    instrumentIcon: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 4,
    },
    trackName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 3,
        textAlign: 'center',
    },
    trackType: {
        color: '#4a9eff',
        fontSize: 9,
        marginBottom: 2,
        textAlign: 'center',
        fontWeight: '600',
    },
    clipCount: {
        color: '#ffaa00',
        fontSize: 9,
        textAlign: 'center',
        fontWeight: '600',
    },
    section: {
        marginBottom: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        color: '#aaa',
        fontSize: 9,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    toggle: {
        color: '#4a9eff',
        fontSize: 12,
    },
    knob: {
        width: '100%',
        height: 25,
    },
    value: {
        color: '#fff',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 2,
    },
    eqControl: {
        marginBottom: 6,
    },
    eqLabel: {
        color: '#888',
        fontSize: 9,
        marginBottom: 2,
    },
    eqSlider: {
        width: '100%',
        height: 20,
    },
    eqValue: {
        color: '#fff',
        fontSize: 9,
        textAlign: 'right',
    },
    auxControl: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    auxLabel: {
        color: '#888',
        fontSize: 9,
        width: 25,
    },
    auxSlider: {
        flex: 1,
        height: 20,
    },
    auxValue: {
        color: '#fff',
        fontSize: 9,
        width: 25,
        textAlign: 'right',
    },
    compControl: {
        marginBottom: 6,
    },
    compLabel: {
        color: '#888',
        fontSize: 9,
        marginBottom: 2,
    },
    compSlider: {
        width: '100%',
        height: 20,
    },
    compValue: {
        color: '#fff',
        fontSize: 9,
        textAlign: 'right',
    },
    powerButton: {
        backgroundColor: '#444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 3,
    },
    powerButtonOn: {
        backgroundColor: '#4a9eff',
    },
    powerButtonText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    mutesoloSection: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 12,
    },
    muteButton: {
        flex: 1,
        backgroundColor: '#444',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#555',
    },
    muteButtonActive: {
        backgroundColor: '#ff4444',
        borderColor: '#ff6666',
        shadowColor: '#ff4444',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    soloButton: {
        flex: 1,
        backgroundColor: '#444',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#555',
    },
    soloButtonActive: {
        backgroundColor: '#ffaa00',
        borderColor: '#ffcc00',
        shadowColor: '#ffaa00',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    meterSection: {
        alignItems: 'center',
        marginBottom: 12,
    },
    meter: {
        width: 40,
        height: 100,
        backgroundColor: '#0a0a0a',
        borderRadius: 6,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        borderWidth: 2,
        borderColor: '#333',
    },
    meterFill: {
        width: '100%',
        backgroundColor: '#4a9eff',
        shadowColor: '#4a9eff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
    },
    meterLabel: {
        color: '#fff',
        fontSize: 9,
        marginTop: 4,
    },
    faderSection: {
        alignItems: 'center',
    },
    fader: {
        width: '100%',
        height: 30,
    },
    faderValue: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
});
