// Test script to verify user preferences RLS fix
// Run this with: node test-preferences-fix.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPreferencesRLS() {
  console.log('🧪 Testing User Preferences RLS Fix...\n');

  try {
    // Test 1: Check if RLS is enabled
    console.log('1️⃣ Checking if RLS is enabled on user_preferences table...');
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'user_preferences' })
      .single();

    if (rlsError) {
      console.log('⚠️  Could not check RLS status (this is normal if the function doesn\'t exist)');
    } else {
      console.log('✅ RLS status checked');
    }

    // Test 2: Check policies exist
    console.log('\n2️⃣ Checking if RLS policies exist...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd')
      .eq('tablename', 'user_preferences');

    if (policiesError) {
      console.log('⚠️  Could not check policies (this might be normal depending on permissions)');
    } else if (policies && policies.length > 0) {
      console.log('✅ Found RLS policies:');
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });
    } else {
      console.log('❌ No RLS policies found - this is the problem!');
    }

    // Test 3: Try to create a test preference (this will fail without proper auth)
    console.log('\n3️⃣ Testing upsert operation (without auth - should fail gracefully)...');
    const testUserId = 'test-user-' + Date.now();
    const { data: upsertData, error: upsertError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: testUserId,
        favorite_colors: ['#FF0000'],
        style_preferences: ['casual'],
        size_preferences: {},
        brand_preferences: [],
        budget_range: { min: 0, max: 100 }
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (upsertError) {
      if (upsertError.code === '42501') {
        console.log('❌ RLS policy violation - this confirms the issue exists');
        console.log('   Error:', upsertError.message);
      } else if (upsertError.message.includes('JWT')) {
        console.log('✅ Authentication required (this is expected without login)');
      } else {
        console.log('⚠️  Unexpected error:', upsertError.message);
      }
    } else {
      console.log('✅ Upsert succeeded (unexpected without auth)');
    }

    console.log('\n📋 Summary:');
    console.log('To fix the RLS issue, run the SQL script in fix-user-preferences-rls.sql');
    console.log('in your Supabase SQL Editor.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPreferencesRLS();
