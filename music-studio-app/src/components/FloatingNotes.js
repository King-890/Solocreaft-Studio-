import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, Platform } from 'react-native';

export default function FloatingNotes() {
    const notes = ['♪', '♫', '♬', '♩', '𝄞'];
    const animations = useRef(
        Array(8).fill(0).map(() => ({
            translateY: new Animated.Value(0),
            translateX: new Animated.Value(0),
            opacity: new Animated.Value(0),
            scale: new Animated.Value(1),
        }))
    ).current;

    useEffect(() => {
        animations.forEach((anim, index) => {
            const startDelay = index * 800;
            const duration = 8000 + Math.random() * 4000;
            const xOffset = (Math.random() - 0.5) * 100;

            Animated.loop(
                Animated.sequence([
                    Animated.delay(startDelay),
                    Animated.parallel([
                        Animated.timing(anim.opacity, {
                            toValue: 0.3,
                            duration: 1000,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                        Animated.timing(anim.scale, {
                            toValue: 1 + Math.random() * 0.5,
                            duration: 1000,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(anim.translateY, {
                            toValue: -800,
                            duration: duration,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                        Animated.timing(anim.translateX, {
                            toValue: xOffset,
                            duration: duration,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                    ]),
                    Animated.timing(anim.opacity, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: Platform.OS !== 'web',
                    }),
                    Animated.parallel([
                        Animated.timing(anim.translateY, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                        Animated.timing(anim.translateX, {
                            toValue: 0,
                            duration: 0,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                        Animated.timing(anim.scale, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: Platform.OS !== 'web',
                        }),
                    ]),
                ])
            ).start();
        });
    }, []);

    return (
        <View style={[styles.container, { pointerEvents: 'none' }]}>
            {animations.map((anim, index) => (
                <Animated.Text
                    key={index}
                    style={[
                        styles.note,
                        {
                            left: `${(index * 12.5) % 100}%`,
                            opacity: anim.opacity,
                            transform: [
                                { translateY: anim.translateY },
                                { translateX: anim.translateX },
                                { scale: anim.scale },
                            ],
                        },
                    ]}
                >
                    {notes[index % notes.length]}
                </Animated.Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    note: {
        position: 'absolute',
        bottom: 0,
        fontSize: 40,
        color: '#FFD700',
    },
});
