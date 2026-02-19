import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useProject } from '../contexts/ProjectContext';
import Visualizer from '../components/Visualizer';
import { createShadow, createTextShadow } from '../utils/shadows';

const INSTRUMENTS = [
    { id: 'piano', name: 'Grand Piano', icon: '🎹', color: '#4a9eff' },
    { id: 'guitar', name: 'Nylon Guitar', icon: '🎸', color: '#ff7043' },
    { id: 'drums', name: 'Drum Kit', icon: '🥁', color: '#03dac6' },
    { id: 'bass', name: 'Electric Bass', icon: '🎸', color: '#ffa726' },
    { id: 'synth', name: 'Synth Pad', icon: '🎹', color: '#bb86fc' },
    { id: 'violin', name: 'Violin', icon: '🎻', color: '#ef5350' },
    { id: 'flute', name: 'Flute', icon: '🪈', color: '#26c6da' },
    { id: 'sitar', name: 'Sitar', icon: '🪕', color: '#ffb74d' },
    { id: 'saxophone', name: 'Saxophone', icon: '🎷', color: '#fdd835' },
    { id: 'trumpet', name: 'Trumpet', icon: '🎺', color: '#ffd54f' },
];

export default function BandRoomScreen() {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const { tracks, clips, recordings } = useProject();

    const stats = [
        { label: 'Tracks', value: tracks.length, icon: '🎼', color: '#4a9eff' },
        { label: 'Recordings', value: recordings.length, icon: '🎙️', color: '#03dac6' },
        { label: 'Timeline', value: clips.length, icon: '🎞️', color: '#bb86fc' },
    ];

    const numColumns = width > 800 ? 5 : width > 500 ? 3 : 2;
    const padWidth = (width - 40 - (12 * (numColumns - 1))) / numColumns;

    const navigateToInstrument = (type) => {
        navigation.navigate('InstrumentRoom', { instrumentType: type });
    };

    return (
        <LinearGradient
            colors={['#020617', '#0f172a', '#1e293b']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.title}>Studio Hub</Text>
                        <View style={styles.statusIndicator}>
                            <View style={styles.pulseDot} />
                            <Text style={styles.subtitle}>Production Control Center • Online</Text>
                        </View>
                    </View>
                    <View style={styles.visualizerContainer}>
                        <Visualizer trackId="master" type="bars" height={50} color="#03dac6" />
                        <Text style={styles.visLabel}>MASTER</Text>
                    </View>
                </View>

                {/* Dashboard Stats - Glassmorphism */}
                <View style={styles.statsRow}>
                    {stats.map((stat, idx) => (
                        <LinearGradient
                            key={idx}
                            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.statCard}
                        >
                            <View style={[styles.statIconBadge, { backgroundColor: stat.color + '20' }]}>
                                <Text style={styles.statIcon}>{stat.icon}</Text>
                            </View>
                            <View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        </LinearGradient>
                    ))}
                </View>

                {/* Instrument Quick Access */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Instruments Room</Text>
                    <TouchableOpacity 
                        style={styles.libraryBtn}
                        onPress={() => navigation.navigate('InstrumentsLibrary')}
                    >
                        <Text style={styles.seeAll}>FULL LIBRARY</Text>
                        <Text style={styles.arrowIcon}>→</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {INSTRUMENTS.map((inst) => (
                        <TouchableOpacity
                            key={inst.id}
                            style={[
                                styles.instCard, 
                                { width: padWidth, borderBottomColor: inst.color }
                            ]}
                            onPress={() => navigateToInstrument(inst.id)}
                            activeOpacity={0.7}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.05)', 'transparent']}
                                style={styles.cardGlow}
                            />
                            <View style={[
                                styles.instIconBg, 
                                createShadow({ color: inst.color, radius: 15, opacity: 0.4, elevation: 8 })
                            ]}>
                                <Text style={styles.instIcon}>{inst.icon}</Text>
                            </View>
                            <Text style={styles.instName}>{inst.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Performance Tip */}
                <LinearGradient
                    colors={['rgba(74, 158, 255, 0.1)', 'rgba(3, 218, 198, 0.05)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.footerCard}
                >
                    <View style={styles.tipHeader}>
                        <View style={styles.tipIconBg}>
                            <Text style={styles.tipIcon}>💡</Text>
                        </View>
                        <Text style={styles.tipTitle}>Production Insight</Text>
                    </View>
                    <Text style={styles.tipText}>
                        Fine-tune your groove by layering different instruments. The Grand Piano and Acoustic Guitar now support velocity sensitivity—swipe or tap harder for more presence!
                    </Text>
                    <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('InstrumentsLibrary')}>
                        <Text style={styles.exploreBtnText}>Explore Instruments</Text>
                    </TouchableOpacity>
                </LinearGradient>

                <View style={{ height: 60 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 35,
        marginTop: Platform.OS === 'ios' ? 20 : 10,
    },
    title: {
        fontSize: 38,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: -1,
        ...createTextShadow({ color: 'rgba(0,0,0,0.5)', radius: 10 }),
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#03dac6',
        marginRight: 8,
        ...createShadow({ color: '#03dac6', radius: 4, opacity: 0.8 }),
    },
    subtitle: {
        fontSize: 13,
        color: '#94a3b8',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    visualizerContainer: {
        alignItems: 'center',
    },
    visLabel: {
        color: '#03dac6',
        fontSize: 9,
        fontWeight: '900',
        marginTop: 6,
        letterSpacing: 2,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 40,
    },
    statCard: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        paddingVertical: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)', // For web
        ...createShadow({ color: '#000', radius: 10, opacity: 0.4, offsetY: 5 }),
    },
    statIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 22,
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '900',
        lineHeight: 28,
    },
    statLabel: {
        color: '#64748b',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    sectionTitle: {
        color: '#f8fafc',
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    libraryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(74, 158, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    seeAll: {
        color: '#4a9eff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1,
    },
    arrowIcon: {
        color: '#4a9eff',
        fontSize: 14,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 40,
    },
    instCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.4)',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 3,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        position: 'relative',
        overflow: 'hidden',
        ...createShadow({ color: '#000', radius: 8, opacity: 0.3, offsetY: 4 }),
    },
    cardGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    instIconBg: {
        width: 64,
        height: 64,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    instIcon: {
        fontSize: 32,
    },
    instName: {
        color: '#f1f5f9',
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.2,
    },
    footerCard: {
        borderRadius: 30,
        padding: 30,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...createShadow({ color: '#000', radius: 15, opacity: 0.3, offsetY: 10 }),
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 12,
    },
    tipIconBg: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 204, 0, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tipIcon: {
        fontSize: 18,
    },
    tipTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    tipText: {
        color: '#94a3b8',
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '500',
    },
    exploreBtn: {
        backgroundColor: '#4a9eff',
        alignSelf: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 15,
        marginTop: 20,
        ...createShadow({ color: '#4a9eff', radius: 5, opacity: 0.5 }),
    },
    exploreBtnText: {
        color: '#fff',
        fontWeight: '900',
        fontSize: 14,
    },
});
