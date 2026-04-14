/**
 * SampleLibrary.js
 * High-fidelity, multi-sampled instrument repository mapped to Tone.js premium library.
 */
import { Asset } from 'expo-asset';

const BASE_URL = 'https://nbrosowsky.github.io/tonejs-instruments/samples';
const DEBUG = __DEV__ || process.env.NODE_ENV === 'development';

export const INSTRUMENTS = {
  PIANO: 'piano',
  GUITAR: 'guitar-acoustic',
  BASS: 'bass-electric',
  VIOLIN: 'violin',
  FLUTE: 'flute',
  SITAR: 'guitar-nylon', // Using nylon acoustic as closest premium fallback
  SAXOPHONE: 'saxophone',
  TRUMPET: 'trumpet',
  CELLO: 'cello',
  STRINGS: 'violin', 
  HARP: 'harp',
  MARIMBA: 'xylophone',
  ACCORDION: 'harmonium',
  BANJO: 'guitar-acoustic',
  CLARINET: 'clarinet',
  OBOE: 'bassoon',
  TUBA: 'tuba',
  FRENCH_HORN: 'french-horn',
  SHAMISEN: 'guitar-nylon',
  KOTO: 'harp',
  KALIMBA: 'harp',
  SYNTH: 'organ',
  CHOIR: 'harmonium',
  DRUMS: 'standard_drums',
  TABLA: 'tabla_set',
  DHOLAK: 'dholak_set'
};

const AVAILABLE_SAMPLES = {
  'piano': ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'Ds1', 'Ds2', 'Ds3', 'Ds4', 'Ds5', 'Ds6', 'Ds7', 'Fs1', 'Fs2', 'Fs3', 'Fs4', 'Fs5', 'Fs6', 'Fs7'],
  'guitar-acoustic': ['F3', 'Fs1', 'Fs2', 'Fs3', 'G1', 'G2', 'G3', 'Gs1', 'Gs2', 'Gs3', 'A1', 'A2', 'A3', 'As1', 'As2', 'As3', 'B1', 'B2', 'B3', 'C2', 'C3', 'C4', 'Cs2', 'Cs3', 'Cs4', 'D2', 'D3', 'D4', 'Ds2', 'Ds3', 'Ds4', 'E1', 'E2', 'E3', 'F1', 'F2'],
  'bass-electric': ['As2', 'As3', 'As4', 'As5', 'Cs3', 'Cs4', 'Cs5', 'Cs6', 'E2', 'E3', 'E4', 'E5', 'G2', 'G3', 'G4', 'G5'],
  'violin': ['A3', 'A4', 'A5', 'A6', 'C4', 'C5', 'C6', 'C7', 'E4', 'E5', 'E6', 'G4', 'G5', 'G6'],
  'cello': ['E2', 'F2', 'G2', 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'],
  'flute': ['A4', 'C4', 'C5', 'C6', 'E4', 'E5', 'E6'],
  'trumpet': ['C4', 'C5', 'C6', 'F4', 'F5', 'F6', 'A4', 'A5'],
  'saxophone': ['D4', 'D5', 'F4', 'F5', 'A4', 'A5', 'C5', 'C6'],
  'harp': ['C3', 'E3', 'G3', 'C4', 'E4', 'G4', 'C5', 'E5', 'G5', 'C6', 'E6'],
  'xylophone': ['C4', 'G4', 'C5', 'G5', 'C6', 'G6', 'C7'],
  'harmonium': ['C3', 'C4', 'C5', 'E3', 'E4', 'E5', 'G3', 'G4', 'G5'],
  'clarinet': ['D3', 'D4', 'D5', 'F3', 'F4', 'F5', 'A3', 'A4', 'A5'],
  'bassoon': ['C3', 'C4', 'C5', 'E3', 'E4', 'E5', 'G3', 'G4', 'G5'],
  'tuba': ['F1', 'F2', 'F3', 'A1', 'A2', 'A3', 'C2', 'C3', 'C4'],
  'french-horn': ['C3', 'C4', 'C5', 'F3', 'F4', 'F5', 'A3', 'A4', 'A5'],
  'organ': ['C3', 'C4', 'C5', 'C6', 'E3', 'E4', 'E5', 'E6', 'G3', 'G4', 'G5', 'G6'],
  'guitar-nylon': ['Fs2', 'Fs3', 'Fs4', 'Fs5', 'G3', 'G5', 'Gs2', 'Gs4', 'Gs5', 'A2', 'A3', 'A4', 'A5', 'As5', 'B1', 'B2', 'B3', 'B4', 'Cs3', 'Cs4', 'Cs5', 'D2', 'D3', 'D5', 'Ds4', 'E2', 'E3', 'E4', 'E5']
};

const NOTES = { C: 0, 'C#': 1, 'Db': 1, D: 2, 'D#': 3, 'Eb': 3, E: 4, F: 5, 'F#': 6, 'Gb': 6, G: 7, 'G#': 8, 'Ab': 8, A: 9, 'A#': 10, 'Bb': 10, B: 11 };

function noteToMidi(noteName) {
  if (!noteName) return 60;
  let match = noteName.match(/^([A-G][#bs]?|Db|Eb|Gb|Ab|Bb)(\d)$/);
  if (!match) return 60;
  let [, note, octave] = match;
  
  if (note.includes('s')) note = note.replace('s', '#');
  if (note === 'B#') { note = 'C'; octave++; }
  if (note === 'E#') { note = 'F'; }
  if (note === 'Cb') { note = 'B'; octave--; }
  if (note === 'Fb') { note = 'E'; }

  return (parseInt(octave) + 1) * 12 + NOTES[note];
}

export const getSampleData = (instrumentKey, noteName, velocity = 0.8) => {
  const normalizedKey = String(instrumentKey).toLowerCase();
  
  const ALIAS_MAP = {
    'brass': INSTRUMENTS.TRUMPET,
    'brass_ensemble': INSTRUMENTS.TUBA,
    'synth': INSTRUMENTS.SYNTH,
    'strings': INSTRUMENTS.STRINGS,
    'orchestral_strings': INSTRUMENTS.STRINGS,
    'ethnic_strings': INSTRUMENTS.SITAR,
    'world': INSTRUMENTS.BANJO,
    'guitar': INSTRUMENTS.GUITAR,
    'acoustic_guitar': INSTRUMENTS.GUITAR,
    'electric_guitar': INSTRUMENTS.GUITAR,
    'bass': INSTRUMENTS.BASS,
    'bass_guitar': INSTRUMENTS.BASS,
  };

  const internalKey = ALIAS_MAP[normalizedKey] || INSTRUMENTS[normalizedKey.toUpperCase()] || instrumentKey;
  const validValues = Object.values(INSTRUMENTS);
  const safeInstrument = validValues.includes(internalKey) ? internalKey : INSTRUMENTS.PIANO;

  let requestMidi = noteToMidi(noteName);
  
  // Find the closest sample
  const sampleBank = AVAILABLE_SAMPLES[safeInstrument] || AVAILABLE_SAMPLES['piano'];
  
  let closestSample = sampleBank[0];
  let minDiff = 999;
  
  for (let s of sampleBank) {
      let sMidi = noteToMidi(s);
      let diff = Math.abs(requestMidi - sMidi);
      if (diff < minDiff) {
          minDiff = diff;
          closestSample = s;
      }
  }

  // Calculate the exact pitch shift ratio needed
  const closestMidi = noteToMidi(closestSample);
  const playbackRate = Math.pow(2, (requestMidi - closestMidi) / 12);
  
  // Tonejs-instruments uses .mp3 in its main repo samples directory
  const finalUrl = `${BASE_URL}/${safeInstrument}/${closestSample}.mp3`;
  
  if (DEBUG) {
    // console.log(`🔍 [SampleLibrary] Resolved: ${instrumentKey} -> ${noteName} (Closest: ${closestSample}, Rate: ${playbackRate.toFixed(2)})`);
  }
  
  return { url: finalUrl, playbackRate, cacheKey: `${safeInstrument}-${closestSample}` };
};

export const getSafeSampleData = (instrumentKey, noteName, velocity = 0.8) => {
  try {
    return getSampleData(instrumentKey, noteName, velocity);
  } catch (err) {
    return getSampleData('PIANO', 'C4', 0.8);
  }
};

// Backwards compatibility shim
export const getSampleUrl = (instrumentKey, noteName, velocity) => {
    return getSampleData(instrumentKey, noteName, velocity).url;
}

const PERCUSSION_REGISTRY = (() => {
  const safe = (fn) => { try { return fn(); } catch (e) { return null; } };
  return {
    drums: {
      kick: safe(() => require('../../assets/sounds/drums/kick.wav')),
      snare: safe(() => require('../../assets/sounds/drums/snare.wav')),
      hihat: safe(() => require('../../assets/sounds/drums/hihat.wav')),
      tom1: safe(() => require('../../assets/sounds/drums/kick.wav')),
      tom2: safe(() => require('../../assets/sounds/drums/snare.wav')),
      crash: safe(() => require('../../assets/sounds/drums/hihat.wav')),
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

export const getLocalPercussionAsset = (instrument, soundId) => {
  const normalizedInstrument = String(instrument).toLowerCase();
  if (normalizedInstrument === 'drums' || normalizedInstrument === 'standard_drums') return PERCUSSION_REGISTRY.drums[soundId] || null;
  if (normalizedInstrument === 'tabla' || normalizedInstrument === 'tabla_set') return PERCUSSION_REGISTRY.tabla[soundId] || null;
  if (normalizedInstrument === 'dholak' || normalizedInstrument === 'dholak_set') return PERCUSSION_REGISTRY.dholak[soundId] || null;
  if (normalizedInstrument === 'world' || normalizedInstrument === 'global_rhythms') return PERCUSSION_REGISTRY.world[soundId] || PERCUSSION_REGISTRY.drums['kick'] || null;
  return null;
};

export const PRELOAD_NOTES = ['C4'];

export default {
  INSTRUMENTS,
  getSampleData,
  getSafeSampleData,
  getSampleUrl,
  PRELOAD_NOTES
};
