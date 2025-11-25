import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, Easing } from 'react-native';
import { COLORS } from '../constants/DesignSystem';

const NOTES = ['♪', '♫', '♬', '♩'];

export default function FloatingNote({ delay = 0, startX, startY, duration = 4000 }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0)).current;

    const note = NOTES[Math.floor(Math.random() * NOTES.length)];
    const size = 20 + Math.random() * 15;

    useEffect(() => {
        const animate = () => {
            // Reset values
            translateY.setValue(0);
            translateX.setValue(0);
            opacity.setValue(0);
            scale.setValue(0.5);

            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    // Float up
                    Animated.timing(translateY, {
                        toValue: -200 - Math.random() * 100,
                        duration: duration,
                        useNativeDriver: true,
                        easing: Easing.out(Easing.sin),
                    }),
                    // Drift side to side
                    Animated.timing(translateX, {
                        toValue: (Math.random() - 0.5) * 100,
                        duration: duration,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.sin),
                    }),
                    // Fade in then out
                    Animated.sequence([
                        Animated.timing(opacity, {
                            toValue: 0.8,
                            duration: duration * 0.2,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: duration * 0.8,
                            useNativeDriver: true,
                        }),
                    ]),
                    // Scale up slightly
                    Animated.timing(scale, {
                        toValue: 1.2,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            ]).start(() => {
                animate(); // Loop
            });
        };

        animate();
    }, []);

    return (
        <Animated.Text
            style={[
                styles.note,
                {
                    left: startX,
                    top: startY,
                    fontSize: size,
                    opacity,
                    transform: [
                        { translateY },
                        { translateX },
                        { scale }
                    ]
                }
            ]}
        >
            {note}
        </Animated.Text>
    );
}

const styles = StyleSheet.create({
    note: {
        position: 'absolute',
        color: COLORS.textGold,
        textShadowColor: COLORS.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 5,
        fontWeight: 'bold',
    },
});
