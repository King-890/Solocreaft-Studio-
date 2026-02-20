import React, { createContext, useState, useContext, useRef, useMemo } from 'react';
import { Platform, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPlaybackService from '../services/AudioPlaybackService';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { INSTRUMENT_TRACKS, INSTRUMENT_TRACK_MAP } from '../constants/AudioConstants';
const ProjectContext = createContext({});

export const ProjectProvider = ({ children }) => {
    const normalizeTrack = (track) => {
        const defaults = {
            volume: 0.8,
            pan: 0,
            gain: 0.75,
            effects: {
                reverb: { enabled: false, mix: 0.3 },
                delay: { enabled: false, time: 0.4, feedback: 0.5 }
            },
            eq: { low: 0, mid: 0, high: 0 },
            auxSends: [0, 0],
            compressor: { enabled: false, threshold: -20, ratio: 4, attack: 0.003, release: 0.25 },
            muted: false,
            solo: false,
        };

        return {
            ...defaults,
            ...track,
            effects: {
                ...defaults.effects,
                ...(track.effects || {}),
                reverb: { ...defaults.effects.reverb, ...(track.effects?.reverb || {}) },
                delay: { ...defaults.effects.delay, ...(track.effects?.delay || {}) }
            },
            eq: { ...defaults.eq, ...(track.eq || {}) },
            compressor: { ...defaults.compressor, ...(track.compressor || {}) },
            auxSends: Array.isArray(track.auxSends) ? track.auxSends : defaults.auxSends
        };
    };

    const [tracks, setTracks] = useState(() => INSTRUMENT_TRACKS.map(normalizeTrack));

    const [clips, setClips] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [areRecordingsLoaded, setAreRecordingsLoaded] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [tempo, setTempo] = useState(120);
    const [currentProjectName, setCurrentProjectName] = useState('Untitled Project');
    const [selectedClipId, setSelectedClipId] = useState(null);
    const [masterVolume, setMasterVolume] = useState(0.8);
    
    // PERFORMANCE: High-frequency time updates via Animated.Value to avoid React re-renders
    const timeAnimatedValue = useRef(new Animated.Value(0)).current;

    const playheadInterval = useRef(null);
    const saveTimeout = useRef(null);

    // Load recordings on mount
    React.useEffect(() => {
        loadRecordings();
    }, []);

    // Save recordings when they change (Debounced to save main thread)
    React.useEffect(() => {
        if (areRecordingsLoaded) {
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            saveTimeout.current = setTimeout(() => {
                saveRecordings();
                saveTimeout.current = null;
            }, 1000);
        }

        return () => {
            if (saveTimeout.current) {
                clearTimeout(saveTimeout.current);
                saveTimeout.current = null;
            }
        };
    }, [recordings, areRecordingsLoaded]);

    // Initial cleanup/sync (Staggered initialization removed for performance)
    React.useEffect(() => {
        // No longer needed after mixer refactor
    }, []); // Run once on mount

    const togglePlayback = () => {
        if (isPlaying) {
            clearInterval(playheadInterval.current);
            AudioPlaybackService.stopAll();
            setIsPlaying(false);
        } else {
            // Check if there are any clips to play
            if (clips.length === 0) {
                alert('No recordings found. Please record some audio first.');
                return;
            }

            setIsPlaying(true);
            const startTime = Date.now() - currentTime;
            const projectDuration = getProjectDuration();

            // Start audio playback
            AudioPlaybackService.playClips(clips, currentTime);

            playheadInterval.current = setInterval(() => {
                const newTime = Date.now() - startTime;

                // Stop at end of project
                if (projectDuration > 0 && newTime >= projectDuration) {
                    clearInterval(playheadInterval.current);
                    AudioPlaybackService.stopAll();
                    setIsPlaying(false);
                    setCurrentTime(projectDuration);
                    timeAnimatedValue.setValue(projectDuration);
                } else {
                    setCurrentTime(newTime);
                    timeAnimatedValue.setValue(newTime);
                }
            }, 32); // 32ms (~30fps) is enough for visual updates and saves CPU
        }
    };

    const stopPlayback = () => {
        clearInterval(playheadInterval.current);
        AudioPlaybackService.stopAll();
        setIsPlaying(false);
        setCurrentTime(0);
    };

    // Load recordings from AsyncStorage
    const loadRecordings = async () => {
        try {
            const stored = await AsyncStorage.getItem('@recordings');
            if (stored) {
                setRecordings(JSON.parse(stored));
                console.log('Recordings loaded:', JSON.parse(stored).length);
            }
        } catch (error) {
            console.error('Failed to load recordings:', error);
        } finally {
            setAreRecordingsLoaded(true);
        }
    };

    // Save recordings to AsyncStorage
    const saveRecordings = async () => {
        try {
            await AsyncStorage.setItem('@recordings', JSON.stringify(recordings));
            console.log('Recordings saved:', recordings.length);
        } catch (error) {
            console.error('Failed to save recordings:', error);
        }
    };

    const addTrack = (type = 'audio') => {
        const newTrack = normalizeTrack({
            id: Date.now().toString(),
            name: `Track ${tracks.length + 1}`,
            type,
        });
        setTracks([...tracks, newTrack]);
    };

    const updateTrackVolume = (trackId, volume) => {
        const track = tracks.find(t => t.id === trackId);
        setTracks(tracks.map(t => t.id === trackId ? { ...t, volume } : t));

        // Sync to UnifiedAudioEngine mixer for all instruments mapped to this track
        Object.entries(INSTRUMENT_TRACK_MAP).forEach(([instrumentId, trackId_map]) => {
            if (trackId_map === trackId) {
                UnifiedAudioEngine.setMixerSettings(instrumentId, { volume });
            }
        });
    };

    const updateTrackPan = (trackId, pan) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, pan } : t));

        // Sync to UnifiedAudioEngine mixer
        Object.entries(INSTRUMENT_TRACK_MAP).forEach(([instrumentId, trackId_map]) => {
            if (trackId_map === trackId) {
                UnifiedAudioEngine.setMixerSettings(instrumentId, { pan });
            }
        });
    };

    const updateTrackGain = (trackId, gain) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, gain } : t));
    };

    const updateTrackEQ = (trackId, eq) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, eq: { ...t.eq, ...eq } } : t));
    };

    const updateTrackEffect = (trackId, effectType, settings) => {
        setTracks(tracks.map(t => {
            if (t.id === trackId) {
                const newEffects = { ...t.effects, [effectType]: { ...t.effects[effectType], ...settings } };
                
                // Trigger audio engine updates based on effect type
                if (effectType === 'reverb') {
                    // Reverb sync handled via UnifiedAudioEngine if needed
                } else if (effectType === 'delay') {
                    // Delay sync handled via UnifiedAudioEngine if needed
                }
                
                return { ...t, effects: newEffects };
            }
            return t;
        }));
    };

    const updateTrackMute = (trackId, muted) => {
        const track = tracks.find(t => t.id === trackId);
        setTracks(tracks.map(t => t.id === trackId ? { ...t, muted } : t));
        if (track) {
            // AudioPlaybackService.setTrackMute(trackId, muted, track.volume); // Removed
            
            // Sync to UnifiedAudioEngine mixer
            Object.entries(INSTRUMENT_TRACK_MAP).forEach(([instrumentId, trackId_map]) => {
                if (trackId_map === trackId) {
                    UnifiedAudioEngine.setMixerSettings(instrumentId, { mute: muted });
                }
            });
        }
    };

    const updateTrackSolo = (trackId, solo) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, solo } : t));
    };

    const updateTrackAuxSend = (trackId, sendIndex, level) => {
        setTracks(tracks.map(t => {
            if (t.id === trackId) {
                const newAuxSends = [...t.auxSends];
                newAuxSends[sendIndex] = level;
                return { ...t, auxSends: newAuxSends };
            }
            return t;
        }));
    };

    const updateTrackCompressor = (trackId, settings) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, compressor: { ...t.compressor, ...settings } } : t));
        AudioPlaybackService.setTrackCompressor(trackId, settings);
    };

    const addClip = (trackId, audioUri, duration) => {
        const newClip = {
            id: Date.now().toString(),
            trackId,
            audioUri,
            startTime: 0, // Add to beginning for now
            duration,
            type: 'audio'
        };
        setClips([...clips, newClip]);
        console.log('Clip added to timeline:', newClip);
    };

    const deleteClip = (clipId) => {
        setClips(clips.filter(c => c.id !== clipId));
        if (selectedClipId === clipId) {
            setSelectedClipId(null);
        }
    };

    // Calculate total project duration based on clips
    const getProjectDuration = () => {
        if (clips.length === 0) return 0;
        return Math.max(...clips.map(clip => clip.startTime + clip.duration));
    };

    const addRecording = async (uri, duration, source = 'instrument', instrumentType = null) => {
        const newRecording = {
            id: Date.now().toString(),
            name: source === 'voice'
                ? `Vocal Recording ${recordings.filter(r => r.source === 'voice').length + 1}`
                : `${instrumentType || 'Instrument'} Recording ${recordings.filter(r => r.source === 'instrument').length + 1}`,
            uri,
            duration,
            source, // 'voice' or 'instrument'
            instrumentType, // e.g., 'piano', 'drums', 'guitar', null for voice
            createdAt: new Date().toISOString(),
        };

        // GUEST MODE: Save only to local state and AsyncStorage
        setRecordings([...recordings, newRecording]);
        console.log('Recording added to local library:', newRecording);
        return newRecording;
    };

    const deleteRecording = async (recordingId) => {
        const recording = recordings.find(r => r.id === recordingId);

        // Delete from IndexedDB if on web and has idb:// URI
        if (recording && recording.uri.startsWith('idb://')) {
            try {
                const { deleteFileFromLocal } = require('../utils/webStorage');
                await deleteFileFromLocal(recording.uri);
                console.log('Recording deleted from IndexedDB');
            } catch (error) {
                console.error('Failed to delete recording from IndexedDB:', error);
            }
        }

        // Delete from local state (AsyncStorage sync is handled by useEffect)
        setRecordings(recordings.filter(r => r.id !== recordingId));
        console.log('Recording deleted from local state');
    };

    const updateRecording = async (recordingId, updates) => {
        // Update local state (AsyncStorage sync is handled by useEffect)
        setRecordings(recordings.map(r =>
            r.id === recordingId ? { ...r, ...updates } : r
        ));
        console.log('Recording updated in local state');
    };


    const clearAllData = async () => {
        try {
            await AsyncStorage.removeItem('@recordings');
            await AsyncStorage.removeItem('@projects');
            await AsyncStorage.removeItem('@user_profile');
            setRecordings([]);
            setTracks(INSTRUMENT_TRACKS.map(normalizeTrack));
            setClips([]);
            console.log('All local data cleared.');
            return { success: true };
        } catch (error) {
            console.error('Failed to clear data:', error);
            return { success: false, error };
        }
    };

    const saveCurrentProject = async (name) => {
        const projectName = name || currentProjectName;
        const projectData = {
            id: Date.now().toString(),
            name: projectName,
            tempo,
            tracks,
            clips,
            recordings,
            updatedAt: new Date().toISOString()
        };

        try {
            // Save to project list in AsyncStorage
            const existingProjectsStr = await AsyncStorage.getItem('@projects');
            const existingProjects = existingProjectsStr ? JSON.parse(existingProjectsStr) : [];
            
            // Upsert by name
            const updatedProjects = [...existingProjects.filter(p => p.name !== projectName), projectData];
            await AsyncStorage.setItem('@projects', JSON.stringify(updatedProjects));
            
            setCurrentProjectName(projectName);
            console.log('Project saved:', projectName);

            // If user is authenticated, we could sync to Supabase JSONB here
            // (Decision 5 implementation would go here)

            return projectData;
        } catch (error) {
            console.error('Failed to save project:', error);
            throw error;
        }
    };

    const memoizedValue = useMemo(() => ({
        tracks,
        clips,
        isPlaying,
        currentTime,
        tempo,
        setTempo,
        togglePlayback,
        stopPlayback,
        addTrack,
        updateTrackVolume,
        updateTrackPan,
        updateTrackGain,
        updateTrackEQ,
        updateTrackEffect,
        updateTrackMute,
        updateTrackSolo,
        updateTrackAuxSend,
        updateTrackCompressor,
        addClip,
        deleteClip,
        getProjectDuration,
        recordings,
        addRecording,
        deleteRecording,
        updateRecording,
        clearAllData,
        saveCurrentProject,
        currentProjectName,
        zoomLevel: 1,
        setZoomLevel: () => { },
        selectedClipId,
        setSelectedClipId,
        masterVolume,
        updateMasterVolume: (val) => {
            setMasterVolume(val);
            UnifiedAudioEngine.setMasterVolume(val);
        },
        timeAnimatedValue,
    }), [
        tracks, clips, isPlaying, currentTime, tempo, recordings, selectedClipId, masterVolume, currentProjectName
    ]);

    return (
        <ProjectContext.Provider value={memoizedValue}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
