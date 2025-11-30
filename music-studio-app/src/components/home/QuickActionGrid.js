import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { HOME_THEMES, SPACING, TYPOGRAPHY } from '../../constants/HomeScreenThemes';

/**
 * QuickActionGrid Component
 * 
 * Displays a grid of quick action buttons (4 columns)
 */
export default function QuickActionGrid({
    actions = [],
    theme = HOME_THEMES.darkStudio
}) {
    return (
        <View style={styles.actionGrid}>
            {actions.map((action, index) => (
                <QuickActionItem
                    key={index}
                    {...action}
                    theme={theme}
                />
            ))}
        </View>
    );
}

function QuickActionItem({ icon, label, color, onPress, theme }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
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
            style={styles.actionItem}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
        >
            <Animated.View
                style={[
                    styles.actionIcon,
                    {
                        backgroundColor: color,
                        transform: [{ scale: scaleAnim }]
                    },
                    theme.shadowSmall
                ]}
            >
                <Text style={styles.actionIconText}>{icon}</Text>
            </Animated.View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xl,
        marginTop: SPACING.md,
    },
    actionItem: {
        width: '23%',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    actionIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    actionIconText: {
        fontSize: 28,
    },
    actionLabel: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        fontWeight: '500',
    },
});
