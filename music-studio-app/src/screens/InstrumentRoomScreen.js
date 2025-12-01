import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Audio } from 'expo-av';
import { useProject } from '../contexts/ProjectContext';
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
    // sitar: {
    //     colors: ['#3a2a1a', '#4a3520', '#5a4025'],
    //     accent: '#FFB74D',
    //     name: 'Sitar Studio',
    //     icon: '🪕',
    // },
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
};

export default function InstrumentRoomScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { instrumentType = 'piano' } = route.params || {};
    const { addRecording } = useProject();

    const [isRecording, setIsRecording] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const theme = INSTRUMENT_THEMES[instrumentType] || INSTRUMENT_THEMES.piano;

    // Lock to landscape orientation on mount
    useEffect(() => {
        const lockOrientation = async () => {
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
            ScreenOrientation.unlockAsync().catch(err =>
                console.warn('⚠️ Could not unlock orientation:', err)
            );
        };
    }, []);

    // Fade in on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const [recording, setRecording] = useState(null);

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
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
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
        if (!recording) return;

        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('Recording stopped and stored at', uri);

        // Save to project context
        if (uri) {
            // Calculate duration (approximate)
            const status = await recording.getStatusAsync();
            const duration = status.durationMillis;

            await addRecording(uri, duration, null, 'instrument', instrumentType);
            console.log('Performance saved to library');
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
                return <Violin />;
            case 'flute':
                return <Flute />;
            case 'trumpet':
                return <Trumpet />;
            case 'saxophone':
                return <Saxophone />;
            case 'world':
                return <WorldPercussion />;
            case 'tabla':
                return <Tabla />;
            // case 'sitar':
            //     return <AcousticGuitar instrument="sitar" />;
            case 'veena':
                return <Violin />; // Reuse violin for now (similar string instrument)
            case 'dholak':
                return <Dholak />;
            default:
                return <Piano />;
        }
    };

    return (
        <View style={styles.container}>
            {/* Themed Background */}
            <LinearGradient
                colors={theme.colors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Vignette Overlay */}
            <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                locations={[0, 0.3, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            <SafeAreaView style={styles.safeArea} edges={['right', 'left']}>
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerIcon}>{theme.icon}</Text>
                        <Text style={styles.headerTitle}>{theme.name}</Text>
                    </View>

                    <View style={styles.headerRight} />
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
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIcon: {
        fontSize: 24,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    headerRight: {
        width: 60, // Balance the back button
    },
    instrumentContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
});
