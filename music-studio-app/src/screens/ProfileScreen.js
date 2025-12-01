import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform, Alert, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING } from '../constants/UIConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { moveRecordingToPermanentStorage } from '../utils/fileSystem';

export default function ProfileScreen() {
    const { user, signOut } = useAuth();

    // Profile editing state
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: user?.email || '',
        bio: '',
        role: 'Music Producer',
    });

    // Load profile data on mount
    React.useEffect(() => {
        loadProfileData();
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
                mediaTypes: ['images'],
                allowsEditing: false,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedUri = result.assets[0].uri;
                // Move to permanent storage if on native
                if (Platform.OS !== 'web') {
                    try {
                        const permanentUri = await moveRecordingToPermanentStorage(selectedUri);
                        setAvatarUri(permanentUri);
                    } catch (err) {
                        console.warn('Failed to move avatar to permanent storage:', err);
                        setAvatarUri(selectedUri);
                    }
                } else {
                    setAvatarUri(selectedUri);
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
                {/* Profile Card */}
                <LinearGradient
                    colors={['#6200ee', '#3700b3']}
                    style={styles.profileCard}
                >
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={handlePickImage}
                        activeOpacity={0.8}
                    >
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {(profileData.name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()}
                            </Text>
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
                                placeholderTextColor="#ccc"
                                value={profileData.name}
                                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                            />
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                placeholder="Email"
                                placeholderTextColor="#ccc"
                                value={profileData.email}
                                editable={false}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Role (e.g., Music Producer)"
                                placeholderTextColor="#ccc"
                                value={profileData.role}
                                onChangeText={(text) => setProfileData({ ...profileData, role: text })}
                            />
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Bio (optional)"
                                placeholderTextColor="#ccc"
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
                            <Text style={styles.profileLabel}>{profileData.role}</Text>
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

                {/* Log Out Button */}
                <TouchableOpacity style={styles.logOutButton} onPress={handleLogOut}>
                    <Text style={styles.logOutIcon}>🚪</Text>
                    <Text style={styles.logOutText}>Log Out</Text>
                </TouchableOpacity>

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
        ...Platform.select({
            web: {
                boxShadow: '0 4px 8px rgba(98, 0, 238, 0.3)',
            }
        })
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.md,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#fff',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#03dac6',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#6200ee',
    },
    cameraEmoji: {
        fontSize: 18,
    },
    profileInfo: {
        alignItems: 'center',
        width: '100%',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    profileEmail: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    profileLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    profileBio: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    editProfileButton: {
        marginTop: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    editProfileText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    editContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
        fontSize: 16,
        color: '#333',
    },
    inputDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        color: '#666',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    editButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    editButton: {
        flex: 1,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    saveButton: {
        backgroundColor: '#03dac6',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
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
});
