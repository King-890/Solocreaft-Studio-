import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Modal, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { COLORS, SPACING } from '../constants/UIConfig';
import InstrumentAudio from '../utils/InstrumentAudio';
import { useSettings } from '../contexts/SettingsContext';

export default function InstrumentRoomScreen({ navigation, route }) {
    const { instrument, instrumentCategory, instrumentName, instrumentIcon, instrumentId } = route.params || {};
    const { audioEnabled, getInstrumentSettings, updateInstrumentSettings } = useSettings();
    const [isRecording, setIsRecording] = useState(false);
    const [recordings, setRecordings] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState(getInstrumentSettings(instrumentId));

    useEffect(() => {
        setSettings(getInstrumentSettings(instrumentId));
    }, [instrumentId]);

    const handleStartRecording = () => {
        setIsRecording(true);
        console.log('Recording started for:', instrumentName);
        // TODO: Implement actual recording logic
    };

    const handleStopRecording = () => {
        setIsRecording(false);
        const newRecording = {
            id: Date.now(),
            instrument: instrumentName,
            timestamp: new Date().toLocaleString(),
            duration: '0:00'
        };
        setRecordings([newRecording, ...recordings]);
        console.log('Recording stopped');
    };

    const handlePlayInstrument = () => {
        if (!audioEnabled) {
            console.log('Audio is disabled');
            return;
        }
        console.log('Playing:', instrumentName, 'with settings:', settings);
        // Apply settings to audio playback
        InstrumentAudio.playInstrument(instrumentName, 1.5, { x: settings.pan, y: 0.5 }, instrumentId);

        // Visual feedback
        setIsPlaying(true);
        setTimeout(() => setIsPlaying(false), 1500);
    };

    const handleSettingChange = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        updateInstrumentSettings(instrumentId, newSettings);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={styles.instrumentIcon}>{instrumentIcon || '🎵'}</Text>
                    <View>
                        <Text style={styles.headerTitle}>{instrumentName || 'Instrument'}</Text>
                        <Text style={styles.headerSubtitle}>Instrument Room</Text>
                    </View>
                </View>
            </View>

            {/* Instrument Display */}
            <View style={styles.instrumentDisplay}>
                <View style={[styles.instrumentCircle, isPlaying && styles.instrumentCirclePlaying]}>
                    <Text style={styles.instrumentIconLarge}>{instrumentIcon || '🎵'}</Text>
                    {isPlaying && (
                        <View style={styles.playingIndicator}>
                            <Text style={styles.playingNote}>♪</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.instrumentTitle}>{instrumentName}</Text>
                <Text style={styles.categoryBadge}>{instrumentCategory}</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                {/* Play Button */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.playButton]}
                    onPress={handlePlayInstrument}
                >
                    <Text style={styles.controlIcon}>▶️</Text>
                    <Text style={styles.controlText}>Play Sound</Text>
                </TouchableOpacity>

                {/* Band Room Button */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.bandRoomButton]}
                    onPress={() => navigation.navigate('BandRoom')}
                >
                    <Text style={styles.controlIcon}>🎼</Text>
                    <Text style={styles.controlText}>Band Room</Text>
                </TouchableOpacity>

                {/* Record Button */}
                <TouchableOpacity
                    style={[styles.controlButton, isRecording ? styles.recordingButton : styles.recordButton]}
                    onPress={isRecording ? handleStopRecording : handleStartRecording}
                >
                    <Text style={styles.controlIcon}>{isRecording ? '⏹️' : '🔴'}</Text>
                    <Text style={styles.controlText}>
                        {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Text>
                </TouchableOpacity>

                {/* Settings Button */}
                <TouchableOpacity
                    style={[styles.controlButton, styles.settingsButton]}
                    onPress={() => setShowSettings(true)}
                >
                    <Text style={styles.controlIcon}>⚙️</Text>
                    <Text style={styles.controlText}>Settings</Text>
                </TouchableOpacity>
            </View>

            {/* Recording Indicator */}
            {isRecording && (
                <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingText}>Recording in progress...</Text>
                </View>
            )}

            {/* Recordings List */}
            <View style={styles.recordingsSection}>
                <Text style={styles.sectionTitle}>📼 Your Recordings</Text>

                <ScrollView style={styles.recordingsList}>
                    {recordings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyIcon}>🎙️</Text>
                            <Text style={styles.emptyText}>No recordings yet</Text>
                            <Text style={styles.emptySubtext}>Tap "Start Recording" to begin</Text>
                        </View>
                    ) : (
                        recordings.map((recording) => (
                            <View key={recording.id} style={styles.recordingItem}>
                                <View style={styles.recordingInfo}>
                                    <Text style={styles.recordingName}>{recording.instrument}</Text>
                                    <Text style={styles.recordingTime}>{recording.timestamp}</Text>
                                </View>
                                <TouchableOpacity style={styles.playRecordingButton}>
                                    <Text style={styles.playRecordingIcon}>▶️</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Settings Modal */}
            <Modal
                visible={showSettings}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowSettings(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>⚙️ Instrument Settings</Text>
                            <TouchableOpacity onPress={() => setShowSettings(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.settingsContainer}>
                            {/* Volume */}
                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Volume</Text>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderValue}>{Math.round(settings.volume * 100)}%</Text>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={0}
                                        maximumValue={1}
                                        value={settings.volume}
                                        onValueChange={(value) => handleSettingChange('volume', value)}
                                        minimumTrackTintColor={COLORS.primary}
                                        maximumTrackTintColor="#ccc"
                                    />
                                </View>
                            </View>

                            {/* Reverb */}
                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Reverb</Text>
                                <Switch
                                    value={settings.reverb}
                                    onValueChange={(value) => handleSettingChange('reverb', value)}
                                    trackColor={{ false: '#767577', true: COLORS.primary }}
                                    thumbColor={settings.reverb ? '#fff' : '#f4f3f4'}
                                />
                            </View>

                            {/* Echo */}
                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Echo</Text>
                                <Switch
                                    value={settings.echo}
                                    onValueChange={(value) => handleSettingChange('echo', value)}
                                    trackColor={{ false: '#767577', true: COLORS.primary }}
                                    thumbColor={settings.echo ? '#fff' : '#f4f3f4'}
                                />
                            </View>

                            {/* Pan */}
                            <View style={styles.settingItem}>
                                <Text style={styles.settingLabel}>Pan (L-R)</Text>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderValue}>
                                        {settings.pan < 0 ? 'L' : settings.pan > 0 ? 'R' : 'C'}
                                    </Text>
                                    <Slider
                                        style={styles.slider}
                                        minimumValue={-1}
                                        maximumValue={1}
                                        value={settings.pan}
                                        onValueChange={(value) => handleSettingChange('pan', value)}
                                        minimumTrackTintColor={COLORS.primary}
                                        maximumTrackTintColor="#ccc"
                                    />
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        marginBottom: SPACING.md,
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: 16,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instrumentIcon: {
        fontSize: 40,
        marginRight: SPACING.md,
    },
    headerTitle: {
        color: COLORS.textGold,
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    instrumentDisplay: {
        alignItems: 'center',
        paddingVertical: SPACING.xl,
    },
    instrumentCircle: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(98, 0, 238, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: COLORS.primary,
        marginBottom: SPACING.md,
        position: 'relative',
    },
    instrumentCirclePlaying: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
        elevation: 10,
    },
    instrumentIconLarge: {
        fontSize: 80,
    },
    playingIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 75,
    },
    playingNote: {
        fontSize: 60,
        color: COLORS.primary,
    },
    instrumentTitle: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    categoryBadge: {
        color: COLORS.textSecondary,
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    controls: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
        borderRadius: 12,
        marginBottom: SPACING.md,
    },
    playButton: {
        backgroundColor: COLORS.primary,
    },
    bandRoomButton: {
        backgroundColor: '#ffd93d',
    },
    recordButton: {
        backgroundColor: '#cf6679',
    },
    recordingButton: {
        backgroundColor: '#ff3333',
    },
    settingsButton: {
        backgroundColor: '#555',
        borderWidth: 1,
        borderColor: '#888',
    },
    controlIcon: {
        fontSize: 24,
        marginRight: SPACING.sm,
    },
    controlText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        marginHorizontal: SPACING.lg,
        borderRadius: 8,
        marginBottom: SPACING.lg,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#ff0000',
        marginRight: SPACING.sm,
    },
    recordingText: {
        color: '#ff0000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    recordingsSection: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    recordingsList: {
        flex: 1,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: SPACING.xxl,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: SPACING.md,
    },
    emptyText: {
        color: COLORS.text,
        fontSize: 18,
        marginBottom: SPACING.xs,
    },
    emptySubtext: {
        color: COLORS.textSecondary,
        fontSize: 14,
    },
    recordingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    recordingInfo: {
        flex: 1,
    },
    recordingName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    recordingTime: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    playRecordingButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playRecordingIcon: {
        fontSize: 16,
    },
    // Settings Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        borderTopWidth: 2,
        borderTopColor: COLORS.primary,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textGold,
    },
    modalClose: {
        fontSize: 30,
        color: COLORS.text,
        fontWeight: '300',
    },
    settingsContainer: {
        padding: SPACING.lg,
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    settingLabel: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
        flex: 1,
    },
    sliderContainer: {
        flex: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    slider: {
        flex: 1,
        height: 40,
    },
    sliderValue: {
        color: COLORS.textSecondary,
        fontSize: 14,
        minWidth: 40,
        textAlign: 'right',
        marginRight: SPACING.sm,
    },
});
