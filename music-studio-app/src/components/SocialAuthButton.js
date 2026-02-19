import React, { useRef, useEffect } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    View,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { createShadow } from '../utils/shadows';

export default function SocialAuthButton({
    provider,
    onPress,
    disabled = false,
    loading = false
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Web animations must use useNativeDriver: false
    const useNativeDriver = Platform.OS !== 'web';

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver,
                }),
            ])
        ).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver,
        }).start();
    };

    const getProviderConfig = () => {
        switch (provider.toLowerCase()) {
            case 'google':
                return {
                    colors: ['#4285F4', '#34A853'],
                    icon: 'G',
                    text: 'Google',
                    accentColor: '#4285F4',
                };
            case 'facebook':
                return {
                    colors: ['#1877F2', '#0C63D4'],
                    icon: 'f',
                    text: 'Facebook',
                    accentColor: '#1877F2',
                };
            default:
                return {
                    colors: ['#666', '#444'],
                    icon: '?',
                    text: 'Continue',
                    accentColor: '#666',
                };
        }
    };

    const config = getProviderConfig();

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: disabled ? 0.5 : 1,
                },
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={config.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                        styles.gradient,
                        createShadow({ color: config.accentColor, offsetY: 4, opacity: 0.3, radius: 8, elevation: 4 }),
                    ]}
                >
                    {/* Glow effect */}
                    <Animated.View
                        style={[
                            styles.glowOverlay,
                            {
                                opacity: glowOpacity,
                                backgroundColor: config.accentColor,
                            },
                        ]}
                    />

                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <View style={styles.contentContainer}>
                            <View style={styles.iconContainer}>
                                <Text style={styles.iconText}>{config.icon}</Text>
                            </View>
                            <Text style={styles.buttonText}>
                                Continue with {config.text}
                            </Text>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 16,
    },
    gradient: {
        padding: 1,
        borderRadius: 12,
        height: 56,
        justifyContent: 'center',
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
