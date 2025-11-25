import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/UIConfig';

/**
 * Beautiful Music-Themed Button Component
 * Features: Gradient-like appearance, musical note icons, glow effects
 */
export default function MusicButton({
    title,
    subtitle,
    icon,
    onPress,
    color = COLORS.primary,
    style
}) {
    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Outer glow layer */}
            <View style={[styles.glowLayer, { backgroundColor: color + '20' }]} />

            {/* Main button content */}
            <View style={[styles.buttonContent, { borderColor: color + '40' }]}>
                {/* Icon container with circular background */}
                <View style={[styles.iconContainer, { backgroundColor: color }]}>
                    <Text style={styles.iconText}>{icon}</Text>

                    {/* Small decorative musical notes */}
                    <View style={styles.noteDecoration}>
                        <Text style={styles.tinyNote}>♪</Text>
                    </View>
                </View>

                {/* Text content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        marginVertical: SPACING.sm,
        position: 'relative',
    },
    glowLayer: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 20,
        opacity: 0.6,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: SPACING.md,
        borderWidth: 1,
        borderLeftWidth: 3,
        ...SHADOWS.medium,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
        position: 'relative',
        ...SHADOWS.glow,
    },
    iconText: {
        fontSize: 28,
        color: '#fff',
    },
    noteDecoration: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: COLORS.textGold,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tinyNote: {
        fontSize: 10,
        color: '#000',
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 2,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
    },
});
