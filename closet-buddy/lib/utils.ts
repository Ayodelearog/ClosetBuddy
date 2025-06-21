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

	// Extract dominant colors from image using simplified but accurate algorithm
	async extractColors(file: File): Promise<string[]> {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			const img = new Image();

			img.onload = () => {
				// Resize for performance but keep reasonable quality
				const maxSize = 300;
				const scale = Math.min(maxSize / img.width, maxSize / img.height);
				canvas.width = img.width * scale;
				canvas.height = img.height * scale;

				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const colors = this.extractDominantColors(imageData);

				resolve(colors);
			};

			img.src = URL.createObjectURL(file);
		});
	},

	// Simplified but more reliable color extraction
	extractDominantColors(imageData: ImageData): string[] {
		const data = imageData.data;
		const colorCounts = new Map<string, number>();

		// Sample pixels in a grid pattern, focusing on center area
		const stepSize = 4; // Sample every 4th pixel
		const centerX = imageData.width / 2;
		const centerY = imageData.height / 2;

		for (let y = 0; y < imageData.height; y += stepSize) {
			for (let x = 0; x < imageData.width; x += stepSize) {
				const i = (y * imageData.width + x) * 4;
				const r = data[i];
				const g = data[i + 1];
				const b = data[i + 2];
				const a = data[i + 3];

				// Skip transparent pixels
				if (a < 128) continue;

				// Skip very light, very dark, or very gray colors
				if (this.shouldSkipColor(r, g, b)) continue;

				// Quantize colors to reduce noise (group similar colors)
				const quantizedR = Math.round(r / 16) * 16;
				const quantizedG = Math.round(g / 16) * 16;
				const quantizedB = Math.round(b / 16) * 16;

				const hex = this.rgbToHex(quantizedR, quantizedG, quantizedB);

				// Weight pixels closer to center more heavily
				const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
				const maxDistance = Math.min(imageData.width, imageData.height) / 2;
				const weight = Math.max(
					1,
					Math.round(3 * (1 - distance / maxDistance))
				);

				colorCounts.set(hex, (colorCounts.get(hex) || 0) + weight);
			}
		}

		if (colorCounts.size === 0) {
			return ["#808080"]; // Return gray if no valid colors found
		}

		// Get the most frequent colors
		const sortedColors = Array.from(colorCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.map(([color]) => color);

		// Filter out colors that are too similar to each other
		const uniqueColors: string[] = [];
		for (const color of sortedColors) {
			const isSimilar = uniqueColors.some(
				(existingColor) => this.colorDistance(color, existingColor) < 40
			);
			if (!isSimilar) {
				uniqueColors.push(color);
			}
			if (uniqueColors.length >= 4) break;
		}

		return uniqueColors.slice(0, 4);
	},

	// Helper functions for color processing
	shouldSkipColor(r: number, g: number, b: number): boolean {
		const brightness = (r + g + b) / 3;
		const saturation =
			(Math.max(r, g, b) - Math.min(r, g, b)) / Math.max(r, g, b, 1);

		// Don't skip important clothing colors like white, black, and grays
		if (this.isImportantClothingColor(r, g, b)) {
			return false;
		}

		// Skip very dark colors (but not black)
		if (brightness < 25) return true;

		// Skip very bright colors (but not white/cream)
		if (brightness > 230) return true;

		// Skip very unsaturated colors (but not grays, white, black)
		if (saturation < 0.1) return true;

		return false;
	},

	// Check if a color is an important clothing color that should never be skipped
	isImportantClothingColor(r: number, g: number, b: number): boolean {
		const brightness = (r + g + b) / 3;
		const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);

		// White and off-white (high brightness, low color difference)
		if (brightness > 200 && maxDiff < 30) return true;

		// Black and very dark colors (low brightness, low color difference)
		if (brightness < 40 && maxDiff < 30) return true;

		// Gray tones (moderate brightness, low color difference)
		if (brightness > 60 && brightness < 200 && maxDiff < 40) return true;

		return false;
	},

	euclideanDistance(
		a: [number, number, number],
		b: [number, number, number]
	): number {
		return Math.sqrt(
			(a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
		);
	},

	rgbToHex(r: number, g: number, b: number): string {
		return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
	},

	colorDistance(hex1: string, hex2: string): number {
		const rgb1 = this.hexToRgb(hex1);
		const rgb2 = this.hexToRgb(hex2);
		if (!rgb1 || !rgb2) return 0;
		return this.euclideanDistance(
			[rgb1.r, rgb1.g, rgb1.b],
			[rgb2.r, rgb2.g, rgb2.b]
		);
	},

	hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
			  }
			: null;
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
