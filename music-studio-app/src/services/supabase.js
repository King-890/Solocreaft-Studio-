import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Import AsyncStorage only for native platforms
let AsyncStorage;
try {
  if (Platform.OS !== 'web') {
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
    // Import polyfill for native platforms
    require('react-native-url-polyfill/auto');
  }
} catch (error) {
  console.error('Failed to load AsyncStorage or URL polyfill:', error);
}

// Import error monitor (lazy to avoid circular dependencies)
let errorMonitor;
try {
  errorMonitor = require('./ErrorMonitor').errorMonitor;
} catch (err) {
  console.warn('ErrorMonitor not available:', err);
}

// Supabase configuration
const SUPABASE_URL = 'https://urmmuuceqaybbhnktqgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybW11dWNlcWF5YmJobmt0cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIzMDgsImV4cCI6MjA3ODk0ODMwOH0.ei0cjf8GcCfexKg88kE3oYj3CUIAh8RHRdjm0nLqHfM';

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const error = new Error('CRITICAL: Supabase URL or Anon Key is missing!');
  console.error(error.message);
  if (errorMonitor) {
    errorMonitor.report(error, { type: 'CONFIG_ERROR', source: 'supabase.js' });
  }
}

// Create Supabase client with defensive error handling - DISABLED for local-only mode
let supabase = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase disabled' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase disabled' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Supabase disabled' } }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};
console.log('✅ Supabase client disabled (Local-only mode)');


export { supabase };

// Test connection on startup
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Supabase connection test passed');
    return { success: true, session: data.session };
  } catch (error) {
    if (errorMonitor) {
      errorMonitor.report(error, { type: 'CONNECTION_TEST', source: 'supabase.js' });
    }
    console.error('❌ Supabase connection test failed:', error);
    return { success: false, error };
  }
};


export const uploadAudioFile = async (uri, userId, projectId) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileName = `${userId}/${projectId}/${Date.now()}.wav`;

    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(fileName, blob, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('recordings')
      .getPublicUrl(fileName);

    return { data: { path: fileName, publicUrl }, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
