import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MixerModal from '../components/MixerModal';

export default function MixerScreen() {
    const navigation = useNavigation();

    const handleClose = () => {
        // Navigate back to Home screen
        navigation.navigate('Home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleClose}
                >
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Mixer Console</Text>
                <View style={styles.placeholder} />
            </View>
            <MixerModal visible={true} onClose={handleClose} fullScreen={true} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    backButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#03dac6',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    placeholder: {
        width: 50,
    },
});
