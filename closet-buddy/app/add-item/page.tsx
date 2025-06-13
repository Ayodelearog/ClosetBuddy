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

export default function AddItemPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

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
			const extractedColors = await imageUtils.extractColors(file);
			setFormData((prev) => ({ ...prev, colors: extractedColors }));
		} catch (error) {
			console.error("Color extraction failed:", error);
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

		setIsSubmitting(true);

		try {
			// For now, we'll use a mock user ID since we haven't implemented auth yet
			const userId = "demo-user";
			const itemId = generateUUID();

			// Upload image to Supabase Storage
			const { data: uploadData, error: uploadError } =
				await StorageService.uploadImage(formData.image!, userId, itemId);

			if (uploadError) {
				throw new Error("Failed to upload image");
			}

			// Create clothing item record
			const { error } = await ClothingItemService.create({
				user_id: userId,
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
			});

			if (error) {
				throw new Error("Failed to save item");
			}

			// Redirect to wardrobe
			router.push("/wardrobe");
		} catch (error) {
			console.error("Error saving item:", error);
			setErrors({ submit: "Failed to save item. Please try again." });
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
					className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
					<ArrowLeft className="w-5 h-5" />
				</Link>
				<h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Image Upload */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
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
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Name *
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => handleInputChange("name", e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							placeholder="e.g., Blue Cotton T-Shirt"
						/>
						{errors.name && (
							<p className="text-red-500 text-sm mt-1">{errors.name}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
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
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
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
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Colors{" "}
						{formData.colors.length > 0 &&
							`(${formData.colors.length} detected)`}
					</label>
					<div className="flex flex-wrap gap-2">
						{formData.colors.map((color, index) => (
							<div
								key={index}
								className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
								<div
									className="w-4 h-4 rounded-full border border-gray-300"
									style={{ backgroundColor: color }}
								/>
								<span className="text-sm">{color}</span>
								<button
									type="button"
									onClick={() => {
										const newColors = formData.colors.filter(
											(_, i) => i !== index
										);
										handleInputChange("colors", newColors);
									}}
									className="text-gray-400 hover:text-red-500">
									×
								</button>
							</div>
						))}
					</div>
					{formData.colors.length === 0 && (
						<p className="text-sm text-gray-500 mt-1">
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
