import React, { useState, useRef } from 'react';
import { TextInput, Animated, StyleSheet, Text, View } from 'react-native';
import UISounds from '../utils/UISounds';

export default function AnimatedInput({
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences'
}) {
    const [isFocused, setIsFocused] = useState(false);
    const focusAnim = useRef(new Animated.Value(0)).current;
    const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

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
            // Get the new character
            const newChar = text[text.length - 1];
            UISounds.playTypeForChar(newChar);
        }
        onChangeText(text);
    };

    const borderColor = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 1)'],
    });

    const shadowOpacity = focusAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.8],
    });

    const labelTop = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [18, -10],
    });

    const labelFontSize = labelAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [16, 12],
    });

    return (
        <View style={styles.container}>
            <Animated.Text
                style={[
                    styles.label,
                    {
                        top: labelTop,
                        fontSize: labelFontSize,
                        color: isFocused ? '#FFD700' : '#999',
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
                        shadowOpacity: shadowOpacity,
                    },
                ]}
            >
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={handleChangeText}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
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
        marginBottom: 25,
        position: 'relative',
    },
    label: {
        position: 'absolute',
        left: 15,
        backgroundColor: '#0a0014',
        paddingHorizontal: 5,
        zIndex: 1,
        fontWeight: '600',
    },
    inputContainer: {
        borderWidth: 2,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        elevation: 5,
    },
    input: {
        padding: 18,
        fontSize: 16,
        color: '#fff',
    },
});
