import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

/**
 * ProfessionalVideoBackground Component
 * 
 * Renders video backgrounds with proper scaling
 * Features: looping, muted/unmuted, auto-play on interaction, dark overlay
 */
export default function ProfessionalVideoBackground({
    source,
    overlay = true,
    overlayOpacity = 0.4,
    isMuted = true,
    volume = 1.0,
    children
}) {
    const { width, height } = useWindowDimensions();
    const [isPlaying, setIsPlaying] = useState(false);

    const [hasError, setHasError] = useState(false);

    // Create video player with expo-video
    const player = useVideoPlayer(source, (player) => {
        player.loop = true;
        player.muted = isMuted;
        player.volume = volume;
    });

    // Monitor for errors
    useEffect(() => {
        if (player) {
            const subscription = player.addListener('statusChange', (status) => {
                if (status.status === 'error') {
                    console.warn('Video background error:', status.error);
                    setHasError(true);
                }
            });
            return () => subscription.remove();
        }
    }, [player]);

    // Auto-play on mobile (non-web platforms)
    useEffect(() => {
        if (player && Platform.OS !== 'web' && !hasError) {
            // Mobile platforms can auto-play without user interaction
            player.play();
            setIsPlaying(true);
        }
    }, [player, hasError]);

    if (hasError) {
        // Fallback to a simple gradient or just the content container
        return (
            <View style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
                {children}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Video Background */}
            <VideoView
                player={player}
                style={styles.video}
                contentFit="cover"
                nativeControls={false}
            />

            {/* Dark Overlay for UI Readability */}
            {overlay && (
                <View
                    style={[
                        styles.overlay,
                        { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }
                    ]}
                />
            )}

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
    },
    content: {
        flex: 1,
        zIndex: 2,
    },
});
