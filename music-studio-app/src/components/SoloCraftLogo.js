import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createTextShadow } from '../utils/shadows';

export default function SoloCraftLogo({ size = 120, showText = true, animated = true }) {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (animated) {
            // Rotation animation
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 20000,
                    useNativeDriver: Platform.OS !== 'web',
                })
            ).start();

            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.1,
                        duration: 2000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            ).start();
        }
    }, [animated]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const logoSize = size;
    const fontSize = size * 0.5;
    const textSize = size * 0.15;

    return (
        <View style={[styles.container, { width: logoSize, height: logoSize }]}>
            {/* Outer glow ring */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        width: logoSize,
                        height: logoSize,
                        borderRadius: logoSize / 2,
                        transform: animated ? [{ rotate: spin }, { scale: pulseAnim }] : [],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#BA55D3', '#9370DB', '#FFD700', '#BA55D3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.gradientRing, { borderRadius: logoSize / 2 }]}
                />
            </Animated.View>

            {/* Main logo circle */}
            <View
                style={[
                    styles.logoCircle,
                    {
                        width: logoSize * 0.9,
                        height: logoSize * 0.9,
                        borderRadius: (logoSize * 0.9) / 2,
                        backgroundColor: '#000', // Black background for contrast
                    },
                ]}
            >
                <LinearGradient
                    colors={['#2d1b4e', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.innerGradient, { borderRadius: (logoSize * 0.9) / 2 }]}
                >
                    {/* SC Letters Monogram */}
                    <View style={styles.lettersContainer}>
                        <Text style={[styles.letterS, { fontSize: fontSize * 1.2 }]}>S</Text>
                        <Text style={[styles.letterC, { fontSize: fontSize * 1.2 }]}>C</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* App name text */}
            {showText && (
                <View style={styles.textContainer}>
                    <Text style={[styles.appName, { fontSize: textSize }]}>SOLOCRAFT</Text>
                    <Text style={[styles.appSubtitle, { fontSize: textSize * 0.6 }]}>STUDIO</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        opacity: 0.6,
    },
    gradientRing: {
        width: '100%',
        height: '100%',
    },
    logoCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
    },
    innerGradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)', // Subtle gold border
    },
    lettersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -5, // Center visually
    },
    letterS: {
        fontWeight: '900',
        color: '#BA55D3', // Purple
        marginRight: -15, // Overlap
        ...createTextShadow({ color: 'rgba(0, 0, 0, 0.5)', offsetX: 2, offsetY: 2, radius: 5 }),
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    letterC: {
        fontWeight: '900',
        color: '#FFD700', // Gold
        marginLeft: -5,
        ...createTextShadow({ color: 'rgba(0, 0, 0, 0.5)', offsetX: 2, offsetY: 2, radius: 5 }),
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
    },
    textContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    appName: {
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    appSubtitle: {
        fontWeight: '600',
        color: '#FFD700',
        letterSpacing: 6,
        opacity: 0.8,
        marginTop: 4,
        fontSize: 10,
    },
});
