"use client";

import { useState, useEffect, useCallback } from "react";
import { ClothingItemService } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const sampleItems = [
	{
		user_id: "placeholder", // Will be replaced with actual user ID
		name: "White Cotton T-Shirt",
		category: "tops" as const,
		colors: ["#FFFFFF"],
		image_url:
			"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
		image_path: "sample/white-tshirt.jpg",
		occasions: ["casual", "work"] as const,
		seasons: ["spring", "summer"] as const,
		mood_tags: ["comfortable", "classic"] as const,
		brand: "Uniqlo",
		size: "M",
		material: "Cotton",
		wear_count: 0,
		favorite: false,
	},
	{
		user_id: "placeholder", // Will be replaced with actual user ID
		name: "Blue Jeans",
		category: "bottoms" as const,
		colors: ["#4169E1"],
		image_url:
			"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
		image_path: "sample/blue-jeans.jpg",
		occasions: ["casual", "work"] as const,
		seasons: ["spring", "fall", "winter"] as const,
		mood_tags: ["comfortable", "classic"] as const,
		brand: "Levi's",
		size: "32",
		material: "Denim",
		wear_count: 0,
		favorite: true,
	},
	{
		user_id: "placeholder", // Will be replaced with actual user ID
		name: "Black Blazer",
		category: "outerwear" as const,
		colors: ["#000000"],
		image_url:
			"https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400",
		image_path: "sample/black-blazer.jpg",
		occasions: ["work", "formal"] as const,
		seasons: ["fall", "winter", "spring"] as const,
		mood_tags: ["professional", "elegant"] as const,
		brand: "Zara",
		size: "M",
		material: "Wool Blend",
		wear_count: 0,
		favorite: false,
	},
	{
		user_id: "placeholder", // Will be replaced with actual user ID
		name: "White Sneakers",
		category: "shoes" as const,
		colors: ["#FFFFFF"],
		image_url:
			"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
		image_path: "sample/white-sneakers.jpg",
		occasions: ["casual", "work"] as const,
		seasons: ["spring", "summer", "fall"] as const,
		mood_tags: ["comfortable", "sporty"] as const,
		brand: "Adidas",
		size: "9",
		material: "Leather",
		wear_count: 0,
		favorite: true,
	},
];

export function DebugDatabase() {
	const { user } = useAuth();
	const [items, setItems] = useState<unknown[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [adding, setAdding] = useState(false);

	const loadItems = useCallback(async () => {
		if (!user) return;

		try {
			setLoading(true);
			console.log("DebugDatabase: Loading items for user:", user.id);
			const { data, error } = await ClothingItemService.getAll(user.id);
			console.log("DebugDatabase: Result:", { data, error });

			if (error) {
				setError(error.message || "Unknown error");
			} else {
				setItems(data || []);
			}
		} catch (err) {
			console.error("DebugDatabase: Error:", err);
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, [user]);

	const addSampleData = async () => {
		if (!user) return;

		try {
			setAdding(true);
			console.log("Adding sample data...");

			for (const item of sampleItems) {
				const itemWithUserId = {
					...item,
					user_id: user.id,
					occasions: [...item.occasions],
					seasons: [...item.seasons],
					mood_tags: [...item.mood_tags],
				};
				const { data, error } = await ClothingItemService.create(
					itemWithUserId
				);
				if (error) {
					console.error("Error creating item:", item.name, error);
				} else {
					console.log("Created item:", item.name, data);
				}
			}

			console.log("Sample data addition complete");
			// Reload items after adding
			await loadItems();
		} catch (err) {
			console.error("Exception adding sample data:", err);
		} finally {
			setAdding(false);
		}
	};

	useEffect(() => {
		loadItems();
	}, [loadItems]);

	if (!user) {
		return null;
	}

	return (
		<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
			<h3 className="text-lg font-semibold text-yellow-800 mb-2">
				🐛 Database Debug Info
			</h3>
			{loading && <p className="text-yellow-700">Loading items...</p>}
			{error && <p className="text-red-600">Error: {error}</p>}
			{!loading && !error && (
				<div className="text-yellow-700">
					<p>Items found: {items.length}</p>
					{items.length === 0 && (
						<div className="mt-2">
							<button
								onClick={addSampleData}
								disabled={adding}
								className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
								{adding ? "Adding..." : "Add Sample Data"}
							</button>
						</div>
					)}
					{items.length > 0 && (
						<details className="mt-2">
							<summary className="cursor-pointer">View items</summary>
							<pre className="mt-2 text-xs bg-yellow-100 p-2 rounded overflow-auto max-h-40">
								{JSON.stringify(items, null, 2)}
							</pre>
						</details>
					)}
				</div>
			)}
		</div>
	);
}
