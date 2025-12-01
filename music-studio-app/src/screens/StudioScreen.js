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

export default function StudioScreen({ route }) {
    const initialInstrument = route?.params?.initialInstrument || 'timeline';
    const [activeInstrument, setActiveInstrument] = useState(initialInstrument);
    const [showExportModal, setShowExportModal] = useState(false);
    const { tracks, saveCurrentProject, currentProjectName } = useProject();
    const { user } = useAuth();
    const navigation = useNavigation();

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;



    useEffect(() => {
        // Lock to landscape
        async function lockLandscape() {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        lockLandscape();

        return () => {
            // Unlock on exit
            async function unlockOrientation() {
                await ScreenOrientation.unlockAsync();
            }
            unlockOrientation();
        };
    }, []);

    useEffect(() => {
        if (route?.params?.initialInstrument) {
            handleInstrumentChange(route.params.initialInstrument);
        }
    }, [route?.params?.initialInstrument]);

    const handleInstrumentChange = (instrumentId) => {
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

    const handleRecordingSaved = (data) => {
        console.log('Recording saved:', data);
    };

    const handleSaveProject = () => {
        Alert.prompt(
            'Save Project',
            'Enter a name for your project:',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Save',
                    onPress: (projectName) => {
                        if (projectName && projectName.trim()) {
                            const project = saveCurrentProject(projectName.trim());
                            Alert.alert('Success', `Project "${project.name}" saved successfully!`);
                        } else {
                            Alert.alert('Error', 'Please enter a valid project name');
                        }
                    }
                }
            ],
            'plain-text',
            currentProjectName
        );
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
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>← Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Studio</Text>
                    <View style={styles.headerButtons}>
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

                <View style={styles.selectorContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} indicatorStyle="white">
                        {INSTRUMENTS.map((inst) => (
                            <TouchableOpacity
                                key={inst.id}
                                style={[
                                    styles.selectorButton,
                                    activeInstrument === inst.id && styles.activeSelector
                                ]}
                                onPress={() => handleInstrumentChange(inst.id)}
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

                <View style={styles.workspace}>
                    <Animated.View style={[styles.instrumentArea, { opacity: fadeAnim }]}>
                        {renderInstrument()}
                    </Animated.View>
                </View>

                <ExportModal
                    visible={showExportModal}
                    onClose={() => setShowExportModal(false)}
                    projectName="My Project"
                />
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
});
