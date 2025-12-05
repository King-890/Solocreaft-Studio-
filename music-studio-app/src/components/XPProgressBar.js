import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * XPProgressBar Component
 * 
 * Displays XP progress towards next level with animated fill
 */
export default function XPProgressBar({
    level,
    currentXP,
    neededXP,
    percentage,
    color = '#3498DB',
    showLabel = true,
}) {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animate progress bar
        Animated.spring(progressAnim, {
            toValue: percentage,
            friction: 8,
            useNativeDriver: false,
        }).start();

        // Glow pulse effect
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();
    }, [percentage]);

    const progressWidth = progressAnim.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            {showLabel && (
                <View style={styles.header}>
                    <Text style={styles.levelText}>Level {level}</Text>
                    <Text style={styles.xpText}>
                        {Math.floor(currentXP)} / {Math.floor(neededXP)} XP
                    </Text>
                </View>
            )}

            {/* Progress Bar */}
            <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                    <Animated.View style={[styles.barFill, { width: progressWidth }]}>
                        <LinearGradient
                            colors={[color, `${color}CC`]}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />

                        {/* Glow effect */}
                        <Animated.View
                            style={[
                                styles.glow,
                                {
                                    opacity: glowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.3, 0.8],
                                    }),
                                },
                            ]}
                        />
                    </Animated.View>
                </View>

                {/* Percentage label */}
                {!showLabel && (
                    <Text style={styles.percentageText}>
                        {Math.floor(percentage)}%
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    levelText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    xpText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 14,
        fontFamily: 'Orbitron-Medium',
    },
    barContainer: {
        position: 'relative',
    },
    barBackground: {
        height: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    barFill: {
        height: '100%',
        borderRadius: 6,
        overflow: 'hidden',
    },
    glow: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
    },
    percentageText: {
        position: 'absolute',
        right: 8,
        top: '50%',
        transform: [{ translateY: -8 }],
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Orbitron-Medium',
    },
});
