import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';

const NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];

export default function Saxophone() {
    const { width, height } = useWindowDimensions();

    const handleNotePress = (note) => {
        console.log(`Saxophone note ${note} played`);
        UnifiedAudioEngine.playSound(note, 'saxophone');
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            <View style={[styles.container, { minHeight: height - 150 }]}>
                <Text style={styles.title}>Saxophone</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.keysScroll}>
                    <View style={styles.keysContainer}>
                        {NOTES.map((note) => (
                            <TouchableOpacity
                                key={note}
                                style={styles.key}
                                onPress={() => handleNotePress(note)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.keyText}>{note}</Text>
                                <View style={styles.keyDetail} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
                <Text style={styles.instruction}>Tap keys to play notes</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
    },
    keysScroll: {
        flexGrow: 0,
    },
    keysContainer: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    key: {
        width: 60,
        height: 180,
        backgroundColor: '#FFD700', // Gold
        borderRadius: 30,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
        borderWidth: 2,
        borderColor: '#DAA520',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    keyDetail: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0E68C',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#B8860B',
    },
    keyText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    instruction: {
        color: '#888',
        fontSize: 14,
        marginTop: 20,
    },
});
