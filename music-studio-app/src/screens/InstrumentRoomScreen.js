import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Audio from 'expo-audio';
import { useProject } from '../contexts/ProjectContext';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';
import ImmersiveBackground from '../components/ImmersiveBackground';
import PerformanceRecorder from '../components/PerformanceRecorder';
import Piano from '../components/Piano';
import DrumMachine from '../components/DrumMachine';
import AcousticGuitar from '../components/AcousticGuitar';
import BassGuitar from '../components/BassGuitar';
import SynthPad from '../components/SynthPad';
import Violin from '../components/Violin';
import Flute from '../components/Flute';
import Trumpet from '../components/Trumpet';
import Saxophone from '../components/Saxophone';
import WorldPercussion from '../components/WorldPercussion';
import Tabla from '../components/Tabla';
import Dholak from '../components/Dholak';
import Sitar from '../components/Sitar';
import Harp from '../components/Harp';
import Accordion from '../components/Accordion';
import Marimba from '../components/Marimba';
import Kalimba from '../components/Kalimba';
import BrassEnsemble from '../components/BrassEnsemble';
import ChoirHall from '../components/ChoirHall';
import Banjo from '../components/Banjo';
import EthnicStrings from '../components/EthnicStrings';
import OrchestralStrings from '../components/OrchestralStrings';

// Instrument-specific themes
const INSTRUMENT_THEMES = {
    piano: {
        colors: ['#1a1a2e', '#16213e', '#0f3460'],
        accent: '#3498DB',
        name: 'Piano Studio',
        icon: '🎹',
    },
    drums: {
        colors: ['#2d1b1b', '#3d2020', '#4a1a1a'],
        accent: '#E74C3C',
        name: 'Drum Room',
        icon: '🥁',
    },
    guitar: {
        colors: ['#2c1810', '#3d2415', '#4a2c1a'],
        accent: '#E67E22',
        name: 'Guitar Studio',
        icon: '🎸',
    },
    bass: {
        colors: ['#1a1a2e', '#2c1a3d', '#3d1a4a'],
        accent: '#9B59B6',
        name: 'Bass Room',
        icon: '🎸',
    },
    synth: {
        colors: ['#0a1929', '#1a2332', '#2a3342'],
        accent: '#00BCD4',
        name: 'Synth Lab',
        icon: '🎛️',
    },
    violin: {
        colors: ['#2a1a1a', '#3a2020', '#4a2a2a'],
        accent: '#D4AF37',
        name: 'String Studio',
        icon: '🎻',
    },
    flute: {
        colors: ['#1a2a2a', '#203a3a', '#2a4a4a'],
        accent: '#4DD0E1',
        name: 'Wind Studio',
        icon: '🪈',
    },
    trumpet: {
        colors: ['#2a2a1a', '#3a3a20', '#4a4a2a'],
        accent: '#FFD700',
        name: 'Brass Studio',
        icon: '🎺',
    },
    saxophone: {
        colors: ['#2a1a2a', '#3a203a', '#4a2a4a'],
        accent: '#FF6B9D',
        name: 'Sax Studio',
        icon: '🎷',
    },
    world: {
        colors: ['#1a2a1a', '#203a20', '#2a4a2a'],
        accent: '#8BC34A',
        name: 'World Percussion',
        icon: '🌍',
    },
    tabla: {
        colors: ['#2a1a1a', '#3a2020', '#4a2a2a'],
        accent: '#FF9800',
        name: 'Tabla Studio',
        icon: '🪘',
    },
    sitar: {
        colors: ['#3a2a1a', '#4a3520', '#5a4025'],
        accent: '#FFB74D',
        name: 'Sitar Studio',
        icon: '🪕',
    },
    veena: {
        colors: ['#2a1a2a', '#3a2535', '#4a3040'],
        accent: '#CE93D8',
        name: 'Veena Studio',
        icon: '🎻',
    },
    dholak: {
        colors: ['#2a2a1a', '#3a3a25', '#4a4a30'],
        accent: '#FFA726',
        name: 'Dholak Studio',
        icon: '🪘',
    },
    synthesizer: {
        colors: ['#1a1a3a', '#25254a', '#30305a'],
        accent: '#7C4DFF',
        name: 'Synthesizer Lab',
        icon: '🎛️',
    },
    harp: {
        colors: ['#2a1a2e', '#3a2142', '#4a2a5a'],
        accent: '#E1BEE7',
        name: 'Harp Studio',
        icon: '🪜',
    },
    banjo: {
        colors: ['#2c1a12', '#3e261a', '#4a2c1a'],
        accent: '#FFCC80',
        name: 'Banjo Room',
        icon: '🪕',
    },
    accordion: {
        colors: ['#2a1a1a', '#4a1a1a', '#6a1a1a'],
        accent: '#F48FB1',
        name: 'Accordion Hall',
        icon: '🪗',
    },
    marimba: {
        colors: ['#1a2a1a', '#253a25', '#304a30'],
        accent: '#8D6E63',
        name: 'Marimba Room',
        icon: '🪵',
    },
    choir: {
        colors: ['#1a1a2e', '#1a2e3a', '#1a3e4a'],
        accent: '#F0F4C3',
        name: 'Choir Hall',
        icon: '👥',
    },
    clarinet: {
        colors: ['#1a2a2a', '#203a3a', '#2a4a4a'],
        accent: '#B2DFDB',
        name: 'Woodwind Studio',
        icon: '🎷',
    },
    oboe: {
        colors: ['#1a2a2a', '#203a3a', '#2a4a4a'],
        accent: '#80CBC4',
        name: 'Oboe Room',
        icon: '🎷',
    },
    tuba: {
        colors: ['#2a2a1a', '#3a3a20', '#4a4a2a'],
        accent: '#FFB74D',
        name: 'Brass Hall',
        icon: '🎺',
    },
    kalimba: {
        colors: ['#2a1a12', '#3e261a', '#4a2c1a'],
        accent: '#A1887F',
        name: 'Kalimba Studio',
        icon: '🖐️',
    },
    french_horn: {
        colors: ['#2a2a1a', '#3a3a20', '#4a4a2a'],
        accent: '#FFD700',
        name: 'French Horn Hall',
        icon: '📯',
    },
    cello: {
        colors: ['#2a1a1a', '#3a2020', '#4a2a2a'],
        accent: '#CD7F32',
        name: 'Cello Suite',
        icon: '🎻',
    },
    contrabass: {
        colors: ['#1a1a1a', '#2a2a2a', '#3a3a3a'],
        accent: '#8B4513',
        name: 'Contrabass Studio',
        icon: '🎸',
    },
    orchestral_strings: {
        colors: ['#2a1a1a', '#3a2020', '#4a2a2a'],
        accent: '#D4AF37',
        name: 'Orchestral Strings',
        icon: '🎻',
    },
};

export default function InstrumentRoomScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { instrumentType = 'piano' } = route.params || {};
    const { addRecording, isPlaying, togglePlayback, stopPlayback, masterVolume, updateMasterVolume } = useProject();
    const [volSliderWidth, setVolSliderWidth] = useState(0);

    const [isRecording, setIsRecording] = useState(false);
    const recordingStartTimeRef = useRef(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0.6)).current;

    const theme = INSTRUMENT_THEMES[instrumentType] || INSTRUMENT_THEMES.piano;

    // Track ID mapping for visualizers
    const trackMap = { 
        piano: '2', 
        drums: '3', 
        guitar: '5', 
        bass: '4', 
        synth: '6', 
        violin: '7', 
        world: '3', 
        tabla: '3', 
        dholak: '3', 
        sitar: '9', 
        saxophone: '10', 
        trumpet: '11', 
        flute: '8' 
    };
    const trackId = trackMap[instrumentType] || '2';

    const handleVolTouch = useCallback((evt) => {
        if (volSliderWidth === 0) return;
        const locationX = evt.nativeEvent.locationX;
        const percentage = Math.max(0, Math.min(1, locationX / volSliderWidth));
        updateMasterVolume(percentage);
    }, [volSliderWidth, updateMasterVolume]);

    const volPanResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleVolTouch(evt),
        onPanResponderMove: (evt) => handleVolTouch(evt),
    }), [handleVolTouch]);

    // Lock to landscape orientation on mount
    useEffect(() => {
        const lockOrientation = async () => {
            if (Platform.OS === 'web') {
                console.log('🌐 Web platform detected, skipping orientation lock');
                return;
            }
            try {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                console.log('🔒 Locked to landscape mode');
            } catch (error) {
                console.warn('⚠️ Could not lock orientation:', error);
            }
        };

        lockOrientation();

        // Unlock orientation when leaving the screen
        return () => {
            if (Platform.OS === 'web') return;
            try {
                ScreenOrientation.unlockAsync().catch(err =>
                    console.warn('⚠️ Could not unlock orientation:', err)
                );
            } catch (e) {
                console.warn('Error unlocking orientation:', e);
            }
        };
    }, []);

    // Fade in on mount and start pulse
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 1000,
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();
    }, []);

    // In SDK 54, we use the useAudioRecorder hook
    const recorder = Audio.useAudioRecorder({
        extension: '.m4a',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    });

    const handleStartRecording = async () => {
        try {
            console.log('Requesting permissions..');
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                console.log('Starting recording..');
                await recorder.prepare();
                recorder.record();
                recordingStartTimeRef.current = Date.now();
                setIsRecording(true);
                console.log('Recording started');
            } else {
                console.warn('Permission to record audio not granted');
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const handleStopRecording = async () => {
        setIsRecording(false);
        if (!recorder.isRecording) return;

        console.log('Stopping recording..');
        await recorder.stop();
        const uri = recorder.uri;
        console.log('Recording stopped and stored at', uri);

        // Save to project context
        if (uri) {
            // Calculate real duration
            const duration = recordingStartTimeRef.current > 0 
                ? Date.now() - recordingStartTimeRef.current 
                : 5000; // Fallback to 5s if start time missing

            await addRecording(uri, duration, null, 'instrument', instrumentType);
            console.log(`Performance saved to library (Duration: ${duration}ms)`);
            recordingStartTimeRef.current = 0; // Reset
        }

        // Navigate back
        setTimeout(() => {
            navigation.goBack();
        }, 1000);
    };

    const renderInstrument = () => {
        switch (instrumentType) {
            case 'piano':
                return <Piano />;
            case 'drums':
                return <DrumMachine />;
            case 'guitar':
                return <AcousticGuitar />;
            case 'bass':
                return <BassGuitar />;
            case 'synth':
            case 'synthesizer':  // Handle both synth and synthesizer IDs
                return <SynthPad />;
            case 'violin':
                return <Violin instrument="violin" />;
            case 'veena':
                return <Sitar instrument="veena" />;
            case 'sitar':
                return <Sitar />;
            case 'harp':
                return <Harp />;
            case 'shamisen':
            case 'koto':
                return <EthnicStrings instrument={instrumentType} />;
            case 'flute':
                return <Flute />;
            case 'trumpet':
                return <BrassEnsemble instrument="trumpet" />;
            case 'saxophone':
                return <Saxophone />;
            case 'world':
                return <WorldPercussion />;
            case 'tabla':
                return <Tabla />;
            case 'dholak':
                return <Dholak />;
            case 'banjo':
                return <Banjo />;
            case 'accordion':
                return <Accordion />;
            case 'marimba':
                return <Marimba />;
            case 'choir':
                return <ChoirHall />;
            case 'clarinet':
                return <Flute instrument="clarinet" />; // Woodwinds use flute logic
            case 'oboe':
                return <Flute instrument="oboe" />;
            case 'tuba':
            case 'french_horn':
                return <BrassEnsemble instrument={instrumentType} />;
            case 'kalimba':
                return <Kalimba />;
            case 'cello':
            case 'contrabass':
            case 'strings':
                return <OrchestralStrings instrument={instrumentType} />;
            default:
                return <Piano />;
        }
    };

    return (
        <View style={styles.container}>
            {/* Immersive Background with Real-time Visualizer */}
            <ImmersiveBackground 
                trackId={trackId} 
                showVisualizer={true} 
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <View style={styles.backButtonContent}>
                            <Text style={styles.backIcon}>←</Text>
                            <Text style={styles.backText}>STUDIO HUB</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <View style={[styles.glassPill, { borderColor: theme.accent + '44' }]}>
                            <Text style={styles.headerIcon}>{theme.icon}</Text>
                            <Text style={styles.headerTitle}>{theme.name.toUpperCase()}</Text>
                            <Animated.View style={[
                                styles.statusIndicator, 
                                { backgroundColor: theme.accent, opacity: pulseAnim }
                            ]} />
                        </View>
                    </View>

                    <View style={styles.headerRight}>
                        <TouchableOpacity 
                            style={[styles.playButton, isPlaying && styles.isPlayingButton]}
                            onPress={togglePlayback}
                        >
                            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                        </TouchableOpacity>
                        <View style={styles.volContainer}>
                            <Text style={styles.volIcon}>🔊</Text>
                            <View 
                                style={styles.volTrack}
                                onLayout={(e) => setVolSliderWidth(e.nativeEvent.layout.width)}
                                {...volPanResponder.panHandlers}
                            >
                                <View style={[styles.volFill, { width: `${masterVolume * 100}%` }]} />
                            </View>
                        </View>
                        <Animated.Text style={[styles.studioStatus, { opacity: pulseAnim }]}>LIVE SESSION</Animated.Text>
                    </View>
                </Animated.View>

                {/* Instrument Interface */}
                <Animated.View style={[styles.instrumentContainer, { opacity: fadeAnim }]}>
                    {renderInstrument()}
                </Animated.View>

                {/* Performance Recorder */}
                <PerformanceRecorder
                    instrumentName={instrumentType}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    isRecording={isRecording}
                />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: sc(20),
        paddingVertical: sc(8),
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    backButton: {
        minWidth: sc(100),
    },
    backButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backIcon: {
        color: '#64748b',
        fontSize: normalize(16),
        fontWeight: 'bold',
    },
    backText: {
        color: '#64748b',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 1,
        fontFamily: 'Montserrat-Bold',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    glassPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingHorizontal: sc(12),
        paddingVertical: sc(6),
        borderRadius: 20,
        borderWidth: 1,
        gap: 10,
        ...createShadow({ color: '#000', radius: 10, opacity: 0.2 }),
    },
    headerIcon: {
        fontSize: normalize(16),
    },
    headerTitle: {
        color: '#fff',
        fontSize: normalize(11),
        fontWeight: '900',
        letterSpacing: 1.5,
        fontFamily: 'Montserrat-Bold',
        ...createTextShadow({ color: 'rgba(0,0,0,0.5)', radius: 3 }),
    },
    statusIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginLeft: 2,
    },
    headerRight: {
        minWidth: sc(180),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 15,
    },
    volContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        width: sc(60),
    },
    volIcon: {
        fontSize: normalize(10),
        color: '#64748b',
    },
    volTrack: {
        flex: 1,
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    volFill: {
        height: '100%',
        backgroundColor: '#03dac6',
        borderRadius: 2,
    },
    playButton: {
        width: sc(36),
        height: sc(36),
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    isPlayingButton: {
        backgroundColor: '#03dac6',
        borderColor: '#03dac6',
    },
    playIcon: {
        color: '#fff',
        fontSize: normalize(14),
    },
    studioStatus: {
        color: '#475569',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2,
    },
    instrumentContainer: {
        flex: 1,
        padding: sc(8),
        paddingBottom: sc(15),
    },
});
