import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform, Alert, TextInput, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { COLORS, SPACING } from '../constants/UIConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moveRecordingToPermanentStorage } from '../utils/fileSystem';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();
    const { projects = [], tracks = [], clips = [] } = useProject() || {};

    // Calculate stats
    const projectCount = projects.length || 0;
    const trackCount = tracks.length || 0;
    const recordingCount = clips.length || 0;

    // Profile editing state
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: user?.email || '',
        bio: '',
        role: 'Music Producer',
    });

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    // Load profile data on mount
    useEffect(() => {
        loadProfileData();

        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    }, []);

    const loadProfileData = async () => {
        try {
            const stored = await AsyncStorage.getItem('@user_profile');
            if (stored) {
                const data = JSON.parse(stored);
                setProfileData({
                    ...profileData,
                    ...data,
                    email: user?.email || data.email,
                });
                if (data.avatarUri) {
                    setAvatarUri(data.avatarUri);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const saveProfileData = async () => {
        try {
            const dataToSave = {
                ...profileData,
                avatarUri,
            };
            await AsyncStorage.setItem('@user_profile', JSON.stringify(dataToSave));
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', 'Failed to save profile');
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedUri = result.assets[0].uri;
                let finalUri = selectedUri;

                if (Platform.OS !== 'web') {
                    try {
                        const permanentUri = await moveRecordingToPermanentStorage(selectedUri);
                        finalUri = permanentUri;
                    } catch (err) {
                        console.warn('Failed to move avatar:', err);
                    }
                }

                setAvatarUri(finalUri);

                // Auto-save avatar
                try {
                    const currentProfile = await AsyncStorage.getItem('@user_profile');
                    const profileToSave = currentProfile ? JSON.parse(currentProfile) : profileData;
                    profileToSave.avatarUri = finalUri;
                    await AsyncStorage.setItem('@user_profile', JSON.stringify(profileToSave));

                    if (Platform.OS !== 'web') {
                        Alert.alert('Success', 'Avatar updated!');
                    }
                } catch (saveError) {
                    console.error('Error saving avatar:', saveError);
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleLogOut = async () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim }
                    ]
                }}>
                    {/* Profile Card */}
                    <LinearGradient
                        colors={['#BA55D3', '#9370DB', '#6200ee']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.profileCard}
                    >
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={handlePickImage}
                            activeOpacity={0.8}
                        >
                            {avatarUri && (Platform.OS === 'web' || avatarUri.startsWith('file://') || avatarUri.startsWith('http')) ? (
                                <Image
                                    source={{ uri: avatarUri }}
                                    style={styles.avatarImage}
                                    onError={() => setAvatarUri(null)}
                                />
                            ) : (
                                <LinearGradient
                                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                                    style={styles.avatarPlaceholder}
                                >
                                    <Text style={styles.avatarText}>
                                        {(profileData.name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            )}
                            <View style={styles.cameraIcon}>
                                <Text style={styles.cameraEmoji}>📷</Text>
                            </View>
                        </TouchableOpacity>

                        {isEditing ? (
                            <View style={styles.editContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Your Name"
                                    placeholderTextColor="#999"
                                    value={profileData.name}
                                    onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                                />
                                <TextInput
                                    style={[styles.input, styles.inputDisabled]}
                                    placeholder="Email"
                                    placeholderTextColor="#999"
                                    value={profileData.email}
                                    editable={false}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Role (e.g., Music Producer)"
                                    placeholderTextColor="#999"
                                    value={profileData.role}
                                    onChangeText={(text) => setProfileData({ ...profileData, role: text })}
                                />
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Bio (optional)"
                                    placeholderTextColor="#999"
                                    value={profileData.bio}
                                    onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                                    multiline
                                    numberOfLines={3}
                                />

                                <View style={styles.editButtons}>
                                    <TouchableOpacity
                                        style={[styles.editButton, styles.cancelButton]}
                                        onPress={() => {
                                            setIsEditing(false);
                                            loadProfileData();
                                        }}
                                    >
                                        <Text style={styles.editButtonText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.editButton, styles.saveButton]}
                                        onPress={saveProfileData}
                                    >
                                        <Text style={styles.editButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>
                                    {profileData.name || 'Set your name'}
                                </Text>
                                <Text style={styles.profileEmail}>{profileData.email || 'Not logged in'}</Text>
                                <View style={styles.roleBadge}>
                                    <Text style={styles.profileLabel}>{profileData.role}</Text>
                                </View>
                                {profileData.bio ? (
                                    <Text style={styles.profileBio}>{profileData.bio}</Text>
                                ) : null}

                                <TouchableOpacity
                                    style={styles.editProfileButton}
                                    onPress={() => setIsEditing(true)}
                                >
                                    <Text style={styles.editProfileText}>✏️ Edit Profile</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </LinearGradient>

                    {/* Stats Section */}
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{projectCount}</Text>
                            <Text style={styles.statLabel}>Projects</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{recordingCount}</Text>
                            <Text style={styles.statLabel}>Recordings</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{trackCount}</Text>
                            <Text style={styles.statLabel}>Tracks</Text>
                        </View>
                    </View>

                    {/* Log Out Button */}
                    <TouchableOpacity style={styles.logOutButton} onPress={handleLogOut}>
                        <Text style={styles.logOutIcon}>🚪</Text>
                        <Text style={styles.logOutText}>Log Out</Text>
                    </TouchableOpacity>

                    {/* Developer Credit */}
                    <View style={styles.creditContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.creditText}>Developed by</Text>
                        <LinearGradient
                            colors={['#BA55D3', '#FFD700']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.studioBadge}
                        >
                            <Text style={styles.studioText}>UJ STUDIO</Text>
                        </LinearGradient>
                        <Text style={styles.versionText}>v1.0.0</Text>
                    </View>

                    <View style={{ height: 40 }} />
                </Animated.View>
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
        borderRadius: 24,
        alignItems: 'center',
        elevation: 12,
        ...Platform.select({
            web: {
                boxShadow: '0 8px 24px rgba(186, 85, 211, 0.4)',
            }
        })
    },
    avatarContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: SPACING.lg,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        overflow: 'hidden',
        elevation: 8,
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 56,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: '#FFD700',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        elevation: 4,
    },
    cameraEmoji: {
        fontSize: 20,
    },
    profileInfo: {
        alignItems: 'center',
        width: '100%',
    },
    profileName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    profileEmail: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.95)',
        marginBottom: 12,
    },
    roleBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.4)',
        marginBottom: 12,
    },
    profileLabel: {
        fontSize: 14,
        color: '#FFD700',
        fontWeight: '600',
    },
    profileBio: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.85)',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    editProfileButton: {
        marginTop: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 28,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    editProfileText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    editContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 14,
        padding: 16,
        marginBottom: 14,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    inputDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        color: '#666',
    },
    textArea: {
        height: 90,
        textAlignVertical: 'top',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    editButton: {
        flex: 1,
        padding: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    saveButton: {
        backgroundColor: '#FFD700',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        borderRadius: 16,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3a3a3a',
        elevation: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#BA55D3',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#aaa',
        fontWeight: '600',
    },
    logOutButton: {
        backgroundColor: '#cf6679',
        borderRadius: 16,
        padding: SPACING.md,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...Platform.select({
            web: {
                boxShadow: '0 4px 12px rgba(207, 102, 121, 0.4)',
            }
        })
    },
    logOutIcon: {
        fontSize: 22,
        marginRight: SPACING.sm,
    },
    logOutText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
    },
    creditContainer: {
        alignItems: 'center',
        marginTop: SPACING.xl * 2,
        paddingHorizontal: SPACING.lg,
    },
    divider: {
        width: '40%',
        height: 1,
        backgroundColor: '#3a3a3a',
        marginBottom: SPACING.md,
    },
    creditText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
        letterSpacing: 1,
    },
    studioBadge: {
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 4,
        ...Platform.select({
            web: {
                boxShadow: '0 4px 12px rgba(186, 85, 211, 0.3)',
            }
        })
    },
    studioText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 2,
    },
    versionText: {
        fontSize: 11,
        color: '#666',
        marginTop: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
