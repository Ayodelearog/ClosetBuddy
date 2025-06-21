import type { ClothingItem, UserPreferences, Occasion, MoodTag } from "@/types";
import {
	OutfitSuggestionEngine,
	type OutfitSuggestion,
	type SuggestionFilters,
	type AIStyleProfile,
} from "./outfitEngine";
import { ClothingItemService } from "./supabase";

// Type for database errors
interface DatabaseError {
	code?: string;
	message?: string;
}

// Mock user preferences service - replace with your actual Supabase service when implemented

const UserPreferencesService = {
	async get(userId: string) {
		// Mock implementation with sample preferences - replace with actual Supabase call
		const samplePreferences: UserPreferences = {
			id: "pref-1",
			user_id: userId,
			favorite_colors: ["#000000", "#FFFFFF", "#000080", "#DC143C"],
			style_preferences: ["professional", "classic", "comfortable"],
			size_preferences: {
				tops: "M",
				bottoms: "M",
				dresses: "M",
				outerwear: "M",
				shoes: "9",
				accessories: "One Size",
				underwear: "M",
				activewear: "M",
				sleepwear: "M",
				formal: "M",
			},
			brand_preferences: ["Uniqlo", "Zara", "H&M"],
			budget_range: {
				min: 20,
				max: 200,
			},
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		};

		return { data: samplePreferences, error: null };
	},
};

export class OutfitService {
	private static async getUserItems(userId: string): Promise<ClothingItem[]> {
		const { data, error } = await ClothingItemService.getAll(userId);
		if (error) {
			throw new Error("Failed to load wardrobe items");
		}
		return data || [];
	}

	private static async getUserPreferences(
		userId: string
	): Promise<UserPreferences | null> {
		const { data, error } = await UserPreferencesService.get(userId);
		if (error && (error as DatabaseError).code !== "PGRST116") {
			throw new Error("Failed to load user preferences");
		}
		return data;
	}

	// Generate outfit suggestions for a user
	static async generateOutfitSuggestions(
		userId: string,
		filters: SuggestionFilters = {}
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				throw new Error(
					"Your wardrobe is empty. Add some clothing items to get outfit suggestions!"
				);
			}

			if (items.length < 2) {
				throw new Error(
					"You need at least 2 items in your wardrobe to generate outfit suggestions. Add more items to your wardrobe!"
				);
			}

			const preferences = await this.getUserPreferences(userId);
			const enhancedFilters = this.enhanceFiltersWithPreferences(
				filters,
				preferences
			);

			const engine = new OutfitSuggestionEngine(items);
			const suggestions = await engine.generateSuggestions(enhancedFilters);

			return suggestions;
		} catch (error) {
			console.error("Error generating outfit suggestions:", error);
			throw error;
		}
	}

	// Get occasion-specific suggestions
	static async getOccasionSuggestions(
		userId: string,
		occasion: Occasion
	): Promise<OutfitSuggestion[]> {
		const filters: SuggestionFilters = {
			occasion: occasion,
			maxItems: 8,
		};

		return this.generateOutfitSuggestions(userId, filters);
	}

	// Generate AI-powered outfit suggestions
	static async generateAIOutfitSuggestions(
		userId: string,
		filters: SuggestionFilters = {},
		count: number = 3
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				throw new Error(
					"Your wardrobe is empty. Add some clothing items to get outfit suggestions!"
				);
			}

			if (items.length < 2) {
				throw new Error(
					"You need at least 2 items in your wardrobe to generate outfit suggestions. Add more items to your wardrobe!"
				);
			}

			const preferences = await this.getUserPreferences(userId);
			const enhancedFilters = this.enhanceFiltersWithPreferences(
				filters,
				preferences
			);

			// Add randomization to ensure fresh suggestions
			enhancedFilters.maxItems = Math.max(count * 3, 15); // Generate more to have variety

			// Create AI style profile
			const aiStyleProfile = await this.generateAIStyleProfile(userId);

			// Create suggestion engine with AI profile
			const engine = new OutfitSuggestionEngine(items, aiStyleProfile);
			const allSuggestions = await engine.generateSuggestions(enhancedFilters);

			// Shuffle and return requested number of suggestions for freshness
			const shuffled = allSuggestions.sort(() => Math.random() - 0.5);
			return shuffled.slice(0, count);
		} catch (error) {
			console.error("Error generating AI outfit suggestions:", error);
			throw error;
		}
	}

	// Generate AI style profile for a user
	static async generateAIStyleProfile(userId: string): Promise<AIStyleProfile> {
		try {
			const items = await this.getUserItems(userId);
			const preferences = await this.getUserPreferences(userId);

			const engine = new OutfitSuggestionEngine(items);
			const aiProfile = engine.generateAIStyleProfile();

			// Enhance with user preferences if available
			if (preferences) {
				aiProfile.colorPreferences.loves = [
					...aiProfile.colorPreferences.loves,
					...preferences.favorite_colors,
				];
			}

			return aiProfile;
		} catch (error) {
			console.error("Error generating AI style profile:", error);
			throw error;
		}
	}

	// Enhance filters with user preferences
	private static enhanceFiltersWithPreferences(
		filters: SuggestionFilters,
		preferences: UserPreferences | null
	): SuggestionFilters {
		if (!preferences) return filters;

		const enhanced = { ...filters };

		if (!enhanced.preferredColors && preferences.favorite_colors.length > 0) {
			enhanced.preferredColors = preferences.favorite_colors;
		}

		return enhanced;
	}

	// Get current season based on date
	private static getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
		const month = new Date().getMonth() + 1;

		if (month >= 3 && month <= 5) return "spring";
		if (month >= 6 && month <= 8) return "summer";
		if (month >= 9 && month <= 11) return "fall";
		return "winter";
	}

	// Get mood-specific suggestions
	static async getMoodSuggestions(
		userId: string,
		mood: string
	): Promise<OutfitSuggestion[]> {
		const filters: SuggestionFilters = {
			mood: mood as MoodTag,
			maxItems: 8,
		};

		return this.generateOutfitSuggestions(userId, filters);
	}

	// Get color coordinated suggestions
	static async getColorCoordinatedSuggestions(
		userId: string
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				throw new Error(
					"Your wardrobe is empty. Add some clothing items to get outfit suggestions!"
				);
			}

			if (items.length < 2) {
				throw new Error(
					"You need at least 2 items in your wardrobe to generate outfit suggestions. Add more items to your wardrobe!"
				);
			}

			const preferences = await this.getUserPreferences(userId);
			const filters: SuggestionFilters = {
				maxItems: 8,
			};

			// If user has color preferences, use them
			if (preferences?.favorite_colors?.length) {
				filters.preferredColors = preferences.favorite_colors;
			}

			const engine = new OutfitSuggestionEngine(items);
			const suggestions = await engine.generateSuggestions(filters);

			// Sort by color harmony score
			return suggestions.sort((a, b) => b.colorHarmony - a.colorHarmony);
		} catch (error) {
			console.error("Error generating color coordinated suggestions:", error);
			throw error;
		}
	}

	// Save favorite outfit
	static async saveFavoriteOutfit(
		userId: string,
		suggestion: OutfitSuggestion,
		name: string
	): Promise<void> {
		// Mock implementation - replace with actual Supabase call
		console.log("Saving favorite outfit:", { userId, suggestion, name });
		// This would save to a favorites table in the database
	}

	// Get personalized suggestions based on time and preferences
	static async getPersonalizedSuggestions(
		userId: string,
		context: { timeOfDay?: string }
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				throw new Error(
					"Your wardrobe is empty. Add some clothing items to get outfit suggestions!"
				);
			}

			if (items.length < 2) {
				throw new Error(
					"You need at least 2 items in your wardrobe to generate outfit suggestions. Add more items to your wardrobe!"
				);
			}

			const preferences = await this.getUserPreferences(userId);
			const currentSeason = this.getCurrentSeason();

			const filters: SuggestionFilters = {
				season: currentSeason,
				maxItems: 8,
			};

			// Adjust based on time of day
			if (context.timeOfDay === "morning") {
				filters.occasion = "work";
			} else if (context.timeOfDay === "evening") {
				filters.occasion = "casual";
			}

			// Add user preferences
			if (preferences?.favorite_colors?.length) {
				filters.preferredColors = preferences.favorite_colors;
			}

			return this.generateOutfitSuggestions(userId, filters);
		} catch (error) {
			console.error("Error generating personalized suggestions:", error);
			throw error;
		}
	}

	// Get style challenge suggestions (push boundaries)
	static async getStyleChallengeSuggestions(
		userId: string
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				throw new Error(
					"Your wardrobe is empty. Add some clothing items to get outfit suggestions!"
				);
			}

			if (items.length < 2) {
				throw new Error(
					"You need at least 2 items in your wardrobe to generate outfit suggestions. Add more items to your wardrobe!"
				);
			}

			const engine = new OutfitSuggestionEngine(items);
			const allSuggestions = await engine.generateSuggestions({ maxItems: 20 });

			// Filter for more adventurous combinations
			const challengeSuggestions = allSuggestions.filter(
				(suggestion) =>
					suggestion.items.length >= 3 && // More complex outfits
					suggestion.colorHarmony < 0.8 && // Less conventional color combinations
					suggestion.styleCoherence < 0.9 // Mixed styles
			);

			return challengeSuggestions.slice(0, 6);
		} catch (error) {
			console.error("Error generating style challenge suggestions:", error);
			throw error;
		}
	}

	// Get quick suggestions for home page (3 suggestions)
	static async getQuickSuggestions(
		userId: string
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				return [];
			}

			if (items.length < 2) {
				return [];
			}

			const preferences = await this.getUserPreferences(userId);
			const currentSeason = this.getCurrentSeason();

			const filters: SuggestionFilters = {
				season: currentSeason,
				maxItems: 3,
			};

			// Add user preferences if available
			if (preferences?.favorite_colors?.length) {
				filters.preferredColors = preferences.favorite_colors;
			}

			const engine = new OutfitSuggestionEngine(items);
			const suggestions = await engine.generateSuggestions(filters);

			// Return top 3 suggestions sorted by score
			return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
		} catch (error) {
			console.error("Error generating quick suggestions:", error);
			return [];
		}
	}

	// Get fresh suggestions (different from current ones) - for home page
	static async getFreshSuggestions(
		userId: string
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				return [];
			}

			if (items.length < 2) {
				return [];
			}

			// Use AI suggestions for fresh suggestions (3 for home page)
			return this.generateAIOutfitSuggestions(userId, {}, 3);
		} catch (error) {
			console.error("Error generating fresh suggestions:", error);
			return [];
		}
	}

	// Get suggestions for outfit page (more than home page)
	static async getOutfitPageSuggestions(
		userId: string
	): Promise<OutfitSuggestion[]> {
		try {
			const items = await this.getUserItems(userId);

			if (items.length === 0) {
				return [];
			}

			if (items.length < 2) {
				return [];
			}

			// Use AI suggestions for outfit page (9 suggestions)
			return this.generateAIOutfitSuggestions(userId, {}, 9);
		} catch (error) {
			console.error("Error generating outfit page suggestions:", error);
			return [];
		}
	}

	// Get style insights for a user
	static async getStyleInsights(userId: string): Promise<{
		stylePersonality: string;
		riskTolerance: string;
		dominantColors: string[];
		preferredCategories: string[];
		recommendations: string[];
	}> {
		try {
			const aiProfile = await this.generateAIStyleProfile(userId);

			const recommendations: string[] = [];

			switch (aiProfile.stylePersonality) {
				case "minimalist":
					recommendations.push("Consider adding versatile neutral pieces");
					recommendations.push("Focus on quality over quantity");
					break;
				case "trendy":
					recommendations.push("Experiment with bold color combinations");
					recommendations.push("Try mixing patterns and textures");
					break;
				case "classic":
					recommendations.push("Invest in timeless pieces");
					recommendations.push("Build a capsule wardrobe");
					break;
				case "eclectic":
					recommendations.push("Embrace your unique style");
					recommendations.push("Don't be afraid to mix different aesthetics");
					break;
				default:
					recommendations.push(
						"Explore different styles to find your preference"
					);
			}

			if (aiProfile.riskTolerance === "conservative") {
				recommendations.push("Try adding one statement piece to safe outfits");
			} else if (aiProfile.riskTolerance === "adventurous") {
				recommendations.push("Your bold choices inspire confidence");
			}

			return {
				stylePersonality: aiProfile.stylePersonality,
				riskTolerance: aiProfile.riskTolerance,
				dominantColors: aiProfile.dominantColors,
				preferredCategories: aiProfile.preferredCategories.map((cat) =>
					cat.toString()
				),
				recommendations,
			};
		} catch (error) {
			console.error("Error getting style insights:", error);
			throw error;
		}
	}
}
