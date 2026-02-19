import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { errorMonitor } from '../services/ErrorMonitor';
import { useAuth } from '../contexts/AuthContext';

export default function DebugScreen({ navigation }) {
    const [errors, setErrors] = useState([]);
    const [storageStatus, setStorageStatus] = useState('Checking...');
    const [authStatus, setAuthStatus] = useState({});
    const auth = useAuth();

    useEffect(() => {
        // Subscribe to error updates
        const unsubscribe = errorMonitor.subscribe((error) => {
            setErrors(prev => [error, ...prev.slice(0, 9)]); // Keep last 10
        });

        // Load existing errors
        setErrors(errorMonitor.getRecentErrors(10));

        // Test Local Storage
        testStorage();

        // Get auth status
        setAuthStatus({
            loading: auth.loading,
            hasSession: !!auth.session,
            hasUser: !!auth.user,
            error: auth.error
        });

        return unsubscribe;
    }, [auth]);

    const testStorage = async () => {
        try {
            await AsyncStorage.setItem('debug_test', 'working');
            const val = await AsyncStorage.getItem('debug_test');
            if (val === 'working') {
                setStorageStatus('✅ Local Storage working perfectly');
            } else {
                setStorageStatus('❌ Local Storage read failed');
            }
        } catch (err) {
            setStorageStatus(`❌ Storage Exception: ${err.message}`);
        }
    };

    const testError = () => {
        errorMonitor.report(new Error('Test error from Debug Screen'), {
            type: 'TEST',
            source: 'DebugScreen'
        });
    };

    const clearErrors = () => {
        errorMonitor.clearErrors();
        setErrors([]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🎵 Music Studio Debug Screen</Text>
                <Text style={styles.subtitle}>If you see this, React Native is working!</Text>
            </View>

            {/* Storage Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Local Storage Status</Text>
                <Text style={styles.statusText}>{storageStatus}</Text>
                <TouchableOpacity style={styles.button} onPress={testStorage}>
                    <Text style={styles.buttonText}>Retest Storage</Text>
                </TouchableOpacity>
            </View>

            {/* Auth Status */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Auth Status</Text>
                <Text style={styles.infoText}>Loading: {authStatus.loading ? 'Yes' : 'No'}</Text>
                <Text style={styles.infoText}>Has Session: {authStatus.hasSession ? 'Yes' : 'No'}</Text>
                <Text style={styles.infoText}>Has User: {authStatus.hasUser ? 'Yes' : 'No'}</Text>
                {authStatus.error && (
                    <Text style={styles.errorText}>Error: {authStatus.error}</Text>
                )}
            </View>

            {/* Navigation Tests */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Navigation Tests</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>Go to Login</Text>
                    </TouchableOpacity>

                    {authStatus.hasSession && (
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => navigation.navigate('Main')}
                        >
                            <Text style={styles.buttonText}>Go to Main</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Error Testing */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Error Testing</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.button} onPress={testError}>
                        <Text style={styles.buttonText}>Generate Test Error</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={clearErrors}>
                        <Text style={styles.buttonText}>Clear Errors</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => console.log('Console test - working!')}
                    >
                        <Text style={styles.buttonText}>Test Console Log</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Errors */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Errors ({errors.length})</Text>
                {errors.length === 0 ? (
                    <Text style={styles.infoText}>No errors recorded</Text>
                ) : (
                    errors.map((error) => (
                        <View key={error.id} style={styles.errorCard}>
                            <Text style={styles.errorMessage}>{error.message}</Text>
                            <Text style={styles.errorTime}>
                                {new Date(error.timestamp).toLocaleTimeString()}
                            </Text>
                            {error.context && Object.keys(error.context).length > 0 && (
                                <Text style={styles.errorContext}>
                                    {JSON.stringify(error.context, null, 2)}
                                </Text>
                            )}
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
    },
    header: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#333',
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        color: '#ccc',
        fontSize: 16,
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    sectionTitle: {
        color: '#6200ee',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statusText: {
        color: 'white',
        fontSize: 14,
        marginBottom: 10,
    },
    infoText: {
        color: '#ccc',
        fontSize: 14,
        marginBottom: 5,
    },
    errorText: {
        color: '#ff4444',
        fontSize: 14,
        marginTop: 5,
    },
    buttonGroup: {
        gap: 10,
    },
    button: {
        backgroundColor: '#6200ee',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    errorCard: {
        backgroundColor: '#2a2a2a',
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#ff4444',
    },
    errorMessage: {
        color: '#ff6666',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    errorTime: {
        color: '#888',
        fontSize: 12,
        marginBottom: 5,
    },
    errorContext: {
        color: '#aaa',
        fontSize: 11,
        fontFamily: 'monospace',
    },
});
