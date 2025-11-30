#!/usr/bin/env node

// This script updates ThemeGallery.js to make it responsive
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'ThemeGallery.js');
let content = fs.readFileSync(filePath, 'utf8');

// Update the styles to be responsive
content = content.replace(
    `    themeCard: {
        width: '47%',
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },`,
    `    themeCard: {
        width: '47%',
        maxWidth: 200,
        backgroundColor: '#1e1e1e',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
        aspectRatio: 1,
    },`
);

content = content.replace(
    `    themePreview: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },`,
    `    themePreview: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },`
);

// Update renderThemeCard to position labels absolutely
content = content.replace(
    `                <Text style={styles.themeName}>{theme.name}</Text>
                {isActive && <Text style={styles.activeLabel}>✓ Active</Text>}
            </TouchableOpacity>`,
    `                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    {isActive && <Text style={styles.activeLabel}>✓ Active</Text>}
                </View>
            </TouchableOpacity>`
);

// Update themeName style
content = content.replace(
    `    themeName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        padding: 10,
        textAlign: 'center',
    },`,
    `    themeName: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        padding: 8,
        paddingTop: 6,
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },`
);

// Update activeLabel style
content = content.replace(
    `    activeLabel: {
        color: '#03dac6',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 8,
    },`,
    `    activeLabel: {
        color: '#03dac6',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 6,
        backgroundColor: 'rgba(3, 218, 198, 0.1)',
    },`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ ThemeGallery.js updated with responsive design!');
