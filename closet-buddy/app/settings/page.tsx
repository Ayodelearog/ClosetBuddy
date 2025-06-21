"use client";

import { Palette, Cloud, Bell, Shield } from "lucide-react";
import { PreferencesForm } from "@/components/PreferencesForm";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function SettingsPageContent() {
	const { user } = useAuth();
	return (
		<div className="max-w-4xl mx-auto">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
					Settings
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					Customize your ClosetBuddy experience
				</p>
			</div>

			<div className="space-y-6">
				{/* Style Preferences */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
							<Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
								Style Preferences
							</h2>
							<p className="text-gray-600 dark:text-gray-300">
								Set your favorite colors and style preferences for better
								recommendations
							</p>
						</div>
					</div>

					{user ? (
						<PreferencesForm
							userId={user.id}
							onSave={(preferences) => {
								console.log("Preferences saved:", preferences);
							}}
						/>
					) : (
						<div className="text-center py-8">
							<p className="text-gray-600 dark:text-gray-400">
								Please sign in to manage your preferences
							</p>
						</div>
					)}
				</div>

				{/* Weather Settings */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
							<Cloud className="w-5 h-5 text-blue-600" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900">
								Weather Integration
							</h2>
							<p className="text-gray-600">
								Configure weather-based outfit suggestions
							</p>
						</div>
					</div>
					<div className="p-4 bg-blue-50 rounded-lg">
						<p className="text-blue-700">
							🌤️ Coming in Phase 2! Set your location and temperature
							preferences for weather-aware outfit suggestions.
						</p>
					</div>
				</div>

				{/* Notifications */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
							<Bell className="w-5 h-5 text-green-600" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900">
								Notifications
							</h2>
							<p className="text-gray-600">
								Manage your notification preferences
							</p>
						</div>
					</div>
					<div className="p-4 bg-green-50 rounded-lg">
						<p className="text-green-700">
							🔔 Coming in Phase 3! Get daily outfit suggestions and wardrobe
							reminders.
						</p>
					</div>
				</div>

				{/* Privacy & Security */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
							<Shield className="w-5 h-5 text-gray-600" />
						</div>
						<div>
							<h2 className="text-xl font-semibold text-gray-900">
								Privacy & Security
							</h2>
							<p className="text-gray-600">
								Manage your account security and privacy settings
							</p>
						</div>
					</div>
					<div className="p-4 bg-gray-50 rounded-lg">
						<p className="text-gray-700">
							🔒 Coming in Phase 3! User authentication, data privacy controls,
							and account management.
						</p>
					</div>
				</div>

				{/* Current Settings */}
				<div className="bg-white rounded-lg shadow-sm border p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Current Configuration
					</h2>
					<div className="space-y-3">
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<span className="text-gray-600">Storage</span>
							<span className="text-gray-900 font-medium">
								Supabase (Free Tier)
							</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<span className="text-gray-600">Image Processing</span>
							<span className="text-gray-900 font-medium">Client-side</span>
						</div>
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<span className="text-gray-600">AI Features</span>
							<span className="text-gray-900 font-medium">Coming Soon</span>
						</div>
						<div className="flex justify-between items-center py-2">
							<span className="text-gray-600">Version</span>
							<span className="text-gray-900 font-medium">Phase 1.0</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function SettingsPage() {
	return (
		<ProtectedRoute>
			<SettingsPageContent />
		</ProtectedRoute>
	);
}
