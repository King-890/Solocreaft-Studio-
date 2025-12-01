import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Pressable,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import EnhancedAnimatedInput from '../components/EnhancedAnimatedInput';
import AnimatedMusicButton from '../components/AnimatedMusicButton';
import FloatingNotes from '../components/FloatingNotes';
import SocialAuthButton from '../components/SocialAuthButton';
import SoloCraftLogo from '../components/SoloCraftLogo';
import UISounds from '../utils/UISounds';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    // COMMENTED OUT: OAuth functionality disabled
    // const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });
    const [errorMsg, setErrorMsg] = useState('');
    const { signIn, resetPassword } = useAuth(); // Removed: signInWithGoogle, signInWithFacebook

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const titleAnim = useRef(new Animated.Value(-50)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(50)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;

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
            Animated.spring(titleAnim, {
                toValue: 0,
                tension: 20,
                friction: 7,
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
        ]).start();

        Animated.loop(
            Animated.timing(logoRotate, {
                toValue: 1,
                duration: 20000,
                useNativeDriver: Platform.OS !== 'web',
            })
        ).start();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await signIn(email, password);
            if (error) {
                setErrorMsg(getUserFriendlyErrorMessage(error));
                UISounds.playError();
            } else {
                UISounds.playSuccess();
            }
        } catch (err) {
            setErrorMsg(getUserFriendlyErrorMessage(err));
            UISounds.playError();
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setErrorMsg('Please enter your email address first');
            UISounds.playError();
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const { error } = await resetPassword(email);
            if (error) {
                setErrorMsg(getUserFriendlyErrorMessage(error));
                UISounds.playError();
            } else {
                setErrorMsg('✅ Password reset email sent! Check your inbox.');
                UISounds.playSuccess();
            }
        } catch (err) {
            setErrorMsg(getUserFriendlyErrorMessage(err));
            UISounds.playError();
        } finally {
            setLoading(false);
        }
    };

    // COMMENTED OUT: OAuth functionality disabled
    // const handleSocialLogin = async (provider) => {
    //     setSocialLoading({ ...socialLoading, [provider]: true });
    //     setErrorMsg('');
    //     try {
    //         const signInMethod = provider === 'google' ? signInWithGoogle : signInWithFacebook;
    //         const { error } = await signInMethod();
    //         if (error) {
    //             // Check if it's a provider not enabled error
    //             if (error.message?.includes('provider is not enabled') || error.error_code === 'validation_failed') {
    //                 const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
    //                 setErrorMsg(`${providerName} login is not configured yet. Please use email/password or contact support.`);
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
    //             setErrorMsg(`${providerName} login is not configured yet. Please use email/password or contact support.`);
    //         } else {
    //             setErrorMsg(err.message || 'Failed to sign in with ' + provider);
    //         }
    //         UISounds.playError();
    //     } finally {
    //         setSocialLoading({ ...socialLoading, [provider]: false });
    //     }
    // };

    const handleScreenTap = (event) => {
        UISounds.playTap();

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

    const spin = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Pressable onPress={handleScreenTap} style={{ flex: 1 }}>
            <View style={styles.container}>
                <LinearGradient
                    colors={['#0f0520', '#1a0a33', '#2d1b4e', '#0f0520']}
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
                        <Animated.View
                            style={[
                                styles.logoContainer,
                                {
                                    transform: [{ scale: logoAnim }],
                                }
                            ]}
                        >
                            <SoloCraftLogo size={100} showText={false} animated={true} />
                        </Animated.View>

                        <Animated.View
                            style={{
                                transform: [{ translateY: titleAnim }],
                            }}
                        >
                            <Text style={styles.title}>SoloCraft Studio</Text>
                            <Text style={styles.subtitle}>Where Creativity Meets Harmony</Text>
                        </Animated.View>

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
                                useEnhancedSounds={false}
                                id="login-email"
                                name="email"
                            />

                            <EnhancedAnimatedInput
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                autoCapitalize="none"
                                useEnhancedSounds={false}
                                id="login-password"
                                name="password"
                            />

                            <TouchableOpacity
                                onPress={handleForgotPassword}
                                disabled={loading}
                                activeOpacity={0.7}
                                style={styles.forgotPasswordButton}
                            >
                                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {errorMsg ? (
                                <Animated.View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{errorMsg.startsWith('✅') ? errorMsg : `⚠️ ${errorMsg}`}</Text>
                                </Animated.View>
                            ) : null}

                            <AnimatedMusicButton
                                title="Login"
                                onPress={handleLogin}
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

                            {/* Social Login Buttons - Side by Side */}
                            {/* <View style={styles.socialButtonsRow}>
                                <View style={styles.socialButtonHalf}>
                                    <SocialAuthButton
                                        provider="google"
                                        onPress={() => handleSocialLogin('google')}
                                        disabled={loading || socialLoading.google}
                                        loading={socialLoading.google}
                                    />
                                </View>
                                <View style={styles.socialButtonHalf}>
                                    <SocialAuthButton
                                        provider="facebook"
                                        onPress={() => handleSocialLogin('facebook')}
                                        disabled={loading || socialLoading.facebook}
                                        loading={socialLoading.facebook}
                                    />
                                </View>
                            </View> */}

                            <TouchableOpacity
                                onPress={() => {
                                    UISounds.playTap();
                                    if (navigation && navigation.navigate) {
                                        navigation.navigate('Signup');
                                    }
                                }}
                                activeOpacity={0.7}
                                style={styles.signupContainer}
                            >
                                <Text style={styles.signupText}>
                                    Don't have an account?{' '}
                                    <Text style={styles.signupLink}>Sign up</Text>
                                </Text>
                            </TouchableOpacity>
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
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#BA55D3',
        pointerEvents: 'none',
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
        marginBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#BA55D3',
        textAlign: 'center',
        marginBottom: 4,
        letterSpacing: 1.2,
    },
    subtitle: {
        fontSize: 12,
        color: '#DDA0DD',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    formContainer: {
        marginTop: 5,
        width: '100%', // Ensure form takes full width
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 6,
        padding: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
    },
    errorText: {
        color: '#ff6b6b',
        textAlign: 'center',
        fontSize: 12,
    },
    signupContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    signupText: {
        color: '#999',
        fontSize: 13,
    },
    signupLink: {
        color: '#BA55D3',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginTop: 8,
        marginBottom: 12,
    },
    forgotPasswordText: {
        color: '#BA55D3',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    decorativeContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 50,
    },
    decorativeNote: {
        fontSize: 30,
        color: 'rgba(186, 85, 211, 0.3)',
    },
    footer: {
        position: 'absolute',
        bottom: 15,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    footerText: {
        color: '#BA55D3',
        fontSize: 10,
        opacity: 0.6,
        marginBottom: 2,
    },
    licenseText: {
        color: '#9370DB',
        fontSize: 9,
        opacity: 0.5,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(186, 85, 211, 0.3)',
    },
    dividerText: {
        color: '#BA55D3',
        paddingHorizontal: 12,
        fontSize: 11,
        fontWeight: '600',
        opacity: 0.7,
    },
    socialButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 8,
    },
    socialButtonHalf: {
        flex: 1,
    },
});
