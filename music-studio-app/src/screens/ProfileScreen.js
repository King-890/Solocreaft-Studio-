import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Platform, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { COLORS, SPACING } from '../constants/UIConfig';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const { audioEnabled, animationsEnabled, currentTheme, toggleAudio, toggleAnimations, setTheme, customVideoUri, saveCustomVideo } = useSettings();

    const handlePickVideo = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'],
                allowsEditing: true,
                quality: 1,
                videoMaxDuration: 15, // Hint to OS, but we must verify manually too
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];

                // Check duration (in milliseconds)
                if (asset.duration > 15000) {
                    Alert.alert('Video too long', 'Please select a video shorter than 15 seconds.');
                    return;
                }

                console.log('Picking video:', asset.uri);
                await saveCustomVideo(asset.uri);
                setTheme('custom');
                Alert.alert('Success', 'Custom theme video set!');
            }
        } catch (error) {
            console.error('Error picking video:', error);
            Alert.alert('Error', 'Failed to pick video');
        }
    };

    const handleLogOut = async () => {
        console.log('Logging out...');
        try {
            const { error } = await signOut();
            if (error) {
                console.error('Logout error:', error);
                if (Platform.OS === 'web') {
                    window.alert('Error logging out: ' + error.message);
                }
            } else {
                console.log('Logout successful!');
            }
        } catch (error) {
            console.error('Logout exception:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Card */}
                <LinearGradient
                    colors={['#6200ee', '#3700b3']}
                    style={styles.profileCard}
                >
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarText}>
                            {user?.email?.charAt(0).toUpperCase() || '?'}
                        </Text>
                    </View>
                    <Text style={styles.profileEmail}>{user?.email || 'Not logged in'}</Text>
                    <Text style={styles.profileLabel}>Music Producer</Text>
                </LinearGradient>

                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    profileCard: {
        margin: SPACING.lg,
        padding: SPACING.xl,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
        // Web compatibility
        ...Platform.select({
            web: {
                boxShadow: '0 4px 8px rgba(98, 0, 238, 0.3)',
            }
        })
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileEmail: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    section: {
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        marginBottom: SPACING.md,
        letterSpacing: 1,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1e1e1e',
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.sm,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    settingIcon: {
        fontSize: 20,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 12,
        color: '#888',
    },
    toggle: {
        width: 50,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#444',
        padding: 2,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: '#6200ee',
    },
    toggleThumb: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
    },
    toggleThumbActive: {
        alignSelf: 'flex-end',
    },
    logOutButton: {
        backgroundColor: '#cf6679',
        borderRadius: 12,
        padding: SPACING.md,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        // Web compatibility
        ...Platform.select({
            web: {
                boxShadow: '0 4px 8px rgba(207, 102, 121, 0.3)',
            }
        })
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
    version: {
        textAlign: 'center',
        color: '#666',
        fontSize: 12,
        marginTop: SPACING.xl,
    },
    themesContainer: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    themeOption: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeOptionActive: {
        borderColor: COLORS.primary,
        backgroundColor: '#2a2a2a',
    },
    themePreview: {
        width: '100%',
        height: 60,
        borderRadius: 8,
        marginBottom: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    checkMark: {
        position: 'absolute',
        top: 8,
        right: 8,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
});
