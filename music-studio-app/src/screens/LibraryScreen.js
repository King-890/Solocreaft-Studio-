import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RecordingsLibrary from '../components/RecordingsLibrary';
import { COLORS, SPACING } from '../constants/UIConfig';

export default function LibraryScreen() {
    const navigation = useNavigation();

    const handleNewProject = () => {
        navigation.navigate('Studio', { projectId: 'new' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header with music theme */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.musicNote}>🎼</Text>
                        <View>
                            <Text style={styles.title}>Your Library</Text>
                            <Text style={styles.subtitle}>Musical creations</Text>
                        </View>
                    </View>

                    {/* New Project Button */}
                    <TouchableOpacity
                        style={styles.newButton}
                        onPress={handleNewProject}
                    >
                        <Text style={styles.newButtonIcon}>+</Text>
                        <Text style={styles.newButtonText}>New</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Decorative wave line */}
            <View style={styles.waveLine} />

            {/* Recordings Section */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <RecordingsLibrary />

                {/* Bottom spacing */}
                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    musicNote: {
        fontSize: 40,
        marginRight: SPACING.md,
    },
    title: {
        color: COLORS.textGold,
        fontSize: 28,
        fontWeight: 'bold',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginTop: 2,
    },
    newButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    newButtonIcon: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 6,
    },
    newButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    waveLine: {
        height: 2,
        backgroundColor: COLORS.textGold,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        opacity: 0.3,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
});
