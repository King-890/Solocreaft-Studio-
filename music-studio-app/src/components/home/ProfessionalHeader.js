import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HOME_THEMES, SPACING, TYPOGRAPHY } from '../../constants/HomeScreenThemes';

/**
 * ProfessionalHeader Component
 * 
 * Displays app title, subtitle, and profile button
 */
export default function ProfessionalHeader({
    title = 'Music Studio',
    subtitle = 'Create something amazing today',
    onProfilePress,
    theme = HOME_THEMES.darkStudio
}) {
    return (
        <View style={styles.header}>
            <View style={styles.headerContent}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {title}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>
                    {subtitle}
                </Text>
            </View>

            {onProfilePress && (
                <TouchableOpacity
                    style={[styles.profileButton, { backgroundColor: theme.secondary }]}
                    onPress={onProfilePress}
                    activeOpacity={0.7}
                >
                    <Text style={styles.profileIcon}>👤</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xxl + 20, // Extra padding for status bar
        paddingBottom: SPACING.lg,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        ...TYPOGRAPHY.title,
        marginBottom: 4,
    },
    headerSubtitle: {
        ...TYPOGRAPHY.subtitle,
    },
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.md,
    },
    profileIcon: {
        fontSize: 24,
    },
});
