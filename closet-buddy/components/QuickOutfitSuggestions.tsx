"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { OutfitSuggestion } from "@/lib/outfitEngine";
import { OutfitService } from "@/lib/outfitService";
import { cn } from "@/lib/utils";

interface QuickOutfitSuggestionsProps {
	userId: string;
	maxSuggestions?: number;
}

export function QuickOutfitSuggestions({
	userId,
	maxSuggestions = 3,
}: QuickOutfitSuggestionsProps) {
	const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const loadSuggestions = useCallback(async () => {
		try {
			setLoading(true);
			const quickSuggestions = await OutfitService.getQuickSuggestions(userId);
			setSuggestions(quickSuggestions.slice(0, maxSuggestions));
		} catch (error) {
			console.error("Error loading quick suggestions:", error);
			setSuggestions([]);
		} finally {
			setLoading(false);
		}
	}, [userId, maxSuggestions]);

	useEffect(() => {
		loadSuggestions();
	}, [loadSuggestions]);

	const refreshSuggestions = async () => {
		try {
			setRefreshing(true);
			const freshSuggestions = await OutfitService.getFreshSuggestions(userId);
			setSuggestions(freshSuggestions.slice(0, maxSuggestions));
		} catch (error) {
			console.error("Error refreshing suggestions:", error);
		} finally {
			setRefreshing(false);
		}
	};

	if (loading) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center gap-2 mb-4">
					<Sparkles className="w-5 h-5 text-purple-600" />
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Today&apos;s Outfit Suggestions
					</h2>
				</div>
				<div className="flex items-center justify-center py-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
				</div>
			</div>
		);
	}

	if (suggestions.length === 0) {
		return (
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
				<div className="flex items-center gap-2 mb-4">
					<Sparkles className="w-5 h-5 text-purple-600" />
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Today&apos;s Outfit Suggestions
					</h2>
				</div>
				<div className="text-center py-8">
					<div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
						<Sparkles className="w-6 h-6 text-gray-400" />
					</div>
					<p className="text-gray-600 dark:text-gray-400 mb-4">
						Add more items to your wardrobe to get outfit suggestions
					</p>
					<Link
						href="/add-item"
						className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
						Add Items
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<Sparkles className="w-5 h-5 text-purple-600" />
					<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
						Today&apos;s Outfit Suggestions
					</h2>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={refreshSuggestions}
						disabled={refreshing}
						className="p-2 text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
						title="Refresh suggestions">
						<RefreshCw
							className={cn("w-4 h-4", refreshing && "animate-spin")}
						/>
					</button>
					<Link
						href="/outfits"
						className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
						View All
						<ArrowRight className="w-4 h-4" />
					</Link>
				</div>
			</div>

			{/* Suggestions */}
			<div className="space-y-4">
				{suggestions.map((suggestion, index) => (
					<div
						key={suggestion.id}
						className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
						{/* Items Preview */}
						<div className="flex items-center gap-3 mb-3">
							<div className="flex -space-x-2">
								{suggestion.items.slice(0, 4).map((item, itemIndex) => (
									<div
										key={item.id}
										className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-700">
										<Image
											src={item.image_url}
											alt={item.name}
											fill
											className="object-cover"
										/>
									</div>
								))}
								{suggestion.items.length > 4 && (
									<div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
										<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
											+{suggestion.items.length - 4}
										</span>
									</div>
								)}
							</div>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-900 dark:text-gray-100">
										{suggestion.items.length} piece outfit
									</span>
									<div
										className={cn(
											"px-2 py-0.5 rounded-full text-xs font-medium",
											suggestion.score >= 0.8
												? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
												: suggestion.score >= 0.6
												? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
												: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
										)}>
										{Math.round(suggestion.score * 100)}% match
									</div>
								</div>
								{suggestion.reasoning.length > 0 && (
									<p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
										{suggestion.reasoning[0]}
									</p>
								)}
							</div>
						</div>

						{/* Tags */}
						<div className="flex flex-wrap gap-1">
							{suggestion.occasion && (
								<span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full capitalize">
									{suggestion.occasion.replace("_", " ")}
								</span>
							)}
							{suggestion.season && (
								<span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full capitalize">
									{suggestion.season}
								</span>
							)}
							{suggestion.mood && (
								<span className="px-2 py-1 bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 text-xs rounded-full capitalize">
									{suggestion.mood}
								</span>
							)}
						</div>
					</div>
				))}
			</div>

			{/* View All Link */}
			<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
				<Link
					href="/outfits"
					className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-sm font-medium">
					<Sparkles className="w-4 h-4 mr-2" />
					Explore More Outfits
				</Link>
			</div>
		</div>
	);
}
