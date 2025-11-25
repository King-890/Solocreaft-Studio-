# Audio Setup Instructions

## Overview
The app now has an `AudioManager` that will play ambient sounds for the Home Screen. To enable audio, you need to add three audio files.

## Required Audio Files

Create a folder: `assets/sounds/` and add these files:

### 1. River Flow Sound
- **Filename**: `river_flow.mp3`
- **Type**: Gentle flowing water sound
- **Duration**: 30-60 seconds (will loop)
- **Suggested sources**: 
  - Freesound.org
  - YouTube Audio Library
  - Search: "gentle river flowing ambient"

### 2. Wind Breeze Sound
- **Filename**: `wind_breeze.mp3`
- **Type**: Soft wind through trees
- **Duration**: 30-60 seconds (will loop)
- **Suggested sources**:
  - Freesound.org
  - Search: "soft wind breeze ambient"

### 3. Instrument Ambient Sound
- **Filename**: `instrument_ambient.mp3`
- **Type**: Soft traditional instrument (like guzheng, koto, or similar)
- **Duration**: 30-60 seconds (will loop)
- **Suggested sources**:
  - Freesound.org
  - YouTube Audio Library
  - Search: "traditional asian instrument ambient"

## How to Enable Audio

Once you have the audio files:

1. Create the folder structure:
   ```
   assets/
   └── sounds/
       ├── river_flow.mp3
       ├── wind_breeze.mp3
       └── instrument_ambient.mp3
   ```

2. Open `src/utils/AudioManager.js`

3. Uncomment the audio loading lines (around lines 52-70):
   ```javascript
   // Change from:
   // await this.loadSound('river', require('../../assets/sounds/river_flow.mp3'), AUDIO_CONFIG.river);
   
   // To:
   await this.loadSound('river', require('../../assets/sounds/river_flow.mp3'), AUDIO_CONFIG.river);
   ```

4. Do the same for wind and instrument sounds.

## Volume Adjustment

You can adjust volumes in `src/constants/UIConfig.js`:

```javascript
export const AUDIO_CONFIG = {
    river: {
        enabled: true,
        volume: 0.3,  // Adjust 0.0 - 1.0
        loop: true,
    },
    wind: {
        enabled: true,
        volume: 0.2,  // Adjust 0.0 - 1.0
        loop: true,
    },
    instrument: {
        enabled: true,
        volume: 0.4,  // Adjust 0.0 - 1.0
        loop: true,
    },
};
```

## Current Status

✅ Audio infrastructure is ready  
⏳ Waiting for audio files to be added  
📝 Console will show: "River sound ready (add river_flow.mp3 to assets/sounds/)"
