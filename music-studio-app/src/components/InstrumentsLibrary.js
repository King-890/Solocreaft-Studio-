import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedCard from './AnimatedCard';
import WebAudioEngine from '../services/WebAudioEngine';

const INSTRUMENTS = [
    { id: 'piano', name: 'Piano', icon: '🎹', color: '#6200ee' },
    { id: 'drums', name: 'Drum Machine', icon: '🥁', color: '#cf6679' },
    { id: 'tabla', name: 'Tabla', icon: '🪘', color: '#d4a373' },
    { id: 'bass', name: 'Bass Guitar', icon: '🎸', color: '#03dac6' },
    { id: 'guitar', name: 'Acoustic Guitar', icon: '🎸', color: '#f1c40f' },
    { id: 'synth', name: 'Synth Pad', icon: '🎛️', color: '#9b59b6' },
    { id: 'violin', name: 'Violin', icon: '🎻', color: '#e74c3c' },
    { id: 'flute', name: 'Flute', icon: '🎵', color: '#3498db' },
    { id: 'trumpet', name: 'Trumpet', icon: '🎺', color: '#f39c12' },
    { id: 'saxophone', name: 'Saxophone', icon: '🎷', color: '#1abc9c' },
    { id: 'world', name: 'World Percussion', icon: '🪘', color: '#8B4513' },
];

export default function InstrumentsLibrary() {
    const { width } = useWindowDimensions();
    const navigation = useNavigation();

    useEffect(() => {
        // PRELOAD CORE ORCHESTRA (Background)
        if (Platform.OS === 'web') {
            const preloadDelay = setTimeout(() => {
                console.log('🎻 Deep preloading core orchestra samples...');
                WebAudioEngine.preload();
            }, 1000);
            return () => clearTimeout(preloadDelay);
        }
    }, []);

    const handleInstrumentPress = (instrumentId) => {
        navigation.navigate('Studio', { initialInstrument: instrumentId });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.sectionTitle}>Instruments Library</Text>
                <Text style={styles.subtitle}>Select an instrument to start playing</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {INSTRUMENTS.map((instrument, index) => (
                        <AnimatedCard
                            key={instrument.id}
                            delay={index * 50} // Staggered delay
                            style={[
                                styles.instrumentCard,
                                {
                                    borderColor: instrument.color,
                                    width: (width - 45) / 2 // Dynamic width
                                }
                            ]}
                            onPress={() => handleInstrumentPress(instrument.id)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: `${instrument.color}20` }]}>
                                <Text style={styles.instrumentIcon}>{instrument.icon}</Text>
                            </View>
                            <Text style={styles.instrumentName}>{instrument.name}</Text>
                        </AnimatedCard>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#1e1e1e',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: 10,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        color: '#888',
        fontSize: 14,
    },
    scrollContent: {
        padding: 15,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    instrumentCard: {
        // width handled dynamically
        backgroundColor: '#1e1e1e',
        padding: 15,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 15,
        elevation: 4,
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    instrumentIcon: {
        fontSize: 32,
    },
    instrumentName: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
    },
});
