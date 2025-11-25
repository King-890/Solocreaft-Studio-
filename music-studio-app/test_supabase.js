const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://urmmuuceqaybbhnktqgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVybW11dWNlcWF5YmJobmt0cWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNzIzMDgsImV4cCI6MjA3ODk0ODMwOH0.ei0cjf8GcCfexKg88kE3oYj3CUIAh8RHRdjm0nLqHfM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            console.error('Error details:', error);
        } else {
            console.log('Connection successful!');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
