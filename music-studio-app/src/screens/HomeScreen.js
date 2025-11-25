import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Modal, Dimensions, StatusBar } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import ParticleSystem from '../components/ParticleSystem';
import FloatingNote from '../components/FloatingNote';
import MusicButton from '../components/MusicButton';
import UIConfig from '../constants/UIConfig';
import AudioManager from '../utils/AudioManager';
import AnimatedCard from '../components/AnimatedCard';

const { width, height } = Dimensions.get('window');
const { COLORS, FONTS, SHADOWS, ASSETS, LAYOUT, ANIMATIONS } = UIConfig;

export default function HomeScreen() {
    const { user } = useAuth();
    const { audioEnabled, animationsEnabled } = useSettings();
    const navigation = useNavigation();
    const [showProfile, setShowProfile] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);

    useEffect(() => {
        // Start ambient audio when screen loads if enabled
        if (audioEnabled) {
            const startAudio = async () => {
                await AudioManager.playHomeScreenAmbience();
                setAudioStarted(true);
            };
            startAudio();
        } else {
            // Stop audio if disabled
            AudioManager.stopAll();
            setAudioStarted(false);
        }

        return () => {
            // Clean up audio when leaving screen
            AudioManager.stopAll();
        };
    }, [audioEnabled]);

    const handleScreenPress = async () => {
        // Resume audio context on first user interaction (browser requirement)
        if (!audioStarted && audioEnabled) {
            await AudioManager.playHomeScreenAmbience();
            setAudioStarted(true);
        }
    };

    const handleNewProject = () => {
        setShowProfile(false);
        navigation.navigate('Studio', { projectId: 'new' });
    };

    const handleLibrary = () => {
        setShowProfile(false);
        navigation.navigate('Library');
    };

    const handleInstruments = () => {
        setShowProfile(false);
        navigation.navigate('InstrumentsLibrary');
    };

    const handleSettings = () => {
        setShowProfile(false);
        navigation.navigate('Settings');
    };

    return (
        <View style={styles.container} onTouchStart={handleScreenPress}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* Static Background - No Rotation */}
            <ImageBackground
                source={ASSETS.homeBackground}
                style={styles.background}
                resizeMode="cover"
            >
                <View style={styles.overlay} />
            </ImageBackground>

            {/* Particle System (Petals) - Only if animations enabled */}
            {animationsEnabled && <ParticleSystem count={ANIMATIONS.particles.petalCount} />}

            {/* Floating Notes from Instrument Area - Only if animations enabled */}
            {animationsEnabled && (
                <View style={styles.noteSourceContainer}>
                    <FloatingNote delay={0} startX={0} startY={0} />
                    <FloatingNote delay={1500} startX={30} startY={-20} />
                    <FloatingNote delay={3000} startX={-30} startY={20} />
                    <FloatingNote delay={4500} startX={10} startY={5} />
                </View>
            )}

            {/* UI Layer */}
            <View style={styles.uiContainer}>
                {/* Profile / Menu Button */}
                <TouchableOpacity
                    style={styles.profileOrb}
                    onPress={() => setShowProfile(true)}
                >
                    <View style={styles.orbInner}>
                        <Text style={styles.orbText}>
                            {user?.email?.charAt(0).toUpperCase() || '♪'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Menu Modal */}
            <Modal
                visible={showProfile}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowProfile(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowProfile(false)}
                >
                    <AnimatedCard style={styles.menuCard}>
                        <View style={styles.menuHeader}>
                            <Text style={styles.menuTitle}>Sanctuary</Text>
                            <Text style={styles.menuSubtitle}>Choose your path</Text>
                        </View>

                        <MusicButton
                            title="New Creation"
                            subtitle="Start a fresh composition"
                            icon="🎵"
                            color={COLORS.primary}
                            onPress={handleNewProject}
                        />

                        <MusicButton
                            title="Library"
                            subtitle="Your saved works"
                            icon="📚"
                            color={COLORS.secondary}
                            onPress={handleLibrary}
                        />

                        <MusicButton
                            title="Instruments"
                            subtitle="Explore sound collection"
                            icon="🎹"
                            color="#ff6b9d"
                            onPress={handleInstruments}
                        />

                        <MusicButton
                            title="Settings"
                            subtitle="Customize experience"
                            icon="⚙️"
                            color="#888"
                            onPress={handleSettings}
                        />
                    </AnimatedCard>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: `rgba(0,0,0,${LAYOUT.homeScreen.overlayOpacity})`,
    },
    noteSourceContainer: {
        position: 'absolute',
        top: LAYOUT.homeScreen.noteSourcePosition.top,
        left: LAYOUT.homeScreen.noteSourcePosition.left,
        width: 100,
        height: 100,
    },
    uiContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: LAYOUT.homeScreen.profileOrbPosition.top,
        paddingRight: LAYOUT.homeScreen.profileOrbPosition.right,
    },
    profileOrb: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        ...SHADOWS.glow,
    },
    orbInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orbText: {
        color: COLORS.textGold,
        fontSize: 24,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuCard: {
        width: LAYOUT.modal.cardWidth,
        backgroundColor: 'rgba(20, 20, 30, 0.9)',
        borderRadius: LAYOUT.modal.cardRadius,
        padding: LAYOUT.modal.cardPadding,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        ...SHADOWS.medium,
    },
    menuHeader: {
        marginBottom: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        paddingBottom: 16,
    },
    menuTitle: {
        color: COLORS.textGold,
        fontSize: 28,
        fontWeight: 'bold',
        fontFamily: FONTS.bold,
        letterSpacing: 1,
    },
    menuSubtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 4,
    },
});