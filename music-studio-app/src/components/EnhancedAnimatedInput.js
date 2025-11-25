import React, { useState, useRef } from 'react';
import { TextInput, Animated, StyleSheet, Text, View } from 'react-native';
import UISounds from '../utils/UISounds';

export default function EnhancedAnimatedInput({
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    useEnhancedSounds = false
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [floatingNotes, setFloatingNotes] = useState([]);
    const focusAnim = useRef(new Animated.Value(0)).current;
    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
    const inputRef = useRef(null);

    const handleFocus = () => {
        setIsFocused(true);
        UISounds.playFocus();

        Animated.parallel([
            Animated.timing(focusAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }),
            Animated.timing(labelAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false,
            }),
        ]).start();
    };

    const handleBlur = () => {
        setIsFocused(false);

        Animated.timing(focusAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start();

        if (!value) {
            Animated.timing(labelAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    };

    const handleChangeText = (text) => {
        if (text.length > value.length) {
            const newChar = text[text.length - 1];
            if (useEnhancedSounds) {
                UISounds.playKeySound(newChar, newChar.charCodeAt(0));
            } else {
                UISounds.playTypeForChar(newChar);
            }

            // Simplified animation - faster
            Animated.timing(focusAnim, {
                toValue: 1.1,
                duration: 80,
                useNativeDriver: false,
            }).start(() => {
                Animated.timing(focusAnim, {
                    toValue: 1,
                    duration: 80,
                    useNativeDriver: false,
                }).start();
            });

            // Limit floating notes to 3 max for performance
            if (floatingNotes.length < 3) {
                const notes = ['♪', '♫'];
                const colors = ['#FF4444', '#FFD700'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];

                const rotationAnim = new Animated.Value(0);
                const newNote = {
                    id: Date.now() + Math.random(),
                    note: randomNote,
                    color: randomColor,
                    anim: new Animated.Value(0),
                    rotation: rotationAnim,
                    x: Math.random() * 80,
                };

                setFloatingNotes(prev => [...prev, newNote]);

                Animated.parallel([
                    Animated.timing(newNote.anim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotationAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    setFloatingNotes(prev => prev.filter(n => n.id !== newNote.id));
                });
            }
        }
        onChangeText(text);
    };

    const handleKeyPress = (e) => {
        if (useEnhancedSounds && e.nativeEvent) {
            const key = e.nativeEvent.key;
            const keyCode = e.nativeEvent.keyCode || key.charCodeAt(0);

            if (['Backspace', 'Delete', 'Enter', 'Tab', 'Escape'].includes(key)) {
                UISounds.playKeySound(key, keyCode);
            }
        }
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1, 1.3],
        outputRange: useEnhancedSounds
            ? [
                'rgba(255, 68, 68, 0.5)',
                'rgba(255, 140, 0, 1)',
                'rgba(255, 215, 0, 1)'
            ]
            : [
                'rgba(65, 105, 225, 0.5)',
                'rgba(138, 43, 226, 1)',
                'rgba(186, 85, 211, 1)'
            ],
    });

    const shadowOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    const labelTop = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, -8],
    });

    const labelFontSize = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 11],
    });

    const labelColor = useEnhancedSounds ? '#FF8C00' : '#BA55D3';
    const shadowColor = useEnhancedSounds ? '#FFD700' : '#9370DB';

    return (
        <View style={styles.container}>
            {/* Floating musical notes */}
            {floatingNotes.map(noteObj => (
                <Animated.Text
                    key={noteObj.id}
                    style={[
                        styles.floatingNote,
                        {
                            left: `${noteObj.x}%`,
                            color: noteObj.color,
                            opacity: noteObj.anim.interpolate({
                                inputRange: [0, 0.3, 1],
                                outputRange: [1, 1, 0],
                            }),
                            transform: [
                                {
                                    translateY: noteObj.anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -80],
                                    }),
                                },
                                {
                                    translateX: noteObj.anim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0, 20, -10],
                                    }),
                                },
                                {
                                    scale: noteObj.anim.interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [0.3, 1.5, 0.8],
                                    }),
                                },
                                {
                                    rotate: noteObj.rotation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: ['0deg', '360deg'],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {noteObj.note}
                </Animated.Text>
            ))}

            <Animated.Text
                style={[
                    styles.label,
                    {
                        top: labelTop,
                        fontSize: labelFontSize,
                        color: isFocused ? labelColor : '#999',
                    },
                ]}
            >
                {label}
            </Animated.Text>
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        borderColor: borderColor,
                        shadowColor: shadowColor,
                        shadowOpacity: shadowOpacity,
                    },
                ]}
            >
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyPress={handleKeyPress}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    placeholderTextColor="transparent"
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        position: 'relative',
        overflow: 'visible',
    },
    floatingNote: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        zIndex: 10,
        top: 12,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    label: {
        position: 'absolute',
        left: 12,
        backgroundColor: 'rgba(10, 0, 20, 0.9)',
        paddingHorizontal: 5,
        paddingVertical: 1,
        zIndex: 1,
        fontWeight: '700',
        borderRadius: 3,
        fontSize: 11,
    },
    inputContainer: {
        borderWidth: 2,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 10,
        elevation: 6,
    },
    input: {
        padding: 11,
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
});
