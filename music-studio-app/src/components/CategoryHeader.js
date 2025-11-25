import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../constants/UIConfig';

/**
 * Category Header Component
 * Beautiful section header for instrument categories
 */
export default function CategoryHeader({
    title,
    icon,
    color,
    count,
    style
}) {
    return (
        <View style={[styles.header, style]}>
            {/* Left decorative line */}
            <View style={[styles.decorativeLine, { backgroundColor: color }]} />

            {/* Icon and title */}
            <View style={styles.titleContainer}>
                <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <Text style={styles.icon}>{icon}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
                {count !== undefined && (
                    <View style={[styles.countBadge, { backgroundColor: color }]}>
                        <Text style={styles.countText}>{count}</Text>
                    </View>
                )}
            </View>

            {/* Right decorative line */}
            <View style={[styles.decorativeLine, { backgroundColor: color }]} />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
        paddingHorizontal: SPACING.md,
    },
    decorativeLine: {
        height: 2,
        flex: 1,
        opacity: 0.3,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: SPACING.md,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    icon: {
        fontSize: 20,
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    countBadge: {
        marginLeft: SPACING.sm,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
