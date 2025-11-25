import React from 'react';
import { View, StyleSheet } from 'react-native';
import ThreeScene from '../components/ThreeScene';

// Placeholder instrument models array; can be populated with actual model data later
const instrumentModels = [];

export default function BandRoomScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <ThreeScene instrumentModels={instrumentModels} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});
