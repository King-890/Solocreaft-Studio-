# Archived 3D Features

This folder contains 3D-related components that have been temporarily disabled to ensure app stability.

## Files Archived

- **ThreeScene.js** - 3D scene component using three.js, expo-gl, and expo-three
- **SpatialAudio.js** - Spatial audio implementation for 3D objects
- **loadModel.js** - GLTF model loader utility

## Why Archived?

These files were causing app startup issues due to:
- Complex dependencies (three.js, expo-gl, expo-three)
- Bundler compatibility issues
- Not essential for core app functionality

## To Re-enable Later

When you're ready to implement 3D features:

1. **Install required packages:**
   ```bash
   npm install three expo-gl expo-three
   ```

2. **Move files back:**
   - Move `ThreeScene.js` back to `src/components/`
   - Move `SpatialAudio.js` back to `src/components/`
   - Move `loadModel.js` back to `src/utils/`

3. **Update BandRoomScreen.js:**
   - Import ThreeScene component
   - Replace placeholder with `<ThreeScene instrumentModels={instrumentModels} />`

4. **Test thoroughly** on mobile device before deploying

## Notes

- These components work on mobile devices only (not web)
- Requires proper three.js setup and model files
- May need additional optimization for performance
