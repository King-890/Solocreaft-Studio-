import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SHADOWS, SPACING } from '../constants/UIConfig';

/**
 * Beautiful Instrument Card Component
 * Displays instrument with icon, name, and category badge
 */
export default function InstrumentCard({
    name,
    icon,
    category,
    categoryColor,
    onPress,
    isSelected = false,
    style
}) {
    return (
        <TouchableOpacity
            style={[styles.card, isSelected && styles.cardSelected, style]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Glow effect when selected */}
            {isSelected && (
                <View style={[styles.selectedGlow, { backgroundColor: categoryColor + '30' }]} />
            )}

            {/* Card content */}
            <View style={[styles.cardContent, { borderColor: categoryColor + '40' }]}>
                {/* Icon container */}
                <View style={[styles.iconContainer, { backgroundColor: categoryColor }]}>
                    <Text style={styles.iconText}>{icon}</Text>
                </View>

                {/* Instrument name */}
                <Text style={styles.instrumentName} numberOfLines={1}>
                    {name}
                </Text>

                {/* Category badge */}
                <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
                    <Text style={[styles.categoryText, { color: categoryColor }]}>
                        {category}
                    </Text>
                </View>

                {/* Musical note decoration */}
                <View style={styles.noteDecoration}>
                    <Text style={styles.tinyNote}>♪</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        marginBottom: SPACING.md,
        position: 'relative',
    },
    cardSelected: {
        transform: [{ scale: 1.02 }],
    },
    selectedGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 16,
        opacity: 0.6,
    },
    cardContent: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: SPACING.md,
        borderWidth: 1,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.glow,
    },
    iconText: {
        fontSize: 32,
        color: '#fff',
    },
    instrumentName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    categoryBadge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    noteDecoration: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.textGold,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tinyNote: {
        fontSize: 11,
        color: '#000',
        fontWeight: 'bold',
    },
});
