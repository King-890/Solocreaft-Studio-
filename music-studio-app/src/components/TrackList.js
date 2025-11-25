import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useProject } from '../contexts/ProjectContext';
import Track from './Track';

export default function TrackList() {
    const { tracks } = useProject();

    return (
        <ScrollView style={styles.container}>
            {tracks.map((track) => (
                <Track key={track.id} track={track} />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
