import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * UJ Logo Component
 * Professional animated logo with heartbeat effect, waves, and particles
 */
export default function UJLogo({ size = 120, showText = false }) {
    // Heartbeat animations
    const heartbeat = useRef(new Animated.Value(1)).current;
    const wave1 = useRef(new Animated.Value(0)).current;
    const wave2 = useRef(new Animated.Value(0)).current;
    const wave3 = useRef(new Animated.Value(0)).current;
    const wave4 = useRef(new Animated.Value(0)).current;
    const wave5 = useRef(new Animated.Value(0)).current;

    // Particle system - reduced to 4 for performance
    const particleAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

    // Glow pulse
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Realistic heartbeat - lub-dub pattern
        const heartbeatSequence = Animated.loop(
            Animated.sequence([
                // First beat (lub)
                Animated.timing(heartbeat, {
                    toValue: 1.12,
                    duration: 150,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(heartbeat, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                // Second beat (dub)
                Animated.timing(heartbeat, {
                    toValue: 1.08,
                    duration: 120,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(heartbeat, {
                    toValue: 1,
                    duration: 180,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                // Pause
                Animated.delay(600),
            ])
        );
        heartbeatSequence.start();

        // Wave pulses - emanating from center
        const startWave = (wave, delay) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(wave, {
                        toValue: 1,
                        duration: 2500,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(wave, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            ).start();
        };

        startWave(wave1, 0);
        startWave(wave2, 500);
        startWave(wave3, 1000);
        startWave(wave4, 1500);
        startWave(wave5, 2000);

        // Glow breathing effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: false,
                }),
            ])
        ).start();

        // Subtle particle system
        particleAnims.forEach((anim, index) => {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(index * 400),
                    Animated.timing(anim, {
                        toValue: 1,
                        duration: 3200,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.timing(anim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                ])
            ).start();
        });
    }, []);

    const glowIntensity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 0.9],
    });

    const glowRadius = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [25, 40],
    });

    return (
        <View style={[styles.container, { width: size * 2.2, height: size * 2.2 }]}>
            {/* Heartbeat waves - concentric pulses (reduced to 3) */}
            {[wave1, wave2, wave3].map((wave, index) => (
                <Animated.View
                    key={`wave-${index}`}
                    style={[
                        styles.heartbeatWave,
                        {
                            width: size * 2.2,
                            height: size * 2.2,
                            borderRadius: size * 1.1,
                            opacity: wave.interpolate({
                                inputRange: [0, 0.3, 1],
                                outputRange: [0, 0.6, 0],
                            }),
                            transform: [{
                                scale: wave.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 1.4],
                                }),
                            }],
                            borderColor: index % 2 === 0 ? '#FF4500' : '#DC143C',
                            borderWidth: 2,
                        },
                    ]}
                />
            ))}

            {/* Subtle particle system */}
            {particleAnims.map((anim, index) => {
                const angle = (index / 4) * Math.PI * 2;
                const distance = size * 0.7;

                return (
                    <Animated.View
                        key={`particle-${index}`}
                        style={[
                            styles.particle,
                            {
                                left: '50%',
                                top: '50%',
                                opacity: anim.interpolate({
                                    inputRange: [0, 0.4, 0.8, 1],
                                    outputRange: [0, 0.8, 0.6, 0],
                                }),
                                transform: [
                                    {
                                        translateX: anim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, Math.cos(angle) * distance],
                                        }),
                                    },
                                    {
                                        translateY: anim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, Math.sin(angle) * distance],
                                        }),
                                    },
                                ],
                                backgroundColor: index % 2 === 0 ? '#FF4500' : '#FFD700',
                            },
                        ]}
                    />
                );
            })}

            {/* Main logo core with heartbeat */}
            <Animated.View
                style={[
                    styles.logoCore,
                    {
                        transform: [{ scale: heartbeat }],
                    },
                ]}
            >
                <Animated.View
                    style={{
                        elevation: 15,
                    }}
                >
                    <LinearGradient
                        colors={['#FF4500', '#FF6347', '#DC143C', '#8B0000', '#000']}
                        style={[styles.mainCircle, { width: size, height: size, borderRadius: size / 2 }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Inner ring for depth */}
                        <View style={[styles.innerRing, { width: size * 0.88, height: size * 0.88, borderRadius: size * 0.44 }]} />

                        {/* UJ Text with 3D depth */}
                        <View style={styles.textContainer}>
                            {/* Shadow layers */}
                            <Text style={[styles.textShadow, { fontSize: size * 0.38, top: 3, left: 3 }]}>UJ</Text>
                            <Text style={[styles.textShadow, { fontSize: size * 0.38, top: 2, left: 2 }]}>UJ</Text>

                            {/* Main text */}
                            <Text style={[styles.mainText, { fontSize: size * 0.38 }]}>UJ</Text>
                        </View>

                        {/* Heartbeat line - subtle EKG style */}
                        <Animated.View
                            style={[
                                styles.heartbeatLine,
                                {
                                    bottom: size * 0.18,
                                    width: size * 0.5,
                                    opacity: heartbeat.interpolate({
                                        inputRange: [1, 1.12],
                                        outputRange: [0.4, 0.9],
                                    }),
                                },
                            ]}
                        >
                            <View style={styles.ekgPath} />
                        </Animated.View>

                        {/* Musical notes - professional placement */}
                        <Text style={[styles.musicalNote, { fontSize: size * 0.16, top: size * 0.12, right: -size * 0.22 }]}>♪</Text>
                        <Text style={[styles.musicalNote, { fontSize: size * 0.16, bottom: size * 0.12, left: -size * 0.22 }]}>♫</Text>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>

            {/* Text below logo */}
            {showText && (
                <View style={styles.textBelow}>
                    <Text style={styles.companyName}>UJ</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    heartbeatWave: {
        position: 'absolute',
        borderStyle: 'solid',
    },
    particle: {
        position: 'absolute',
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    logoCore: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#000',
        overflow: 'visible',
    },
    innerRing: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.4)',
    },
    textContainer: {
        position: 'relative',
        zIndex: 10,
    },
    textShadow: {
        position: 'absolute',
        fontWeight: '900',
        color: '#000',
        opacity: 0.3,
        // Web compatibility
        ...Platform.select({
            web: {
                textShadow: '0 0 0 rgba(0,0,0,0.3)', // Reset native shadow
            }
        })
    },
    mainText: {
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
    },
    heartbeatLine: {
        position: 'absolute',
        height: 1.5,
        backgroundColor: '#FFD700',
    },
    ekgPath: {
        width: '100%',
        height: '100%',
        backgroundColor: '#FFD700',
    },
    musicalNote: {
        position: 'absolute',
        color: '#FFD700',
        fontWeight: 'bold',
        opacity: 0.8,
    },
    textBelow: {
        position: 'absolute',
        bottom: -45,
        alignItems: 'center',
    },
    companyName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FF4500',
        letterSpacing: 3,
    },
});
