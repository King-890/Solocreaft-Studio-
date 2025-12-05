import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Pressable,
    Dimensions,
    Platform,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import EnhancedAnimatedInput from '../components/EnhancedAnimatedInput';
import AnimatedMusicButton from '../components/AnimatedMusicButton';
import FloatingNotes from '../components/FloatingNotes';
import SocialAuthButton from '../components/SocialAuthButton';
import UISounds from '../utils/UISounds';
import UJLogo from '../components/UJLogo';

export default function SignupScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // COMMENTED OUT: OAuth functionality disabled
    // const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });
    const [errorMsg, setErrorMsg] = useState('');
    const { signUp } = useAuth(); // Removed: signInWithGoogle, signInWithFacebook

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(50)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;
    const titleAnim = useRef(new Animated.Value(20)).current;

    // Ripple effect state
    const [ripples, setRipples] = useState([]);

    useEffect(() => {
        UISounds.init();

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(formAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                delay: 300,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(logoAnim, {
                toValue: 1,
                tension: 20,
                friction: 7,
                delay: 150,
                useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.spring(titleAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
                delay: 200,
                useNativeDriver: Platform.OS !== 'web',
            }),
        ]).start();
    }, []);

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            setErrorMsg('Passwords do not match');
            UISounds.playError();
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await signUp(email, password);
            if (error) {
                setErrorMsg(error.message);
                UISounds.playError();
            } else {
                UISounds.playSuccess();
                // Show improved confirmation dialog
                const message = 'Account created successfully!\n\nPlease check your email inbox (and spam folder) for a verification link to activate your account.\n\nYou can close this page and click the link in your email to verify.';
                if (Platform.OS === 'web') {
                    window.alert(message);
                } else {
                    Alert.alert(
                        '✅ Success!',
                        message,
                        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
                    );
                }
                // Don't navigate immediately on web - let user read the message
                if (Platform.OS !== 'web') {
                    navigation.navigate('Login');
                }
            }
        } catch (err) {
            setErrorMsg(err.message);
            UISounds.playError();
        } finally {
            setLoading(false);
        }
    };

    // COMMENTED OUT: OAuth functionality disabled
    // const handleSocialSignup = async (provider) => {
    //     setSocialLoading({ ...socialLoading, [provider]: true });
    //     setErrorMsg('');
    //     try {
    //         const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
    //         const { error } = await signInMethod();
    //         if (error) {
    //             // Check if it's a provider not enabled error
    //             if (error.message?.includes('provider is not enabled') || error.error_code === 'validation_failed') {
    //                 const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    //                 setErrorMsg(`${providerName} signup is not configured yet. Please use email/password or contact support.`);
    //             } else {
    //                 setErrorMsg(error.message);
    //             }
    //             UISounds.playError();
    //         } else {
    //             UISounds.playSuccess();
    //         }
    //     } catch (err) {
    //         // Handle network or other errors
    //         if (err.message?.includes('provider is not enabled')) {
    //             const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    //             setErrorMsg(`${providerName} signup is not configured yet. Please use email/password or contact support.`);
    //         } else {
    //             setErrorMsg(err.message || 'Failed to sign up with ' + provider);
    //         }
    //         UISounds.playError();
    //     } finally {
    //         setSocialLoading({ ...socialLoading, [provider]: false });
    //     }
    // };

    const handleScreenTap = (event) => {
        const sounds = ['playBell', 'playWood', 'playMetal', 'playString', 'playWind'];
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        const randomFreq = 400 + Math.random() * 600;
        UISounds[randomSound](randomFreq, 100);

        if (event.nativeEvent) {
            const { locationX, locationY } = event.nativeEvent;
            const newRipple = {
                id: Date.now(),
                x: locationX,
                y: locationY,
                anim: new Animated.Value(0),
            };

            setRipples(prev => [...prev, newRipple]);

            Animated.timing(newRipple.anim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: Platform.OS !== 'web',
            }).start(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            });
        }
    };

    return (
        <Pressable onPress={handleScreenTap} style={styles.container}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0a0000', '#1a0505', '#0f0000', '#000000']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <FloatingNotes />

                    {ripples.map(ripple => (
                        <Animated.View
                            key={ripple.id}
                            style={[
                                styles.ripple,
                                {
                                    left: ripple.x - 50,
                                    top: ripple.y - 50,
                                    opacity: ripple.anim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.6, 0],
                                    }),
                                    transform: [{
                                        scale: ripple.anim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 3],
                                        }),
                                    }],
                                },
                            ]}
                        />
                    ))}

                    <Animated.View
                        style={[
                            styles.content,
                            { opacity: fadeAnim }
                        ]}
                    >
                        {/* UJ Logo */}
                        <Animated.View
                            style={[
                                styles.logoContainer,
                                {
                                    transform: [{ scale: logoAnim }],
                                }
                            ]}
                        >
                            <UJLogo size={90} showText={false} />
                        </Animated.View>

                        <Animated.View
                            style={{
                                transform: [{ translateY: titleAnim }],
                            }}
                        >
                            <Text style={styles.poeticPhrase}>
                                Two souls, one rhythm, infinite harmony
                            </Text>
                            <Text style={styles.subtitle}>Create Your Musical Journey</Text>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View
                            style={[
                                styles.formContainer,
                                {
                                    transform: [{ translateY: formAnim }],
                                },
                            ]}
                        >
                            <EnhancedAnimatedInput
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                useEnhancedSounds={true}
                                id="signup-email"
                                name="email"
                            />

                            <EnhancedAnimatedInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                useEnhancedSounds={true}
                                id="signup-password"
                                name="password"
                            />

                            <EnhancedAnimatedInput
                                label="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                useEnhancedSounds={true}
                                id="signup-confirm-password"
                                name="confirmPassword"
                            />

                            {errorMsg ? (
                                <Animated.View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
                                </Animated.View>
                            ) : null}

                            <AnimatedMusicButton
                                title="Create Account"
                                onPress={handleSignup}
                                disabled={loading}
                                loading={loading}
                            />

                            {/* COMMENTED OUT: OAuth functionality disabled */}
                            {/* Divider */}
                            {/* <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View> */}

                            {/* Social Signup Buttons - Side by Side */}
                            {/* <View style={styles.socialButtonsRow}>
                                <View style={styles.socialButtonHalf}>
                                    <SocialAuthButton
                                        provider="google"
                                        onPress={() => handleSocialSignup('google')}
                                        disabled={loading || socialLoading.google}
                                        loading={socialLoading.google}
                                    />
                                </View>
                                <View style={styles.socialButtonHalf}>
                                    <SocialAuthButton
                                        provider="facebook"
                                        onPress={() => handleSocialSignup('facebook')}
                                        disabled={loading || socialLoading.facebook}
                                        loading={socialLoading.facebook}
                                    />
                                </View>
                            </View> */}

                            <Pressable
                                onPress={() => {
                                    UISounds.playTap();
                                    if (navigation && navigation.navigate) {
                                        navigation.navigate('Login');
                                    }
                                }}
                            >
                                <View style={styles.loginContainer}>
                                    <Text style={styles.loginText}>
                                        Already have an account?{' '}
                                        <Text style={styles.loginLink}>Login</Text>
                                    </Text>
                                </View>
                            </Pressable>
                        </Animated.View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>© 2024 SoloCraft Studio. All rights reserved.</Text>
                            <Text style={styles.licenseText}>Licensed under MIT License</Text>
                        </View>
                    </Animated.View>
                </LinearGradient>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
        maxWidth: 400,
        alignSelf: 'center',
        width: '100%',
    },
    logoContainer: {
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    poeticPhrase: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFD700',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 2,
        fontStyle: 'italic',
        letterSpacing: 0.3,
        opacity: 0.85,
    },
    subtitle: {
        fontSize: 9,
        color: '#FF8C00',
        textAlign: 'center',
        marginBottom: 5,
        opacity: 0.75,
    },
    formContainer: {
        marginTop: 0,
        width: '100%', // Ensure form takes full width
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 6,
        padding: 6,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
    },
    errorText: {
        color: '#ff6b6b',
        textAlign: 'center',
        fontSize: 11,
    },
    loginContainer: {
        marginTop: 8,
        alignItems: 'center',
    },
    loginText: {
        color: '#999',
        fontSize: 11,
    },
    loginLink: {
        color: '#FF4500',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    footer: {
        position: 'absolute',
        bottom: 12,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#FFD700',
        fontSize: 9,
        opacity: 0.5,
        marginBottom: 2,
    },
    licenseText: {
        color: '#FF8C00',
        fontSize: 8,
        opacity: 0.45,
    },
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#FF4500',
        pointerEvents: 'none',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
    },
    dividerText: {
        color: '#FFD700',
        paddingHorizontal: 10,
        fontSize: 10,
        fontWeight: '600',
        opacity: 0.7,
    },
    socialButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 6,
    },
    socialButtonHalf: {
        flex: 1,
    },
});
