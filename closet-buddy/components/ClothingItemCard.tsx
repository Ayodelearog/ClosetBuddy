"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Edit, Trash2, Calendar } from "lucide-react";
import { ClothingItem } from "@/types";
import { formatRelativeTime, cn } from "@/lib/utils";
import { ConfirmationModal } from "./ConfirmationModal";
import { useToast } from "@/contexts/ToastContext";

interface ClothingItemCardProps {
	item: ClothingItem;
	onEdit?: (item: ClothingItem) => void;
	onDelete?: (item: ClothingItem) => void;
	onToggleFavorite?: (item: ClothingItem) => void;
	className?: string;
	viewMode?: "grid" | "list";
}

export function ClothingItemCard({
	item,
	onEdit,
	onDelete,
	onToggleFavorite,
	className = "",
	viewMode = "grid",
}: ClothingItemCardProps) {
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const { success, error: showError } = useToast();

	const handleDeleteClick = () => {
		setShowDeleteModal(true);
	};

	const handleDeleteConfirm = async () => {
		if (!onDelete) return;

		setIsDeleting(true);
		try {
			await onDelete(item);
			setShowDeleteModal(false);
			success(
				"Item deleted",
				`"${item.name}" has been removed from your wardrobe`
			);
		} catch (error) {
			console.error("Error deleting item:", error);
			showError("Failed to delete item", "Please try again");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleToggleFavorite = async () => {
		if (!onToggleFavorite) return;

		try {
			await onToggleFavorite(item);
			const message = item.favorite
				? `"${item.name}" removed from favorites`
				: `"${item.name}" added to favorites`;
			success(
				item.favorite ? "Removed from favorites" : "Added to favorites",
				message
			);
		} catch (error) {
			console.error("Error toggling favorite:", error);
			showError("Failed to update favorite", "Please try again");
		}
	};

	return (
		<>
			<ConfirmationModal
				isOpen={showDeleteModal}
				onClose={() => !isDeleting && setShowDeleteModal(false)}
				onConfirm={handleDeleteConfirm}
				title="Delete Item"
				message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
				confirmText="Delete"
				cancelText="Cancel"
				type="danger"
				isLoading={isDeleting}
			/>
			<div
				className={cn(
					"bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200",
					viewMode === "list" ? "flex" : "",
					className
				)}>
				{/* Image */}
				<div
					className={cn(
						"relative",
						viewMode === "list"
							? "w-32 flex-shrink-0 self-stretch"
							: "aspect-square"
					)}>
					<Image
						src={item.image_url}
						alt={item.name}
						fill
						className={cn(
							"object-cover",
							viewMode === "list" ? "rounded-l-lg" : "rounded-t-lg"
						)}
					/>

					{/* Favorite button */}
					{onToggleFavorite && (
						<button
							onClick={handleToggleFavorite}
							className={cn(
								"absolute top-2 right-2 p-2 rounded-full transition-colors",
								item.favorite
									? "bg-red-500 text-white hover:bg-red-600"
									: "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
							)}>
							<Heart
								className={cn("w-4 h-4", item.favorite && "fill-current")}
							/>
						</button>
					)}

					{/* Category badge */}
					<div className="absolute top-2 left-2">
						<span className="px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-full capitalize">
							{item.category.replace("_", " ")}
						</span>
					</div>
				</div>

				{/* Content */}
				<div
					className={cn(
						"p-4",
						viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""
					)}>
					<div>
						{/* Title and brand */}
						<div className="mb-2">
							<h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
								{item.name}
							</h3>
							{item.brand && (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									{item.brand}
								</p>
							)}
						</div>

						{/* Colors */}
						{item.colors.length > 0 && (
							<div className="flex items-center gap-1 mb-2">
								{item.colors.slice(0, 4).map((color, index) => (
									<div
										key={index}
										className="w-4 h-4 rounded-full border border-gray-200"
										style={{ backgroundColor: color }}
										title={color}
									/>
								))}
								{item.colors.length > 4 && (
									<span className="text-xs text-gray-500 ml-1">
										+{item.colors.length - 4}
									</span>
								)}
							</div>
						)}

						{/* Tags */}
						<div className="flex flex-wrap gap-1 mb-3">
							{item.occasions.slice(0, 2).map((occasion) => (
								<span
									key={occasion}
									className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full capitalize">
									{occasion.replace("_", " ")}
								</span>
							))}
							{item.mood_tags.slice(0, 1).map((mood) => (
								<span
									key={mood}
									className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full capitalize">
									{mood}
								</span>
							))}
						</div>

						{/* Stats */}
						<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
							<div className="flex items-center gap-1">
								<Calendar className="w-3 h-3" />
								<span>Worn {item.wear_count} times</span>
							</div>
							{item.last_worn && (
								<span>Last: {formatRelativeTime(item.last_worn)}</span>
							)}
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
							<div className="text-xs text-gray-500 dark:text-gray-400">
								Added {formatRelativeTime(item.created_at)}
							</div>

							<div className="flex items-center gap-1">
								{onEdit && (
									<button
										onClick={() => onEdit(item)}
										className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
										title="Edit item">
										<Edit className="w-4 h-4" />
									</button>
								)}
								{onDelete && (
									<button
										onClick={handleDeleteClick}
										className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
										title="Delete item">
										<Trash2 className="w-4 h-4" />
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
