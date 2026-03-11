const Audio = require('expo-audio');
console.log('Audio exports:', Object.keys(Audio));
if (Audio.InterruptionMode) {
    console.log('InterruptionMode keys:', Object.keys(Audio.InterruptionMode));
} else {
    console.log('InterruptionMode is UNDEFINED');
}
