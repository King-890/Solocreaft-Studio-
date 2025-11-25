import React, { useRef, useEffect } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    Animated,
    View,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SocialAuthButton({
    provider,
    onPress,
    disabled = false,
    loading = false
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const getProviderConfig = () => {
        switch (provider.toLowerCase()) {
            case 'google':
                return {
                    colors: ['#4285F4', '#34A853'],
                    icon: 'G',
                    text: 'Google',
                    shadowColor: '#4285F4',
                };
            case 'facebook':
                return {
                    colors: ['#1877F2', '#0C63D4'],
                    icon: 'f',
                    text: 'Facebook',
                    shadowColor: '#1877F2',
                };
            default:
                return {
                    colors: ['#666', '#444'],
                    icon: '?',
                    text: 'Continue',
                    shadowColor: '#666',
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
                    style={styles.gradient}
                >
                    {/* Glow effect */}
                    <Animated.View
                        style={[
                            styles.glowOverlay,
                            {
                                opacity: glowOpacity,
                                backgroundColor: config.shadowColor,
                            },
                        ]}
                    />

                    <View style={styles.content}>
                        {loading ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <>
                                <View style={styles.iconContainer}>
                                    <Text style={styles.icon}>{config.icon}</Text>
                                </View>
                                <Text style={styles.text}>{config.text}</Text>
                            </>
                        )}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradient: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    iconContainer: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    icon: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    text: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});
