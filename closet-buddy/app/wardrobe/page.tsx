"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import Link from "next/link";
import { ClothingItemCard } from "@/components/ClothingItemCard";
import { FilterState } from "@/types";
import {
	CLOTHING_CATEGORIES,
	OCCASIONS,
	SEASONS,
	MOOD_TAGS,
} from "@/lib/utils";
import { useWardrobe } from "@/hooks/useWardrobe";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// import { useToast } from "@/contexts/ToastContext";

function WardrobePageContent() {
	const { items, loading, error, toggleFavorite, deleteItem, loadItems } =
		useWardrobe();
	// const { success, error: showError, info } = useToast();
	const [filteredItems, setFilteredItems] = useState(items);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showFilters, setShowFilters] = useState(false);

	const [filters, setFilters] = useState<FilterState>({
		categories: [],
		occasions: [],
		seasons: [],
		moods: [],
		colors: [],
		favorites_only: false,
		search_query: "",
	});

	// Calculate active filter count
	const activeFilterCount =
		filters.categories.length +
		filters.occasions.length +
		filters.seasons.length +
		filters.moods.length +
		filters.colors.length +
		(filters.favorites_only ? 1 : 0) +
		(filters.search_query ? 1 : 0);

	const applyFilters = useCallback(() => {
		let filtered = [...items];

		// Search query
		if (filters.search_query) {
			const query = filters.search_query.toLowerCase();
			filtered = filtered.filter(
				(item) =>
					item.name.toLowerCase().includes(query) ||
					item.brand?.toLowerCase().includes(query) ||
					item.notes?.toLowerCase().includes(query)
			);
		}

		// Categories
		if (filters.categories.length > 0) {
			filtered = filtered.filter((item) =>
				filters.categories.includes(item.category)
			);
		}

		// Occasions
		if (filters.occasions.length > 0) {
			filtered = filtered.filter((item) =>
				item.occasions.some((occasion) => filters.occasions.includes(occasion))
			);
		}

		// Seasons
		if (filters.seasons.length > 0) {
			filtered = filtered.filter((item) =>
				item.seasons.some((season) => filters.seasons.includes(season))
			);
		}

		// Moods
		if (filters.moods.length > 0) {
			filtered = filtered.filter((item) =>
				item.mood_tags.some((mood) => filters.moods.includes(mood))
			);
		}

		// Colors
		if (filters.colors.length > 0) {
			filtered = filtered.filter((item) =>
				item.colors.some((color) =>
					filters.colors.some((filterColor) =>
						color.toLowerCase().includes(filterColor.toLowerCase())
					)
				)
			);
		}

		// Favorites only
		if (filters.favorites_only) {
			filtered = filtered.filter((item) => item.favorite);
		}

		setFilteredItems(filtered);
	}, [items, filters]);

	// Apply filters when items or filters change
	useEffect(() => {
		applyFilters();
	}, [applyFilters]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600 mb-4">{error}</p>
				<button
					onClick={loadItems}
					className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
						My Wardrobe
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-1">
						{items.length} {items.length === 1 ? "item" : "items"} in your
						closet
					</p>
				</div>

				<Link
					href="/add-item"
					className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl">
					<Plus className="w-5 h-5 mr-2" />
					Add Item
				</Link>
			</div>

			{/* Search and Filters */}
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
						<input
							type="text"
							placeholder="Search items..."
							value={filters.search_query}
							onChange={(e) =>
								setFilters((prev) => ({
									...prev,
									search_query: e.target.value,
								}))
							}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
						/>
					</div>

					{/* Filter Toggle */}
					<div className="flex gap-2">
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors relative">
							<Filter className="w-5 h-5 mr-2" />
							Filters
							{activeFilterCount > 0 && (
								<span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
									{activeFilterCount}
								</span>
							)}
						</button>

						{/* Clear Filters Button */}
						{(filters.categories.length > 0 ||
							filters.occasions.length > 0 ||
							filters.seasons.length > 0 ||
							filters.moods.length > 0 ||
							filters.colors.length > 0 ||
							filters.favorites_only ||
							filters.search_query) && (
							<button
								onClick={() =>
									setFilters({
										categories: [],
										occasions: [],
										seasons: [],
										moods: [],
										colors: [],
										favorites_only: false,
										search_query: "",
									})
								}
								className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
								Clear all
							</button>
						)}
					</div>

					{/* View Mode Toggle */}
					<div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
						<button
							onClick={() => setViewMode("grid")}
							className={`p-2 ${
								viewMode === "grid"
									? "bg-purple-600 text-white"
									: "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
							}`}>
							<Grid className="w-5 h-5" />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`p-2 ${
								viewMode === "list"
									? "bg-purple-600 text-white"
									: "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
							}`}>
							<List className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Filters Panel */}
				{showFilters && (
					<div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{/* Categories */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Categories
								</label>
								<div className="space-y-1 max-h-32 overflow-y-auto">
									{CLOTHING_CATEGORIES.map((category) => (
										<label key={category.value} className="flex items-center">
											<input
												type="checkbox"
												checked={filters.categories.includes(category.value)}
												onChange={(e) => {
													const newCategories = e.target.checked
														? [...filters.categories, category.value]
														: filters.categories.filter(
																(c) => c !== category.value
														  );
													setFilters((prev) => ({
														...prev,
														categories: newCategories,
													}));
												}}
												className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
											/>
											<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
												{category.label}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Occasions */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Occasions
								</label>
								<div className="space-y-1 max-h-32 overflow-y-auto">
									{OCCASIONS.map((occasion) => (
										<label key={occasion.value} className="flex items-center">
											<input
												type="checkbox"
												checked={filters.occasions.includes(occasion.value)}
												onChange={(e) => {
													const newOccasions = e.target.checked
														? [...filters.occasions, occasion.value]
														: filters.occasions.filter(
																(o) => o !== occasion.value
														  );
													setFilters((prev) => ({
														...prev,
														occasions: newOccasions,
													}));
												}}
												className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
											/>
											<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
												{occasion.label}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Seasons */}
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Seasons
								</label>
								<div className="space-y-1 max-h-32 overflow-y-auto">
									{SEASONS.map((season) => (
										<label key={season.value} className="flex items-center">
											<input
												type="checkbox"
												checked={filters.seasons.includes(season.value)}
												onChange={(e) => {
													const newSeasons = e.target.checked
														? [...filters.seasons, season.value]
														: filters.seasons.filter((s) => s !== season.value);
													setFilters((prev) => ({
														...prev,
														seasons: newSeasons,
													}));
												}}
												className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
											/>
											<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
												{season.label}
											</span>
										</label>
									))}
								</div>
							</div>

							{/* Moods & Favorites */}
							<div className="space-y-4">
								{/* Moods */}
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Moods
									</label>
									<div className="space-y-1 max-h-24 overflow-y-auto">
										{MOOD_TAGS.slice(0, 5).map((mood) => (
											<label key={mood.value} className="flex items-center">
												<input
													type="checkbox"
													checked={filters.moods.includes(mood.value)}
													onChange={(e) => {
														const newMoods = e.target.checked
															? [...filters.moods, mood.value]
															: filters.moods.filter((m) => m !== mood.value);
														setFilters((prev) => ({
															...prev,
															moods: newMoods,
														}));
													}}
													className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
												/>
												<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
													{mood.label}
												</span>
											</label>
										))}
									</div>
								</div>

								{/* Favorites */}
								<div>
									<label className="flex items-center">
										<input
											type="checkbox"
											checked={filters.favorites_only}
											onChange={(e) =>
												setFilters((prev) => ({
													...prev,
													favorites_only: e.target.checked,
												}))
											}
											className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
										/>
										<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
											Favorites only
										</span>
									</label>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Items Grid/List */}
			{filteredItems.length === 0 ? (
				<div className="text-center py-12">
					<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Plus className="w-8 h-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
						{items.length === 0
							? "No items yet"
							: "No items match your filters"}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						{items.length === 0
							? "Start building your digital wardrobe by adding your first clothing item."
							: "Try adjusting your search or filter criteria."}
					</p>
					{items.length === 0 && (
						<Link
							href="/add-item"
							className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
							<Plus className="w-5 h-5 mr-2" />
							Add Your First Item
						</Link>
					)}
				</div>
			) : (
				<div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
							: "flex flex-col space-y-4"
					}>
					{filteredItems.map((item) => (
						<ClothingItemCard
							key={item.id}
							item={item}
							onToggleFavorite={toggleFavorite}
							onDelete={deleteItem}
							viewMode={viewMode}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default function WardrobePage() {
	return (
		<ProtectedRoute>
			<WardrobePageContent />
		</ProtectedRoute>
	);
}
