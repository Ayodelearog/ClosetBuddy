"use client";

import { useState, useEffect, useCallback } from "react";
import { Sparkles, RefreshCw, TrendingUp, Brain } from "lucide-react";
import { OutfitSuggestion, SuggestionFilters } from "@/lib/outfitEngine";
import { OutfitService } from "@/lib/outfitService";
import { OutfitCard } from "@/components/OutfitCard";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function OutfitsPageContent() {
	const { user } = useAuth();
	const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [generating, setGenerating] = useState(false);
	const filters: SuggestionFilters = {
		maxItems: 8,
	};

	const toast = useToast();
	const { success, error: showError, info } = toast;

	const loadSuggestions = useCallback(async () => {
		if (!user) return;

		try {
			setLoading(true);
			const newSuggestions = await OutfitService.getOutfitPageSuggestions(
				user.id
			);
			setSuggestions(newSuggestions);

			if (newSuggestions.length === 0) {
				info(
					"No suggestions available",
					"Add more items to your wardrobe to get outfit suggestions"
				);
			}
		} catch (error) {
			console.error("Error loading suggestions:", error);
			showError(
				"Failed to load suggestions",
				error instanceof Error ? error.message : "Please try again"
			);
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]); // Toast functions are stable, safe to omit from deps

	// Load initial suggestions
	useEffect(() => {
		loadSuggestions();
	}, [loadSuggestions]);

	const generateNewSuggestions = async () => {
		if (!user) return;

		try {
			setGenerating(true);
			info(
				"AI analyzing your style",
				"Creating fresh personalized outfit suggestions based on your wardrobe..."
			);

			const newSuggestions = await OutfitService.generateAIOutfitSuggestions(
				user.id,
				filters,
				9 // Generate 9 suggestions for outfit page
			);
			setSuggestions(newSuggestions);

			success(
				"New AI outfits generated!",
				`Found ${newSuggestions.length} fresh outfit suggestions`
			);
		} catch (error) {
			console.error("Error generating suggestions:", error);
			showError(
				"Failed to generate suggestions",
				error instanceof Error ? error.message : "Please try again"
			);
		} finally {
			setGenerating(false);
		}
	};

	const handleSaveOutfit = async (
		suggestion: OutfitSuggestion,
		name: string
	) => {
		if (!user) return;

		try {
			await OutfitService.saveFavoriteOutfit(user.id, suggestion, name);
			// This will be implemented when we add favorite outfits storage
		} catch (error) {
			throw error;
		}
	};

	const handleTryOutfit = () => {
		// This could navigate to a "try on" view or mark items as worn
		info("Try outfit", "This feature will be available soon!");
	};

	const handleAISuggestions = async () => {
		if (!user) return;

		try {
			setGenerating(true);
			info(
				"AI analyzing your style",
				"Creating personalized outfit suggestions based on your wardrobe..."
			);

			const newSuggestions = await OutfitService.generateAIOutfitSuggestions(
				user.id,
				filters,
				9 // Generate 9 suggestions for outfit page
			);
			setSuggestions(newSuggestions);

			success(
				"AI suggestions ready!",
				`Generated ${newSuggestions.length} personalized outfit recommendations`
			);
		} catch (error) {
			showError(
				"Failed to generate AI suggestions",
				error instanceof Error ? error.message : "Please try again"
			);
		} finally {
			setGenerating(false);
		}
	};

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-center min-h-64">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
						<p className="text-gray-600 dark:text-gray-400">
							Loading outfit suggestions...
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
						<Sparkles className="w-8 h-8 text-purple-600" />
						Outfit Suggestions
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-1">
						AI-powered outfit combinations from your wardrobe
					</p>
				</div>

				<button
					onClick={generateNewSuggestions}
					disabled={generating}
					className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50">
					{generating ? (
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
					) : (
						<RefreshCw className="w-5 h-5 mr-2" />
					)}
					{generating ? "Generating..." : "New Suggestions"}
				</button>
			</div>

			{/* AI Suggestions */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
				<div className="flex flex-wrap gap-2">
					<button
						onClick={handleAISuggestions}
						disabled={generating}
						className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-lg hover:from-blue-200 hover:to-purple-200 transition-colors text-sm disabled:opacity-50 font-medium">
						<Brain className="w-4 h-4 mr-2" />
						AI Style Analysis
					</button>
				</div>
			</div>

			{/* Suggestions Grid */}
			{suggestions.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
						<Sparkles className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
						No outfit suggestions available
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						Add more items to your wardrobe to get personalized outfit
						suggestions.
					</p>
					<button
						onClick={generateNewSuggestions}
						className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
						<RefreshCw className="w-5 h-5 mr-2" />
						Try Again
					</button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{suggestions.map((suggestion) => (
						<OutfitCard
							key={suggestion.id}
							suggestion={suggestion}
							onSave={handleSaveOutfit}
							onTryOn={handleTryOutfit}
						/>
					))}
				</div>
			)}

			{/* Stats */}
			{suggestions.length > 0 && (
				<div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6">
					<div className="flex items-center gap-2 mb-4">
						<TrendingUp className="w-5 h-5 text-purple-600" />
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Suggestion Stats
						</h3>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{suggestions.length}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Combinations
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{Math.round(
									(suggestions.reduce((sum, s) => sum + s.score, 0) /
										suggestions.length) *
										100
								)}
								%
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Avg Score
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{Math.round(
									(suggestions.reduce((sum, s) => sum + s.colorHarmony, 0) /
										suggestions.length) *
										100
								)}
								%
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Color Harmony
							</div>
						</div>
						<div className="text-center">
							<div className="text-2xl font-bold text-purple-600">
								{suggestions.reduce((sum, s) => sum + s.items.length, 0)}
							</div>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								Total Items
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function OutfitsPage() {
	return (
		<ProtectedRoute>
			<OutfitsPageContent />
		</ProtectedRoute>
	);
}
