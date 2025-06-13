import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ClothingCategory, Occasion, Season, MoodTag } from "@/types";

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// Cross-browser compatible UUID generator
export function generateUUID(): string {
	// Try to use crypto.randomUUID if available
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback to manual UUID generation
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

// Image processing utilities
export const imageUtils = {
	// Validate image file
	validateImage(file: File): { valid: boolean; error?: string } {
		const maxSize = 5 * 1024 * 1024; // 5MB
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

		if (!allowedTypes.includes(file.type)) {
			return {
				valid: false,
				error: "Please upload a JPEG, PNG, or WebP image",
			};
		}

		if (file.size > maxSize) {
			return { valid: false, error: "Image must be less than 5MB" };
		}

		return { valid: true };
	},

	// Resize image to optimize storage
	async resizeImage(
		file: File,
		maxWidth: number = 800,
		maxHeight: number = 800,
		quality: number = 0.8
	): Promise<File> {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			const img = new Image();

			img.onload = () => {
				// Calculate new dimensions
				let { width, height } = img;

				if (width > height) {
					if (width > maxWidth) {
						height = (height * maxWidth) / width;
						width = maxWidth;
					}
				} else {
					if (height > maxHeight) {
						width = (width * maxHeight) / height;
						height = maxHeight;
					}
				}

				canvas.width = width;
				canvas.height = height;

				// Draw and compress
				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						const resizedFile = new File([blob!], file.name, {
							type: file.type,
							lastModified: Date.now(),
						});
						resolve(resizedFile);
					},
					file.type,
					quality
				);
			};

			img.src = URL.createObjectURL(file);
		});
	},

	// Extract dominant colors from image (simplified version)
	async extractColors(file: File): Promise<string[]> {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			const img = new Image();

			img.onload = () => {
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;
				const colorMap = new Map<string, number>();

				// Sample every 10th pixel for performance
				for (let i = 0; i < data.length; i += 40) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];

					// Skip very light or very dark colors
					if (r + g + b < 50 || r + g + b > 700) continue;

					const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
						.toString(16)
						.slice(1)}`;
					colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
				}

				// Get top 3 colors
				const sortedColors = Array.from(colorMap.entries())
					.sort((a, b) => b[1] - a[1])
					.slice(0, 3)
					.map(([color]) => color);

				resolve(sortedColors);
			};

			img.src = URL.createObjectURL(file);
		});
	},
};

// Form validation utilities
export const validation = {
	clothingItem: {
		name: (value: string) => {
			if (!value.trim()) return "Name is required";
			if (value.length < 2) return "Name must be at least 2 characters";
			if (value.length > 100) return "Name must be less than 100 characters";
			return null;
		},

		category: (value: ClothingCategory | "") => {
			if (!value) return "Category is required";
			return null;
		},

		colors: (value: string[]) => {
			if (value.length === 0) return "At least one color is required";
			return null;
		},
	},
};

// Constants for dropdown options
export const CLOTHING_CATEGORIES: { value: ClothingCategory; label: string }[] =
	[
		{ value: "tops", label: "Tops" },
		{ value: "bottoms", label: "Bottoms" },
		{ value: "dresses", label: "Dresses" },
		{ value: "outerwear", label: "Outerwear" },
		{ value: "shoes", label: "Shoes" },
		{ value: "accessories", label: "Accessories" },
		{ value: "underwear", label: "Underwear" },
		{ value: "activewear", label: "Activewear" },
		{ value: "sleepwear", label: "Sleepwear" },
		{ value: "formal", label: "Formal" },
	];

export const OCCASIONS: { value: Occasion; label: string }[] = [
	{ value: "casual", label: "Casual" },
	{ value: "work", label: "Work" },
	{ value: "formal", label: "Formal" },
	{ value: "party", label: "Party" },
	{ value: "date", label: "Date" },
	{ value: "workout", label: "Workout" },
	{ value: "travel", label: "Travel" },
	{ value: "home", label: "Home" },
	{ value: "special_event", label: "Special Event" },
	{ value: "outdoor", label: "Outdoor" },
];

export const SEASONS: { value: Season; label: string }[] = [
	{ value: "spring", label: "Spring" },
	{ value: "summer", label: "Summer" },
	{ value: "fall", label: "Fall" },
	{ value: "winter", label: "Winter" },
	{ value: "all_season", label: "All Season" },
];

export const MOOD_TAGS: { value: MoodTag; label: string }[] = [
	{ value: "confident", label: "Confident" },
	{ value: "comfortable", label: "Comfortable" },
	{ value: "elegant", label: "Elegant" },
	{ value: "edgy", label: "Edgy" },
	{ value: "playful", label: "Playful" },
	{ value: "professional", label: "Professional" },
	{ value: "romantic", label: "Romantic" },
	{ value: "sporty", label: "Sporty" },
	{ value: "trendy", label: "Trendy" },
	{ value: "classic", label: "Classic" },
];

// Date formatting utilities
export const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
};

export const formatRelativeTime = (dateString: string) => {
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) return "Just now";
	if (diffInSeconds < 3600)
		return `${Math.floor(diffInSeconds / 60)} minutes ago`;
	if (diffInSeconds < 86400)
		return `${Math.floor(diffInSeconds / 3600)} hours ago`;
	if (diffInSeconds < 604800)
		return `${Math.floor(diffInSeconds / 86400)} days ago`;

	return formatDate(dateString);
};
