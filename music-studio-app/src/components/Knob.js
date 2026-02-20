import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Knob Component
 * 
 * A tactile rotary knob for controlling audio parameters.
 * Supports touch/mouse drag for rotation and provides visual feedback via gradients.
 */
export default function Knob({
    label,
    value = 0, // 0 to 1
    onChange,
    min = 0,
    max = 1,
    size = 60,
    color = '#BA55D3',
    unit = '',
    precision = 2
}) {
    const animatedValue = useRef(new Animated.Value(value)).current;
    const [displayValue, setDisplayValue] = useState(value);
    const currentValueRef = useRef(value);
    const lastY = useRef(0);

    // Sync ref with state
    useEffect(() => {
        currentValueRef.current = displayValue;
    }, [displayValue]);

    // Update internal animation if external value changes
    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: value,
            useNativeDriver: true,
            friction: 7,
            tension: 40
        }).start();
        setDisplayValue(value);
    }, [value]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                lastY.current = gestureState.y0;
            },
            onPanResponderMove: (evt, gestureState) => {
                const dy = lastY.current - gestureState.moveY;
                const sensitivity = 200; // Pixels for a full rotation
                const delta = dy / sensitivity;
                
                const newValue = Math.min(Math.max(currentValueRef.current + delta, 0), 1);
                
                if (newValue !== currentValueRef.current) {
                    setDisplayValue(newValue);
                    animatedValue.setValue(newValue); // Real-time rotation sync
                    if (onChange) {
                        const scaledValue = min + newValue * (max - min);
                        onChange(scaledValue);
                    }
                }
                lastY.current = gestureState.moveY;
            },
        })
    ).current;

    const rotation = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['-135deg', '135deg'],
    });

    const scaledDisplayValue = min + displayValue * (max - min);

    return (
        <View style={[styles.container, { width: size + 20 }]}>
            {label && <Text style={styles.label}>{label}</Text>}
            
            <View 
                {...panResponder.panHandlers}
                style={[styles.knobWrapper, { width: size, height: size }]}
            >
                {/* Glow Background */}
                <View style={[styles.glow, { 
                    width: size, 
                    height: size, 
                    borderRadius: size / 2,
                    backgroundColor: color,
                    opacity: 0.1 + displayValue * 0.2,
                    ...Platform.select({
                        web: { boxShadow: `0 0 15px ${color}` }
                    })
                }]} />

                <Animated.View style={[
                    styles.knob, 
                    { 
                        width: size * 0.8, 
                        height: size * 0.8, 
                        borderRadius: (size * 0.8) / 2,
                        transform: [{ rotate: rotation }] 
                    }
                ]}>
                    <LinearGradient
                        colors={['#333', '#1a1a1a']}
                        style={[styles.gradient, { borderRadius: (size * 0.8) / 2 }]}
                    >
                        {/* Indicator Notch */}
                        <View style={[styles.notch, { backgroundColor: color }]} />
                    </LinearGradient>
                </Animated.View>
            </View>

            <Text style={styles.valueText}>
                {scaledDisplayValue.toFixed(precision)}{unit}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    label: {
        color: '#999',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    knobWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    glow: {
        position: 'absolute',
    },
    knob: {
        backgroundColor: '#222',
        borderWidth: 2,
        borderColor: '#444',
        alignItems: 'center',
    },
    gradient: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
    },
    notch: {
        width: 4,
        height: 12,
        borderRadius: 2,
        marginTop: 4,
    },
    valueText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});
