import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, PanResponder } from 'react-native';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, LinearGradient as SvgLinearGradient, Stop, Path, Circle, Rect, Line, Ellipse } from 'react-native-svg';
import UnifiedAudioEngine from '../services/UnifiedAudioEngine';
import { createShadow, createTextShadow } from '../utils/shadows';
import { sc, normalize, useResponsive } from '../utils/responsive';
import HapticService from '../services/HapticService';
import GuitarString from './GuitarString';
import { GUITAR_CHORDS, STRING_COLORS, STRING_THICKNESS } from '../utils/GuitarVoicings';
import InstrumentContainer from './InstrumentContainer';

const CHORDS = ['C', 'G', 'D', 'A', 'E', 'Am', 'Em', 'Dm'];
const STRING_Y_POSITIONS = [160, 216, 272, 328, 384, 440];

export default function AcousticGuitar({ instrument = 'guitar' }) {
    const { isPhone, isLandscape, SCREEN_HEIGHT, SAFE_TOP, SAFE_BOTTOM } = useResponsive();
    
    const [selectedChord, setSelectedChord] = useState('C');
    const selectedChordRef = useRef('C');
    const [activeStrings, setActiveStrings] = useState(new Array(6).fill(false));
    const touchedStrings = useRef(new Set());
    const timeoutsRef = useRef({});
    
    const [frameHeight, setFrameHeight] = useState(SCREEN_HEIGHT * 0.8);

    useEffect(() => {
        selectedChordRef.current = selectedChord;
    }, [selectedChord]);

    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(id => clearTimeout(id));
        };
    }, []);

    const playString = useCallback((index, velocity = 0.5) => {
        const currentChord = selectedChordRef.current;
        const notes = GUITAR_CHORDS[currentChord];
        const note = notes[index];
        
        if (note) {
            UnifiedAudioEngine.playSound(note, instrument, 0, velocity);
            HapticService.light();
            setActiveStrings(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            
            if (timeoutsRef.current[index]) {
                clearTimeout(timeoutsRef.current[index]);
            }

            timeoutsRef.current[index] = setTimeout(() => {
                setActiveStrings(prev => {
                    const next = [...prev];
                    next[index] = false;
                    return next;
                });
                delete timeoutsRef.current[index];
            }, 100);
        }
    }, [instrument]);

    const processTouch = useCallback((y, velocity = 0.5) => {
        if (!frameHeight) return;
        const virtualY = (y / frameHeight) * 600;
        
        let closestIndex = -1;
        let minDistance = 1000;
        STRING_Y_POSITIONS.forEach((sy, i) => {
            const dist = Math.abs(virtualY - sy);
            if (dist < minDistance && dist < 40) {
                closestIndex = i;
                minDistance = dist;
            }
        });

        if (closestIndex !== -1 && !touchedStrings.current.has(closestIndex)) {
            touchedStrings.current.add(closestIndex);
            const v = Math.min(Math.max(Math.abs(velocity) * 1.5, 0.4), 1.0);
            playString(closestIndex, v);
        }
    }, [playString, frameHeight]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                UnifiedAudioEngine.activateAudio();
                touchedStrings.current.clear();
                processTouch(evt.nativeEvent.locationY);
            },
            onPanResponderMove: (evt, gestureState) => {
                processTouch(evt.nativeEvent.locationY, gestureState.vy);
            },
            onPanResponderRelease: () => {
                touchedStrings.current.clear();
            }
        })
    ).current;

    const isStackView = isPhone && !isLandscape;

    return (
        <InstrumentContainer>
            <ExpoGradient 
                colors={['#050201', '#140804', '#050201']} 
                style={[styles.container, isStackView && { flexDirection: 'column' }, { paddingTop: SAFE_TOP }]}
            >
                {/* Chord Selection Bar */}
                <View style={[styles.sidebar, isStackView && { width: '100%', height: sc(80), borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
                    {!isPhone && <Text style={styles.sidebarHeader}>CHORD BANK</Text>}
                    <View style={[styles.chordGrid, isStackView && { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }]}>
                        {CHORDS.map((chord) => (
                            <TouchableOpacity
                                key={chord}
                                style={[styles.chordButton, selectedChord === chord && styles.chordButtonActive, isStackView && { width: sc(60), height: sc(32) }]}
                                onPress={() => {
                                    setSelectedChord(chord);
                                    HapticService.selection();
                                }}
                                activeOpacity={0.8}
                            >
                                <ExpoGradient
                                    colors={selectedChord === chord ? ['rgba(251, 191, 36, 0.4)', 'rgba(217, 119, 6, 0.1)'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
                                    start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                                    style={styles.chordGradient}
                                />
                                <Text style={[styles.chordText, selectedChord === chord && styles.chordTextActive, isStackView && { fontSize: normalize(12), lineHeight: sc(28) }]}>{chord}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* SVG Photorealistic Guitar Layout */}
                <View 
                    style={styles.guitarFrame} 
                    onLayout={(e) => setFrameHeight(e.nativeEvent.layout.height)}
                >
                    <Svg width="100%" height="100%" viewBox="0 0 1000 600" preserveAspectRatio="none">
                        <Defs>
                            <RadialGradient id="bodyFinish" cx="55%" cy="50%" rx="55%" ry="50%">
                                <Stop offset="0%" stopColor="#d97706" />
                                <Stop offset="30%" stopColor="#b45309" />
                                <Stop offset="70%" stopColor="#78350f" />
                                <Stop offset="100%" stopColor="#2e1106" />
                            </RadialGradient>

                            <SvgLinearGradient id="rosewood" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor="#1a0d08" />
                                <Stop offset="30%" stopColor="#2e160d" />
                                <Stop offset="70%" stopColor="#241009" />
                                <Stop offset="100%" stopColor="#140603" />
                            </SvgLinearGradient>

                            <SvgLinearGradient id="ebony" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor="#1f1f1f" />
                                <Stop offset="100%" stopColor="#050505" />
                            </SvgLinearGradient>

                            <SvgLinearGradient id="fretWire" x1="0" y1="0" x2="1" y2="0">
                                <Stop offset="0%" stopColor="#8c8c8c" />
                                <Stop offset="40%" stopColor="#ffffff" />
                                <Stop offset="100%" stopColor="#4d4d4d" />
                            </SvgLinearGradient>

                            <RadialGradient id="holeDepth" cx="48%" cy="52%" rx="50%" ry="50%">
                                <Stop offset="75%" stopColor="#000000" />
                                <Stop offset="95%" stopColor="#1a0802" />
                                <Stop offset="100%" stopColor="#3d1405" />
                            </RadialGradient>

                            <SvgLinearGradient id="bone" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor="#ffffff" />
                                <Stop offset="50%" stopColor="#e5e7eb" />
                                <Stop offset="100%" stopColor="#d1d5db" />
                            </SvgLinearGradient>

                            <SvgLinearGradient id="pickguard" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0%" stopColor="#1c0700" />
                                <Stop offset="50%" stopColor="#3d1406" />
                                <Stop offset="100%" stopColor="#0f0300" />
                            </SvgLinearGradient>
                        </Defs>
                        
                        {/* 1. Body */}
                        <Ellipse cx="750" cy="300" rx="580" ry="430" fill="url(#bodyFinish)" stroke="#1a0500" strokeWidth="8" />
                        <Ellipse cx="750" cy="300" rx="570" ry="420" fill="none" stroke="#fefce8" strokeWidth="3" opacity="0.8" />
                        <Ellipse cx="750" cy="300" rx="566" ry="416" fill="none" stroke="#2e1106" strokeWidth="1" opacity="0.6" />
                        
                        {/* Body Glare */}
                        <Path d="M 500 10 C 780 -80 970 20 970 300 C 970 400 900 480 750 500 C 850 400 850 150 600 80 C 450 40 350 150 250 200 C 250 180 300 120 500 10 Z" fill="rgba(255,255,255,0.06)" />

                        {/* Pickguard */}
                        <Path d="M 550 450 C 650 450 780 480 800 580 C 800 650 750 650 650 650 C 580 650 500 560 550 450 Z" fill="url(#pickguard)" />

                        {/* 2. Soundhole & Rosette */}
                        <Circle cx="550" cy="300" r="165" fill="none" stroke="#451a03" strokeWidth="2" />
                        <Circle cx="550" cy="300" r="156" fill="none" stroke="#eab308" strokeWidth="10" strokeDasharray="3 2" />
                        <Circle cx="550" cy="300" r="156" fill="none" stroke="#b45309" strokeWidth="4" strokeDasharray="1 4" />
                        <Circle cx="550" cy="300" r="148" fill="none" stroke="#fefce8" strokeWidth="2" opacity="0.6" />
                        <Circle cx="550" cy="300" r="144" fill="none" stroke="#2e1106" strokeWidth="4" />
                        <Circle cx="550" cy="300" r="140" fill="url(#holeDepth)" />
                        <Circle cx="548" cy="302" r="140" fill="none" stroke="#000" strokeWidth="4" />

                        {/* 3. Neck & Fretboard */}
                        {/* Fretboard Drop shadow */}
                        <Path d="M -50 142 L 522 142 A 163 163 0 0 0 522 462 L -50 462 Z" fill="rgba(0,0,0,0.6)" />
                        {/* Wood perfectly gripping the soundhole */}
                        <Path d="M -50 140 L 520 140 A 163 163 0 0 0 520 460 L -50 460 Z" fill="url(#rosewood)" stroke="#0a0502" strokeWidth="2" />

                        {/* Frets with Pearl Inlays */}
                        {[40, 160, 260, 340, 410, 465].map((fx, i) => (
                            <React.Fragment key={`fret-${i}`}>
                                <Rect x={fx + 2} y="140" width="4" height="320" fill="rgba(0,0,0,0.8)" />
                                <Rect x={fx} y="140" width="3" height="320" fill="url(#fretWire)" />
                                {(i === 1 || i === 2 || i === 3) && (
                                    <Circle cx={fx - 50} cy="300" r="8" fill="url(#bone)" opacity="0.8" />
                                )}
                            </React.Fragment>
                        ))}

                        {/* 4. Bridge */}
                        <Path d="M 825 105 C 800 200 800 400 825 495 C 850 505 870 475 870 435 C 890 375 890 225 870 165 C 870 125 850 95 825 105 Z" fill="rgba(0,0,0,0.7)" transform="translate(4,4)" />
                        <Path d="M 825 105 C 800 200 800 400 825 495 C 850 505 870 475 870 435 C 890 375 890 225 870 165 C 870 125 850 95 825 105 Z" fill="url(#ebony)" stroke="#111" strokeWidth="2" />
                        
                        {/* Saddle */}
                        <Rect x="838" y="130" width="6" height="340" rx="3" ry="3" fill="rgba(0,0,0,0.9)" transform="rotate(-1.5, 838, 130)" />
                        <Rect x="835" y="130" width="6" height="340" rx="3" ry="3" fill="url(#bone)" transform="rotate(-1.5, 835, 130)" />

                        {/* Bridge Pins (Anchoring to exactly STRING_Y_POSITIONS) */}
                        {STRING_Y_POSITIONS.map((sy, i) => (
                            <React.Fragment key={`pin-${i}`}>
                                <Circle cx="866" cy={sy + 2} r="9" fill="rgba(0,0,0,0.8)" />
                                <Circle cx="865" cy={sy} r="7" fill="#e5e7eb" />
                                <Circle cx="865" cy={sy} r="6" fill="#fcfcfc" />
                                <Circle cx="865" cy={sy} r="2.5" fill="#000" />
                            </React.Fragment>
                        ))}

                        {/* 5. String Tails (Saddle to Pin) */}
                        {STRING_Y_POSITIONS.map((sy, i) => {
                            const saddleSlantX = 835 + (i * 1.5); 
                            return (
                                <Line 
                                    key={`tail-${i}`}
                                    x1={saddleSlantX} y1={sy} 
                                    x2="865" y2={sy} 
                                    stroke={i < 3 ? '#b87333' : '#d1d5db'} 
                                    strokeWidth={STRING_THICKNESS[i]} 
                                />
                            );
                        })}
                    </Svg>

                    {/* Interactive overlay for Vibrating Strings */}
                    <View 
                        style={StyleSheet.absoluteFillObject}
                        {...panResponder.panHandlers}
                    >
                        {STRING_Y_POSITIONS.map((yPos, i) => {
                            // Calculates exact saddle slant offset dynamically
                            const saddleSlantXOffset = 83.5 + (i * 0.15); 
                            return (
                                <GuitarString
                                    key={`str-${i}`}
                                    thickness={STRING_THICKNESS[i]}
                                    color={STRING_COLORS[i]}
                                    active={activeStrings[i]}
                                    vibrationScale={6.0}
                                    style={{ 
                                        position: 'absolute', 
                                        top: `${(yPos / 600) * 100}%`,
                                        left: '-5%', 
                                        width: `${saddleSlantXOffset + 5}%`, // Spans exactly from far left up to the slanted saddle
                                        marginTop: -(STRING_THICKNESS[i] / 2)
                                    }}
                                />
                            );
                        })}
                    </View>
                </View>

                {/* Overlaid UI Footer */}
                <View style={[styles.footer, { bottom: SAFE_BOTTOM + sc(15) }]}>
                    <Text style={styles.footerLabel}>SWIPE THE STRINGS • ULTRA REALISTIC STUDIO EDITION</Text>
                </View>
            </ExpoGradient>
        </InstrumentContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        borderRadius: sc(40),
        margin: sc(5),
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        ...createShadow({ color: '#000', radius: sc(40), opacity: 0.9, offsetY: sc(20) }),
    },
    sidebar: {
        width: sc(120),
        backgroundColor: 'rgba(15, 6, 4, 0.7)',
        padding: sc(15),
        zIndex: 30,
        borderTopLeftRadius: sc(40),
        borderBottomLeftRadius: sc(40),
        borderRightWidth: 1,
        borderRightColor: 'rgba(255,255,255,0.05)',
    },
    sidebarHeader: {
        color: '#fbbf24',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2.5,
        marginBottom: sc(20),
        textAlign: 'center',
        opacity: 0.8,
        ...createTextShadow({ color: 'rgba(251, 191, 36, 0.3)', radius: sc(4) }),
    },
    chordGrid: {
        flex: 1,
        gap: sc(12),
    },
    chordButton: {
        height: sc(42),
        borderRadius: sc(12),
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(0,0,0,0.6)',
        ...createShadow({ color: '#000', radius: sc(6), offsetY: sc(3), opacity: 0.6 }),
    },
    chordButtonActive: {
        borderColor: 'rgba(251, 191, 36, 1)',
        ...createShadow({ color: '#fbbf24', radius: sc(15), opacity: 0.75 }),
        transform: [{ scale: 1.05 }],
    },
    chordGradient: { ...StyleSheet.absoluteFillObject },
    chordText: {
        color: '#e5e7eb',
        fontSize: normalize(15),
        fontWeight: '900',
        textAlign: 'center',
        lineHeight: sc(38),
        fontFamily: 'Montserrat-Bold',
    },
    chordTextActive: { 
        color: '#fbbf24',
        ...createTextShadow({ color: '#fbbf24', radius: sc(10) }),
    },
    guitarFrame: {
        flex: 1,
        position: 'relative',
        borderTopRightRadius: sc(40),
        borderBottomRightRadius: sc(40),
        overflow: 'hidden',
    },
    footer: {
        position: 'absolute',
        bottom: sc(20),
        right: sc(30),
        pointerEvents: 'none',
    },
    footerLabel: {
        color: '#fbbf24',
        fontSize: normalize(8),
        fontWeight: '900',
        letterSpacing: 2.5,
        opacity: 0.85,
        ...createTextShadow({ color: 'rgba(0,0,0,0.95)', radius: sc(3) }),
    },
});
