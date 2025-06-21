"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Palette, Users, Sparkles, Brain, Target } from "lucide-react";
import { OutfitSuggestion } from "@/lib/outfitEngine";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";

interface OutfitCardProps {
	suggestion: OutfitSuggestion;
	onSave?: (suggestion: OutfitSuggestion, name: string) => void;
	onTryOn?: (suggestion: OutfitSuggestion) => void;
	className?: string;
}

export function OutfitCard({
	suggestion,
	onSave,
	onTryOn,
	className = "",
}: OutfitCardProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);
	const [outfitName, setOutfitName] = useState("");
	const { success, error: showError } = useToast();

	const handleSave = async () => {
		if (!onSave || !outfitName.trim()) return;

		setIsSaving(true);
		try {
			await onSave(suggestion, outfitName.trim());
			setShowSaveModal(false);
			setOutfitName("");
			success(
				"Outfit saved!",
				`"${outfitName}" has been added to your favorites`
			);
		} catch {
			showError("Failed to save outfit", "Please try again");
		} finally {
			setIsSaving(false);
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 0.8) return "text-green-600 bg-green-100";
		if (score >= 0.6) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getScoreLabel = (score: number) => {
		if (score >= 0.8) return "Excellent";
		if (score >= 0.6) return "Good";
		return "Fair";
	};

	return (
		<>
			{/* Save Modal */}
			{showSaveModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
							Save Outfit
						</h3>
						<input
							type="text"
							value={outfitName}
							onChange={(e) => setOutfitName(e.target.value)}
							placeholder="Enter outfit name..."
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
							autoFocus
						/>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setShowSaveModal(false)}
								className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
								disabled={isSaving}>
								Cancel
							</button>
							<button
								onClick={handleSave}
								disabled={!outfitName.trim() || isSaving}
								className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
								{isSaving ? "Saving..." : "Save"}
							</button>
						</div>
					</div>
				</div>
			)}

			<div
				className={cn(
					"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200",
					className
				)}>
				{/* Header */}
				<div className="p-4 border-b border-gray-100 dark:border-gray-700">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{suggestion.aiConfidence ? (
								<Brain className="w-5 h-5 text-purple-600" />
							) : (
								<Sparkles className="w-5 h-5 text-purple-600" />
							)}
							<h3 className="font-semibold text-gray-900 dark:text-gray-100">
								{suggestion.aiConfidence
									? "AI-Powered Outfit"
									: "Outfit Suggestion"}
							</h3>
							{suggestion.stylePersonality && (
								<span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full capitalize">
									{suggestion.stylePersonality}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							{suggestion.aiConfidence && (
								<div className="flex items-center gap-1">
									<Target className="w-3 h-3 text-blue-600" />
									<span className="text-xs text-blue-600 font-medium">
										{Math.round(suggestion.aiConfidence * 100)}% AI Match
									</span>
								</div>
							)}
							<div
								className={cn(
									"px-2 py-1 rounded-full text-xs font-medium",
									getScoreColor(suggestion.score)
								)}>
								{getScoreLabel(suggestion.score)}
							</div>
						</div>
					</div>

					{/* Tags */}
					<div className="flex flex-wrap gap-1 mt-2">
						{suggestion.occasion && (
							<span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
								{suggestion.occasion.replace("_", " ")}
							</span>
						)}
						{suggestion.season && (
							<span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full capitalize">
								{suggestion.season}
							</span>
						)}
						{suggestion.mood && (
							<span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full capitalize">
								{suggestion.mood}
							</span>
						)}
					</div>
				</div>

				{/* Items Grid */}
				<div className="p-4">
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
						{suggestion.items.map((item) => (
							<div key={item.id} className="relative group">
								<div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
									<Image
										src={item.image_url}
										alt={item.name}
										fill
										className="object-cover group-hover:scale-105 transition-transform duration-200"
									/>
									<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
								</div>
								<div className="mt-1">
									<p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
										{item.name}
									</p>
									<p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
										{item.category.replace("_", " ")}
									</p>
								</div>

								{/* Colors */}
								{item.colors.length > 0 && (
									<div className="flex gap-1 mt-1">
										{item.colors.slice(0, 3).map((color) => (
											<div
												key={color}
												className="w-3 h-3 rounded-full border border-gray-200 dark:border-gray-600"
												style={{ backgroundColor: color }}
												title={color}
											/>
										))}
									</div>
								)}
							</div>
						))}
					</div>

					{/* Reasoning */}
					{(suggestion.reasoning.length > 0 ||
						suggestion.aiRecommendations?.length) && (
						<div className="mb-4">
							<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
								Why this works:
							</h4>
							<ul className="space-y-1">
								{suggestion.reasoning.map((reason, index) => (
									<li
										key={index}
										className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
										<div className="w-1.5 h-1.5 bg-purple-600 rounded-full flex-shrink-0" />
										{reason}
									</li>
								))}
								{suggestion.aiRecommendations?.map((recommendation, index) => (
									<li
										key={`ai-${index}`}
										className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
										<Brain className="w-3 h-3 text-blue-600 flex-shrink-0" />
										{recommendation}
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Scores */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div className="text-center">
							<div className="flex items-center justify-center gap-1 mb-1">
								<Palette className="w-4 h-4 text-purple-600" />
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
									Color Harmony
								</span>
							</div>
							<div className="text-lg font-bold text-gray-900 dark:text-gray-100">
								{Math.round(suggestion.colorHarmony * 100)}%
							</div>
						</div>
						<div className="text-center">
							<div className="flex items-center justify-center gap-1 mb-1">
								<Users className="w-4 h-4 text-purple-600" />
								<span className="text-xs font-medium text-gray-700 dark:text-gray-300">
									Style Coherence
								</span>
							</div>
							<div className="text-lg font-bold text-gray-900 dark:text-gray-100">
								{Math.round(suggestion.styleCoherence * 100)}%
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2">
						{onTryOn && (
							<button
								onClick={() => onTryOn(suggestion)}
								className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm">
								Try This Outfit
							</button>
						)}
						{onSave && (
							<button
								onClick={() => setShowSaveModal(true)}
								className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm flex items-center gap-2">
								<Heart className="w-4 h-4" />
								Save
							</button>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
