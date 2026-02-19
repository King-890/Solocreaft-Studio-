import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import InstrumentCard from '../components/InstrumentCard';
import CategoryHeader from '../components/CategoryHeader';
import { COLORS, SPACING, INSTRUMENT_CATEGORIES } from '../constants/UIConfig';
import { createShadow, createTextShadow } from '../utils/shadows';

export default function InstrumentsLibraryScreen({ navigation, route }) {
    const [selectedInstrument, setSelectedInstrument] = useState(route?.params?.selectedInstrument || null);

    const handleInstrumentSelect = (categoryId, instrument) => {
        setSelectedInstrument(instrument.id);

        if (route?.params?.onSelect) {
            route.params.onSelect(instrument);
            navigation.goBack();
        } else {
            navigation.navigate('InstrumentRoom', {
                instrumentType: instrument.id,
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
        <View style={styles.container}>
            <LinearGradient
                colors={['#0f172a', '#1e293b', '#0f172a']}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar barStyle="light-content" />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Studio Library</Text>
                    <Text style={styles.headerSubtitle}>Select your primary instrument</Text>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('BandRoom')}
                    >
                        <LinearGradient
                            colors={['rgba(74, 158, 255, 0.15)', 'rgba(3, 218, 198, 0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bandRoomCard}
                        >
                            <View style={styles.bandRoomIconBg}>
                                <Text style={styles.bandRoomIcon}>🎼</Text>
                            </View>
                            <View style={styles.bandRoomText}>
                                <Text style={styles.bandRoomTitle}>Band Room</Text>
                                <Text style={styles.bandRoomSubtitle}>Full multi-track production center</Text>
                            </View>
                            <Text style={styles.bandRoomArrow}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {Object.keys(INSTRUMENT_CATEGORIES).map(renderCategory)}

                    <View style={{ height: 60 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -0.5,
        ...createTextShadow({ color: 'rgba(0,0,0,0.5)', radius: 10 }),
    },
    headerSubtitle: {
        color: '#94a3b8',
        fontSize: 16,
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.md,
        paddingTop: SPACING.md,
    },
    categorySection: {
        marginBottom: SPACING.xl,
    },
    instrumentGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.sm,
        marginTop: SPACING.md,
    },
    bandRoomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...createShadow({ color: '#000', radius: 15, offsetY: 10, opacity: 0.4 }),
    },
    bandRoomIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    bandRoomIcon: {
        fontSize: 32,
    },
    bandRoomText: {
        flex: 1,
    },
    bandRoomTitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '900',
    },
    bandRoomSubtitle: {
        color: '#64748b',
        fontSize: 13,
        marginTop: 2,
    },
    bandRoomArrow: {
        color: '#4A9EFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
