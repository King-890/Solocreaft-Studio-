import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform, AppState } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';

/**
 * ResponsiveBackground Component
 * 
 * Handles all background types (gradient, photo, video) with:
 * - Aspect ratio preservation
 * - Smart cover mode (fill screen, crop edges, no stretch)
 * - Portrait/landscape detection and optimization
 * - Performance optimization (pause when inactive)
 * - Support for all screen sizes and orientations
 */
export default function ResponsiveBackground({
    theme,
    overlay = true,
    overlayOpacity = 0.3,
    children
}) {
    const [dimensions, setDimensions] = useState(Dimensions.get('window'));
    const [appState, setAppState] = useState(AppState.currentState);
    const videoPlayerRef = useRef(null);

    // Determine if screen is portrait
    const isPortrait = dimensions.height > dimensions.width;
    const aspectRatio = dimensions.width / dimensions.height;

    // Handle dimension changes (rotation, fold/unfold)
    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    // Handle app state changes (pause video when backgrounded)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            setAppState(nextAppState);

            // Pause video when app goes to background
            if (videoPlayerRef.current && theme?.type === 'video') {
                if (nextAppState === 'background' || nextAppState === 'inactive') {
                    videoPlayerRef.current.pause();
                } else if (nextAppState === 'active') {
                    videoPlayerRef.current.play();
                }
            }
        });

        return () => subscription?.remove();
    }, [theme?.type]);

    // Render gradient background
    if (theme?.type === 'gradient') {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={theme.colors}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                {overlay && (
                    <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
                )}
                <View style={styles.content}>
                    {children}
                </View>
            </View>
        );
    }

    // Render video background
    if (theme?.type === 'video') {
        return (
            <VideoBackground
                source={theme.source || { uri: theme.uri }}
                portraitSource={theme.portraitSource}
                isPortrait={isPortrait}
                overlay={overlay}
                overlayOpacity={overlayOpacity}
                appState={appState}
                onPlayerReady={(player) => { videoPlayerRef.current = player; }}
            >
                {children}
            </VideoBackground>
        );
    }

    // Render photo background
    if (theme?.type === 'photo') {
        return (
            <PhotoBackground
                source={theme.source || { uri: theme.uri }}
                portraitSource={theme.portraitSource}
                isPortrait={isPortrait}
                overlay={overlay}
                overlayOpacity={overlayOpacity}
            >
                {children}
            </PhotoBackground>
        );
    }

    // Fallback: solid color
    return (
        <View style={[styles.container, { backgroundColor: '#000' }]}>
            {children}
        </View>
    );
}

/**
 * VideoBackground Component
 * Handles video backgrounds with smart source selection
 */
function VideoBackground({
    source,
    portraitSource,
    isPortrait,
    overlay,
    overlayOpacity,
    appState,
    onPlayerReady,
    children
}) {
    // Choose appropriate source based on orientation
    const videoSource = (isPortrait && portraitSource) ? portraitSource : source;

    const player = useVideoPlayer(videoSource, (player) => {
        player.loop = true;
        player.muted = true;
        player.play();

        // Notify parent of player instance
        if (onPlayerReady) {
            onPlayerReady(player);
        }
    });

    return (
        <View style={styles.container}>
            <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover" // Fill screen, crop edges, preserve aspect ratio
                nativeControls={false}
                allowsFullscreen={false}
            />

            {/* Dark overlay for UI readability */}
            {overlay && (
                <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
            )}

            {/* Content layer */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

/**
 * PhotoBackground Component
 * Handles photo backgrounds with smart source selection
 */
function PhotoBackground({
    source,
    portraitSource,
    isPortrait,
    overlay,
    overlayOpacity,
    children
}) {
    // Choose appropriate source based on orientation
    const imageSource = (isPortrait && portraitSource) ? portraitSource : source;

    return (
        <View style={styles.container}>
            <ImageBackground
                source={imageSource}
                style={StyleSheet.absoluteFill}
                resizeMode="cover" // Fill screen, crop edges, preserve aspect ratio
                blurRadius={0} // No blur for high-res displays
            />

            {/* Dark overlay for UI readability */}
            {overlay && (
                <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
            )}

            {/* Content layer */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
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
