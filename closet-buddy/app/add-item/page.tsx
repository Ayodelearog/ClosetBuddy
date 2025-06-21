"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ImageUpload";
import { AddClothingItemForm, ClothingCategory } from "@/types";
import {
	CLOTHING_CATEGORIES,
	validation,
	imageUtils,
	generateUUID,
} from "@/lib/utils";
import { ClothingItemService, StorageService } from "@/lib/supabase";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function AddItemPageContent() {
	const { user } = useAuth();
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const { success, error: showError, info } = useToast();
	const [formData, setFormData] = useState<AddClothingItemForm>({
		name: "",
		category: "" as ClothingCategory,
		subcategory: "",
		colors: [],
		occasions: [],
		seasons: [],
		mood_tags: [],
		brand: "",
		size: "",
		material: "",
		care_instructions: "",
		purchase_date: "",
		notes: "",
		image: null,
	});

	const handleInputChange = (
		field: keyof AddClothingItemForm,
		value: unknown
	) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	// Removed handleMultiSelect as it's not used in the current form

	const handleColorExtraction = async (file: File) => {
		try {
			info("Analyzing image", "Extracting colors from your clothing item...");
			const extractedColors = await imageUtils.extractColors(file);
			setFormData((prev) => ({ ...prev, colors: extractedColors }));
			success(
				"Colors detected!",
				`Found ${extractedColors.length} dominant colors in your image`
			);
		} catch (error) {
			console.error("Color extraction failed:", error);
			showError(
				"Color extraction failed",
				"Unable to detect colors from the image. You can add colors manually."
			);
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		// Validate required fields
		const nameError = validation.clothingItem.name(formData.name);
		if (nameError) newErrors.name = nameError;

		const categoryError = validation.clothingItem.category(formData.category);
		if (categoryError) newErrors.category = categoryError;

		if (!formData.image) newErrors.image = "Image is required";

		const colorsError = validation.clothingItem.colors(formData.colors);
		if (colorsError) newErrors.colors = colorsError;

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;
		if (!user) return;

		setIsSubmitting(true);

		try {
			info("Saving item", "Uploading your clothing item to your wardrobe...");

			const itemId = generateUUID();

			// Upload image to Supabase Storage
			console.log("Uploading image for user:", user.id, "itemId:", itemId);
			const { data: uploadData, error: uploadError } =
				await StorageService.uploadImage(formData.image!, user.id, itemId);

			if (uploadError) {
				console.error("Image upload error:", uploadError);
				throw new Error(
					`Failed to upload image: ${uploadError.message || uploadError}`
				);
			}

			console.log("Image uploaded successfully:", uploadData);

			// Create clothing item record
			const itemData = {
				user_id: user.id,
				name: formData.name,
				category: formData.category,
				subcategory: formData.subcategory || undefined,
				colors: formData.colors,
				image_url: uploadData!.url,
				image_path: uploadData!.path,
				occasions: formData.occasions,
				seasons: formData.seasons,
				mood_tags: formData.mood_tags,
				brand: formData.brand || undefined,
				size: formData.size || undefined,
				material: formData.material || undefined,
				care_instructions: formData.care_instructions || undefined,
				purchase_date: formData.purchase_date || undefined,
				last_worn: undefined,
				wear_count: 0,
				favorite: false,
				notes: formData.notes || undefined,
			};

			console.log("Creating item with data:", itemData);
			const { data: createdItem, error } = await ClothingItemService.create(
				itemData
			);

			if (error) {
				console.error("Database error:", error);
				throw new Error(`Failed to save item: ${error.message || error}`);
			}

			console.log("Item created successfully:", createdItem);

			success(
				"Item added!",
				`"${formData.name}" has been added to your wardrobe successfully`
			);

			// Redirect to wardrobe page after a short delay to show the success message
			setTimeout(() => {
				router.push("/wardrobe");
			}, 1500);
		} catch (error) {
			console.error("Error saving item:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Failed to save item";
			showError("Failed to save item", errorMessage);
			setErrors({ submit: errorMessage });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			{/* Header */}
			<div className="flex items-center gap-4 mb-8">
				<Link
					href="/wardrobe"
					className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300">
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
					Add New Item
				</h1>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Image Upload */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Photo *
					</label>
					<ImageUpload
						onImageSelect={(file) => {
							handleInputChange("image", file);
							handleColorExtraction(file);
						}}
						onImageRemove={() => {
							handleInputChange("image", null);
							handleInputChange("colors", []);
						}}
						selectedImage={formData.image}
					/>
					{errors.image && (
						<p className="text-red-500 text-sm mt-1">{errors.image}</p>
					)}
				</div>

				{/* Basic Info */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Name *
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => handleInputChange("name", e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							placeholder="e.g., Blue Cotton T-Shirt"
						/>
						{errors.name && (
							<p className="text-red-500 text-sm mt-1">{errors.name}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Category *
						</label>
						<select
							value={formData.category}
							onChange={(e) =>
								handleInputChange(
									"category",
									e.target.value as ClothingCategory
								)
							}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
							<option value="">Select category</option>
							{CLOTHING_CATEGORIES.map((category) => (
								<option key={category.value} value={category.value}>
									{category.label}
								</option>
							))}
						</select>
						{errors.category && (
							<p className="text-red-500 text-sm mt-1">{errors.category}</p>
						)}
					</div>
				</div>

				{/* Colors */}
				<div>
					<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Colors{" "}
						{formData.colors.length > 0 &&
							`(${formData.colors.length} detected)`}
					</label>
					<div className="flex flex-wrap gap-2">
						{formData.colors.map((color, index) => (
							<div
								key={index}
								className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
								<div
									className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
									style={{ backgroundColor: color }}
								/>
								<span className="text-sm text-gray-900 dark:text-gray-100">
									{color}
								</span>
								<button
									type="button"
									onClick={() => {
										const newColors = formData.colors.filter(
											(_, i) => i !== index
										);
										handleInputChange("colors", newColors);
									}}
									className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
									×
								</button>
							</div>
						))}
					</div>
					{formData.colors.length === 0 && (
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
							Colors will be automatically detected from your image
						</p>
					)}
					{errors.colors && (
						<p className="text-red-500 text-sm mt-1">{errors.colors}</p>
					)}
				</div>

				{/* Submit Button */}
				<div className="flex justify-end pt-6">
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
						{isSubmitting ? (
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
						) : (
							<Save className="w-5 h-5 mr-2" />
						)}
						{isSubmitting ? "Saving..." : "Save Item"}
					</button>
				</div>

				{errors.submit && (
					<p className="text-red-500 text-sm text-center">{errors.submit}</p>
				)}
			</form>
		</div>
	);
}

export default function AddItemPage() {
	return (
		<ProtectedRoute>
			<AddItemPageContent />
		</ProtectedRoute>
	);
}
