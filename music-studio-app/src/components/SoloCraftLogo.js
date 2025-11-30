import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
                        width: logoSize * 0.85,
                        height: logoSize * 0.85,
                        borderRadius: (logoSize * 0.85) / 2,
                    },
                ]}
            >
                <LinearGradient
                    colors={['#1a0a33', '#2d1b4e', '#1a0a33']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.innerGradient, { borderRadius: (logoSize * 0.85) / 2 }]}
                >
                    {/* SC Letters */}
                    <View style={styles.lettersContainer}>
                        <Text style={[styles.letterS, { fontSize }]}>S</Text>
                        <Text style={[styles.letterC, { fontSize }]}>C</Text>
                    </View>

                    {/* Musical note accent */}
                    <Text style={[styles.musicNote, { fontSize: fontSize * 0.3 }]}>♪</Text>
                </LinearGradient>
            </View>

            {/* App name text */}
            {showText && (
                <View style={styles.textContainer}>
                    <Text style={[styles.appName, { fontSize: textSize }]}>SoloCraft</Text>
                    <Text style={[styles.appSubtitle, { fontSize: textSize * 0.7 }]}>STUDIO</Text>
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
        borderWidth: 2,
        borderColor: 'rgba(186, 85, 211, 0.5)',
    },
    lettersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    letterS: {
        fontWeight: 'bold',
        color: '#BA55D3',
        marginRight: -5,
    },
    letterC: {
        fontWeight: 'bold',
        color: '#FFD700',
        marginLeft: -5,
    },
    musicNote: {
        position: 'absolute',
        top: '15%',
        right: '20%',
        color: '#9370DB',
        opacity: 0.6,
    },
    textContainer: {
        marginTop: 10,
        alignItems: 'center',
    },
    appName: {
        fontWeight: 'bold',
        color: '#BA55D3',
        letterSpacing: 2,
    },
    appSubtitle: {
        fontWeight: '600',
        color: '#FFD700',
        letterSpacing: 3,
        opacity: 0.8,
        marginTop: 2,
    },
});
