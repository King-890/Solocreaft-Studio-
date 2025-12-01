import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InstrumentCard from '../components/InstrumentCard';
import CategoryHeader from '../components/CategoryHeader';
import { COLORS, SPACING, INSTRUMENT_CATEGORIES } from '../constants/UIConfig';

export default function InstrumentsLibraryScreen({ navigation, route }) {
    const [selectedInstrument, setSelectedInstrument] = useState(route?.params?.selectedInstrument || null);

    const handleInstrumentSelect = (categoryId, instrument) => {
        setSelectedInstrument(instrument.id);

        // If called from Studio with callback, use it
        if (route?.params?.onSelect) {
            route.params.onSelect(instrument);
            navigation.goBack();
        } else {
            // Navigate to Instrument Room with correct parameter
            navigation.navigate('InstrumentRoom', {
                instrumentType: instrument.id,  // This is the key parameter InstrumentRoomScreen expects
            });
        }
    };

    const renderCategory = (categoryId) => {
        const category = INSTRUMENT_CATEGORIES[categoryId];

        return (
            <View key={categoryId} style={styles.categorySection}>
                <CategoryHeader
                    title={category.name}
                    icon={category.icon}
                    color={category.color}
                    count={category.instruments.length}
                />

                <View style={styles.instrumentGrid}>
                    {category.instruments.map((instrument) => (
                        <InstrumentCard
                            key={instrument.id}
                            name={instrument.name}
                            icon={instrument.icon}
                            category={category.name}
                            categoryColor={category.color}
                            isSelected={selectedInstrument === instrument.id}
                            onPress={() => handleInstrumentSelect(categoryId, instrument)}
                        />
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Instruments</Text>
                <Text style={styles.headerSubtitle}>Enter the instrument room</Text>
            </View>

            {/* Scrollable content */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Band Room Entry */}
                <TouchableOpacity
                    style={styles.bandRoomButton}
                    onPress={() => navigation.navigate('BandRoom')}
                >
                    <Text style={styles.bandRoomIcon}>🎼</Text>
                    <View>
                        <Text style={styles.bandRoomTitle}>Enter Band Room</Text>
                        <Text style={styles.bandRoomSubtitle}>Play all instruments together</Text>
                    </View>
                    <Text style={styles.bandRoomArrow}>→</Text>
                </TouchableOpacity>

                {Object.keys(INSTRUMENT_CATEGORIES).map(renderCategory)}

                {/* Bottom spacing */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        color: COLORS.textGold,
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.md,
    },
    categorySection: {
        marginBottom: SPACING.lg,
    },
    instrumentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.sm,
    },
    bandRoomButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        margin: SPACING.md,
        padding: SPACING.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    bandRoomIcon: {
        fontSize: 32,
        marginRight: SPACING.md,
    },
    bandRoomTitle: {
        color: COLORS.textGold,
        fontSize: 18,
        fontWeight: 'bold',
    },
    bandRoomSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
    },
    bandRoomArrow: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 'auto',
    },
});
