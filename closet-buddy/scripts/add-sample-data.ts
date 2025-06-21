import { ClothingItemService } from "../lib/supabase";

// Note: This script is deprecated since we no longer use demo users
// Sample data should be added through the DebugDatabase component
// which uses authenticated user IDs

const createSampleItems = (userId: string) => [
	{
		user_id: userId,
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
		user_id: userId,
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
		user_id: userId,
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
		user_id: userId,
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

export async function addSampleData(userId: string) {
	console.log("Adding sample data for user:", userId);

	const sampleItems = createSampleItems(userId);

	for (const item of sampleItems) {
		try {
			const { data, error } = await ClothingItemService.create(item);
			if (error) {
				console.error("Error creating item:", item.name, error);
			} else {
				console.log("Created item:", item.name, data);
			}
		} catch (err) {
			console.error("Exception creating item:", item.name, err);
		}
	}

	console.log("Sample data addition complete");
}

// Note: This script can no longer be run directly since it requires a user ID
// Use the DebugDatabase component in the app instead
