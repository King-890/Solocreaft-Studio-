import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Image, Animated, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

// Sub-component to handle video player events safely
const VideoBackground = ({ player, onError }) => {
    useEffect(() => {
        if (player) {
            const subscription = player.addListener('statusChange', (status) => {
                if (status.status === 'error') {
                    onError();
                }
            });
            return () => subscription.remove();
        }
    }, [player, onError]);

    return (
        <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
        />
    );
};

/**
 * ImmersiveBackground Component
 * 
 * Renders a high-quality, responsive background (image or video) that:
 * 1. Always covers the screen without distortion (resizeMode="cover")
 * 2. Applies a cinematic gradient overlay for text readability
 * 3. Fades in smoothly to avoid jarring transitions
 */
export default function ImmersiveBackground({ children, style }) {
    const { currentTheme } = useTheme();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [videoError, setVideoError] = useState(false);

    useEffect(() => {
        // Reset error state when theme changes
        setVideoError(false);
    }, [currentTheme]);

    useEffect(() => {
        // Reset opacity when theme changes
        fadeAnim.setValue(0);

        // Fade in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800, // Cinematic slow fade
            useNativeDriver: true,
        }).start();
    }, [currentTheme]);

    // Render Logic
    const renderMedia = () => {
        // 1. Gradient Theme (CSS Gradient or fallback)
        if (currentTheme.type === 'gradient') {
            return (
                <LinearGradient
                    colors={currentTheme.colors}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            );
        }

        // 2. Photo Theme
        if (currentTheme.type === 'photo') {
            const imageSource = currentTheme.source ? currentTheme.source : { uri: currentTheme.uri };
            return (
                <Image
                    source={imageSource}
                    style={[StyleSheet.absoluteFill, styles.media]}
                    resizeMode="cover"
                />
            );
        }

        // 3. Video Theme
        if (currentTheme.type === 'video') {
            // If we have an error, fallback to gradient or dark background
            if (videoError) {
                return (
                    <LinearGradient
                        colors={['#1a1a1a', '#000000']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                );
            }

            const videoSource = currentTheme.source
                ? currentTheme.source
                : { uri: currentTheme.uri };

            // Initialize video player
            const player = useVideoPlayer(videoSource, player => {
                player.loop = true;
                player.play();
                player.muted = true;
            });

            return (
                <VideoBackground
                    player={player}
                    onError={() => setVideoError(true)}
                />
            );
        }

        return null; // Fallback
    };

    return (
        <View style={[styles.container, style]}>
            {/* Animated Background Layer */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
                {renderMedia()}
            </Animated.View>

            {/* Cinematic Vignette Overlay 
                Darkens top and bottom for UI contrast, keeps center bright
            */}
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none" // Allow touches to pass through
            />

            {/* Content Layer */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000', // Black base ensures no white flashes
        overflow: 'hidden',
    },
    media: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        zIndex: 10, // Ensure content is above background
    },
});
