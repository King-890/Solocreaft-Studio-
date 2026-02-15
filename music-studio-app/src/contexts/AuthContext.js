import React, { createContext, useState, useEffect, useContext } from "react";
import { Platform } from "react-native";
import { supabase } from "../services/supabase";
import { getUserFriendlyErrorMessage } from "../utils/errorMessages";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  // HARDCODED GUEST USER FOR AUTH REMOVAL
  const GUEST_USER = {
    id: "guest_user_id",
    email: "guest@solocraft.studio",
    user_metadata: { name: "Guest User" },
  };
  const GUEST_SESSION = {
    user: GUEST_USER,
    access_token: "guest_token",
  };

  const [user, setUser] = useState(GUEST_USER);
  const [session, setSession] = useState(GUEST_SESSION);
  const [loading, setLoading] = useState(false); // Set loading to false immediately
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔄 AuthProvider: Simplified for Guest Access");
    // We no longer need to check sessions or listen for auth changes
  }, []);

  const value = {
    user,
    session,
    loading,
    error,
    signIn: async () => ({
      data: { user: GUEST_USER, session: GUEST_SESSION },
      error: null,
    }),
    signUp: async () => ({
      data: { user: GUEST_USER, session: GUEST_SESSION },
      error: null,
    }),
    resetPassword: async () => ({ data: {}, error: null }),
    signOut: async () => {
      console.log("🚪 SignOut called - No-op in guest mode");
      return { error: null };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
