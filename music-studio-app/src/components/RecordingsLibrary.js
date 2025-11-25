import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import AudioPlaybackService from '../services/AudioPlaybackService';

export default function RecordingsLibrary() {
    const { recordings, deleteRecording } = useProject();
    const [searchQuery, setSearchQuery] = useState('');
    const [playingId, setPlayingId] = useState(null);

    const filteredRecordings = recordings.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePlay = async (recording) => {
        if (playingId === recording.id) {
            AudioPlaybackService.stopAll();
            setPlayingId(null);
        } else {
            AudioPlaybackService.stopAll();
            setPlayingId(recording.id);
            await AudioPlaybackService.playClip(
                { id: recording.id, audioUri: recording.uri, startTime: 0, duration: recording.duration },
                0
            );
            setPlayingId(null);
        }
    };

    const handleDelete = (recordingId) => {
        if (confirm('Delete this recording?')) {
            deleteRecording(recordingId);
            if (playingId === recordingId) {
                AudioPlaybackService.stopAll();
                setPlayingId(null);
            }
        }
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
                    data={filteredRecordings}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.recordingCard}>
                            <View style={styles.recordingInfo}>
                                <Text style={styles.recordingName}>{item.name}</Text>
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
                                        {playingId === item.id ? '⏸' : '▶'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDelete(item.id)}
                                >
                                    <Text style={styles.actionText}>🗑</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
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
    recordingName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
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
    deleteButton: {
        backgroundColor: '#cf6679',
    },
    actionText: {
        fontSize: 18,
    },
});
