import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { HOME_THEMES, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/HomeScreenThemes';

/**
 * RecentProjectsCarousel Component
 * 
 * Displays a horizontal scrollable list of recent projects
 */
export default function RecentProjectsCarousel({
    projects = [],
    onProjectPress,
    theme = HOME_THEMES.darkStudio
}) {
    if (!projects || projects.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Recent Projects
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAll, { color: theme.accent }]}>See All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {projects.map((project, index) => (
                    <ProjectCard
                        key={project.id || index}
                        project={project}
                        onPress={() => onProjectPress(project)}
                        theme={theme}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

function ProjectCard({ project, onPress, theme }) {
    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.secondary }, theme.shadowSmall]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[styles.artwork, { backgroundColor: theme.primary }]}>
                <Text style={styles.artworkIcon}>🎵</Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={[styles.projectTitle, { color: theme.text }]} numberOfLines={1}>
                    {project.name || 'Untitled Project'}
                </Text>
                <Text style={[styles.projectDate, { color: theme.textMuted }]}>
                    {new Date(project.lastModified || Date.now()).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 18,
        fontWeight: 'bold',
    },
    seeAll: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md, // For shadow
    },
    card: {
        width: 140,
        marginRight: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    artwork: {
        height: 100,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    artworkIcon: {
        fontSize: 32,
    },
    cardContent: {
        padding: SPACING.sm,
    },
    projectTitle: {
        ...TYPOGRAPHY.caption,
        fontWeight: '600',
        marginBottom: 2,
    },
    projectDate: {
        fontSize: 10,
    },
});
