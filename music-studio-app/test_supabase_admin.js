const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://urmmuuceqaybbhnktqgv.supabase.co';
// WARNING: This is a secret key, do not use in production app!
const SUPABASE_SERVICE_KEY = 'sb_secret_ztpF0LOCye9qLn6VNLt1Aw_LTMbub4v';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testAdminConnection() {
    console.log('Testing Supabase Admin connection...');
    try {
        // Try to list users or something that requires admin
        const { data, error } = await supabase.auth.admin.listUsers();

        if (error) {
            console.error('Admin Connection failed:', error.message);
        } else {
            console.log('Admin Connection successful!');
            console.log('User count:', data.users.length);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testAdminConnection();
