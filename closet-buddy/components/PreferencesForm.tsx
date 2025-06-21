"use client";

import { useState, useEffect } from "react";
import { Save, Palette, Heart } from "lucide-react";
import { UserPreferences, MoodTag, ClothingCategory } from "@/types";
import { MOOD_TAGS } from "@/lib/utils";
import { UserPreferencesService } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";

interface PreferencesFormProps {
	userId: string;
	onSave?: (preferences: UserPreferences) => void;
}

export function PreferencesForm({ userId, onSave }: PreferencesFormProps) {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { success, error: showError, info } = useToast();

	const [preferences, setPreferences] = useState({
		favorite_colors: [] as string[],
		style_preferences: [] as MoodTag[],
		size_preferences: {} as Record<ClothingCategory, string>,
		brand_preferences: [] as string[],
		budget_range: { min: 0, max: 1000 } as { min: number; max: number },
	});

	const [newColor, setNewColor] = useState("");

	// Load existing preferences
	useEffect(() => {
		const loadPreferences = async () => {
			try {
				setLoading(true);
				console.log("🔄 Loading preferences for user:", userId);

				const { data, error } = await UserPreferencesService.get(userId);
				console.log("📊 Load result:", { data, error });

				if (error && error.code !== "PGRST116") {
					// PGRST116 = no rows found
					console.error("❌ Load error:", error);
					throw new Error(`Failed to load preferences: ${error.message}`);
				}

				if (data) {
					console.log("✅ Loaded preferences:", data);
					setPreferences({
						favorite_colors: data.favorite_colors || [],
						style_preferences: data.style_preferences || [],
						size_preferences: data.size_preferences || {},
						brand_preferences: data.brand_preferences || [],
						budget_range: data.budget_range || { min: 0, max: 1000 },
					});
					info(
						"Preferences loaded",
						"Your style preferences have been loaded successfully"
					);
				} else {
					console.log("ℹ️ No preferences found, using defaults");
					info(
						"Welcome!",
						"Set up your style preferences to get better outfit recommendations"
					);
				}
			} catch (err) {
				console.error("❌ Load error:", err);
				const errorMessage =
					err instanceof Error ? err.message : "Failed to load preferences";
				setError(errorMessage);
				showError("Failed to load preferences", errorMessage);
			} finally {
				setLoading(false);
			}
		};

		loadPreferences();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]); // Toast functions are stable, safe to omit from deps

	const handleSave = async () => {
		try {
			setSaving(true);
			setError(null);

			console.log("🔄 Saving preferences for user:", userId);
			console.log("📝 Preferences data:", {
				user_id: userId,
				favorite_colors: preferences.favorite_colors,
				style_preferences: preferences.style_preferences,
				size_preferences: preferences.size_preferences,
				brand_preferences: preferences.brand_preferences,
				budget_range: preferences.budget_range,
			});

			const { data, error } = await UserPreferencesService.upsert({
				user_id: userId,
				favorite_colors: preferences.favorite_colors,
				style_preferences: preferences.style_preferences,
				size_preferences: preferences.size_preferences,
				brand_preferences: preferences.brand_preferences,
				budget_range: preferences.budget_range,
			});

			console.log("📊 Upsert result:", { data, error });

			if (error) {
				console.error("❌ Supabase error:", error);
				throw new Error(`Failed to save preferences: ${error.message}`);
			}

			console.log("✅ Preferences saved successfully:", data);
			success(
				"Preferences saved!",
				"Your style preferences have been updated successfully"
			);

			if (data && onSave) {
				onSave(data);
			}
		} catch (err) {
			console.error("❌ Save error:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Failed to save preferences";
			setError(errorMessage);
			showError("Failed to save preferences", errorMessage);
		} finally {
			setSaving(false);
		}
	};

	const addColor = () => {
		if (newColor && !preferences.favorite_colors.includes(newColor)) {
			setPreferences((prev) => ({
				...prev,
				favorite_colors: [...prev.favorite_colors, newColor],
			}));
			setNewColor("");
		}
	};

	const removeColor = (color: string) => {
		setPreferences((prev) => ({
			...prev,
			favorite_colors: prev.favorite_colors.filter((c) => c !== color),
		}));
	};

	// Brand functions removed for now - will be implemented in future version

	const toggleStylePreference = (mood: MoodTag) => {
		setPreferences((prev) => ({
			...prev,
			style_preferences: prev.style_preferences.includes(mood)
				? prev.style_preferences.filter((m) => m !== mood)
				: [...prev.style_preferences, mood],
		}));
	};

	// Size preference function removed for now - will be implemented in future version

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{error && (
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<p className="text-red-700 dark:text-red-400">{error}</p>
				</div>
			)}

			{/* Favorite Colors */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
						<Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Favorite Colors
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Colors you love to wear
						</p>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex gap-2">
						<input
							type="text"
							value={newColor}
							onChange={(e) => setNewColor(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && addColor()}
							placeholder="Add a color (e.g., navy blue, emerald green)"
							className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
						/>
						<button
							onClick={addColor}
							className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
							Add
						</button>
					</div>

					<div className="flex flex-wrap gap-2">
						{preferences.favorite_colors.map((color) => (
							<span
								key={color}
								className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
								{color}
								<button
									onClick={() => removeColor(color)}
									className="text-purple-500 hover:text-purple-700 dark:hover:text-purple-200">
									×
								</button>
							</span>
						))}
					</div>
				</div>
			</div>

			{/* Style Preferences */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
						<Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Style Preferences
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Your preferred style moods
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
					{MOOD_TAGS.map((mood) => (
						<label key={mood.value} className="flex items-center">
							<input
								type="checkbox"
								checked={preferences.style_preferences.includes(mood.value)}
								onChange={() => toggleStylePreference(mood.value)}
								className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
							/>
							<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
								{mood.label}
							</span>
						</label>
					))}
				</div>
			</div>

			{/* Save Button */}
			<div className="flex justify-end">
				<button
					onClick={handleSave}
					disabled={saving}
					className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
					{saving ? (
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
					) : (
						<Save className="w-5 h-5 mr-2" />
					)}
					{saving ? "Saving..." : "Save Preferences"}
				</button>
			</div>
		</div>
	);
}
