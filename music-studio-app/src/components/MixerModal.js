import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { useProject } from '../contexts/ProjectContext';
import { useMixer } from '../contexts/MixerContext';
import AudioPlaybackService from '../services/AudioPlaybackService';
import MixerChannelStrip from './MixerChannelStrip';

export default function MixerModal({ visible, onClose, fullScreen = false }) {
    const {
        tracks,
        clips,
        updateTrackVolume,
        updateTrackPan,
        updateTrackGain,
        updateTrackEQ,
        updateTrackMute,
        updateTrackSolo,
        updateTrackAuxSend,
        updateTrackCompressor
    } = useProject();

    const {
        mixerState,
        setMasterVolume,
        toggleMasterMute,
    } = useMixer();

    // Calculate master meter level
    const calculateMasterLevel = () => {
        if (tracks.length === 0) return 0;
        const activeTracks = tracks.filter(t => !t.muted);
        if (activeTracks.length === 0) return 0;
        const avgVolume = activeTracks.reduce((sum, t) => sum + (t.volume * t.gain), 0) / activeTracks.length;
        return avgVolume * mixerState.masterVolume;
    };

    const masterLevel = calculateMasterLevel();

    const renderContent = () => (
        <View style={fullScreen ? styles.fullScreenContent : styles.modalContent}>
            {!fullScreen && (
                <View style={styles.header}>
                    <Text style={styles.title}>Mixer Console</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeButton}>✕</Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                horizontal
                style={styles.channelsContainer}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.channelsContent}
            >
                {/* Channel Strips */}
                {tracks.map((track) => (
                    <MixerChannelStrip
                        key={track.id}
                        track={track}
                        clips={clips}
                        onVolumeChange={updateTrackVolume}
                        onPanChange={updateTrackPan}
                        onEQChange={updateTrackEQ}
                        onGainChange={updateTrackGain}
                        onMuteToggle={updateTrackMute}
                        onSoloToggle={updateTrackSolo}
                        onAuxSendChange={updateTrackAuxSend}
                        onCompressorChange={updateTrackCompressor}
                    />
                ))}

                {/* Master Section */}
                <View style={styles.masterSection}>
                    <View style={styles.masterHeader}>
                        <Text style={styles.masterTitle}>MASTER</Text>
                    </View>

                    <View style={styles.masterMeter}>
                        <View style={styles.meterContainer}>
                            <View style={styles.meterTrack}>
                                <View style={[
                                    styles.meterFill,
                                    {
                                        height: `${masterLevel * 100}%`,
                                        backgroundColor: masterLevel > 0.9 ? '#ff4444' : masterLevel > 0.7 ? '#ffaa00' : '#4a9eff'
                                    }
                                ]} />
                            </View>
                            <View style={styles.meterMarks}>
                                <Text style={styles.meterMark}>0</Text>
                                <Text style={styles.meterMark}>-6</Text>
                                <Text style={styles.meterMark}>-12</Text>
                                <Text style={styles.meterMark}>-18</Text>
                                <Text style={styles.meterMark}>-24</Text>
                            </View>
                        </View>
                        <Text style={styles.meterValue}>
                            {(masterLevel * 100).toFixed(1)}%
                        </Text>
                    </View>

                    <View style={styles.masterFaderSection}>
                        <Text style={styles.masterLabel}>MASTER VOLUME</Text>
                        <Slider
                            style={styles.masterFader}
                            minimumValue={0}
                            maximumValue={1}
                            value={mixerState.masterVolume}
                            onValueChange={setMasterVolume}
                            minimumTrackTintColor="#4a9eff"
                            maximumTrackTintColor="#444"
                            thumbTintColor="#4a9eff"
                        />
                        <Text style={styles.masterValue}>{(mixerState.masterVolume * 100).toFixed(0)}%</Text>
                    </View>

                    <View style={styles.masterStats}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Tracks</Text>
                            <Text style={styles.statValue}>{tracks.length}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Active</Text>
                            <Text style={styles.statValue}>{tracks.filter(t => !t.muted).length}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Solo</Text>
                            <Text style={styles.statValue}>{tracks.filter(t => t.solo).length}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.testToneButton}
                        onPress={() => AudioPlaybackService.playTestTone()}
                    >
                        <Text style={styles.testToneText}>🔊 TEST TONE</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => {
                        // Settings are already applied in real-time via context
                        // Just close the modal
                        onClose();
                    }}
                >
                    <Text style={styles.applyButtonText}>Apply & Close</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (fullScreen) {
        return renderContent();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                {renderContent()}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        maxWidth: 1200,
        height: '90%',
        backgroundColor: '#121212', // Darker background
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#333',
    },
    fullScreenContent: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
        backgroundColor: '#1a1a1a',
    },
    title: {
        color: '#e0e0e0',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    closeButton: {
        color: '#888',
        fontSize: 28,
        fontWeight: '300',
    },
    channelsContainer: {
        flex: 1,
        backgroundColor: '#121212',
    },
    channelsContent: {
        padding: 24,
        flexDirection: 'row',
        gap: 16, // Use gap for spacing
    },
    masterSection: {
        width: 280, // Slightly wider
        height: '100%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
    },
    masterHeader: {
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#6200ee', // Purple accent
        alignItems: 'center',
    },
    masterTitle: {
        color: '#e0e0e0',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 1,
    },
    masterMeter: {
        alignItems: 'center',
        marginBottom: 32,
    },
    meterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    meterTrack: {
        width: 60,
        height: 240,
        backgroundColor: '#0a0a0a',
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        borderWidth: 1,
        borderColor: '#222',
    },
    meterFill: {
        width: '100%',
    },
    meterMarks: {
        height: 220,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    meterMark: {
        color: '#555',
        fontSize: 10,
        fontFamily: 'monospace',
    },
    meterValue: {
        color: '#6200ee',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 12,
        fontFamily: 'monospace',
    },
    masterFaderSection: {
        marginBottom: 32,
    },
    masterLabel: {
        color: '#888',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
        letterSpacing: 1,
    },
    masterFader: {
        width: '100%',
        height: 40,
    },
    masterValue: {
        color: '#e0e0e0',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 8,
    },
    masterStats: {
        backgroundColor: '#222',
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    statLabel: {
        color: '#888',
        fontSize: 12,
    },
    statValue: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: '600',
    },
    testToneButton: {
        backgroundColor: 'transparent',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 'auto', // Push to bottom
        borderWidth: 1,
        borderColor: '#6200ee',
    },
    testToneText: {
        color: '#6200ee',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#2a2a2a',
        backgroundColor: '#1a1a1a',
        alignItems: 'center',  // Changed from 'flex-end' to 'center'
    },
    applyButton: {
        backgroundColor: '#6200ee',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
        alignItems: 'center',
        elevation: 4,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
