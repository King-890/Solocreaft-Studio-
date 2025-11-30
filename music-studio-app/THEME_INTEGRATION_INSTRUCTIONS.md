# HomeScreen Theme Integration - Manual Instructions

## Summary
The audio recording is **FIXED** ✅ - the error is resolved!

The theme system is **COMPLETE** except for HomeScreen integration. Due to file complexity, automated edits keep failing. Please follow these simple manual steps:

---

## Step-by-Step Instructions

### 1. Open the file
Open `src/screens/HomeScreen.js` in your editor

### 2. Add import (Line 12)
After line 11 (`import AnimatedCard from '../components/AnimatedCard';`), add:
```javascript
import ThemeGallery from '../components/ThemeGallery';
```

### 3. Add state variable (Line 21)
After line 20 (`const [showProfile, setShowProfile] = useState(false);`), add:
```javascript
const [showThemeGallery, setShowThemeGallery] = useState(false);
```

### 4. Add handler function (After line 69)
After the `handleSettings` function (around line 69), add this new function:
```javascript

const handleThemes = () => {
    setShowProfile(false);
    setShowThemeGallery(true);
};
```

### 5. Add Themes button (After line 152)
After the Instruments `<MusicButton>` (around line 152), add:
```javascript

<MusicButton
    title="Themes"
    subtitle="Customize appearance"
    icon="🎨"
    color="#9c27b0"
    onPress={handleThemes}
/>
```

### 6. Add Theme Gallery modal (Before line 164)
Before the closing `</View>` and after the Menu `</Modal>` (around line 163), add:
```javascript

{/* Theme Gallery Modal */}
<Modal
    visible={showThemeGallery}
    animationType="slide"
    onRequestClose={() => setShowThemeGallery(false)}
>
    <ThemeGallery onClose={() => setShowThemeGallery(false)} />
</Modal>
```

---

## That's It!

After these changes:
- ✅ Audio recording will work (already fixed)
- ✅ You'll have a "Themes" button in the menu
- ✅ Clicking it opens the theme gallery
- ✅ You can upload photos/videos as backgrounds
- ✅ Themes persist across app restarts

## Test It
1. Open the app
2. Click the menu button (top right)
3. Click "Themes"
4. Upload a photo or video!
