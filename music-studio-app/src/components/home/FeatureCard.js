import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { HOME_THEMES, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../constants/HomeScreenThemes';

/**
 * FeatureCard Component
 * 
 * Displays a feature with icon, title, description, and chevron
 */
export default function FeatureCard({
    icon,
    title,
    description,
    onPress,
    color,
    theme = HOME_THEMES.darkStudio
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

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
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
        >
            <Animated.View
                style={[
                    styles.featureCard,
                    {
                        backgroundColor: color || theme.primary,
                        transform: [{ scale: scaleAnim }]
                    },
                    theme.shadow
                ]}
            >
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={styles.featureIconText}>{icon}</Text>
                </View>

                <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>
                        {title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: theme.textMuted }]}>
                        {description}
                    </Text>
                </View>

                <Text style={[styles.chevron, { color: theme.text }]}>›</Text>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
    },
    featureIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    featureIconText: {
        fontSize: 24,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    featureDescription: {
        ...TYPOGRAPHY.caption,
        fontSize: 14,
    },
    chevron: {
        fontSize: 32,
        fontWeight: '300',
        opacity: 0.5,
    },
});
