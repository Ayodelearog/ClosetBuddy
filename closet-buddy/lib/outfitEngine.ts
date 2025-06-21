import type {
	ClothingItem,
	ClothingCategory,
	Occasion,
	Season,
	MoodTag,
} from "@/types";
import { AIUtils } from "@/lib/ai";

export interface OutfitSuggestion {
	id: string;
	items: ClothingItem[];
	score: number;
	occasion?: Occasion;
	season?: Season;
	mood?: MoodTag;
	reasoning: string[];
	colorHarmony: number;
	styleCoherence: number;
	aiConfidence?: number;
	aiRecommendations?: string[];
	stylePersonality?: string;
}

export interface AIStyleProfile {
	dominantColors: string[];
	preferredCategories: ClothingCategory[];
	stylePersonality:
		| "classic"
		| "trendy"
		| "casual"
		| "formal"
		| "eclectic"
		| "minimalist";
	riskTolerance: "conservative" | "moderate" | "adventurous";
	colorPreferences: {
		loves: string[];
		likes: string[];
		neutral: string[];
		dislikes: string[];
	};
	occasionFrequency: Record<Occasion, number>;
}

export interface SuggestionFilters {
	occasion?: Occasion;
	season?: Season;
	mood?: MoodTag;
	preferredColors?: string[];
	excludeItems?: string[]; // Item IDs to exclude
	maxItems?: number;
}

export class OutfitSuggestionEngine {
	protected items: ClothingItem[];
	protected aiStyleProfile?: AIStyleProfile;

	constructor(items: ClothingItem[], aiStyleProfile?: AIStyleProfile) {
		this.items = items;
		this.aiStyleProfile = aiStyleProfile;
	}

	// Main method to generate outfit suggestions
	async generateSuggestions(
		filters: SuggestionFilters = {}
	): Promise<OutfitSuggestion[]> {
		const filteredItems = this.filterItems(filters);
		const outfitCombinations = this.generateCombinations(
			filteredItems,
			filters
		);
		let scoredOutfits = outfitCombinations.map((combo) =>
			this.scoreOutfit(combo, filters)
		);

		// Enhance with AI if available
		if (AIUtils.isAIAvailable()) {
			scoredOutfits = await this.enhanceWithAI(scoredOutfits, filters);
		}

		// Sort by score and return top suggestions
		const result = scoredOutfits
			.sort((a, b) => b.score - a.score)
			.slice(0, filters.maxItems || 10);

		return result;
	}

	// Filter items based on criteria
	private filterItems(filters: SuggestionFilters): ClothingItem[] {
		return this.items.filter((item) => {
			// Exclude specific items
			if (filters.excludeItems?.includes(item.id)) return false;

			// Filter by occasion - if item has no occasions, include it (more lenient)
			if (
				filters.occasion &&
				item.occasions.length > 0 &&
				!item.occasions.includes(filters.occasion)
			)
				return false;

			// Filter by season - if item has no seasons, include it (more lenient)
			if (
				filters.season &&
				item.seasons.length > 0 &&
				!item.seasons.includes(filters.season)
			)
				return false;

			// Filter by mood - if item has no mood tags, include it (more lenient)
			if (
				filters.mood &&
				item.mood_tags.length > 0 &&
				!item.mood_tags.includes(filters.mood)
			)
				return false;

			return true;
		});
	}

	// Generate outfit combinations
	private generateCombinations(
		items: ClothingItem[],
		filters: SuggestionFilters
	): ClothingItem[][] {
		const combinations: ClothingItem[][] = [];
		const itemsByCategory = this.groupByCategory(items);

		// Generate basic outfit combinations
		const tops = itemsByCategory.tops || [];
		const bottoms = itemsByCategory.bottoms || [];
		const dresses = itemsByCategory.dresses || [];
		const outerwear = itemsByCategory.outerwear || [];
		const shoes = itemsByCategory.shoes || [];
		const accessories = itemsByCategory.accessories || [];

		// Dress-based outfits
		dresses.forEach((dress) => {
			const outfit = [dress];

			if (shoes.length > 0) {
				outfit.push(this.getBestMatch(dress, shoes));
			}

			if (outerwear.length > 0) {
				const jacket = this.getBestMatch(dress, outerwear);
				if (jacket) outfit.push(jacket);
			}

			if (accessories.length > 0) {
				const accessory = this.getBestMatch(dress, accessories);
				if (accessory) outfit.push(accessory);
			}

			combinations.push(outfit);
		});

		// Top + Bottom combinations
		tops.forEach((top) => {
			bottoms.forEach((bottom) => {
				const outfit = [top, bottom];

				if (shoes.length > 0) {
					outfit.push(this.getBestMatch(top, shoes));
				}

				if (outerwear.length > 0) {
					const jacket = this.getBestMatch(top, outerwear);
					if (jacket && this.isOuterwearAppropriate(jacket, filters)) {
						outfit.push(jacket);
					}
				}

				if (accessories.length > 0) {
					const accessory = this.getBestMatch(top, accessories);
					if (accessory) outfit.push(accessory);
				}

				combinations.push(outfit);
			});
		});

		return combinations.filter((combo) => combo.length >= 2);
	}

	// Group items by category
	private groupByCategory(
		items: ClothingItem[]
	): Record<string, ClothingItem[]> {
		const groups: Record<string, ClothingItem[]> = {};

		items.forEach((item) => {
			const category = this.getCategoryGroup(item.category);
			if (!groups[category]) groups[category] = [];
			groups[category].push(item);
		});

		return groups;
	}

	// Map categories to groups
	private getCategoryGroup(category: ClothingCategory): string {
		const categoryMap: Record<ClothingCategory, string> = {
			tops: "tops",
			bottoms: "bottoms",
			dresses: "dresses",
			outerwear: "outerwear",
			shoes: "shoes",
			accessories: "accessories",
			activewear: "tops",
			sleepwear: "tops",
			underwear: "accessories",
			formal: "dresses",
		};

		return categoryMap[category] || "accessories";
	}

	// Find best matching item from a list
	private getBestMatch(
		baseItem: ClothingItem,
		candidates: ClothingItem[]
	): ClothingItem {
		if (candidates.length === 0) return candidates[0];

		let bestMatch = candidates[0];
		let bestScore = this.calculateCompatibility(baseItem, candidates[0]);

		candidates.forEach((candidate) => {
			const score = this.calculateCompatibility(baseItem, candidate);
			if (score > bestScore) {
				bestScore = score;
				bestMatch = candidate;
			}
		});

		return bestMatch;
	}

	// Calculate compatibility between two items
	private calculateCompatibility(
		item1: ClothingItem,
		item2: ClothingItem
	): number {
		let score = 0;

		// Color compatibility
		score += this.calculateColorCompatibility(item1.colors, item2.colors) * 0.4;

		// Occasion overlap
		const occasionOverlap = item1.occasions.filter((o) =>
			item2.occasions.includes(o)
		).length;
		score +=
			(occasionOverlap /
				Math.max(item1.occasions.length, item2.occasions.length, 1)) *
			0.3;

		// Season overlap
		const seasonOverlap = item1.seasons.filter((s) =>
			item2.seasons.includes(s)
		).length;
		score +=
			(seasonOverlap /
				Math.max(item1.seasons.length, item2.seasons.length, 1)) *
			0.2;

		// Mood overlap
		const moodOverlap = item1.mood_tags.filter((m) =>
			item2.mood_tags.includes(m)
		).length;
		score +=
			(moodOverlap /
				Math.max(item1.mood_tags.length, item2.mood_tags.length, 1)) *
			0.1;

		return score;
	}

	// Calculate color compatibility
	private calculateColorCompatibility(
		colors1: string[],
		colors2: string[]
	): number {
		if (colors1.length === 0 || colors2.length === 0) return 0.5;

		let maxCompatibility = 0;

		colors1.forEach((color1) => {
			colors2.forEach((color2) => {
				const compatibility = this.getColorHarmony(color1, color2);
				maxCompatibility = Math.max(maxCompatibility, compatibility);
			});
		});

		return maxCompatibility;
	}

	// Calculate color harmony between two colors
	private getColorHarmony(color1: string, color2: string): number {
		const hsl1 = this.hexToHsl(color1);
		const hsl2 = this.hexToHsl(color2);

		if (!hsl1 || !hsl2) return 0.5;

		// Same color = perfect match
		if (color1.toLowerCase() === color2.toLowerCase()) return 1.0;

		// Neutral colors (low saturation) go with everything
		if (hsl1.s < 0.2 || hsl2.s < 0.2) return 0.9;

		// Calculate hue difference
		const hueDiff = Math.abs(hsl1.h - hsl2.h);
		const normalizedHueDiff = Math.min(hueDiff, 360 - hueDiff);

		// Complementary colors (opposite on color wheel)
		if (normalizedHueDiff > 150 && normalizedHueDiff < 210) return 0.8;

		// Analogous colors (close on color wheel)
		if (normalizedHueDiff < 30) return 0.9;

		// Triadic colors (120 degrees apart)
		if (Math.abs(normalizedHueDiff - 120) < 20) return 0.7;

		return 0.4;
	}

	// Convert hex to HSL
	private hexToHsl(hex: string): { h: number; s: number; l: number } | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return null;

		const r = Number.parseInt(result[1], 16) / 255;
		const g = Number.parseInt(result[2], 16) / 255;
		const b = Number.parseInt(result[3], 16) / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		let h = 0,
			s = 0;
		const l = (max + min) / 2;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r:
					h = (g - b) / d + (g < b ? 6 : 0);
					break;
				case g:
					h = (b - r) / d + 2;
					break;
				case b:
					h = (r - g) / d + 4;
					break;
			}
			h /= 6;
		}

		return { h: h * 360, s, l };
	}

	// Check if outerwear is appropriate for the context
	private isOuterwearAppropriate(
		_outerwear: ClothingItem,
		filters: SuggestionFilters
	): boolean {
		if (filters.season === "winter" || filters.season === "fall") return true;
		if (filters.occasion === "formal" || filters.occasion === "work")
			return true;
		if (filters.season === "spring") return true;
		return false;
	}

	// Score an outfit combination
	private scoreOutfit(
		items: ClothingItem[],
		filters: SuggestionFilters
	): OutfitSuggestion {
		let score = 0;
		const reasoning: string[] = [];

		// Color harmony score
		const colorHarmony = this.calculateOutfitColorHarmony(items);
		score += colorHarmony * 0.4;

		// Style coherence score
		const styleCoherence = this.calculateStyleCoherence(items);
		score += styleCoherence * 0.3;

		// Completeness score
		const completeness = this.calculateCompleteness(items);
		score += completeness * 0.2;

		// Preference alignment
		const preferenceAlignment = this.calculatePreferenceAlignment(
			items,
			filters
		);
		score += preferenceAlignment * 0.1;

		// Add reasoning
		if (colorHarmony > 0.7) reasoning.push("Great color coordination");
		if (styleCoherence > 0.8) reasoning.push("Cohesive style");
		if (completeness === 1.0) reasoning.push("Complete outfit");

		return {
			id: `outfit-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
			items,
			score,
			occasion: filters.occasion,
			season: filters.season,
			mood: filters.mood,
			reasoning,
			colorHarmony,
			styleCoherence,
		};
	}

	// Calculate overall color harmony for an outfit
	private calculateOutfitColorHarmony(items: ClothingItem[]): number {
		if (items.length < 2) return 1.0;

		let totalHarmony = 0;
		let comparisons = 0;

		for (let i = 0; i < items.length; i++) {
			for (let j = i + 1; j < items.length; j++) {
				totalHarmony += this.calculateColorCompatibility(
					items[i].colors,
					items[j].colors
				);
				comparisons++;
			}
		}

		return comparisons > 0 ? totalHarmony / comparisons : 0.5;
	}

	// Calculate style coherence
	private calculateStyleCoherence(items: ClothingItem[]): number {
		const allOccasions = items.flatMap((item) => item.occasions);
		const allMoods = items.flatMap((item) => item.mood_tags);

		const occasionOverlap = this.calculateOverlapScore(allOccasions);
		const moodOverlap = this.calculateOverlapScore(allMoods);

		return (occasionOverlap + moodOverlap) / 2;
	}

	// Calculate completeness
	private calculateCompleteness(items: ClothingItem[]): number {
		const categories = items.map((item) =>
			this.getCategoryGroup(item.category)
		);
		const uniqueCategories = new Set(categories);

		if (uniqueCategories.has("dresses")) return 1.0;
		if (uniqueCategories.has("tops") && uniqueCategories.has("bottoms"))
			return 1.0;

		return 0.5;
	}

	// Calculate preference alignment
	private calculatePreferenceAlignment(
		items: ClothingItem[],
		filters: SuggestionFilters
	): number {
		if (!filters.preferredColors || filters.preferredColors.length === 0)
			return 0.5;

		const outfitColors = items.flatMap((item) => item.colors);
		const colorMatches = outfitColors.filter((color) =>
			filters.preferredColors!.some(
				(preferred) => this.getColorHarmony(color, preferred) > 0.7
			)
		);

		return colorMatches.length / Math.max(outfitColors.length, 1);
	}

	// Calculate overlap score for arrays
	private calculateOverlapScore(items: string[]): number {
		if (items.length === 0) return 0;

		const counts = items.reduce((acc, item) => {
			acc[item] = (acc[item] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const maxCount = Math.max(...Object.values(counts));
		return maxCount / items.length;
	}

	// Generate AI style profile from user's wardrobe
	generateAIStyleProfile(): AIStyleProfile {
		const allColors = this.items.flatMap((item) => item.colors);
		const allCategories = this.items.map((item) => item.category);
		const allOccasions = this.items.flatMap((item) => item.occasions);

		// Analyze dominant colors
		const colorFrequency = allColors.reduce((acc, color) => {
			acc[color] = (acc[color] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const dominantColors = Object.entries(colorFrequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 5)
			.map(([color]) => color);

		// Analyze preferred categories
		const categoryFrequency = allCategories.reduce((acc, category) => {
			acc[category] = (acc[category] || 0) + 1;
			return acc;
		}, {} as Record<ClothingCategory, number>);

		const preferredCategories = Object.entries(categoryFrequency)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([category]) => category as ClothingCategory);

		const stylePersonality = this.determineStylePersonality();
		const colorPreferences = this.analyzeColorPreferences(allColors);

		const occasionFrequency = allOccasions.reduce((acc, occasion) => {
			acc[occasion] = (acc[occasion] || 0) + 1;
			return acc;
		}, {} as Record<Occasion, number>);

		return {
			dominantColors,
			preferredCategories,
			stylePersonality,
			riskTolerance: this.determineRiskTolerance(),
			colorPreferences,
			occasionFrequency,
		};
	}

	// Determine user's style personality
	private determineStylePersonality(): AIStyleProfile["stylePersonality"] {
		const formalItems = this.items.filter(
			(item) =>
				item.occasions.includes("formal") || item.occasions.includes("work")
		).length;

		const colorVariety = new Set(this.items.flatMap((item) => item.colors))
			.size;
		const totalItems = this.items.length;

		if (formalItems / totalItems > 0.4 && colorVariety / totalItems < 0.3) {
			return "classic";
		}

		if (totalItems < 20 && colorVariety < 8) {
			return "minimalist";
		}

		if (formalItems / totalItems > 0.5) {
			return "formal";
		}

		if (colorVariety / totalItems > 0.5) {
			return "eclectic";
		}

		const trendyMoods = this.items.filter(
			(item) =>
				item.mood_tags.includes("trendy") || item.mood_tags.includes("edgy")
		).length;

		if (trendyMoods / totalItems > 0.3) {
			return "trendy";
		}

		return "casual";
	}

	// Determine user's risk tolerance
	private determineRiskTolerance(): AIStyleProfile["riskTolerance"] {
		const neutralColors = this.items.filter((item) =>
			item.colors.some((color) => this.isNeutralColor(color))
		).length;

		const boldItems = this.items.filter(
			(item) =>
				item.mood_tags.includes("edgy") || item.mood_tags.includes("confident")
		).length;

		const totalItems = this.items.length;
		const neutralRatio = neutralColors / totalItems;
		const boldRatio = boldItems / totalItems;

		if (boldRatio > 0.3) return "adventurous";
		if (neutralRatio > 0.7) return "conservative";
		return "moderate";
	}

	// Check if a color is neutral
	private isNeutralColor(color: string): boolean {
		const hsl = this.hexToHsl(color);
		if (!hsl) return false;
		return hsl.s < 0.2;
	}

	// Analyze color preferences
	private analyzeColorPreferences(
		colors: string[]
	): AIStyleProfile["colorPreferences"] {
		const colorFrequency = colors.reduce((acc, color) => {
			acc[color] = (acc[color] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		const sortedColors = Object.entries(colorFrequency).sort(
			([, a], [, b]) => b - a
		);

		const totalColors = colors.length;
		const loves = sortedColors
			.slice(0, 3)
			.filter(([, count]) => count / totalColors > 0.15)
			.map(([color]) => color);
		const likes = sortedColors
			.slice(3, 8)
			.filter(([, count]) => count / totalColors > 0.05)
			.map(([color]) => color);
		const neutral = sortedColors.slice(8, 12).map(([color]) => color);
		const dislikes: string[] = [];

		return { loves, likes, neutral, dislikes };
	}

	// Enhance outfit suggestions with AI
	private async enhanceWithAI(
		suggestions: OutfitSuggestion[],
		filters: SuggestionFilters
	): Promise<OutfitSuggestion[]> {
		if (!this.aiStyleProfile) return suggestions;

		// Use AI to enhance suggestions
		const enhancedSuggestions = await Promise.all(
			suggestions.map(async (suggestion) => {
				try {
					// Get AI description for the outfit
					const aiDescription = await AIUtils.describeOutfit(suggestion.items, {
						occasion: filters.occasion,
						season: filters.season,
						mood: filters.mood,
					});

					if (aiDescription.success) {
						return {
							...suggestion,
							aiConfidence: aiDescription.confidence,
							aiRecommendations: [
								aiDescription.data.description,
								...aiDescription.data.styleNotes,
							],
							stylePersonality: this.aiStyleProfile?.stylePersonality,
							score: suggestion.score * (aiDescription.confidence || 1),
						};
					}
				} catch (error) {
					console.warn("AI enhancement failed for suggestion:", error);
				}

				return suggestion;
			})
		);

		return enhancedSuggestions;
	}
}
