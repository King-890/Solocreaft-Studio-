import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useProject } from '../contexts/ProjectContext';
import RecordingPlaybackService from '../services/RecordingPlaybackService';

export default function RecordingsLibrary() {
    const navigation = useNavigation();
    const { recordings, deleteRecording, updateRecording } = useProject();
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState('');

    const filteredRecordings = (recordings || []).filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePlay = async (recording) => {
        try {
            if (playingId === recording.id) {
                // Same recording - toggle pause/resume
                if (isPaused) {
                    console.log('▶️ Resuming');
                    await RecordingPlaybackService.resume();
                    setIsPaused(false);
                } else {
                    console.log('⏸️ Pausing');
                    await RecordingPlaybackService.pause();
                    setIsPaused(true);
                }
            } else {
                // New recording - play it
                console.log('🎵 Playing:', recording.name);
                setPlayingId(recording.id);
                setIsPaused(false);

                // Play in background (don't await)
                RecordingPlaybackService.play(recording.uri)
                    .then(() => {
                        console.log('✅ Finished');
                        setPlayingId(null);
                        setIsPaused(false);
                    })
                    .catch(error => {
                        console.error('❌ Error:', error);

                        if (recording.uri.startsWith('blob:')) {
                            Alert.alert(
                                'Recording Unavailable',
                                'This recording has an expired URL. Delete it?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Delete', style: 'destructive', onPress: () => deleteRecording(recording.id) }
                                ]
                            );
                        } else {
                            Alert.alert('Error', 'Could not play recording.');
                        }

                        setPlayingId(null);
                        setIsPaused(false);
                    });
            }
        } catch (error) {
            console.error('❌ Play error:', error);
            setPlayingId(null);
            setIsPaused(false);
        }
    };

    const handleDelete = async (recordingId) => {
        const confirmed = Platform.OS === 'web'
            ? window.confirm('Delete this recording?')
            : await new Promise(resolve => {
                Alert.alert(
                    'Delete Recording',
                    'Are you sure?',
                    [
                        { text: 'Cancel', onPress: () => resolve(false), style: 'cancel' },
                        { text: 'Delete', onPress: () => resolve(true), style: 'destructive' }
                    ]
                );
            });

        if (confirmed) {
            if (playingId === recordingId) {
                await RecordingPlaybackService.stop();
                setPlayingId(null);
                setIsPaused(false);
            }
            await deleteRecording(recordingId);
        }
    };

    const handleEditName = (recording) => {
        setEditingId(recording.id);
        setEditingName(recording.name);
    };

    const handleSaveName = (recordingId) => {
        if (editingName.trim()) {
            updateRecording(recordingId, { name: editingName.trim() });
        }
        setEditingId(null);
        setEditingName('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const handleImportToStudio = (recording) => {
        navigation.navigate('Studio', {
            projectId: 'new',
            importRecording: recording
        });
    };

    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>Recordings ({recordings.length})</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Search recordings..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {filteredRecordings.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        {searchQuery ? 'No recordings found' : 'No recordings yet'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {!searchQuery && 'Record audio in the Studio to see it here'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    scrollEnabled={false}
                    data={filteredRecordings}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                        const sourceIcon = item.source === 'voice' ? '🎤' : '🎹';
                        const sourceLabel = item.source === 'voice'
                            ? 'Vocals'
                            : (item.instrumentType ? item.instrumentType.charAt(0).toUpperCase() + item.instrumentType.slice(1) : 'Instrument');

                        return (
                            <View style={styles.recordingCard}>
                                <View style={styles.recordingInfo}>
                                    <View style={styles.recordingHeader}>
                                        <Text style={styles.sourceIcon}>{sourceIcon}</Text>
                                        <View style={styles.recordingTitleContainer}>
                                            {editingId === item.id ? (
                                                <View style={styles.editContainer}>
                                                    <TextInput
                                                        style={styles.editInput}
                                                        value={editingName}
                                                        onChangeText={setEditingName}
                                                        autoFocus
                                                        selectTextOnFocus
                                                        onSubmitEditing={() => handleSaveName(item.id)}
                                                    />
                                                    <TouchableOpacity onPress={() => handleSaveName(item.id)}>
                                                        <Text style={styles.saveButton}>✓</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity onPress={handleCancelEdit}>
                                                        <Text style={styles.cancelButton}>✕</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <TouchableOpacity onPress={() => handleEditName(item)} style={styles.nameContainer}>
                                                    <Text style={styles.recordingName}>{item.name}</Text>
                                                    <Text style={styles.editIcon}>✎</Text>
                                                </TouchableOpacity>
                                            )}
                                            <Text style={styles.sourceLabel}>{sourceLabel}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.recordingMeta}>
                                        {formatDuration(item.duration)} • {formatDate(item.createdAt)}
                                    </Text>
                                </View>
                                <View style={styles.recordingActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.playButton]}
                                        onPress={() => handlePlay(item)}
                                    >
                                        <Text style={styles.actionText}>
                                            {playingId === item.id && !isPaused ? '⏸' : '▶'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.studioButton]}
                                        onPress={() => handleImportToStudio(item)}
                                    >
                                        <Text style={styles.actionText}>🎹</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.deleteButton]}
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <Text style={styles.actionText}>🗑</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#2a2a2a',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#444',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        color: '#444',
        fontSize: 14,
    },
    recordingCard: {
        flexDirection: 'row',
        backgroundColor: '#2a2a2a',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    recordingInfo: {
        flex: 1,
    },
    recordingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    sourceIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    recordingTitleContainer: {
        flex: 1,
    },
    recordingName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    editIcon: {
        color: '#888',
        fontSize: 14,
        opacity: 0.6,
    },
    editContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    editInput: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        color: '#fff',
        padding: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#03dac6',
        fontSize: 14,
    },
    saveButton: {
        color: '#34d399',
        fontSize: 20,
        fontWeight: 'bold',
    },
    cancelButton: {
        color: '#ff6b6b',
        fontSize: 20,
        fontWeight: 'bold',
    },
    sourceLabel: {
        color: '#03dac6',
        fontSize: 12,
        marginTop: 2,
    },
    recordingMeta: {
        color: '#888',
        fontSize: 12,
    },
    recordingActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: '#6200ee',
    },
    studioButton: {
        backgroundColor: '#03dac6',
    },
    deleteButton: {
        backgroundColor: '#cf6679',
    },
    actionText: {
        fontSize: 18,
    },
});
