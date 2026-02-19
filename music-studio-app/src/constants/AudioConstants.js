/**
 * Centralized Audio Constants for SoloCraft Studio
 * This file defines the unified routing between instrument IDs and Mixer Tracks.
 */

export const INSTRUMENT_TRACKS = [
    { id: '1', name: 'Vocals', type: 'vocal', volume: 0.8 },
    { id: '2', name: 'Piano', type: 'midi', volume: 0.7 },
    { id: '3', name: 'Rhythm Section', type: 'midi', volume: 0.85 }, // Drums, Tabla, Dholak
    { id: '4', name: 'Bass Guitar', type: 'audio', volume: 0.8 },
    { id: '5', name: 'Guitars', type: 'audio', volume: 0.75 }, // Acoustic, Electric, Banjo
    { id: '6', name: 'Synthesizers', type: 'midi', volume: 0.65 },
    { id: '7', name: 'Orchestral Strings', type: 'midi', volume: 0.7 },
    { id: '8', name: 'Woodwinds', type: 'midi', volume: 0.75 }, // Flute, Saxophone
    { id: '9', name: 'Brass & Horns', type: 'midi', volume: 0.75 }, // Trumpet, Brass Ensemble
    { id: '10', name: 'Ethnic Strings', type: 'midi', volume: 0.7 }, // Sitar, Veena
    { id: '11', name: 'Choir & Pads', type: 'midi', volume: 0.6 },
    { id: '12', name: 'Plucked Strings', type: 'midi', volume: 0.7 }, // Harp, Kalimba
    { id: '13', name: 'World Percussion', type: 'midi', volume: 0.8 }, // Hand Percussion
    { id: '14', name: 'Mallets', type: 'midi', volume: 0.7 }, // Marimba, Glockenspiel
    { id: '15', name: 'Aux Loop 1', type: 'audio', volume: 0.8 },
    { id: '16', name: 'Aux Loop 2', type: 'audio', volume: 0.8 },
];

export const INSTRUMENT_TRACK_MAP = {
    // Strings
    'violin': '7',
    'cello': '7',
    'strings': '7',
    'orchestral_strings': '7',
    'ethnic_strings': '10',
    'sitar': '10',
    'shamisen': '10',
    'koto': '10',
    'harp': '12',

    // Wind
    'flute': '8',
    'saxophone': '8',
    'clarinet': '8',
    'oboe': '8',
    'trumpet': '9',
    'brass': '9',
    'brass_ensemble': '9',
    'tuba': '9',
    'french_horn': '9',

    // Keys & Pads
    'piano': '2',
    'electric_piano': '2',
    'organ': '2',
    'accordion': '2',
    'synth': '6',
    'choir': '11',

    // Guitars & Bass
    'guitar': '5',
    'acoustic_guitar': '5',
    'electric_guitar': '5',
    'banjo': '5',
    'bass': '4',
    'bass_guitar': '4',

    // Vocals
    'vocal': '1',
    'voice': '1',
    'lead_vocals': '1',
    'backing_vocals': '1',

    // Percussion
    'drums': '3',
    'drum_machine': '3',
    'tabla': '3',
    'dholak': '3',
    'percussion': '13',
    'world_percussion': '13',
    'ethnic_percussion': '13',
    'world': '13',
    'global_rhythms': '13'
};
