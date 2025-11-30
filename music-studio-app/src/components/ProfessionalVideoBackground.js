import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
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

    // Create video player with expo-video
    const player = useVideoPlayer(source, (player) => {
        player.loop = true;
        player.muted = isMuted;
        player.volume = volume;
    });

    // Handle user interaction to start playback
    useEffect(() => {
        const handleInteraction = () => {
            if (!isPlaying && player) {
                player.play();
                setIsPlaying(true);
            }
        };

        // Add event listeners for user interaction
        if (typeof window !== 'undefined') {
            window.addEventListener('click', handleInteraction, { once: true });
            window.addEventListener('touchstart', handleInteraction, { once: true });
            window.addEventListener('keydown', handleInteraction, { once: true });
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('click', handleInteraction);
                window.removeEventListener('touchstart', handleInteraction);
                window.removeEventListener('keydown', handleInteraction);
            }
        };
    }, [player, isPlaying]);

    // Update muted state when prop changes
    useEffect(() => {
        if (player) {
            player.muted = isMuted;
        }
    }, [isMuted, player]);

    // Update volume when prop changes
    useEffect(() => {
        if (player) {
            player.volume = volume;
        }
    }, [volume, player]);

    return (
        <View style={styles.container}>
            {/* Video Background */}
            <VideoView
                player={player}
                style={[styles.video, { width, height }]}
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
