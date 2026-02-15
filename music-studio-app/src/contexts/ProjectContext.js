import React, { createContext, useState, useContext, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AudioPlaybackService from '../services/AudioPlaybackService';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const ProjectContext = createContext({});

export const ProjectProvider = ({ children }) => {
    const { user } = useAuth();
    const [tracks, setTracks] = useState([
        {
            id: '1',
            name: 'Lead Vocals',
            type: 'audio',
            volume: 0.85,
            pan: 0,
            gain: 0.8,
            eq: { high: 2, mid: 0, low: -1 },
            auxSends: [0.3, 0.1],
            compressor: { threshold: -18, ratio: 3, enabled: true },
            muted: false,
            solo: false
        },
        {
            id: '2',
            name: 'Piano',
            type: 'midi',
            volume: 0.7,
            pan: 0,
            gain: 0.75,
            eq: { high: 1, mid: 0, low: 0 },
            auxSends: [0.4, 0],
            compressor: { threshold: -20, ratio: 4, enabled: false },
            muted: false,
            solo: false
        },
        {
            id: '3',
            name: 'Drums',
            type: 'midi',
            volume: 0.9,
            pan: 0,
            gain: 0.95,
            eq: { high: 3, mid: 0, low: 2 },
            auxSends: [0.2, 0.15],
            compressor: { threshold: -15, ratio: 6, enabled: true },
            muted: false,
            solo: false
        },
        {
            id: '4',
            name: 'Bass Guitar',
            type: 'audio',
            volume: 0.8,
            pan: 0,
            gain: 0.85,
            eq: { high: -2, mid: 1, low: 4 },
            auxSends: [0.1, 0],
            compressor: { threshold: -12, ratio: 8, enabled: true },
            muted: false,
            solo: false
        },
        {
            id: '5',
            name: 'Electric Guitar',
            type: 'audio',
            volume: 0.75,
            pan: -0.3,
            gain: 0.7,
            eq: { high: 2, mid: 3, low: 0 },
            auxSends: [0.25, 0.3],
            compressor: { threshold: -20, ratio: 4, enabled: false },
            muted: false,
            solo: false
        },
        {
            id: '6',
            name: 'Synth Pad',
            type: 'midi',
            volume: 0.6,
            pan: 0.2,
            gain: 0.65,
            eq: { high: 0, mid: -1, low: 1 },
            auxSends: [0.5, 0.2],
            compressor: { threshold: -25, ratio: 3, enabled: false },
            muted: false,
            solo: false
        },
        {
            id: '7',
            name: 'Strings',
            type: 'midi',
            volume: 0.65,
            pan: 0,
            gain: 0.7,
            eq: { high: 1, mid: 0, low: 0 },
            auxSends: [0.45, 0.1],
            compressor: { threshold: -22, ratio: 3, enabled: false },
            muted: false,
            solo: false
        },
        {
            id: '8',
            name: 'Backing Vocals',
            type: 'audio',
            volume: 0.7,
            pan: -0.4,
            gain: 0.75,
            eq: { high: 3, mid: 1, low: -2 },
            auxSends: [0.35, 0.15],
            compressor: { threshold: -20, ratio: 4, enabled: true },
            muted: false,
            solo: false
        },
    ]);

    const [clips, setClips] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [areRecordingsLoaded, setAreRecordingsLoaded] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [tempo, setTempo] = useState(120);
    const [selectedClipId, setSelectedClipId] = useState(null);

    const playheadInterval = useRef(null);

    // Load recordings on mount
    React.useEffect(() => {
        loadRecordings();
    }, []);

    // Save recordings when they change
    React.useEffect(() => {
        // Only save if we have finished loading the initial data
        if (areRecordingsLoaded) {
            saveRecordings();
        }
    }, [recordings, areRecordingsLoaded]);

    // Sync initial track settings to AudioPlaybackService
    React.useEffect(() => {
        tracks.forEach(track => {
            AudioPlaybackService.setTrackVolume(track.id, track.muted ? 0 : track.volume);
            AudioPlaybackService.setTrackPan(track.id, track.pan);
        });
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
                } else {
                    setCurrentTime(newTime);
                }
            }, 16); // ~60fps
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
        const newTrack = {
            id: Date.now().toString(),
            name: `Track ${tracks.length + 1}`,
            type,
            volume: 0.8,
            pan: 0,
            gain: 0.75,
            eq: { high: 0, mid: 0, low: 0 },
            auxSends: [0, 0],
            compressor: { threshold: -20, ratio: 4, enabled: false },
            muted: false,
            solo: false,
        };
        setTracks([...tracks, newTrack]);
    };

    const updateTrackVolume = (trackId, volume) => {
        const track = tracks.find(t => t.id === trackId);
        setTracks(tracks.map(t => t.id === trackId ? { ...t, volume } : t));
        AudioPlaybackService.setTrackVolume(trackId, volume);

        // Sync to UnifiedAudioEngine mixer
        if (track) {
            const instrumentMap = {
                'Lead Vocals': 'vocal',
                'Piano': 'piano',
                'Drums': 'drums',
                'Bass Guitar': 'bass',
                'Electric Guitar': 'guitar',
                'Synth Pad': 'synth',
                'Strings': 'violin',
                'Backing Vocals': 'vocal'
            };
            const instrumentId = instrumentMap[track.name];
            if (instrumentId) {
                UnifiedAudioEngine.setMixerSettings(instrumentId, { volume });
            }
        }
    };

    const updateTrackPan = (trackId, pan) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, pan } : t));
        AudioPlaybackService.setTrackPan(trackId, pan);
    };

    const updateTrackGain = (trackId, gain) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, gain } : t));
        AudioPlaybackService.setTrackGain(trackId, gain);
    };

    const updateTrackEQ = (trackId, eq) => {
        setTracks(tracks.map(t => t.id === trackId ? { ...t, eq: { ...t.eq, ...eq } } : t));
        AudioPlaybackService.setTrackEQ(trackId, eq);
    };

    const updateTrackMute = (trackId, muted) => {
        const track = tracks.find(t => t.id === trackId);
        setTracks(tracks.map(t => t.id === trackId ? { ...t, muted } : t));
        if (track) {
            AudioPlaybackService.setTrackMute(trackId, muted, track.volume);
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
                AudioPlaybackService.setTrackAuxSend(trackId, sendIndex, level);
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

    const value = {
        tracks,
        clips,
        isPlaying,
        currentTime,
        tempo,
        togglePlayback,
        stopPlayback,
        addTrack,
        updateTrackVolume,
        updateTrackPan,
        updateTrackGain,
        updateTrackEQ,
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
        zoomLevel: 1, // Default zoom
        setZoomLevel: () => { }, // Placeholder, should be state
        selectedClipId,
        setSelectedClipId,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProject = () => useContext(ProjectContext);
