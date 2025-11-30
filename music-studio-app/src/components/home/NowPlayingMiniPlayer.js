import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { HOME_THEMES, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/HomeScreenThemes';

/**
 * NowPlayingMiniPlayer Component
 * 
 * Displays a compact player for the currently active track
 */
export default function NowPlayingMiniPlayer({
    track,
    isPlaying = false,
    onPlayPause,
    onPress,
    theme = HOME_THEMES.darkStudio
}) {
    if (!track) return null;

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.secondary }, theme.shadow]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Progress Bar (at top) */}
            <View style={[styles.progressBar, { backgroundColor: theme.primary }]}>
                <View style={[styles.progressFill, { width: '30%', backgroundColor: theme.accent }]} />
            </View>

            <View style={styles.content}>
                {/* Artwork */}
                <View style={[styles.artworkContainer, theme.shadowSmall]}>
                    {track.artwork ? (
                        <Image source={{ uri: track.artwork }} style={styles.artwork} />
                    ) : (
                        <View style={[styles.artworkPlaceholder, { backgroundColor: theme.primary }]}>
                            <Text style={styles.artworkIcon}>🎵</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {track.title || 'Untitled Track'}
                    </Text>
                    <Text style={[styles.artist, { color: theme.textMuted }]} numberOfLines={1}>
                        {track.artist || 'Unknown Artist'}
                    </Text>
                </View>

                {/* Controls */}
                <TouchableOpacity
                    style={styles.playButton}
                    onPress={onPlayPause}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={[styles.playIcon, { color: theme.accent }]}>
                        {isPlaying ? '⏸️' : '▶️'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
        position: 'absolute',
        bottom: SPACING.lg,
        left: 0,
        right: 0,
    },
    progressBar: {
        height: 2,
        width: '100%',
    },
    progressFill: {
        height: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.sm,
        paddingRight: SPACING.md,
    },
    artworkContainer: {
        width: 48,
        height: 48,
        borderRadius: BORDER_RADIUS.md,
        marginRight: SPACING.md,
        overflow: 'hidden',
    },
    artwork: {
        width: '100%',
        height: '100%',
    },
    artworkPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    artworkIcon: {
        fontSize: 20,
    },
    info: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        marginBottom: 2,
    },
    artist: {
        ...TYPOGRAPHY.caption,
    },
    playButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIcon: {
        fontSize: 24,
    },
});
