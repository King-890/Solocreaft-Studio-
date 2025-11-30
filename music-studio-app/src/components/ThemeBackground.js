import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeBackground({ children, style }) {
    const { currentTheme } = useTheme();

    // Render gradient theme
    if (currentTheme.type === 'gradient') {
        return (
            <View style={[styles.container, style]}>
                <LinearGradient
                    colors={currentTheme.colors}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.contentContainer}>
                    {children}
                </View>
            </View>
        );
    }

    // Render photo theme
    if (currentTheme.type === 'photo') {
        // Handle both local assets (source) and uploaded photos (uri)
        const imageSource = currentTheme.source ? currentTheme.source : { uri: currentTheme.uri };

        return (
            <View style={[styles.container, style]}>
                <Image
                    source={imageSource}
                    style={[StyleSheet.absoluteFill, styles.image]}
                    resizeMode="cover"
                />
                <View style={[styles.overlay, styles.contentContainer]}>
                    {children}
                </View>
            </View>
        );
    }

    // Render video theme
    if (currentTheme.type === 'video') {
        const videoSource = currentTheme.source
            ? currentTheme.source
            : { uri: currentTheme.uri };

        const player = useVideoPlayer(videoSource, player => {
            player.loop = true;
            player.play();
            player.muted = true;
        });

        return (
            <View style={[styles.container, style]}>
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    nativeControls={false}
                />
                <View style={[styles.overlay, styles.contentContainer]}>
                    {children}
                </View>
            </View>
        );
    }

    // Fallback
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#000', // Fallback background color
        overflow: 'hidden', // Ensure content doesn't spill out
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)', // Slight overlay for better text visibility
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
