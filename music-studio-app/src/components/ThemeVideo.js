import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

/**
 * ThemeVideo Component
 * 
 * Renders a background video loop for the application theme using expo-video.
 * 
 * @param {object} source - The source of the video (e.g., require('./path/to/video.mp4') or { uri: '...' })
 * @param {object} style - Optional style overrides
 * @param {boolean} isMuted - Whether the video should be muted (default: true for themes)
 */
export default function ThemeVideo({ source, style, isMuted = true }) {
    if (!source) return null;

    // Handle source format differences if necessary
    // expo-video accepts string URI or require() directly usually, but let's ensure consistency
    const videoSource = typeof source === 'object' && source.uri ? source.uri : source;

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.muted = isMuted;
        player.play();
    });

    // Update mute status if prop changes
    useEffect(() => {
        if (player) {
            player.muted = isMuted;
        }
    }, [isMuted, player]);

    return (
        <View style={[styles.container, style]}>
            <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1, // Ensure it sits behind other content
        backgroundColor: 'black', // Fallback color
    },
    video: {
        width: '100%',
        height: '100%',
    },
});
