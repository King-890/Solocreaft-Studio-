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
  STRINGS: 'string_ensemble_1'
};

/**
 * Gets the URL for a specific note of an instrument.
 * @param {string} instrumentKey - Key from INSTRUMENTS object
 * @param {string} noteName - Note name like 'C4', 'Fs4' (using 's' for sharp)
 * @returns {string} URL to the MP3 sample
 */
export const getSampleUrl = (instrumentKey, noteName) => {
  // MIDI.js soundfonts use 's' instead of '#' for sharps
  const formattedNote = noteName.replace('#', 's');
  return `${BASE_URL}/${instrumentKey}-mp3/${formattedNote}.mp3`;
};

/**
 * Common notes to preload for better responsiveness
 */
export const PRELOAD_NOTES = ['C3', 'C4', 'C5', 'G4', 'E4'];

export default {
  INSTRUMENTS,
  getSampleUrl,
  PRELOAD_NOTES
};
