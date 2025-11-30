#!/usr/bin/env node

// This script adds theme gallery integration to HomeScreen.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'screens', 'HomeScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
content = content.replace(
    "import AnimatedCard from '../components/AnimatedCard';",
    "import AnimatedCard from '../components/AnimatedCard';\nimport ThemeGallery from '../components/ThemeGallery';"
);

// 2. Add state
content = content.replace(
    "const [showProfile, setShowProfile] = useState(false);\n    const [audioStarted, setAudioStarted] = useState(false);",
    "const [showProfile, setShowProfile] = useState(false);\n    const [showThemeGallery, setShowThemeGallery] = useState(false);\n    const [audioStarted, setAudioStarted] = useState(false);"
);

// 3. Add handler
content = content.replace(
    "const handleSettings = () => {\n        setShowProfile(false);\n        navigation.navigate('Settings');\n    };",
    "const handleSettings = () => {\n        setShowProfile(false);\n        navigation.navigate('Settings');\n    };\n\n    const handleThemes = () => {\n        setShowProfile(false);\n        setShowThemeGallery(true);\n    };"
);

// 4. Add Themes button
content = content.replace(
    `                        <MusicButton
                            title="Instruments"
                            subtitle="Explore sound collection"
                            icon="🎹"
                            color="#ff6b9d"
                            onPress={handleInstruments}
                        />

                        <MusicButton
                            title="Settings"
                            subtitle="Customize experience"
                            icon="⚙️"
                            color="#888"
                            onPress={handleSettings}
                        />`,
    `                        <MusicButton
                            title="Instruments"
                            subtitle="Explore sound collection"
                            icon="🎹"
                            color="#ff6b9d"
                            onPress={handleInstruments}
                        />

                        <MusicButton
                            title="Themes"
                            subtitle="Customize appearance"
                            icon="🎨"
                            color="#9c27b0"
                            onPress={handleThemes}
                        />

                        <MusicButton
                            title="Settings"
                            subtitle="Customize experience"
                            icon="⚙️"
                            color="#888"
                            onPress={handleSettings}
                        />`
);

// 5. Add Theme Gallery modal
content = content.replace(
    "                </TouchableOpacity>\n            </Modal>\n        </View>\n    );\n}",
    `                </TouchableOpacity>
            </Modal>

            {/* Theme Gallery Modal */}
            <Modal
                visible={showThemeGallery}
                animationType="slide"
                onRequestClose={() => setShowThemeGallery(false)}
            >
                <ThemeGallery onClose={() => setShowThemeGallery(false)} />
            </Modal>
        </View>
    );
}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ HomeScreen.js updated successfully!');
