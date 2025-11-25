import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Switch } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/UIConfig';

/**
 * Settings Item Component
 * Music-themed settings row with icon, text, and action
 */
export default function SettingsItem({
    title,
    subtitle,
    icon,
    onPress,
    color = COLORS.primary,
    showArrow = true,
    showToggle = false,
    toggleValue = false,
    onToggle,
    style
}) {
    return (
        <TouchableOpacity
            style={[styles.item, style]}
            onPress={onPress}
            activeOpacity={showToggle ? 1 : 0.7}
            disabled={showToggle}
        >
            {/* Icon container */}
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Text style={styles.iconText}>{icon}</Text>
            </View>

            {/* Text content */}
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>

            {/* Action (arrow or toggle) */}
            {showToggle ? (
                <Switch
                    value={toggleValue}
                    onValueChange={onToggle}
                    trackColor={{ false: '#767577', true: color + '80' }}
                    thumbColor={toggleValue ? color : '#f4f3f4'}
                />
            ) : showArrow && (
                <Text style={styles.arrow}>›</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: SPACING.md,
        marginVertical: SPACING.xs,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...SHADOWS.light,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    iconText: {
        fontSize: 22,
        color: '#fff',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 13,
        marginTop: 2,
    },
    arrow: {
        color: COLORS.textSecondary,
        fontSize: 28,
        fontWeight: '300',
    },
});
