import React, { createContext, useState, useEffect, useContext } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabase';
import { getUserFriendlyErrorMessage } from '../utils/errorMessages';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('🔄 AuthProvider: Initializing...');
        // Check for active session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                console.log('✅ AuthProvider: Session retrieved', { hasSession: !!session });
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
                setError(null);
            })
            .catch((error) => {
                console.error('❌ AuthProvider: Error getting session:', error);
                setSession(null);
                setUser(null);
                setLoading(false);
                // Use user-friendly error message
                setError(getUserFriendlyErrorMessage(error));
            });

        // Listen for auth changes
        try {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                console.log('🔄 AuthProvider: Auth state changed', { event: _event, hasSession: !!session });
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            });

            return () => subscription.unsubscribe();
        } catch (error) {
            console.error('Error setting up auth listener:', error);
            // Use user-friendly error message
            setError(getUserFriendlyErrorMessage(error));
            setLoading(false);
        }
    }, []);

    const value = {
        user,
        session,
        loading,
        error,
        signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
        signUp: (email, password) => supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: Platform.OS === 'web'
                    ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081')
                    : 'solocraft://auth/callback'
            }
        }),
        resetPassword: async (email) => {
            return await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: Platform.OS === 'web'
                    ? (typeof window !== 'undefined' ? window.location.origin + '/reset-password' : 'http://localhost:8081/reset-password')
                    : 'solocraft://reset-password'
            });
        },
        signOut: () => supabase.auth.signOut(),
    };

    // FIXED: Always render children, don't hide them when loading
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
