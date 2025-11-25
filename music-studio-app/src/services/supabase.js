import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual Supabase URL and Anon Key
const SUPABASE_URL = 'https://urmmuuceqaybbhnktqgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybW11dWNlcWF5YmJobmt0cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIzMDgsImV4cCI6MjA3ODk0ODMwOH0.ei0cjf8GcCfexKg88kE3oYj3CUIAh8RHRdjm0nLqHfM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

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
