import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Get the appropriate redirect URL based on platform
    const getRedirectUrl = () => {
        if (Platform.OS === 'web') {
            // For web, use the current origin if available
            if (typeof window !== 'undefined' && window.location) {
                return window.location.origin;
            }
            return 'http://localhost:19006';
        }
        // For mobile, use the custom scheme from app.json
        return 'solocraft://';
    };

    const value = {
        user,
        session,
        loading,
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signUp: (email, password) => supabase.auth.signUp({ email, password }),
        signOut: () => supabase.auth.signOut(),
        signInWithGoogle: async () => {
            try {
                return await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: getRedirectUrl(),
                        skipBrowserRedirect: Platform.OS !== 'web',
                    }
                });
            } catch (error) {
                console.error('Google sign-in error:', error);
                return { error };
            }
        },
        signInWithFacebook: async () => {
            try {
                return await supabase.auth.signInWithOAuth({
                    provider: 'facebook',
                    options: {
                        redirectTo: getRedirectUrl(),
                        skipBrowserRedirect: Platform.OS !== 'web',
                    }
                });
            } catch (error) {
                console.error('Facebook sign-in error:', error);
                return { error };
            }
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
