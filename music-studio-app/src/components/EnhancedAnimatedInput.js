// src/components/EnhancedAnimatedInput.js - FIXED VERSION (Web Compatible)
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, Animated, StyleSheet } from 'react-native';

const EnhancedAnimatedInput = ({
    label,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'none',
    style = {},
    id,
    name,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isFocused || value ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused, value]);

    const labelStyle = {
        position: 'absolute',
        left: 12,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [14, 4], // Keep inside the box
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 11],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(255, 255, 255, 0.6)', '#BA55D3'], // Higher contrast
        }),
        backgroundColor: 'transparent', // Transparent to work with gradients
        zIndex: 1,
    };

    return (
        <View style={[styles.container, style]}>
            <Animated.Text style={[labelStyle, { pointerEvents: 'none' }]}>
                {label}
            </Animated.Text>
            <TextInput
                style={[
                    styles.input,
                    { borderColor: isFocused ? '#BA55D3' : 'rgba(255, 255, 255, 0.3)' }
                ]}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=""
                placeholderTextColor="transparent"
                nativeID={id}
                name={name}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
        height: 56,
        justifyContent: 'center',
        width: '100%',
    },
    input: {
        height: 56,
        borderWidth: 1.5,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingTop: 18, // Make room for label
        paddingBottom: 4,
        fontSize: 16,
        color: '#FFFFFF',
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker semi-transparent background
        width: '100%',
    },
});

export default EnhancedAnimatedInput;
