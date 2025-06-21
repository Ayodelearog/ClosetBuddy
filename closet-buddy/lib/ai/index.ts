// AI Services Export Hub
import { AIClients } from "./clients";
import { getAIConfig, validateAIConfig, FASHION_MODELS } from "./config";
import type { ClothingItem } from "@/types";

// Initialize AI client
export const aiClient = new AIClients(getAIConfig());

// Export configuration functions and constants
export { getAIConfig, validateAIConfig, FASHION_MODELS };
export { fashionClient } from "./huggingface-fashion-client";

// Export all types from the centralized types file
export type {
	AIResponse,
	StyleAnalysisInput,
	StyleAnalysisOutput,
	OutfitDescriptionInput,
	OutfitDescriptionOutput,
	FashionAnalysisResult,
	AIConfig,
} from "@/types";

export const AIUtils = {
	// Check if AI services are available
	isAIAvailable(): boolean {
		const config = getAIConfig();
		return validateAIConfig(config);
	},

	// Get current AI provider
	getCurrentProvider(): string {
		const config = getAIConfig();
		return config.provider;
	},

	// Quick style analysis for a wardrobe
	async analyzeWardrobe(items: ClothingItem[]) {
		if (!AIUtils.isAIAvailable()) {
			return AIUtils.getFallbackStyleAnalysis(items);
		}

		const styleInput = {
			items: items.map((item) => ({
				category: item.category,
				colors: item.colors,
				occasions: item.occasions,
				mood_tags: item.mood_tags,
			})),
		};

		try {
			// Convert styleInput to a prompt string for the AI client
			const prompt = `Analyze this wardrobe: ${JSON.stringify(styleInput)}`;
			const result = await aiClient.analyzeStyle(prompt);
			return result;
		} catch (error) {
			console.warn("AI analysis failed, using fallback:", error);
			return AIUtils.getFallbackStyleAnalysis(items);
		}
	},

	// Fallback style analysis
	getFallbackStyleAnalysis(items: ClothingItem[]) {
		const colors = items.flatMap((item) => item.colors);
		const occasions = items.flatMap((item) => item.occasions);
		const uniqueColors = [...new Set(colors)];

		let stylePersonality = "casual";
		const dominantThemes: string[] = [];
		const recommendations: string[] = [];

		// Simple rule-based analysis
		const formalCount = occasions.filter(
			(o) => o === "formal" || o === "work"
		).length;
		const casualCount = occasions.filter((o) => o === "casual").length;

		if (formalCount > casualCount) {
			stylePersonality = "formal";
			dominantThemes.push("professional", "polished");
			recommendations.push("Your wardrobe shows a professional aesthetic");
		} else if (uniqueColors.length <= 4) {
			stylePersonality = "minimalist";
			dominantThemes.push("clean", "simple");
			recommendations.push(
				"Your minimalist approach creates effortless elegance"
			);
		} else {
			dominantThemes.push("comfortable", "versatile");
			recommendations.push(
				"Build a versatile wardrobe with mix-and-match pieces"
			);
		}

		return {
			success: true,
			data: {
				stylePersonality,
				dominantThemes,
				colorPalette: uniqueColors.slice(0, 6),
				recommendations,
				confidence: 0.75,
			},
			confidence: 0.75,
		};
	},

	// Quick outfit description
	async describeOutfit(
		items: ClothingItem[],
		context?: {
			occasion?: string;
			season?: string;
			mood?: string;
		}
	) {
		if (!AIUtils.isAIAvailable()) {
			return AIUtils.getFallbackOutfitDescription(items, context);
		}

		const descriptionInput = {
			items: items.map((item) => ({
				name: item.name,
				category: item.category,
				colors: item.colors,
			})),
			...context,
		};

		try {
			// Convert descriptionInput to a prompt string for the AI client
			const prompt = `Describe this outfit: ${JSON.stringify(
				descriptionInput
			)}`;
			const result = await aiClient.analyzeStyle(prompt);
			return result;
		} catch (error) {
			console.warn("AI outfit description failed, using fallback:", error);
			return AIUtils.getFallbackOutfitDescription(items, context);
		}
	},

	// Fallback outfit description
	getFallbackOutfitDescription(
		items: ClothingItem[],
		context?: {
			occasion?: string;
			season?: string;
			mood?: string;
		}
	) {
		const itemNames = items.map((item) => item.name);
		const colors = items.flatMap((item) => item.colors);
		const uniqueColors = [...new Set(colors)];

		let description = `A stylish ensemble featuring ${itemNames
			.slice(0, 2)
			.join(" and ")}`;

		if (uniqueColors.length === 1) {
			description += ` in ${uniqueColors[0]}`;
		} else if (uniqueColors.length === 2) {
			description += ` with ${uniqueColors.join(" and ")} tones`;
		}

		const styleNotes = ["Well-coordinated pieces", "Balanced color scheme"];
		let occasionFit = "Versatile for multiple occasions";

		if (context?.occasion) {
			occasionFit = `Perfect for ${context.occasion} occasions`;
		}

		return {
			success: true,
			data: {
				description,
				styleNotes,
				occasionFit,
				confidence: 0.8,
			},
			confidence: 0.8,
		};
	},

	// Generate color recommendations
	async getColorRecommendations(baseColors: string[], occasion?: string) {
		if (!AIUtils.isAIAvailable()) {
			return {
				success: false,
				recommendations: AIUtils.getFallbackColorRecommendations(baseColors),
			};
		}

		try {
			// Use the fashion client for better color analysis
			const { fashionClient } = await import("./huggingface-fashion-client");
			const prompt = `Given these base colors: ${baseColors.join(
				", "
			)}, suggest 3-5 complementary colors that would work well ${
				occasion ? `for ${occasion} occasions` : "in general"
			}. Consider color harmony principles.`;

			const advice = await fashionClient.getFashionAdvice(prompt);

			// Extract colors from the advice (simplified approach)
			const colorKeywords = [
				"red",
				"blue",
				"green",
				"black",
				"white",
				"yellow",
				"pink",
				"purple",
				"orange",
				"brown",
				"gray",
				"navy",
				"beige",
			];
			const recommendedColors = colorKeywords.filter((color) =>
				advice.toLowerCase().includes(color)
			);

			return {
				success: true,
				recommendations:
					recommendedColors.length > 0
						? recommendedColors
						: AIUtils.getFallbackColorRecommendations(baseColors),
			};
		} catch (error) {
			console.warn("AI color recommendations failed:", error);
			return {
				success: false,
				recommendations: AIUtils.getFallbackColorRecommendations(baseColors),
			};
		}
	},

	// Fallback color recommendations using color theory
	getFallbackColorRecommendations(baseColors: string[]): string[] {
		const recommendations: string[] = [];

		// Add neutral colors that go with everything
		const neutrals = ["#FFFFFF", "#000000", "#808080", "#F5F5DC", "#2F4F4F"];
		recommendations.push(...neutrals.slice(0, 2));

		// Add complementary colors based on basic color theory
		baseColors.forEach((color) => {
			const lowerColor = color.toLowerCase();
			if (lowerColor.includes("blue")) {
				recommendations.push("#FFA500"); // Orange
			} else if (lowerColor.includes("red")) {
				recommendations.push("#008000"); // Green
			} else if (lowerColor.includes("yellow")) {
				recommendations.push("#800080"); // Purple
			}
		});

		// Remove duplicates and limit to 5
		return [...new Set(recommendations)].slice(0, 5);
	},

	// Get AI provider status
	getProviderStatus() {
		const config = getAIConfig();
		return {
			provider: config.provider,
			configured: validateAIConfig(config),
			models: config.models,
			hasApiKey: !!config.apiKey,
			baseUrl: config.baseUrl,
		};
	},

	// Test AI connection
	async testConnection() {
		if (!AIUtils.isAIAvailable()) {
			return {
				success: false,
				error: "AI services not configured",
			};
		}

		try {
			const testPrompt = "Test connection with a simple style analysis";
			const testResponse = await aiClient.analyzeStyle(testPrompt);

			return {
				success: testResponse.success,
				provider: AIUtils.getCurrentProvider(),
				error: testResponse.error,
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	},
};

// Export commonly used AI functions
export const isAIAvailable = () => AIUtils.isAIAvailable();
export const getCurrentProvider = () => AIUtils.getCurrentProvider();
export const analyzeWardrobe = (items: ClothingItem[]) =>
	AIUtils.analyzeWardrobe(items);
export const describeOutfit = (
	items: ClothingItem[],
	context?: {
		occasion?: string;
		season?: string;
		mood?: string;
	}
) => AIUtils.describeOutfit(items, context);
export const getColorRecommendations = (
	baseColors: string[],
	occasion?: string
) => AIUtils.getColorRecommendations(baseColors, occasion);
export const getProviderStatus = () => AIUtils.getProviderStatus();
export const testConnection = () => AIUtils.testConnection();
