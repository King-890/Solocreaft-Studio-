import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Platform, Alert } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import ExportService from '../services/ExportService';

export default function ExportModal({ visible, onClose, projectName = 'My Project' }) {
    const { clips, tracks, recordings, tempo } = useProject();
    const [exporting, setExporting] = useState(false);
    const [format, setFormat] = useState('wav');

    // Calculate metadata defensibly
    const activeTracks = (tracks || []).filter(t => !t.muted).length;
    const durationCount = (clips || [])
        .filter(c => Number.isFinite(c.startTime) && Number.isFinite(c.duration))
        .reduce((max, c) => Math.max(max, c.startTime + c.duration), 0);
    const duration = durationCount.toFixed(1);
    const sampleRate = "44,100 Hz";

    const handleExport = async () => {
        setExporting(true);
        try {
            if (Platform.OS === 'web') {
                if (format === 'mp3') {
                    await ExportService.exportAsMP3(clips, tracks, tempo);
                } else {
                    await ExportService.exportAsWAV(clips, tracks, tempo);
                }
            } else {
                await ExportService.exportNative(recordings, format);
            }
            
            setExporting(false);
            onClose();
            Alert.alert('Success', 'Export completed successfully!');
        } catch (error) {
            console.error('Export failed:', error);
            setExporting(false);
            Alert.alert('Export Error', error.message || 'Failed to export project');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Export Project</Text>

                    <View style={styles.formatSelector}>
                        <TouchableOpacity
                            style={[styles.formatButton, format === 'wav' && styles.formatButtonActive]}
                            onPress={() => setFormat('wav')}
                        >
                            <Text style={[styles.formatText, format === 'wav' && styles.formatTextActive]}>
                                WAV
                            </Text>
                            <Text style={styles.formatSubtext}>Lossless</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.formatButton, format === 'mp3' && styles.formatButtonActive]}
                            onPress={() => setFormat('mp3')}
                        >
                            <Text style={[styles.formatText, format === 'mp3' && styles.formatTextActive]}>
                                MP3
                            </Text>
                            <Text style={styles.formatSubtext}>Compressed</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.metadataSection}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Duration</Text>
                            <Text style={styles.infoValue}>{duration}s</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Tracks</Text>
                            <Text style={styles.infoValue}>{activeTracks} active</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Sample Rate</Text>
                            <Text style={styles.infoValue}>{sampleRate}</Text>
                        </View>
                    </View>

                    {exporting ? (
                        <View style={styles.exportingContainer}>
                            <ActivityIndicator size="large" color="#6200ee" />
                            <Text style={styles.exportingText}>Exporting...</Text>
                        </View>
                    ) : (
                        <View style={styles.actions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
                                <Text style={styles.exportText}>Export</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: 24,
        width: '80%',
        maxWidth: 400,
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    formatSelector: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    formatButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#333',
    },
    formatButtonActive: {
        borderColor: '#6200ee',
        backgroundColor: '#3a2a4a',
    },
    formatText: {
        color: '#888',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    formatTextActive: {
        color: '#fff',
    },
    formatSubtext: {
        color: '#666',
        fontSize: 12,
    },
    exportingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    exportingText: {
        color: '#888',
        marginTop: 12,
    },
    metadataSection: {
        marginBottom: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.06)',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    infoLabel: {
        color: '#94a3b8',
        fontSize: 13,
    },
    infoValue: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#333',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    exportButton: {
        flex: 1,
        backgroundColor: '#6200ee',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    exportText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
