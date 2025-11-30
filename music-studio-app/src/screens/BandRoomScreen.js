import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BandRoomScreen() {
    return (
        <LinearGradient
            colors={['#0f0520', '#1a0a33', '#2d1b4e']}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>🎸 Band Room</Text>
                <Text style={styles.subtitle}>Collaborative Music Space</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Coming Soon!</Text>
                    <Text style={styles.infoText}>
                        The Band Room will allow you to collaborate with other musicians in real-time.
                    </Text>
                    <Text style={styles.infoText}>
                        Features in development:
                    </Text>
                    <View style={styles.featureList}>
                        <Text style={styles.featureItem}>• Virtual jam sessions</Text>
                        <Text style={styles.featureItem}>• Multi-track recording</Text>
                        <Text style={styles.featureItem}>• Real-time collaboration</Text>
                        <Text style={styles.featureItem}>• Instrument sharing</Text>
                    </View>
                </View>

                <View style={styles.placeholderBox}>
                    <Text style={styles.placeholderText}>🎵</Text>
                    <Text style={styles.placeholderSubtext}>
                        This feature is under construction
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#BA55D3',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#DDA0DD',
        marginBottom: 30,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    infoCard: {
        backgroundColor: 'rgba(186, 85, 211, 0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(186, 85, 211, 0.3)',
        width: '100%',
    },
    infoTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#BA55D3',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#DDA0DD',
        marginBottom: 10,
        lineHeight: 20,
    },
    featureList: {
        marginTop: 10,
    },
    featureItem: {
        fontSize: 14,
        color: '#DDA0DD',
        marginBottom: 5,
        paddingLeft: 10,
    },
    placeholderBox: {
        backgroundColor: 'rgba(186, 85, 211, 0.05)',
        borderRadius: 15,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'rgba(186, 85, 211, 0.2)',
        borderStyle: 'dashed',
        width: '100%',
    },
    placeholderText: {
        fontSize: 60,
        marginBottom: 10,
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#9370DB',
        textAlign: 'center',
    },
});
