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
        left: 10,
        top: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [12, -8],
        }),
        fontSize: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [16, 12],
        }),
        color: animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['#aaa', '#007AFF'],
        }),
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 4,
    };

    return (
        <View style={[styles.container, style]}>
            <Animated.Text style={labelStyle}>
                {label}
            </Animated.Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder=""
                placeholderTextColor="#666"
                nativeID={id}
                name={name}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
        height: 56,
        justifyContent: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#444',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 16,
        color: 'white',
        backgroundColor: '#2a2a2a',
    },
});

export default EnhancedAnimatedInput;
