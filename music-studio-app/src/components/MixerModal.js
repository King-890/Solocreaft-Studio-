import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useProject } from '../contexts/ProjectContext';
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

    const [masterVolume, setMasterVolume] = useState(0.85);

    // Calculate master meter level
    const calculateMasterLevel = () => {
        if (tracks.length === 0) return 0;
        const activeTracks = tracks.filter(t => !t.muted);
        if (activeTracks.length === 0) return 0;
        const avgVolume = activeTracks.reduce((sum, t) => sum + (t.volume * t.gain), 0) / activeTracks.length;
        return avgVolume * masterVolume;
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
                            value={masterVolume}
                            onValueChange={setMasterVolume}
                            minimumTrackTintColor="#4a9eff"
                            maximumTrackTintColor="#444"
                            thumbTintColor="#4a9eff"
                        />
                        <Text style={styles.masterValue}>{(masterVolume * 100).toFixed(0)}%</Text>
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
                <TouchableOpacity style={styles.applyButton} onPress={onClose}>
                    <Text style={styles.applyButtonText}>Apply</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '95%',
        maxWidth: 1200,
        height: '90%',
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
    },
    fullScreenContent: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#222',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    closeButton: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    channelsContainer: {
        flex: 1,
    },
    channelsContent: {
        padding: 20,
        flexDirection: 'row',
    },
    masterSection: {
        width: 240,
        backgroundColor: '#252525',
        borderRadius: 12,
        padding: 18,
        borderWidth: 3,
        borderColor: '#4a9eff',
        shadowColor: '#4a9eff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    masterHeader: {
        marginBottom: 24,
        paddingBottom: 14,
        borderBottomWidth: 3,
        borderBottomColor: '#4a9eff',
        backgroundColor: '#2a2a2a',
        padding: 10,
        borderRadius: 8,
    },
    masterTitle: {
        color: '#4a9eff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: '#4a9eff',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    masterMeter: {
        alignItems: 'center',
        marginBottom: 24,
    },
    meterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    meterTrack: {
        width: 70,
        height: 220,
        backgroundColor: '#0a0a0a',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'flex-end',
        borderWidth: 3,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    meterFill: {
        width: '100%',
    },
    meterMarks: {
        height: 200,
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    meterMark: {
        color: '#888',
        fontSize: 10,
    },
    meterValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 12,
    },
    masterFaderSection: {
        marginBottom: 24,
    },
    masterLabel: {
        color: '#aaa',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    masterFader: {
        width: '100%',
        height: 40,
    },
    masterValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 8,
    },
    masterStats: {
        backgroundColor: '#1a1a1a',
        borderRadius: 6,
        padding: 12,
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
        color: '#4a9eff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    testToneButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#4a9eff',
    },
    testToneText: {
        color: '#4a9eff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#333',
        backgroundColor: '#222',
    },
    applyButton: {
        backgroundColor: '#4a9eff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
