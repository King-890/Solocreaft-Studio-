import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const GUEST_USER = {
    id: "guest_user_id",
    email: "guest@solocraft.studio",
    user_metadata: { name: "Guest User" },
  };
  const GUEST_SESSION = {
    user: GUEST_USER,
    access_token: "guest_token",
  };

  const value = {
    user: GUEST_USER,
    session: GUEST_SESSION,
    loading: false,
    error: null,
    signIn: async () => ({ data: { user: GUEST_USER, session: GUEST_SESSION }, error: null }),
    signUp: async () => ({ data: { user: GUEST_USER, session: GUEST_SESSION }, error: null }),
    resetPassword: async () => ({ data: {}, error: null }),
    signOut: async () => ({ error: null }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
