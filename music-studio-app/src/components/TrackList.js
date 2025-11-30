import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import Track from './Track';

const PIXELS_PER_SECOND = 50;
const TRACK_HEADER_WIDTH = 150;

export default function TrackList() {
    const { tracks, tempo, zoomLevel, getProjectDuration } = useProject();

    const pixelsPerSecond = PIXELS_PER_SECOND * zoomLevel;
    const projectDuration = getProjectDuration();
    const timelineWidth = Math.max((projectDuration / 1000) * pixelsPerSecond, 3000);

    return (
        <View style={styles.container}>
            {tracks.map((track) => (
                <Track
                    key={track.id}
                    track={track}
                    zoomLevel={zoomLevel}
                    pixelsPerSecond={pixelsPerSecond}
                    timelineWidth={timelineWidth}
                    headerWidth={TRACK_HEADER_WIDTH}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
