import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, Platform } from 'react-native';
import { createShadow } from '../utils/shadows';
import { sc } from '../utils/responsive';

const GuitarString = ({ thickness, color, active, vibrationScale = 1 }) => {
    const vibrateAnim = useRef(new Animated.Value(0)).current;
    const isWeb = Platform.OS === 'web';

    useEffect(() => {
        let anim;
        if (active) {
            anim = Animated.sequence([
                Animated.timing(vibrateAnim, {
                    toValue: 1,
                    duration: 50,
                    useNativeDriver: !isWeb,
                }),
                Animated.spring(vibrateAnim, {
                    toValue: 0,
                    friction: 2,
                    tension: 100,
                    useNativeDriver: !isWeb,
                }),
            ]);
            anim.start();
        }
        return () => {
            if (anim) anim.stop();
            vibrateAnim.stopAnimation();
        };
    }, [active, vibrateAnim, isWeb]);

    const translateY = vibrateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 3 * vibrationScale],
    });

    const opacity = vibrateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
    });

    const dynamicStyles = {
        height: thickness,
        backgroundColor: color,
        transform: [{ translateY }],
        opacity: opacity,
        ...createShadow({
            color: color,
            radius: active ? 15 : 4,
            opacity: active ? 0.9 : 0.4
        })
    };

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.string, dynamicStyles]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: sc(65),
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    string: {
        width: '100%',
        borderRadius: 1,
        elevation: 5,
    },
});

export default GuitarString;
