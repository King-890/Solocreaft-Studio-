/**
 * SampleLibrary.js
 * Definitions for high-quality instrument samples hosted on public repositories.
 * Using MIDI.js Soundfont library as a reliable source.
 */

const BASE_URL = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM';

export const INSTRUMENTS = {
  PIANO: 'acoustic_grand_piano',
  GUITAR: 'acoustic_guitar_nylon',
  BASS: 'electric_bass_finger',
  VIOLIN: 'violin',
  FLUTE: 'flute',
  SITAR: 'sitar',
  SAXOPHONE: 'alto_sax',
  TRUMPET: 'trumpet',
  CELLO: 'cello',
  STRINGS: 'string_ensemble_1',
  HARP: 'orchestral_harp',
  MARIMBA: 'marimba',
  ACCORDION: 'accordion',
  BANJO: 'banjo',
  CLARINET: 'clarinet',
  OBOE: 'oboe',
  TUBA: 'tuba',
  FRENCH_HORN: 'french_horn',
  SHAMISEN: 'shamisen',
  KOTO: 'koto',
  KALIMBA: 'kalimba',
  SYNTH: 'pad_1_new_age',
  CHOIR: 'choir_aahs',
  // Percussion Mappings (Local Assets)
  DRUMS: 'standard_drums',
  TABLA: 'tabla_set',
  DHOLAK: 'dholak_set'
};

/**
 * Velocity Layers for dynamic expression.
 * Real instruments change timbre when played harder.
 */
export const VELOCITY_LAYERS = {
  SOFT: { max: 0.4, suffix: '_soft' },
  MEDIUM: { max: 0.8, suffix: '' },
  HARD: { max: 1.0, suffix: '_hard' }
};

/**
 * Gets the URL for a specific note of an instrument.
 * @param {string} instrumentKey - Key from INSTRUMENTS object
 * @param {string} noteName - Note name like 'C4', 'Fs4' (using 's' for sharp)
 * @param {number} velocity - 0.0 to 1.0
 * @returns {string} URL to the MP3 sample
 */
export const getSampleUrl = (instrumentKey, noteName, velocity = 0.8) => {
  // Normalize 's' to '#' first (e.g. 'Fs4' -> 'F#4')
  let normalizedNote = noteName.replace('s', '#');
  
  // Extract note and octave
  const match = normalizedNote.match(/^([A-G][#b]?)(\d)$/);
  if (!match) return `${BASE_URL}/${instrumentKey}-mp3/C4.mp3`; // Fallback to safe note

  let [, note, octave] = match;
  let octaveNum = parseInt(octave);

  // Normalize B# (C+1) and E# (F) for MIDI library compatibility
  if (note === 'B#') {
    note = 'C';
    octaveNum += 1;
  } else if (note === 'E#') {
    note = 'F';
  } else if (note === 'Cb') {
    note = 'B';
    octaveNum -= 1;
  } else if (note === 'Fb') {
    note = 'E';
  }

  // MIDI.js soundfonts in FluidR3_GM use flats (b) instead of sharps (#)
  const SHARP_TO_FLAT = {
    'C#': 'Db',
    'D#': 'Eb',
    'F#': 'Gb',
    'G#': 'Ab',
    'A#': 'Bb'
  };

  if (SHARP_TO_FLAT[note]) {
    note = SHARP_TO_FLAT[note];
  }

  // [NATURAL SOUND] Determine velocity layer suffix if multisampling is available
  // Note: FluidR3_GM doesn't natively have _soft/_hard in the public URL provided,
  // but we can map them if we switch to a more advanced library like WebAudioFont.
  // For now, we'll keep the structure ready for high-fidelity sources.
  let velocitySuffix = '';
  /* 
  if (velocity <= VELOCITY_LAYERS.SOFT.max) velocitySuffix = VELOCITY_LAYERS.SOFT.suffix;
  else if (velocity >= VELOCITY_LAYERS.HARD.max) velocitySuffix = VELOCITY_LAYERS.HARD.suffix;
  */

  const finalNote = note + octaveNum + velocitySuffix;
  return `${BASE_URL}/${instrumentKey}-mp3/${finalNote}.mp3`;
};

/**
 * Safe Asset Registry
 * Individually wraps each require in a try-catch to prevent Metro bundler from crashing 
 * if a specific file is missing. Missing files return null, allowing the engine to fallback.
 */
const PERCUSSION_REGISTRY = (() => {
  const safe = (fn) => {
    try {
      return fn();
    } catch (e) {
      return null;
    }
  };

  return {
    drums: {
      kick: safe(() => require('../../assets/sounds/drums/kick.wav')),
      snare: safe(() => require('../../assets/sounds/drums/snare.wav')),
      hihat: safe(() => require('../../assets/sounds/drums/hihat.wav')),
      tom1: safe(() => require('../../assets/sounds/drums/bass-drum__025_forte_bass-drum-mallet.mp3')),
      tom2: safe(() => require('../../assets/sounds/drums/agogo-bells__025_mezzo-forte_struck-singly.mp3')),
      crash: safe(() => require('../../assets/sounds/drums/banana-shaker__long_forte_shaken.mp3')),
    },
    tabla: {
      dha: safe(() => require('../../assets/sounds/tabla/dha.wav')),
      tin: safe(() => require('../../assets/sounds/tabla/tin.wav')),
      na: safe(() => require('../../assets/sounds/tabla/tin.wav')),
      te: safe(() => require('../../assets/sounds/tabla/dha.wav')),
    },
    dholak: {
      dha: safe(() => require('../../assets/sounds/dholak/dha.wav')),
      ta: safe(() => require('../../assets/sounds/tabla/tin.wav')),
      ge: safe(() => require('../../assets/sounds/dholak/dha.wav')),
      na: safe(() => require('../../assets/sounds/tabla/tin.wav')),
    },
    world: {
      'conga high': safe(() => require('../../assets/sounds/drums/hihat.wav')),
      'conga low': safe(() => require('../../assets/sounds/drums/kick.wav')),
      'bongo high': safe(() => require('../../assets/sounds/tabla/tin.wav')),
      'bongo low': safe(() => require('../../assets/sounds/dholak/dha.wav')),
      'djembe': safe(() => require('../../assets/sounds/drums/kick.wav')),
      'shaker': safe(() => require('../../assets/sounds/drums/hihat.wav')),
      'cowbell': safe(() => require('../../assets/sounds/drums/snare.wav')),
      '1': safe(() => require('../../assets/sounds/drums/hihat.wav')),
      '2': safe(() => require('../../assets/sounds/drums/kick.wav')),
    }
  };
})();

/**
 * Gets the local asset mapping for percussion sounds
 */
export const getLocalPercussionAsset = (instrument, soundId) => {
  const normalizedInstrument = String(instrument).toLowerCase();
  
  if (normalizedInstrument === 'drums' || normalizedInstrument === 'standard_drums') {
    return PERCUSSION_REGISTRY.drums[soundId];
  }
  if (normalizedInstrument === 'tabla' || normalizedInstrument === 'tabla_set') {
    return PERCUSSION_REGISTRY.tabla[soundId];
  }
  if (normalizedInstrument === 'dholak' || normalizedInstrument === 'dholak_set') {
    return PERCUSSION_REGISTRY.dholak[soundId];
  }
  if (normalizedInstrument === 'world' || normalizedInstrument === 'global_rhythms') {
    return PERCUSSION_REGISTRY.world[soundId] || PERCUSSION_REGISTRY.drums['kick'];
  }
  
  return null;
};

/**
 * Common notes to preload for better responsiveness
 */
export const PRELOAD_NOTES = [
  'C4'
];

export default {
  INSTRUMENTS,
  getSampleUrl,
  PRELOAD_NOTES
};

