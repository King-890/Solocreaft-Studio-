import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const GuitarString = ({ thickness, color, active, vibrationScale = 1, style }) => {
    const vibrateAnim = useRef(new Animated.Value(0)).current;
    
    // Create an intense flash on the string when actively plucked
    const flashAnim = useRef(new Animated.Value(0)).current;
    const isWeb = Platform.OS === 'web';

    useEffect(() => {
        let anim;
        if (active) {
            anim = Animated.parallel([
                Animated.sequence([
                    Animated.timing(vibrateAnim, {
                        toValue: 1,
                        duration: 35,
                        useNativeDriver: !isWeb,
                    }),
                    Animated.spring(vibrateAnim, {
                        toValue: 0,
                        friction: 3,
                        tension: 180,
                        useNativeDriver: !isWeb,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(flashAnim, {
                        toValue: 1,
                        duration: 10,
                        useNativeDriver: !isWeb,
                    }),
                    Animated.timing(flashAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: !isWeb,
                    }),
                ])
            ]);
            anim.start();
        }
        return () => {
            if (anim) anim.stop();
            vibrateAnim.stopAnimation();
            flashAnim.stopAnimation();
        };
    }, [active, vibrateAnim, flashAnim, isWeb]);

    const translateY = vibrateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 5 * vibrationScale],
    });

    const isWound = thickness > 3;
    
    // Create sharp string gradients inside the thin strings boundaries
    const gradientColors = isWound 
        ? ['#7a4b2b', '#e6ae85', '#b86d33', '#3d2514'] 
        : ['#9ca3af', '#ffffff', '#e5e7eb', '#6b7280'];

    const dynamicStyles = {
        height: Math.max(thickness - 0.5, 1.5), // Reduce thickness slightly to fit inside shadows cleanly
        transform: [{ translateY }],
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: active ? 3 : 8 },
        shadowOpacity: active ? 0.3 : 0.6,
        shadowRadius: active ? 2 : 4,
        elevation: active ? 8 : 4,
    };

    const flashOpacity = flashAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6], // Soften the flash
    });

    return (
        <View style={[styles.container, style]} pointerEvents="none">
            <Animated.View style={[styles.stringBox, dynamicStyles]}>
                <LinearGradient
                    colors={gradientColors}
                    start={{x: 0, y: 0}} end={{x: 0, y: 1}}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
            
            {/* Extremely bright flash layer covering the string when hit */}
            <Animated.View style={[StyleSheet.absoluteFill, { opacity: flashOpacity, backgroundColor: '#ffffff', borderRadius: 2 }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        paddingHorizontal: 0,
        position: 'relative',
        zIndex: 10,
    },
    stringBox: {
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
    },
});

export default GuitarString;
