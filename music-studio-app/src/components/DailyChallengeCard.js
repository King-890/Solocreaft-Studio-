import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow } from '../utils/shadows';

const CHALLENGE_TYPES = {
    'time-based': {
        icon: '⏱️',
        color: '#3498DB',
    },
    'creation': {
        icon: '🎵',
        color: '#9B59B6',
    },
    'recording': {
        icon: '🎙️',
        color: '#E74C3C',
    },
};

export default function DailyChallengeCard({ challenge, onStart }) {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (challenge) {
            // Animate progress bar
            Animated.spring(progressAnim, {
                toValue: (challenge.progress / challenge.goal) * 100,
                friction: 6,
                useNativeDriver: false,
            }).start();

            // Glow animation for incomplete challenges
            if (challenge.progress < challenge.goal) {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(glowAnim, {
                            toValue: 1,
                            duration: 2000,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                        Animated.timing(glowAnim, {
                            toValue: 0,
                            duration: 2000,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                    ])
                ).start();
            }
        }
    }, [challenge]);

    if (!challenge) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>No daily challenge available</Text>
                    <Text style={styles.emptySubtext}>Check back tomorrow!</Text>
                </View>
            </View>
        );
    }

    const isCompleted = challenge.progress >= challenge.goal;
    const progressPercentage = Math.min((challenge.progress / challenge.goal) * 100, 100);
    const challengeType = CHALLENGE_TYPES[challenge.type] || CHALLENGE_TYPES['creation'];

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={!isCompleted ? onStart : null}
                activeOpacity={isCompleted ? 1 : 0.8}
                disabled={isCompleted}
            >
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: glowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0.9],
                            }),
                        },
                    ]}
                >
                    <LinearGradient
                        colors={
                            isCompleted
                                ? ['#27AE60', '#229954']
                                : [challengeType.color, `${challengeType.color}CC`]
                        }
                        style={styles.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.icon}>{challengeType.icon}</Text>
                                <View>
                                    <Text style={styles.label}>Daily Challenge</Text>
                                    <Text style={styles.title}>{challenge.title}</Text>
                                </View>
                            </View>

                            {isCompleted && (
                                <View style={styles.completedBadge}>
                                    <Text style={styles.completedText}>✓</Text>
                                </View>
                            )}
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: progressAnim.interpolate({
                                                inputRange: [0, 100],
                                                outputRange: ['0%', '100%'],
                                            }),
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                {challenge.progress} / {challenge.goal}
                            </Text>
                        </View>

                        {/* Reward */}
                        <View style={styles.rewardContainer}>
                            <Text style={styles.rewardLabel}>Reward:</Text>
                            <View style={styles.rewardBadge}>
                                <Text style={styles.rewardText}>
                                    +{challenge.reward.xp} XP
                                </Text>
                            </View>
                            {challenge.reward.unlock && (
                                <View style={styles.unlockBadge}>
                                    <Text style={styles.unlockText}>
                                        🎁 {challenge.reward.unlock}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Action Button */}
                        {!isCompleted && (
                            <View style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>
                                    Start Challenge →
                                </Text>
                            </View>
                        )}
                    </LinearGradient>
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
        marginHorizontal: 16,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        ...createShadow({ color: '#000', offsetY: 4, opacity: 0.3, radius: 8, elevation: 8 }),
    },
    gradient: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    icon: {
        fontSize: 32,
    },
    label: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 4,
        fontFamily: 'Montserrat-Bold',
    },
    completedBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    completedText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    progressContainer: {
        marginBottom: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 4,
    },
    progressText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
        fontFamily: 'Orbitron-Medium',
    },
    rewardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
    },
    rewardLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
        fontWeight: '600',
    },
    rewardBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    rewardText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Orbitron-Medium',
    },
    unlockBadge: {
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.5)',
    },
    unlockText: {
        color: '#FFD700',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    emptyCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    emptySubtext: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
    },
});
