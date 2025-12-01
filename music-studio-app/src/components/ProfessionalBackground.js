import React from 'react';
import { ImageBackground, StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ProfessionalBackground Component
 * 
 * Renders backgrounds with proper scaling (no stretching)
 * Supports: ImageBackground, LinearGradient, and solid colors
 */
export default function ProfessionalBackground({
    source,           // Image source (optional)
    gradient,         // Array of gradient colors (optional)
    backgroundColor,  // Solid color (optional)
    overlay = false,  // Add dark overlay for text readability
    overlayOpacity = 0.4,
    children
}) {
    const { width, height } = useWindowDimensions();

    // Gradient background
    if (gradient && gradient.length > 0) {
        return (
            <LinearGradient
                colors={gradient}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {overlay && (
                    <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
                )}
                <View style={styles.content}>
                    {children}
                </View>
            </LinearGradient>
        );
    }

    // Image background
    if (source) {
        return (
            <ImageBackground
                source={source}
                style={styles.container}
                resizeMode="cover" // Prevents stretching
            >
                {overlay && (
                    <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
                )}
                <View style={styles.content}>
                    {children}
                </View>
            </ImageBackground>
        );
    }

    // Solid color background
    return (
        <View style={[styles.container, { backgroundColor: backgroundColor || '#000' }]}>
            {overlay && (
                <View style={[styles.overlay, { backgroundColor: `rgba(0,0,0,${overlayOpacity})` }]} />
            )}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
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
