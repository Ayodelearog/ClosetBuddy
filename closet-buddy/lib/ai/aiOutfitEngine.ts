// AI-Enhanced Outfit Suggestion Engine
import { ClothingItem, Occasion, Season, MoodTag } from "@/types";
import {
	OutfitSuggestionEngine,
	OutfitSuggestion,
	SuggestionFilters,
	AIStyleProfile,
} from "../outfitEngine";
import {
	aiClient,
	StyleAnalysisInput,
	OutfitDescriptionInput,
} from "./clients";

export interface AIEnhancedOutfitSuggestion extends OutfitSuggestion {
	aiDescription?: string;
	aiStyleNotes?: string[];
	aiOccasionFit?: string;
	aiPersonalityMatch?: number;
	aiColorAnalysis?: string;
	aiRecommendations?: string[];
	aiConfidence?: number;
}

export interface AIOutfitFilters extends SuggestionFilters {
	useAI?: boolean;
	personalityWeight?: number; // 0-1, how much to weight AI personality analysis
	descriptionDetail?: "basic" | "detailed" | "comprehensive";
}

export class AIEnhancedOutfitEngine extends OutfitSuggestionEngine {
	private aiAnalysisCache: Map<string, any> = new Map();

	constructor(items: ClothingItem[], aiStyleProfile?: AIStyleProfile) {
		super(items, aiStyleProfile);
	}

	// Enhanced suggestion generation with AI
	async generateAIEnhancedSuggestions(
		filters: AIOutfitFilters = {}
	): Promise<AIEnhancedOutfitSuggestion[]> {
		// Get base suggestions from the original engine
		const baseSuggestions = this.generateSuggestions(filters);

		if (!filters.useAI) {
			return baseSuggestions.map((suggestion) => ({
				...suggestion,
				aiConfidence: 0.5,
			}));
		}

		// Enhance each suggestion with AI
		const enhancedSuggestions = await Promise.all(
			baseSuggestions.map((suggestion) =>
				this.enhanceOutfitWithAI(suggestion, filters)
			)
		);

		// Re-sort based on AI-enhanced scores
		return enhancedSuggestions
			.sort(
				(a, b) =>
					b.score * (b.aiConfidence || 1) - a.score * (a.aiConfidence || 1)
			)
			.slice(0, filters.maxItems || 10);
	}

	// Generate AI-enhanced style profile from wardrobe
	async generateAIEnhancedStyleProfile(): Promise<AIStyleProfile> {
		const cacheKey = "style_profile";
		if (this.aiAnalysisCache.has(cacheKey)) {
			return this.aiAnalysisCache.get(cacheKey);
		}

		// Prepare data for AI analysis
		const styleInput: StyleAnalysisInput = {
			items: this.items.map((item) => ({
				category: item.category,
				colors: item.colors,
				occasions: item.occasions,
				mood_tags: item.mood_tags,
			})),
			userPreferences: this.aiStyleProfile
				? {
						favoriteColors: this.aiStyleProfile.dominantColors,
						stylePreferences: [this.aiStyleProfile.stylePersonality],
				  }
				: undefined,
		};

		try {
			const aiResponse = await aiClient.analyzeStyle(styleInput);

			if (aiResponse.success && aiResponse.data) {
				const aiProfile = aiResponse.data;

				// Convert AI response to our AIStyleProfile format
				const enhancedProfile: AIStyleProfile = {
					dominantColors: aiProfile.colorPalette || [],
					preferredCategories: this.extractPreferredCategories(),
					stylePersonality:
						aiProfile.stylePersonality as AIStyleProfile["stylePersonality"],
					riskTolerance: this.determineRiskToleranceFromAI(aiProfile),
					colorPreferences: {
						loves: aiProfile.colorPalette?.slice(0, 3) || [],
						likes: aiProfile.colorPalette?.slice(3, 6) || [],
						neutral: [],
						dislikes: [],
					},
					occasionFrequency: this.calculateOccasionFrequency(),
				};

				this.aiAnalysisCache.set(cacheKey, enhancedProfile);
				this.aiStyleProfile = enhancedProfile;
				return enhancedProfile;
			}
		} catch (error) {
			console.warn(
				"AI style analysis failed, falling back to rule-based analysis:",
				error
			);
		}

		// Fallback to original method
		const fallbackProfile = super.generateAIStyleProfile();
		this.aiAnalysisCache.set(cacheKey, fallbackProfile);
		return fallbackProfile;
	}

	// Enhance individual outfit with AI
	private async enhanceOutfitWithAI(
		suggestion: OutfitSuggestion,
		filters: AIOutfitFilters
	): Promise<AIEnhancedOutfitSuggestion> {
		const cacheKey = `outfit_${suggestion.items.map((i) => i.id).join("_")}`;

		if (this.aiAnalysisCache.has(cacheKey)) {
			const cached = this.aiAnalysisCache.get(cacheKey);
			return { ...suggestion, ...cached };
		}

		try {
			// Generate AI description
			const descriptionInput: OutfitDescriptionInput = {
				items: suggestion.items.map((item) => ({
					name: item.name,
					category: item.category,
					colors: item.colors,
				})),
				occasion: suggestion.occasion,
				season: suggestion.season,
				mood: suggestion.mood,
			};

			const aiResponse = await aiClient.generateOutfitDescription(
				descriptionInput
			);

			if (aiResponse.success && aiResponse.data) {
				const aiData = aiResponse.data;

				const enhancements = {
					aiDescription: aiData.description,
					aiStyleNotes: aiData.styleNotes,
					aiOccasionFit: aiData.occasionFit,
					aiPersonalityMatch: this.calculatePersonalityMatch(suggestion),
					aiColorAnalysis: this.generateAIColorAnalysis(suggestion),
					aiRecommendations: this.generateAIOutfitRecommendations(suggestion),
					aiConfidence: aiData.confidence,
				};

				this.aiAnalysisCache.set(cacheKey, enhancements);
				return { ...suggestion, ...enhancements };
			}
		} catch (error) {
			console.warn("AI enhancement failed for outfit:", error);
		}

		// Fallback enhancements
		const fallbackEnhancements = {
			aiDescription: this.generateFallbackDescription(suggestion),
			aiStyleNotes: ["Classic combination", "Well-coordinated colors"],
			aiOccasionFit: `Suitable for ${
				suggestion.occasion || "various occasions"
			}`,
			aiPersonalityMatch: 0.7,
			aiColorAnalysis: "Good color harmony",
			aiRecommendations: [
				"Try different accessories",
				"Consider layering options",
			],
			aiConfidence: 0.6,
		};

		return { ...suggestion, ...fallbackEnhancements };
	}

	// Helper methods
	private extractPreferredCategories() {
		const categoryCount = this.items.reduce((acc, item) => {
			acc[item.category] = (acc[item.category] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		return Object.entries(categoryCount)
			.sort(([, a], [, b]) => b - a)
			.slice(0, 3)
			.map(([category]) => category as any);
	}

	private determineRiskToleranceFromAI(
		aiProfile: any
	): AIStyleProfile["riskTolerance"] {
		const themes = aiProfile.dominantThemes || [];
		const boldThemes = themes.filter((theme: string) =>
			["edgy", "bold", "adventurous", "experimental"].includes(
				theme.toLowerCase()
			)
		);

		if (boldThemes.length > 1) return "adventurous";
		if (boldThemes.length === 1) return "moderate";
		return "conservative";
	}

	private calculateOccasionFrequency() {
		const frequency = this.items.reduce((acc, item) => {
			item.occasions.forEach((occasion) => {
				acc[occasion] = (acc[occasion] || 0) + 1;
			});
			return acc;
		}, {} as Record<Occasion, number>);

		return frequency;
	}

	private calculatePersonalityMatch(suggestion: OutfitSuggestion): number {
		if (!this.aiStyleProfile) return 0.7;

		const personality = this.aiStyleProfile.stylePersonality;
		const items = suggestion.items;

		// Calculate match based on style personality
		switch (personality) {
			case "minimalist":
				return items.length <= 3 ? 0.9 : 0.5;
			case "formal":
				return items.every(
					(item) =>
						item.occasions.includes("formal") || item.occasions.includes("work")
				)
					? 0.9
					: 0.4;
			case "casual":
				return items.some((item) => item.occasions.includes("casual"))
					? 0.8
					: 0.5;
			case "trendy":
				return items.some((item) => item.mood_tags.includes("trendy"))
					? 0.9
					: 0.6;
			case "classic":
				return items.every((item) => !item.mood_tags.includes("edgy"))
					? 0.8
					: 0.5;
			case "eclectic":
				const colorVariety = new Set(items.flatMap((item) => item.colors)).size;
				return colorVariety >= 3 ? 0.9 : 0.6;
			default:
				return 0.7;
		}
	}

	private generateAIColorAnalysis(suggestion: OutfitSuggestion): string {
		const colors = suggestion.items.flatMap((item) => item.colors);
		const uniqueColors = new Set(colors);

		if (uniqueColors.size === 1) {
			return "Monochromatic color scheme creates a cohesive look";
		} else if (uniqueColors.size === 2) {
			return "Complementary color pairing enhances visual appeal";
		} else if (uniqueColors.size === 3) {
			return "Triadic color harmony creates dynamic balance";
		} else {
			return "Rich color palette adds visual interest";
		}
	}

	private generateAIOutfitRecommendations(
		suggestion: OutfitSuggestion
	): string[] {
		const recommendations: string[] = [];

		// Season-based recommendations
		if (suggestion.season === "winter") {
			recommendations.push("Consider adding a warm layer for comfort");
		} else if (suggestion.season === "summer") {
			recommendations.push("Light fabrics will keep you cool and comfortable");
		}

		// Occasion-based recommendations
		if (suggestion.occasion === "formal") {
			recommendations.push("Ensure all pieces are well-pressed and fitted");
		} else if (suggestion.occasion === "casual") {
			recommendations.push("Perfect for relaxed, everyday wear");
		}

		// Color-based recommendations
		const colors = suggestion.items.flatMap((item) => item.colors);
		if (colors.includes("#000000") || colors.includes("black")) {
			recommendations.push("Black adds sophistication and versatility");
		}

		return recommendations.slice(0, 3);
	}

	private generateFallbackDescription(suggestion: OutfitSuggestion): string {
		const itemNames = suggestion.items.map((item) => item.name).join(", ");
		const occasion = suggestion.occasion || "any occasion";
		return `A stylish combination featuring ${itemNames}, perfect for ${occasion}.`;
	}
}
