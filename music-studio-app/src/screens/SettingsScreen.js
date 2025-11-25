import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import SettingsItem from '../components/SettingsItem';
import CategoryHeader from '../components/CategoryHeader';
import { COLORS, SPACING } from '../constants/UIConfig';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { audioEnabled, animationsEnabled, toggleAudio, toggleAnimations } = useSettings();

    const handleLogOut = async () => {
        console.log('Log Out button clicked - logging out immediately...');
        try {
            const { error } = await signOut();
            if (error) {
                console.error('Logout error:', error);
                if (Platform.OS === 'web') {
                    window.alert('Error logging out: ' + error.message);
                } else {
                    Alert.alert('Error', error.message);
                }
            } else {
                console.log('Logout successful! Redirecting to login...');
            }
        } catch (error) {
            console.error('Logout exception:', error);
            if (Platform.OS === 'web') {
                window.alert('Error: ' + error.message);
            }
        }
    };

    const handleAudioQuality = () => {
        Alert.alert('Audio Quality', 'High quality audio is enabled');
    };

    const handleTheme = () => {
        Alert.alert('Theme', 'Current theme: Blossom Goddess');
    };

    const handleProfile = () => {
        Alert.alert('Profile', 'Profile settings coming soon!');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
                <Text style={styles.subtitle}>Customize your experience</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Audio Settings */}
                <CategoryHeader
                    title="Audio"
                    icon="🎵"
                    color="#6bcf7f"
                />

                <SettingsItem
                    title="Ambient Sounds"
                    subtitle={audioEnabled ? "Playing" : "Paused"}
                    icon="🌊"
                    color="#4d9de0"
                    showToggle={true}
                    toggleValue={audioEnabled}
                    onToggle={toggleAudio}
                />

                <SettingsItem
                    title="Audio Quality"
                    subtitle="High quality"
                    icon="🎧"
                    color="#6bcf7f"
                    showArrow={true}
                    onPress={handleAudioQuality}
                />

                {/* Appearance */}
                <CategoryHeader
                    title="Appearance"
                    icon="🎨"
                    color="#ff6b9d"
                />

                <SettingsItem
                    title="Animations"
                    subtitle={animationsEnabled ? "Enabled" : "Disabled"}
                    icon="✨"
                    color="#ffd93d"
                    showToggle={true}
                    toggleValue={animationsEnabled}
                    onToggle={toggleAnimations}
                />

                <SettingsItem
                    title="Theme"
                    subtitle="Blossom Goddess"
                    icon="🌸"
                    color="#ff6b9d"
                    showArrow={true}
                    onPress={handleTheme}
                />

                {/* Account */}
                <CategoryHeader
                    title="Account"
                    icon="👤"
                    color="#6200ee"
                />

                <SettingsItem
                    title="Email"
                    subtitle={user?.email || 'Not logged in'}
                    icon="📧"
                    color="#6200ee"
                    showArrow={false}
                />

                <SettingsItem
                    title="Profile"
                    subtitle="View and edit"
                    icon="👤"
                    color="#6200ee"
                    showArrow={true}
                    onPress={handleProfile}
                />

                {/* Log Out Button */}
                <TouchableOpacity
                    style={styles.logOutButton}
                    onPress={handleLogOut}
                >
                    <Text style={styles.logOutIcon}>🚪</Text>
                    <Text style={styles.logOutText}>Log Out</Text>
                </TouchableOpacity>

                {/* App Info */}
                <CategoryHeader
                    title="About"
                    icon="ℹ️"
                    color="#888"
                />

                <SettingsItem
                    title="Version"
                    subtitle="1.0.0 (Beta)"
                    icon="📱"
                    color="#888"
                    showArrow={false}
                />

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
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
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        color: COLORS.textGold,
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
    },
    logOutButton: {
        backgroundColor: '#cf6679',
        borderRadius: 12,
        padding: SPACING.md,
        marginVertical: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#cf6679',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logOutIcon: {
        fontSize: 20,
        marginRight: SPACING.sm,
    },
    logOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
