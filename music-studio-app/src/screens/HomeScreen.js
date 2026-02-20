import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, StatusBar, Animated } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import ParticleSystem from '../components/ParticleSystem';
import FloatingNote from '../components/FloatingNote';
import MusicButton from '../components/MusicButton';
import ThemeGallery from '../components/ThemeGallery';
import ImmersiveBackground from '../components/ImmersiveBackground';
import UIConfig from '../constants/UIConfig';
import AudioManager from '../utils/AudioManager';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import AnimatedCard from '../components/AnimatedCard';
import { createTextShadow } from '../utils/shadows';

const { width, height } = Dimensions.get('window');
const { COLORS, FONTS, SHADOWS, LAYOUT, ANIMATIONS } = UIConfig;

export default function HomeScreen() {
    const { audioEnabled, animationsEnabled } = useSettings();
    const navigation = useNavigation();
    const [showProfile, setShowProfile] = useState(false);
    const [showThemes, setShowThemes] = useState(false);
    const [audioStarted, setAudioStarted] = useState(false);

    useEffect(() => {
        if (audioEnabled) {
            const startAudio = async () => {
                try {
                    const started = await AudioManager.playHomeScreenAmbience();
                    setAudioStarted(started);
                } catch (error) {
                    console.error('Failed to play home screen ambience:', error);
                    setAudioStarted(false);
                }
            };
            startAudio();
        } else {
            AudioManager.stopAll();
            setAudioStarted(false);
        }

        return () => {
            AudioManager.stopAll();
        };
    }, [audioEnabled]);

    const handleScreenPress = async () => {
        // [MOBILE UNLOCK] Attempt to activate BOTH ambient and instrument engines
        UnifiedAudioEngine.activateAudio().catch((err) => {
            console.error('Failed to activate audio engine on press:', err);
        });

        if (!audioStarted && audioEnabled) {
            const resumed = await AudioManager.resumeContext();
            if (resumed) {
                setAudioStarted(true);
            }
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

    const handleThemes = () => {
        setShowProfile(false);
        setShowThemes(true);
    };

    return (
        <ImmersiveBackground>
            <View style={styles.container} onTouchStart={handleScreenPress}>
                <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

                {animationsEnabled && <ParticleSystem count={ANIMATIONS.particles.petalCount} />}

                {animationsEnabled && (
                    <View style={styles.noteSourceContainer}>
                        <FloatingNote delay={0} startX={0} startY={0} />
                        <FloatingNote delay={1500} startX={30} startY={-20} />
                        <FloatingNote delay={3000} startX={-30} startY={20} />
                        <FloatingNote delay={4500} startX={10} startY={5} />
                    </View>
                )}

                <View style={styles.uiContainer}>
                    {audioEnabled && !audioStarted && (
                        <Animated.View style={styles.audioHint}>
                            <Text style={styles.audioHintText}>Tap anywhere to start soundtrack 🎵</Text>
                        </Animated.View>
                    )}
                    <TouchableOpacity
                        style={styles.profileOrb}
                        onPress={() => setShowProfile(true)}
                    >
                        <View style={styles.orbInner}>
                            <Text style={styles.orbText}>👤</Text>
                        </View>
                    </TouchableOpacity>
                </View>

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
                                title="Themes"
                                subtitle="Personalize your studio"
                                icon="🎨"
                                color="#b388ff"
                                onPress={handleThemes}
                            />
                        </AnimatedCard>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    visible={showThemes}
                    animationType="slide"
                    onRequestClose={() => setShowThemes(false)}
                >
                    <ThemeGallery onClose={() => setShowThemes(false)} />
                </Modal>
            </View>
        </ImmersiveBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        overflow: 'hidden',
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
    audioHint: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10,
    },
    audioHintText: {
        color: COLORS.textGold,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        ...createTextShadow({ color: 'rgba(0,0,0,0.5)', offsetX: 1, offsetY: 1, radius: 4 }),
    },
});
