import React from 'react';
import { View, StyleSheet } from 'react-native';

const PIXELS_PER_SECOND = 50;

export default function TimelineGrid({ tempo, zoomLevel, duration }) {
    const pixelsPerSecond = PIXELS_PER_SECOND * zoomLevel;
    const beatDuration = 60 / tempo; // seconds per beat
    const pixelsPerBeat = beatDuration * pixelsPerSecond;
    const beatsPerMeasure = 4;
    const pixelsPerMeasure = pixelsPerBeat * beatsPerMeasure;

    // Calculate total beats to display
    const totalSeconds = Math.max(duration / 1000, 60); // Minimum 60 seconds
    const totalBeats = Math.ceil(totalSeconds / beatDuration);

    const gridLines = [];
    for (let beat = 0; beat <= totalBeats; beat++) {
        const x = beat * pixelsPerBeat;
        const isMeasure = beat % beatsPerMeasure === 0;

        gridLines.push(
            <View
                key={`beat-${beat}`}
                style={[
                    styles.gridLine,
                    {
                        left: x,
                        backgroundColor: isMeasure ? '#444' : '#2a2a2a',
                        width: isMeasure ? 2 : 1,
                    }
                ]}
            />
        );
    }

    return (
        <View style={[styles.container, { pointerEvents: 'none' }]}>
            {gridLines}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    gridLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        height: '100%',
    },
});
