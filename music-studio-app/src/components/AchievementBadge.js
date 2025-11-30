import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Achievement definitions
export const ACHIEVEMENTS = {
    // Creation achievements
    'first-song': {
        title: 'First Creation',
        description: 'Create your first song',
        icon: '🎵',
        color: '#3498DB',
    },
    '10-songs': {
        title: 'Composer',
        description: 'Create 10 songs',
        icon: '🎼',
        color: '#9B59B6',
    },
    '50-songs': {
        title: 'Maestro',
        description: 'Create 50 songs',
        icon: '🎭',
        color: '#E74C3C',
    },

    // Streak achievements
    '3-day-streak': {
        title: 'Getting Started',
        description: '3-day creation streak',
        icon: '🔥',
        color: '#FF6B6B',
    },
    'week-streak': {
        title: 'Dedicated',
        description: '7-day creation streak',
        icon: '⭐',
        color: '#FFD93D',
    },
    'month-streak': {
        title: 'Unstoppable',
        description: '30-day creation streak',
        icon: '👑',
        color: '#FFD700',
    },

    // Instrument mastery
    'piano-master': {
        title: 'Piano Virtuoso',
        description: 'Reach level 10 in piano',
        icon: '🎹',
        color: '#3498DB',
    },
    'drums-master': {
        title: 'Rhythm King',
        description: 'Reach level 10 in drums',
        icon: '🥁',
        color: '#E74C3C',
    },
    'guitar-master': {
        title: 'Guitar Hero',
        description: 'Reach level 10 in guitar',
        icon: '🎸',
        color: '#E67E22',
    },
};

/**
 * AchievementBadge Component
 * 
 * Displays an achievement badge with unlock animation
 */
export default function AchievementBadge({ achievementId, onDismiss, autoHide = true }) {
    const slideAnim = useRef(new Animated.Value(-200)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    const achievement = ACHIEVEMENTS[achievementId];

    useEffect(() => {
        if (achievement) {
            // Slide in from top
            Animated.sequence([
                Animated.parallel([
                    Animated.spring(slideAnim, {
                        toValue: 100,
                        friction: 8,
                        tension: 40,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1,
                        friction: 6,
                        useNativeDriver: true,
                    }),
                ]),
                // Glow effect
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(glowAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                        Animated.timing(glowAnim, {
                            toValue: 0,
                            duration: 1000,
                            useNativeDriver: true,
                        }),
                    ]),
                    { iterations: 2 }
                ),
                // Wait
                Animated.delay(autoHide ? 3000 : 10000),
                // Slide out
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: -200,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                if (onDismiss) onDismiss();
            });
        }
    }, [achievementId]);

    if (!achievement) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            <LinearGradient
                colors={[achievement.color, `${achievement.color}CC`]}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                {/* Glow effect */}
                <Animated.View
                    style={[
                        styles.glow,
                        {
                            opacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.5],
                            }),
                        },
                    ]}
                />

                <View style={styles.content}>
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>{achievement.icon}</Text>
                    </View>

                    {/* Text */}
                    <View style={styles.textContainer}>
                        <Text style={styles.label}>Achievement Unlocked!</Text>
                        <Text style={styles.title}>{achievement.title}</Text>
                        <Text style={styles.description}>{achievement.description}</Text>
                    </View>
                </View>

                {/* Confetti particles */}
                <View style={styles.confettiContainer}>
                    {[...Array(8)].map((_, i) => (
                        <ConfettiParticle key={i} delay={i * 100} />
                    ))}
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

// Confetti particle component
function ConfettiParticle({ delay }) {
    const fallAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fallAnim, {
                toValue: 200,
                duration: 2000,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 2000,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 2000,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const colors = ['#FFD700', '#FF6B9D', '#3498DB', '#9B59B6', '#E74C3C'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    backgroundColor: color,
                    left: `${left}%`,
                    transform: [
                        { translateY: fallAnim },
                        {
                            rotate: rotateAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '360deg'],
                            }),
                        },
                    ],
                    opacity: opacityAnim,
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 10000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 16,
    },
    gradient: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    glow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
    },
    content: {
        flexDirection: 'row',
        padding: 20,
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    icon: {
        fontSize: 32,
    },
    textContainer: {
        flex: 1,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
        marginBottom: 2,
    },
    description: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    confettiContainer: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'none',
    },
    confetti: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
