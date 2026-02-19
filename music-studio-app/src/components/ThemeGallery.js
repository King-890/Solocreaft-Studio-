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
    Platform,
    ActionSheetIOS,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../contexts/ThemeContext';
import UISounds from '../utils/UISounds';
import { useResponsive, getResponsiveColumns } from '../utils/responsive';
import { createShadow } from '../utils/shadows';

function ThemeCard({ theme, isActive, isUserTheme, onSelect, onDelete, cardWidth }) {
    return (
        <TouchableOpacity
            style={[
                styles.themeCard,
                cardWidth && { width: cardWidth },
                isActive && styles.activeThemeCard
            ]}
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
                <VideoThemePreview theme={theme} />
            ) : (
                <ImageBackground
                    source={theme.source ? theme.source : { uri: theme.uri }}
                    style={styles.themePreview}
                    resizeMode="cover"
                />
            )}
            <View style={styles.cardOverlay}>
                <Text style={styles.themeName} numberOfLines={1}>{theme.name}</Text>
                {isActive && <Text style={styles.activeLabel}>ACTIVE</Text>}
            </View>
        </TouchableOpacity>
    );
}

function VideoThemePreview({ theme }) {
    if (Platform.OS === 'web') {
        return (
            <View style={styles.themePreview}>
                <View style={[styles.themePreview, { backgroundColor: '#000' }]}>
                    <Text style={{ fontSize: 40 }}>🎥</Text>
                </View>
                <View style={styles.videoIndicator}>
                    <Text style={styles.videoIcon}>🎥</Text>
                </View>
            </View>
        );
    }

    const videoSource = theme.source ? theme.source : { uri: theme.uri };
    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.muted = true;
        player.play();
    });

    return (
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
    const { wp, SCREEN_WIDTH } = useResponsive();

    // Calculate responsive grid columns
    // Use more columns on larger screens to prevent huge cards
    const columns = getResponsiveColumns(2, 3, 4);
    const cardWidth = wp((100 / columns) - 2);

    const handleUpload = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Upload Photo', 'Upload Video'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) handleUploadPhoto();
                    else if (buttonIndex === 2) handleUploadVideo();
                }
            );
        } else {
            // For Android/Web, simple alert or custom modal could be used
            // For now, we'll just default to Photo for simplicity or toggle
            // Let's use Alert to ask
            if (Platform.OS === 'web') {
                // Web doesn't support Alert.alert with options well, so we might need a custom UI
                // For now, let's just try to upload photo as default or ask user
                const choice = window.confirm("Click OK to upload a Photo, or Cancel to upload a Video.");
                if (choice) handleUploadPhoto();
                else handleUploadVideo();
            } else {
                Alert.alert(
                    'Upload Theme',
                    'Choose theme type',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Photo', onPress: handleUploadPhoto },
                        { text: 'Video', onPress: handleUploadVideo },
                    ]
                );
            }
        }
    };

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
                {/* Upload Button */}
                <View style={styles.uploadSection}>
                    <TouchableOpacity
                        style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
                        onPress={handleUpload}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.uploadIcon}>🎨</Text>
                                <Text style={styles.uploadText}>Upload Custom Theme</Text>
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
                                    cardWidth={cardWidth}
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
                                cardWidth={cardWidth}
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
        padding: 15,
    },
    uploadButton: {
        backgroundColor: '#6200ee',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
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
        fontSize: 16,
        fontWeight: 'bold',
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
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        aspectRatio: 1,
        marginBottom: 12,
    },
    activeThemeCard: {
        borderColor: '#03dac6',
        ...createShadow({ color: '#03dac6', offsetY: 0, opacity: 0.5, radius: 10, elevation: 5 }),
    },
    themePreview: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoIndicator: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 5,
        borderRadius: 15,
    },
    videoIcon: {
        fontSize: 16,
    },
    cardOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 8,
    },
    themeName: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeLabel: {
        color: '#03dac6',
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 2,
    },
});
