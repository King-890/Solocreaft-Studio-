import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';

const OCTAVES = 4; // Reduced for performance/demo
const START_OCTAVE = 3;

export default function Piano() {
    const handleNotePress = (note) => {
        console.log(`Playing ${note}`);
        UnifiedAudioEngine.playSound(note, 'piano');
    };

    const renderKeys = () => {
        const keys = [];
        for (let i = 0; i < OCTAVES; i++) {
            const octave = START_OCTAVE + i;
            // White Keys: C, D, E, F, G, A, B
            const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

            whiteNotes.forEach((note) => {
                keys.push(
                    <TouchableOpacity
                        key={`${note}${octave}`}
                        style={styles.whiteKey}
                        onPressIn={() => handleNotePress(`${note}${octave}`)}
                        onPressOut={() => UnifiedAudioEngine.stopSound(`${note}${octave}`, 'piano')}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.keyLabel}>{note}{octave}</Text>
                    </TouchableOpacity>
                );
            });
        }
        return keys;
    };

    const renderBlackKeys = () => {
        const keys = [];
        const whiteKeyWidth = 50;
        let offset = 0;

        for (let i = 0; i < OCTAVES; i++) {
            const octave = START_OCTAVE + i;
            // Black Keys positions relative to white keys
            // C# (between C and D), D# (between D and E)
            // F# (between F and G), G# (between G and A), A# (between A and B)

            // C is at offset
            // C# is at offset + width - half_black_width

            const blackNotes = [
                { note: 'C#', offset: 1 },
                { note: 'D#', offset: 2 },
                // Skip E-F gap
                { note: 'F#', offset: 4 },
                { note: 'G#', offset: 5 },
                { note: 'A#', offset: 6 }
            ];

            blackNotes.forEach(({ note, offset: keyOffset }) => {
                const leftPosition = (i * 7 * whiteKeyWidth) + (keyOffset * whiteKeyWidth) - (whiteKeyWidth / 2) - 10; // Adjust

                // Better calculation:
                // C=0, D=50, E=100, F=150, G=200, A=250, B=300
                // C# ~ 35, D# ~ 85, F# ~ 185, G# ~ 235, A# ~ 285

                let left = 0;
                if (note.startsWith('C')) left = (i * 7 * whiteKeyWidth) + 35;
                if (note.startsWith('D')) left = (i * 7 * whiteKeyWidth) + 85;
                if (note.startsWith('F')) left = (i * 7 * whiteKeyWidth) + 185;
                if (note.startsWith('G')) left = (i * 7 * whiteKeyWidth) + 235;
                if (note.startsWith('A')) left = (i * 7 * whiteKeyWidth) + 285;

                keys.push(
                    <TouchableOpacity
                        key={`${note}${octave}`}
                        style={[styles.blackKey, { left: left }]}
                        onPressIn={() => handleNotePress(`${note}${octave}`)}
                        onPressOut={() => UnifiedAudioEngine.stopSound(`${note}${octave}`, 'piano')}
                        activeOpacity={0.9}
                    />
                );
            });
        }
        return keys;
    };

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.scrollContent}>
                <View style={styles.keysContainer}>
                    {renderKeys()}
                    {renderBlackKeys()}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 240,
        backgroundColor: '#1a1a1a',
        marginTop: 20,
        borderRadius: 15,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 10,
    },
    keysContainer: {
        flexDirection: 'row',
        position: 'relative',
        height: '100%',
        alignItems: 'flex-start',
    },
    whiteKey: {
        width: 50,
        height: 200,
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ccc',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 15,
        marginRight: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    blackKey: {
        width: 34,
        height: 130,
        backgroundColor: '#111',
        position: 'absolute',
        top: 0,
        zIndex: 10,
        borderBottomLeftRadius: 6,
        borderBottomRightRadius: 6,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 5,
    },
    keyLabel: {
        color: '#888',
        fontSize: 10,
        fontWeight: '600',
    },
});
