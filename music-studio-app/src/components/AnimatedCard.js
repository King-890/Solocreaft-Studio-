import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function AnimatedCard({
    children,
    onPress,
    style,
    delay = 0,
    duration = 500,
    activeOpacity = 0.8
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: duration,
                delay: delay,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: duration,
                delay: delay,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    }, [delay, duration]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: Platform.OS !== 'web',
        }).start();
    };

    return (
        <Animated.View
            style={[
                {
                    opacity: fadeAnim,
                    transform: [
                        { translateY: translateY },
                        { scale: scaleAnim }
                    ]
                }
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={activeOpacity}
                style={[styles.card, style]}
            >
                {children}
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        // Base styles can be overridden
    },
});
