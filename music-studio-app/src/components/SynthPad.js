import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import WebAudioEngine from '../services/WebAudioEngine';

export default function SynthPad() {
    const handlePressIn = () => {
        console.log('Synth Pad Press In');
        WebAudioEngine.playSound('C4');
    };

    const handlePressOut = () => {
        console.log('Synth Pad Press Out');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.pad}
                activeOpacity={0.8}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <Text style={styles.text}>HOLD TO PLAY</Text>
            </TouchableOpacity>
            <View style={styles.controls}>
                <View style={styles.knob}><Text style={styles.knobText}>CUTOFF</Text></View>
                <View style={styles.knob}><Text style={styles.knobText}>RES</Text></View>
                <View style={styles.knob}><Text style={styles.knobText}>LFO</Text></View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    pad: {
        width: 250,
        height: 200,
        backgroundColor: '#6200ee',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6200ee',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 20,
        letterSpacing: 2,
    },
    controls: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 20,
    },
    knob: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#6200ee',
    },
    knobText: {
        color: '#aaa',
        fontSize: 10,
    },
});
