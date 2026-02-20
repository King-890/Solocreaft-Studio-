import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, SCREEN_WIDTH } from '../utils/responsive';

const STRINGS = ['G', 'D', 'A', 'E'];
const NOTE_MAP = ['G2', 'D2', 'A1', 'E1']; // Lower octave for orchestral strings

export default function OrchestralStrings({ instrument = 'cello' }) {
    const [activeStrings, setActiveStrings] = useState([false, false, false, false]);
    const stringAnims = useRef(STRINGS.map(() => new Animated.Value(0))).current;
    const timeoutsRef = useRef({});

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(clearTimeout);
        };
    }, []);

    const pluckString = useCallback((index) => {
        UnifiedAudioEngine.activateAudio();
        const note = NOTE_MAP[index];
        UnifiedAudioEngine.playSound(note, instrument, 0, 0.7);
        
        setActiveStrings(prev => {
            const next = [...prev];
            next[index] = true;
            return next;
        });

        Animated.sequence([
            Animated.timing(stringAnims[index], {
                toValue: 4,
                duration: 80,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(stringAnims[index], {
                toValue: -4,
                duration: 80,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(stringAnims[index], {
                toValue: 0,
                friction: 2,
                useNativeDriver: Platform.OS !== 'web',
            })
        ]).start();

        if (timeoutsRef.current[index]) clearTimeout(timeoutsRef.current[index]);
        timeoutsRef.current[index] = setTimeout(() => {
            setActiveStrings(prev => {
                const next = [...prev];
                next[index] = false;
                return next;
            });
            delete timeoutsRef.current[index];
        }, 500);
    }, [instrument]);

    return (
        <LinearGradient
            colors={['#1a0d06', '#2a1810', '#1a0d06']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.title}>MAJESTIC SYMPHONY</Text>
                <Text style={styles.subtitle}>CONCERT {instrument.toUpperCase()} PRO</Text>
            </View>

            <View style={styles.orchestraBody}>
                {/* Large Wooden Fretless Board */}
                <View style={styles.fingerboardOuter}>
                    <LinearGradient
                        colors={['#000', '#1a1a1a', '#000']}
                        style={styles.fingerboard}
                    />
                    
                    {/* Strings */}
                    <View style={styles.stringsOverlay}>
                        {STRINGS.map((label, i) => (
                            <View key={i} style={styles.stringWrapper}>
                                <Animated.View 
                                    style={[
                                        styles.stringLine,
                                        { 
                                            transform: [{ translateX: stringAnims[i] }],
                                            backgroundColor: activeStrings[i] ? '#fff' : '#bdbdbd',
                                            opacity: activeStrings[i] ? 1 : 0.6,
                                            width: 2 + (i * 0.5)
                                        }
                                    ]}
                                />
                                <TouchableOpacity
                                    style={styles.hotZone}
                                    onPress={() => pluckString(i)}
                                    activeOpacity={1}
                                    accessible={true}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${instrument} string ${STRINGS[i]}`}
                                    accessibilityHint={`Plays the ${NOTE_MAP[i]} note`}
                                />
                            </View>
                        ))}
                    </View>

                    {/* F-Holes Decoration */}
                    <View style={[styles.fHole, styles.fHoleLeft]} />
                    <View style={[styles.fHole, styles.fHoleRight]} />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.instruction}>Draw the bow or pluck the heavy strings for deep resonance</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: sc(40),
        margin: sc(5),
        padding: sc(20),
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.9 }),
    },
    header: {
        alignItems: 'center',
        marginBottom: sc(20),
    },
    title: {
        color: '#d4af37',
        fontSize: normalize(16),
        fontWeight: '900',
        letterSpacing: 4,
    },
    subtitle: {
        color: '#6d4c41',
        fontSize: normalize(10),
        fontWeight: 'bold',
        marginTop: sc(4),
        letterSpacing: 2,
    },
    orchestraBody: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fingerboardOuter: {
        width: sc(320),
        height: '100%',
        backgroundColor: '#3e2723',
        borderRadius: sc(30),
        overflow: 'hidden',
        position: 'relative',
        ...createShadow({ color: '#000', radius: sc(20), offsetY: 15, opacity: 0.7 }),
    },
    fingerboard: {
        position: 'absolute',
        top: 0,
        left: '25%',
        right: '25%',
        height: '100%',
        zIndex: 5,
    },
    stringsOverlay: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        zIndex: 10,
        paddingHorizontal: sc(100),
    },
    stringWrapper: {
        width: sc(40),
        height: '100%',
        alignItems: 'center',
    },
    stringLine: {
        height: '100%',
        backgroundColor: '#bdbdbd',
        ...createShadow({ color: '#000', radius: sc(4), opacity: 0.8 }),
    },
    hotZone: {
        position: 'absolute',
        width: sc(50),
        height: '100%',
    },
    fHole: {
        position: 'absolute',
        top: '40%',
        width: sc(40),
        height: sc(120),
        backgroundColor: 'rgba(0,0,0,0.8)',
        borderRadius: sc(20),
        zIndex: 2,
    },
    fHoleLeft: {
        left: sc(20),
        transform: [{ rotate: '5deg' }],
    },
    fHoleRight: {
        right: sc(20),
        transform: [{ rotate: '-5deg' }],
    },
    footer: {
        alignItems: 'center',
        marginTop: sc(20),
    },
    instruction: {
        color: '#795548',
        fontSize: normalize(11),
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
});
