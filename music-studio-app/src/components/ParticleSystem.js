import React, { useEffect, useState, useRef } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions, Easing, Platform } from 'react-native';
import { COLORS } from '../constants/DesignSystem';

const PARTICLE_TYPES = {
    PETAL: 'petal',
    NOTE: 'note',
};

const Particle = ({ type, startX, delay }) => {
    const { width, height } = useWindowDimensions();
    const translateY = useRef(new Animated.Value(-50)).current;
    const translateX = useRef(new Animated.Value(startX)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(Math.random() * 0.5 + 0.5)).current;

    useEffect(() => {
        const duration = type === PARTICLE_TYPES.PETAL ? 8000 + Math.random() * 4000 : 10000 + Math.random() * 4000;

        Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: height + 50,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(translateX, {
                    toValue: startX + (Math.random() * 400 - 100), // Stronger drift to the right (wind)
                    duration: duration,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.sequence([
                    Animated.timing(opacity, { toValue: 0.9, duration: 1000, useNativeDriver: Platform.OS !== 'web' }),
                    Animated.delay(duration - 2000),
                    Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: Platform.OS !== 'web' }),
                ]),
                Animated.timing(rotate, {
                    toValue: 1,
                    duration: duration,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ]).start(() => {
            // In a real app, we'd recycle this particle
        });
    }, []);

    const spin = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <Animated.View
            style={[
                styles.particle,
                {
                    opacity,
                    transform: [
                        { translateY },
                        { translateX },
                        { rotate: spin },
                        { scale }
                    ]
                }
            ]}
        >
            <View style={[
                type === PARTICLE_TYPES.PETAL ? styles.petal : styles.note,
                type === PARTICLE_TYPES.PETAL && { backgroundColor: COLORS.petal }
            ]} />
        </Animated.View>
    );
};

export default function ParticleSystem({ count = 30 }) {
    const { width } = useWindowDimensions();
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const newParticles = [];
        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                type: Math.random() > 0.8 ? PARTICLE_TYPES.NOTE : PARTICLE_TYPES.PETAL,
                startX: Math.random() * width,
                delay: Math.random() * 8000,
            });
        }
        setParticles(newParticles);
    }, []);

    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
            {particles.map(p => (
                <Particle key={p.id} type={p.type} startX={p.startX} delay={p.delay} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    particle: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    petal: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderTopRightRadius: 0,
        backgroundColor: COLORS.petal,
    },
    note: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.textGold,
    },
});
