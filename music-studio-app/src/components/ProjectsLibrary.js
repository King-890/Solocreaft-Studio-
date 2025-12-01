import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import { useNavigation } from '@react-navigation/native';

export default function ProjectsLibrary() {
    const { projects, loadProject, deleteProject } = useProject();
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLoadProject = (project) => {
        loadProject(project.id);
        navigation.navigate('Studio', { projectId: project.id });
    };

    const handleDelete = (projectId) => {
        Alert.alert(
            'Delete Project',
            'Are you sure you want to delete this project? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteProject(projectId)
                }
            ]
        );
    };

    const formatDuration = (clips) => {
        if (!clips || clips.length === 0) return '0:00';
        const totalMs = Math.max(...clips.map(c => c.startTime + c.duration));
        const seconds = Math.floor(totalMs / 1000);
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
            <Text style={styles.sectionTitle}>Projects ({projects.length})</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Search projects..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {filteredProjects.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        {searchQuery ? 'No projects found' : 'No projects yet'}
                    </Text>
                    <Text style={styles.emptySubtext}>
                        {!searchQuery && 'Save your timeline as a project to see it here'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    scrollEnabled={false}
                    data={filteredProjects}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.projectCard}>
                            <View style={styles.projectInfo}>
                                <Text style={styles.projectName}>{item.name}</Text>
                                <Text style={styles.projectMeta}>
                                    {item.clips?.length || 0} clips • {formatDuration(item.clips)} • {formatDate(item.updatedAt)}
                                </Text>
                            </View>
                            <View style={styles.projectActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.loadButton]}
                                    onPress={() => handleLoadProject(item)}
                                >
                                    <Text style={styles.actionText}>📂</Text>
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
    projectCard: {
        flexDirection: 'row',
        backgroundColor: '#2a2a2a',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    projectInfo: {
        flex: 1,
    },
    projectName: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    projectMeta: {
        color: '#888',
        fontSize: 12,
    },
    projectActions: {
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
    loadButton: {
        backgroundColor: '#03dac6',
    },
    deleteButton: {
        backgroundColor: '#cf6679',
    },
    actionText: {
        fontSize: 18,
    },
});
