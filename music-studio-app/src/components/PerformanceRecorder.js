import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUserProgress } from '../contexts/UserProgressContext';

/**
 * PerformanceRecorder Component
 * 
 * Handles the recording flow for instrument performances:
 * 1. Count-in animation (3-2-1-Go!)
 * 2. Recording with visual feedback
 * 3. Auto-save to timeline
 * 4. XP rewards
 */
export default function PerformanceRecorder({
    instrumentName,
    onStartRecording,
    onStopRecording,
    isRecording = false,
}) {
    const [showCountIn, setShowCountIn] = useState(false);
    const [countInValue, setCountInValue] = useState(3);
    const [recordingDuration, setRecordingDuration] = useState(0);

    const { recordSongCreation, addInstrumentXP } = useUserProgress();

    // Animations
    const countInScale = useRef(new Animated.Value(0)).current;
    const recordPulse = useRef(new Animated.Value(1)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    // Recording timer
    const timerRef = useRef(null);

    // Count-in animation
    useEffect(() => {
        if (showCountIn) {
            Animated.sequence([
                Animated.spring(countInScale, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
                Animated.timing(countInScale, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [countInValue, showCountIn]);

    // Recording pulse animation
    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(recordPulse, {
                        toValue: 1.2,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(recordPulse, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            recordPulse.setValue(1);
        }
    }, [isRecording]);

    // Recording duration timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            setRecordingDuration(0);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isRecording]);

    const handleRecordPress = () => {
        if (isRecording) {
            // Stop recording
            onStopRecording();

            // Award XP based on recording duration
            const xpReward = Math.min(recordingDuration * 5, 200); // Max 200 XP
            addInstrumentXP(instrumentName, xpReward);

            // Record song creation
            const streak = recordSongCreation(instrumentName);

            // Show success feedback (could add a toast/modal here)
            console.log(`Recording saved! Streak: ${streak} days`);
        } else {
            // Start count-in
            setShowCountIn(true);
            setCountInValue(3);

            // Count down
            const countDownInterval = setInterval(() => {
                setCountInValue(prev => {
                    if (prev <= 1) {
                        clearInterval(countDownInterval);
                        setShowCountIn(false);
                        onStartRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Button press animation
    const handlePressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    return (
        <View style={styles.container}>
            {/* Count-in Overlay */}
            {showCountIn && (
                <View style={styles.countInOverlay}>
                    <Animated.View
                        style={[
                            styles.countInCircle,
                            {
                                transform: [{ scale: countInScale }],
                                opacity: countInScale,
                            }
                        ]}
                    >
                        <Text style={styles.countInNumber}>
                            {countInValue === 0 ? 'GO!' : countInValue}
                        </Text>
                    </Animated.View>
                </View>
            )}

            {/* Record Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    onPress={handleRecordPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    style={styles.recordButtonContainer}
                >
                    <LinearGradient
                        colors={isRecording ? ['#E74C3C', '#C0392B'] : ['#3498DB', '#2980B9']}
                        style={styles.recordButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Recording pulse indicator */}
                        {isRecording && (
                            <Animated.View
                                style={[
                                    styles.recordPulse,
                                    { transform: [{ scale: recordPulse }] }
                                ]}
                            />
                        )}

                        <View style={styles.recordButtonContent}>
                            <View style={[
                                styles.recordIcon,
                                isRecording && styles.recordIconActive
                            ]} />

                            <View style={styles.recordTextContainer}>
                                <Text style={styles.recordButtonText}>
                                    {isRecording ? 'Stop Recording' : 'Record Performance'}
                                </Text>

                                {isRecording && (
                                    <Text style={styles.recordDuration}>
                                        {formatDuration(recordingDuration)}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    countInOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    countInCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(52, 152, 219, 0.3)',
        borderWidth: 4,
        borderColor: '#3498DB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    countInNumber: {
        fontSize: 72,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'Orbitron-Medium',
    },
    recordButtonContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    recordButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 50,
        minWidth: 250,
    },
    recordPulse: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    recordButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#fff',
        marginRight: 12,
    },
    recordIconActive: {
        borderRadius: 4,
    },
    recordTextContainer: {
        alignItems: 'flex-start',
    },
    recordButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Montserrat-Bold',
    },
    recordDuration: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        fontFamily: 'Orbitron-Medium',
        marginTop: 2,
    },
});
