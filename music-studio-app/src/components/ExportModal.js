import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import ExportService from '../services/ExportService';

export default function ExportModal({ visible, onClose, projectName = 'My Project' }) {
    const [exporting, setExporting] = useState(false);
    const [format, setFormat] = useState('wav');

    const handleExport = async () => {
        setExporting(true);
        try {
            if (format === 'wav') {
                await ExportService.exportAsWAV(projectName);
            } else {
                await ExportService.exportAsMP3(projectName);
            }
            setTimeout(() => {
                setExporting(false);
                onClose();
            }, 1000);
        } catch (error) {
            console.error('Export failed:', error);
            setExporting(false);
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
