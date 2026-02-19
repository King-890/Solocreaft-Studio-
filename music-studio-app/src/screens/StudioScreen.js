import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert, TextInput, Modal, Platform } from 'react-native';
import AudioRecorder from '../components/AudioRecorder';
import { SafeAreaView } from 'react-native-safe-area-context';
import Piano from '../components/Piano';
import DrumMachine from '../components/DrumMachine';
import BassGuitar from '../components/BassGuitar';
import AcousticGuitar from '../components/AcousticGuitar';
import SynthPad from '../components/SynthPad';
import Violin from '../components/Violin';
import Flute from '../components/Flute';
import Trumpet from '../components/Trumpet';
import Saxophone from '../components/Saxophone';
import WorldPercussion from '../components/WorldPercussion';
import Tabla from '../components/Tabla';
import Timeline from '../components/Timeline';
import ExportModal from '../components/ExportModal';
import { useProject } from '../contexts/ProjectContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import * as ScreenOrientation from 'expo-screen-orientation';
import ProjectManager from '../services/ProjectManager';
import AnimatedCard from '../components/AnimatedCard';
import ImmersiveBackground from '../components/ImmersiveBackground';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import MetronomeService from '../services/MetronomeService';
import EffectsRack from '../components/EffectsRack';
import Visualizer from '../components/Visualizer';
import { PanResponder } from 'react-native';
import { COLORS } from '../constants/UIConfig';
import { createShadow } from '../utils/shadows';

const INSTRUMENTS = [
    { id: 'timeline', name: 'Timeline' },
    { id: 'recorder', name: 'Recorder' },
    { id: 'piano', name: 'Piano' },
    { id: 'drums', name: 'Drums' },
    { id: 'tabla', name: 'Tabla' },
    { id: 'bass', name: 'Bass' },
    { id: 'guitar', name: 'Guitar' },
    { id: 'synth', name: 'Synth' },
    { id: 'violin', name: 'Violin' },
    { id: 'flute', name: 'Flute' },
    { id: 'trumpet', name: 'Trumpet' },
    { id: 'saxophone', name: 'Sax' },
    { id: 'world', name: 'World' },
];

const MasterVolumeSlider = ({ value, onValueChange }) => {
    const [sliderWidth, setSliderWidth] = useState(0);

    const handleTouch = (evt) => {
        if (sliderWidth === 0) return;
        const locationX = evt.nativeEvent.locationX;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        onValueChange(percentage);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => handleTouch(evt),
        onPanResponderMove: (evt) => handleTouch(evt),
    });

    return (
        <View style={styles.masterVolumeContainer}>
            <Text style={styles.masterVolumeIcon}>🔊</Text>
            <View 
                style={styles.masterSliderTrack}
                onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
                {...panResponder.panHandlers}
            >
                <View style={[styles.masterSliderFill, { width: `${value * 100}%` }]} />
                <View style={[styles.masterSliderThumb, { left: `${value * 100}%` }]} />
            </View>
        </View>
    );
};

const InstrumentSelector = React.memo(({ instruments, activeInstrument, onSelect }) => (
    <View style={styles.selectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true} indicatorStyle="white">
            {instruments.map((inst) => (
                <TouchableOpacity
                    key={inst.id}
                    style={[
                        styles.selectorButton,
                        activeInstrument === inst.id && styles.activeSelector
                    ]}
                    onPress={() => onSelect(inst.id)}
                >
                    <Text style={[
                        styles.selectorText,
                        activeInstrument === inst.id && styles.activeSelectorText
                    ]}>
                        {inst.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
));

export default function StudioScreen({ route }) {
    const initialInstrument = route?.params?.initialInstrument || 'timeline';
    const [activeInstrument, setActiveInstrument] = useState(initialInstrument);
    const [showExportModal, setShowExportModal] = useState(false);
    const [isMetronomeActive, setIsMetronomeActive] = useState(false);
    const [showEffectsRack, setShowEffectsRack] = useState(false);
    const [metronomeBeat, setMetronomeBeat] = useState(0);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const { 
        tracks, 
        saveCurrentProject, 
        currentProjectName, 
        masterVolume, 
        updateMasterVolume,
        tempo,
        currentTime 
    } = useProject();
    const { user } = useAuth();
    const navigation = useNavigation();

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Lock orientation to landscape for specific instruments only
    useEffect(() => {
        const landscapeInstruments = ['piano', 'bass', 'flute', 'saxophone'];

        async function setOrientation() {
            if (Platform.OS === 'web') return; // Skip on web
            try {
                if (landscapeInstruments.includes(activeInstrument)) {
                    // Lock to landscape for Piano, Bass, Flute, Sax
                    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
                } else {
                    // Unlock (allow portrait) for other instruments
                    await ScreenOrientation.unlockAsync();
                }
            } catch (error) {
                console.log('Orientation lock error:', error);
            }
        }

        setOrientation();

        return () => {
            // Unlock orientation when leaving screen
            if (Platform.OS !== 'web') {
                try {
                    ScreenOrientation.unlockAsync().catch(err => console.log('Unlock error:', err));
                } catch (e) {
                    console.log('Error unlocking:', e);
                }
            }
        };
    }, [activeInstrument]);

    useEffect(() => {
        if (route?.params?.initialInstrument) {
            handleInstrumentChange(route.params.initialInstrument);
        }
    }, [route?.params?.initialInstrument]);

    const handleInstrumentChange = (instrumentId) => {
        // [MOBILE UNLOCK] Attempt to activate audio on any interaction
        UnifiedAudioEngine.activateAudio().catch(() => {});

        // Fade out
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: Platform.OS !== 'web',
        }).start(() => {
            setActiveInstrument(instrumentId);
            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: Platform.OS !== 'web',
            }).start();
        });
    };

    const handleMasterVolumeChange = (val) => {
        updateMasterVolume(val);
        // [MOBILE UNLOCK] Attempt to activate audio on volume change
        UnifiedAudioEngine.activateAudio().catch(() => {});
    };

    const toggleMetronome = () => {
        if (isMetronomeActive) {
            MetronomeService.stop();
            setIsMetronomeActive(false);
        } else {
            MetronomeService.start(tempo, (beat) => setMetronomeBeat(beat));
            setIsMetronomeActive(true);
        }
    };

    const handleRecordingSaved = (data) => {
        console.log('Recording saved:', data);
    };

    const handleSaveProject = () => {
        setNewProjectName(currentProjectName || 'My New Project');
        setShowSaveModal(true);
    };

    const confirmSaveProject = async () => {
        if (newProjectName && newProjectName.trim()) {
            try {
                const project = await saveCurrentProject(newProjectName.trim());
                setShowSaveModal(false);
                Alert.alert('Success', `Project "${project.name}" saved successfully!`);
            } catch (e) {
                Alert.alert('Error', 'Failed to save project');
            }
        } else {
            Alert.alert('Error', 'Please enter a valid project name');
        }
    };

    const renderInstrument = () => {
        switch (activeInstrument) {
            case 'timeline':
                return <Timeline />;
            case 'recorder':
                return <AudioRecorder onRecordingSaved={handleRecordingSaved} tracks={tracks} />;
            case 'piano':
                return <Piano />;
            case 'drums':
                return <DrumMachine />;
            case 'tabla':
                return <Tabla />;
            case 'bass':
                return <BassGuitar />;
            case 'guitar':
                return <AcousticGuitar />;
            case 'synth':
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
            default:
                return <AudioRecorder onRecordingSaved={handleRecordingSaved} tracks={tracks} />;
        }
    };

    return (
        <ImmersiveBackground>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => {
                            if (activeInstrument !== 'timeline') {
                                handleInstrumentChange('timeline');
                            } else {
                                navigation.goBack();
                            }
                        }}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>Studio</Text>
                        <MasterVolumeSlider value={masterVolume} onValueChange={handleMasterVolumeChange} />
                    </View>
                    <View style={styles.headerButtons}>
                        <AnimatedCard
                            onPress={toggleMetronome}
                            style={[styles.iconButton, isMetronomeActive && styles.activeIconButton]}
                        >
                            <Text style={styles.iconButtonText}>{isMetronomeActive ? '⏳' : '⏲️'}</Text>
                        </AnimatedCard>
                        <AnimatedCard
                            onPress={() => setShowEffectsRack(!showEffectsRack)}
                            style={[styles.iconButton, showEffectsRack && styles.activeIconButton]}
                        >
                            <Text style={styles.iconButtonText}>🎛️</Text>
                        </AnimatedCard>
                        <AnimatedCard
                            onPress={handleSaveProject}
                            style={styles.iconButton}
                        >
                            <Text style={styles.iconButtonText}>💾</Text>
                        </AnimatedCard>
                        <AnimatedCard
                            onPress={() => setShowExportModal(true)}
                            style={styles.exportButton}
                        >
                            <Text style={styles.exportButtonText}>Export</Text>
                        </AnimatedCard>
                    </View>
                </View>

                <View style={styles.metroContainer}>
                    <View style={styles.metronomeIndicator}>
                        {[0, 1, 2, 3].map(i => (
                            <View 
                                key={i} 
                                style={[
                                    styles.metronomeDot, 
                                    metronomeBeat === i && styles.metronomeDotActive,
                                    i === 0 && styles.metronomeDotAccent,
                                    metronomeBeat === i && i === 0 && styles.metronomeDotAccentActive
                                ]} 
                            />
                        ))}
                    </View>
                </View>

                <Visualizer type="waveform" height={40} color="#03dac6" />

                <EffectsRack visible={showEffectsRack} />

                <InstrumentSelector
                    instruments={INSTRUMENTS}
                    activeInstrument={activeInstrument}
                    onSelect={handleInstrumentChange}
                />

                <View style={styles.workspace}>
                    <Animated.View style={[styles.instrumentArea, { opacity: fadeAnim }]}>
                        {renderInstrument()}
                    </Animated.View>
                </View>

                <ExportModal
                    visible={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    projectName={currentProjectName}
                />

                {/* Save Project Modal (Cross-platform alternative to Alert.prompt) */}
                <Modal
                    visible={showSaveModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowSaveModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.saveModalContent}>
                            <Text style={styles.modalTitle}>Save Project</Text>
                            <Text style={styles.modalSubtitle}>Enter a name for your project:</Text>
                            <TextInput
                                style={styles.saveTextInput}
                                value={newProjectName}
                                onChangeText={setNewProjectName}
                                placeholder="Project Name"
                                placeholderTextColor="#666"
                                autoFocus={true}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.cancelButton]} 
                                    onPress={() => setShowSaveModal(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.confirmButton]} 
                                    onPress={confirmSaveProject}
                                >
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImmersiveBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        backgroundColor: '#1e1e1e',
    },
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#03dac6',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#2a2a2a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    iconButtonText: {
        fontSize: 20,
    },
    exportButton: {
        backgroundColor: '#03dac6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    exportButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    selectorContainer: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        backgroundColor: '#121212',
    },
    selectorButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderRadius: 20,
        backgroundColor: '#1e1e1e',
        borderWidth: 1,
        borderColor: '#333',
    },
    activeSelector: {
        backgroundColor: '#6200ee',
        borderColor: '#6200ee',
    },
    selectorText: {
        color: '#888',
        fontWeight: '600',
    },
    activeSelectorText: {
        color: '#fff',
    },
    workspace: {
        flex: 1,
        padding: 20,
    },
    instrumentArea: {
        flex: 1,
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    masterVolumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 150,
        height: 30,
        marginTop: 5,
    },
    masterVolumeIcon: {
        fontSize: 14,
        marginRight: 8,
        color: '#888',
    },
    masterSliderTrack: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
        position: 'relative',
        justifyContent: 'center',
    },
    masterSliderFill: {
        height: '100%',
        backgroundColor: '#03dac6',
        borderRadius: 2,
        position: 'absolute',
    },
    masterSliderThumb: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#fff',
        position: 'absolute',
        marginLeft: -7,
        ...createShadow({
            color: '#000',
            offsetY: 2,
            opacity: 0.5,
            radius: 2,
            elevation: 3,
        }),
    },
    activeIconButton: {
        backgroundColor: 'rgba(3, 218, 198, 0.2)',
        borderColor: '#03dac6',
    },
    metronomeIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
    },
    metronomeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginHorizontal: 2,
    },
    metronomeDotActive: {
        backgroundColor: '#03dac6',
        transform: [{ scale: 1.5 }],
        ...createShadow({ color: '#03dac6', radius: 8, opacity: 0.8 }),
    },
    metronomeDotAccent: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
    },
    metronomeDotAccentActive: {
        backgroundColor: '#ffd700',
        transform: [{ scale: 1.8 }],
        ...createShadow({ color: '#ffd700', radius: 10, opacity: 0.9 }),
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveModalContent: {
        width: '80%',
        maxWidth: 400,
        backgroundColor: '#1e1e1e',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
        ...createShadow({ color: '#000', radius: 20, opacity: 0.5 }),
    },
    modalTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalSubtitle: {
        color: '#888',
        fontSize: 14,
        marginBottom: 20,
    },
    saveTextInput: {
        backgroundColor: '#121212',
        color: '#fff',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#444',
        fontSize: 16,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    modalButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#333',
    },
    confirmButton: {
        backgroundColor: '#6200ee',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
