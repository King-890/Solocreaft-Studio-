import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ImageBackground,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../contexts/ThemeContext';
import UISounds from '../utils/UISounds';

function ThemeCard({ theme, isActive, isUserTheme, onSelect, onDelete }) {
    let player = null;

    if (theme.type === 'video') {
        const videoSource = theme.source ? theme.source : { uri: theme.uri };
        player = useVideoPlayer(videoSource, player => {
            player.loop = true;
            player.muted = true;
            player.play();
        });
    }

    return (
        <TouchableOpacity
            style={[styles.themeCard, isActive && styles.activeThemeCard]}
            onPress={() => onSelect(theme)}
            onLongPress={isUserTheme ? () => onDelete(theme.id) : undefined}
        >
            {theme.type === 'gradient' ? (
                <LinearGradient
                    colors={theme.colors}
                    style={styles.themePreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            ) : theme.type === 'video' ? (
                <View style={styles.themePreview}>
                    <VideoView
                        player={player}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                        nativeControls={false}
                    />
                    <View style={styles.videoIndicator}>
                        <Text style={styles.videoIcon}>🎥</Text>
                    </View>
                </View>
            ) : (
                <ImageBackground
                    source={theme.source ? theme.source : { uri: theme.uri }}
                    style={styles.themePreview}
                    resizeMode="cover"
                />
            )}
            {isActive && <Text style={styles.activeLabel}>ACTIVE</Text>}
        </TouchableOpacity>
    );
}

export default function ThemeGallery({ onClose }) {
    const {
        currentTheme,
        userThemes,
        appThemes,
        uploadPhotoTheme,
        uploadVideoTheme,
        selectTheme,
        deleteUserTheme,
    } = useTheme();

    const [uploading, setUploading] = useState(false);

    const handleUploadPhoto = async () => {
        try {
            setUploading(true);
            UISounds.playTap();
            await uploadPhotoTheme();
            UISounds.playSuccess();
        } catch (error) {
            console.error('Photo upload failed:', error);
            UISounds.playError();
        } finally {
            setUploading(false);
        }
    };

    const handleUploadVideo = async () => {
        try {
            setUploading(true);
            UISounds.playTap();
            await uploadVideoTheme();
            UISounds.playSuccess();
        } catch (error) {
            console.error('Video upload failed:', error);
            UISounds.playError();
        } finally {
            setUploading(false);
        }
    };

    const handleSelectTheme = async (theme) => {
        UISounds.playTap();
        await selectTheme(theme);
        UISounds.playSuccess();
    };

    const handleDeleteTheme = (themeId) => {
        Alert.alert(
            'Delete Theme',
            'Are you sure you want to delete this theme?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteUserTheme(themeId);
                        UISounds.playSuccess();
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Theme Gallery</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Upload Buttons */}
                <View style={styles.uploadSection}>
                    <TouchableOpacity
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                        onPress={handleUploadPhoto}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.uploadIcon}>🖼️</Text>
                                <Text style={styles.uploadText}>Upload Photo</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                        onPress={handleUploadVideo}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.uploadIcon}>🎥</Text>
                                <Text style={styles.uploadText}>Upload Video (Max 15s)</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* User Themes */}
                {userThemes.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Your Themes</Text>
                        <Text style={styles.sectionHint}>Long press to delete</Text>
                        <View style={styles.themeGrid}>
                            {userThemes.map(theme => (
                                <ThemeCard
                                    key={theme.id}
                                    theme={theme}
                                    isActive={currentTheme.id === theme.id}
                                    isUserTheme={true}
                                    onSelect={handleSelectTheme}
                                    onDelete={handleDeleteTheme}
                                />
                            ))}
                        </View>
                    </View>
                )}
                {/* App Themes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Themes</Text>
                    <View style={styles.themeGrid}>
                        {appThemes.map(theme => (
                            <ThemeCard
                                key={theme.id}
                                theme={theme}
                                isActive={currentTheme.id === theme.id}
                                isUserTheme={false}
                                onSelect={handleSelectTheme}
                                onDelete={handleDeleteTheme}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    closeButton: {
        padding: 8,
    },
    closeText: {
        fontSize: 24,
        color: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    uploadSection: {
        flexDirection: 'row',
        padding: 15,
        gap: 10,
    },
    uploadButton: {
        flex: 1,
        backgroundColor: '#6200ee',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
    },
    uploadButtonDisabled: {
        opacity: 0.5,
    },
    uploadIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    uploadText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        padding: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    sectionHint: {
        fontSize: 12,
        color: '#888',
        marginBottom: 15,
    },
    themeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    themeCard: {
        width: '47%',
        maxWidth: 200,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        aspectRatio: 1,
    },
    activeThemeCard: {
        borderColor: '#03dac6',
        boxShadow: '0 0 20px rgba(3, 218, 198, 0.5)',
    },
    themePreview: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoIndicator: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        borderRadius: 25,
    },
    videoIcon: {
        fontSize: 24,
    },
    themeName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        padding: 8,
        paddingTop: 6,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    activeLabel: {
        color: '#03dac6',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 6,
        backgroundColor: 'rgba(3, 218, 198, 0.1)',
    },
});
