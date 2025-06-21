// Database connection test script
// Run with: node scripts/test-database.js

const { createClient } = require("@supabase/supabase-js");

// Load environment variables manually
const supabaseUrl = "https://iccldhfabqhqcgqnnblw.supabase.co";
const supabaseAnonKey =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljY2xkaGZhYnFocWNncW5uYmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjcxMTcsImV4cCI6MjA2NTM0MzExN30.ssDCaZtrAiSNe4wqi1I8kon5ybVT4Uemc7GM_6SKFL0";

if (!supabaseUrl || !supabaseAnonKey) {
	console.error("❌ Missing Supabase environment variables");
	console.error("Please check your .env.local file");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
	console.log("🔍 Testing database connection...\n");

	try {
		// Test basic connection
		console.log("1. Testing basic connection...");
		const { data: connectionTest, error: connectionError } = await supabase
			.from("clothing_items")
			.select("count", { count: "exact", head: true });

		if (connectionError) {
			console.log("❌ Connection failed:", connectionError.message);
			return;
		}
		console.log("✅ Basic connection successful");

		// Test clothing_items table
		console.log("\n2. Testing clothing_items table...");
		const { data: clothingItems, error: clothingError } = await supabase
			.from("clothing_items")
			.select("*")
			.limit(1);

		if (clothingError) {
			console.log("❌ clothing_items table error:", clothingError.message);
		} else {
			console.log("✅ clothing_items table accessible");
			console.log(`   Found ${clothingItems.length} items`);
		}

		// Test user_preferences table
		console.log("\n3. Testing user_preferences table...");
		const { data: preferences, error: preferencesError } = await supabase
			.from("user_preferences")
			.select("*")
			.limit(1);

		if (preferencesError) {
			console.log("❌ user_preferences table error:", preferencesError.message);
			console.log("   This is likely the cause of your preferences issue!");
			console.log(
				"   Please run the database-setup.sql script in your Supabase SQL Editor"
			);
		} else {
			console.log("✅ user_preferences table accessible");
			console.log(`   Found ${preferences.length} preference records`);
		}

		// Test storage bucket
		console.log("\n4. Testing storage bucket...");
		const { data: buckets, error: bucketError } =
			await supabase.storage.listBuckets();

		if (bucketError) {
			console.log("❌ Storage bucket error:", bucketError.message);
		} else {
			const clothingBucket = buckets.find((b) => b.id === "clothing-images");
			if (clothingBucket) {
				console.log("✅ clothing-images bucket exists");
			} else {
				console.log("❌ clothing-images bucket not found");
				console.log(
					"   Please create the storage bucket using the database-setup.sql script"
				);
			}
		}

		// Test preferences operations (requires authentication)
		console.log("\n5. Testing preferences operations...");
		console.log("ℹ️  Preferences testing requires user authentication");
		console.log("   This test will be skipped in the database setup script");
		console.log(
			"   Use the app's settings page to test preferences after signing in"
		);
	} catch (error) {
		console.error("❌ Unexpected error:", error);
	}

	console.log("\n🏁 Database test complete!");
}

testDatabase();
